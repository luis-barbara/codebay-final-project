# payments/views

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import RetrieveAPIView
from rest_framework.decorators import api_view
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.http import HttpResponse
from django.shortcuts import redirect
import stripe
import logging

from marketplace.models import Product, Order
from payments.models import Payment
from .serializers import ProductSerializer, PaymentSerializer

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

# ------------------ Produtos ------------------

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(published=True)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.filter(published=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]



# ------------------ Stripe Checkout ------------------

class CreateCheckoutSessionView(APIView):
    permission_classes = [AllowAny]  

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "Product ID is required"}, status=400)

        try:
            product = Product.objects.get(id=product_id, published=True)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        if not product.seller.stripe_account_id:
            return Response({"error": "Vendor has no Stripe account"}, status=400)

        if not request.user.is_authenticated:
            return Response({"error": "User must be authenticated to checkout."}, status=403)

        try:
            customer_id = request.user.stripe_customer_id

            price_cents = int(float(product.price) * 100)
            metadata = {
                'product_id': product.id,
                'product_name': product.title,
                'vendor': product.seller.full_name,
                'user_id': str(request.user.id),
            }

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='payment',
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'unit_amount': price_cents,
                        'product_data': {
                            'name': product.title,
                        },
                    },
                    'quantity': 1,
                }],
                customer=customer_id,
                payment_intent_data={
                    'application_fee_amount': int(price_cents * 0.10),
                    'transfer_data': {
                        'destination': product.seller.stripe_account_id,
                    },
                    'metadata': metadata,
                },
                success_url=f"{settings.FRONTEND_URL}/frontend/stripe/payment-success.html?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_URL}/frontend/stripe/payment-cancel.html",
            )

            return Response({'sessionId': checkout_session.id})

        except Exception as e:
            logger.error(f"Error creating checkout session: {e}")
            return Response({'error': str(e)}, status=500)



class StripePublishableKeyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"publishableKey": settings.STRIPE_PUBLISHABLE_KEY})





# ------------------ Webhook Stripe ------------------

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        logger.error(f"Webhook error: Invalid payload or signature verification failed - {e}", exc_info=True)
        return HttpResponse(status=400)
    except Exception as e:
        logger.error(f"Unexpected error constructing webhook event: {e}", exc_info=True)
        return HttpResponse(status=500)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})

        product_id = metadata.get('product_id')
        user_id_from_metadata = metadata.get('user_id') # Get as string to handle 'guest'

        payment_intent = session.get('payment_intent')
        
        # --- Handle user_id from metadata ---
        actual_user_id = None
        if user_id_from_metadata and user_id_from_metadata.isdigit():
            actual_user_id = int(user_id_from_metadata)
        elif user_id_from_metadata == 'guest':
            actual_user_id = None # Explicitly set to None for guest
        else:
            logger.warning(f"Webhook: Invalid or missing user_id in metadata: '{user_id_from_metadata}'.")
            return HttpResponse(status=400)

        if not product_id:
            logger.warning("Webhook: Missing product_id in metadata.")
            return HttpResponse(status=400)

        try:
            product = Product.objects.get(id=product_id)

            # Evita duplicação de pagamentos
            if Payment.objects.filter(stripe_payment_intent_id=payment_intent).exists():
                logger.info(f"Payment with intent {payment_intent} already exists. Skipping.")
                return HttpResponse(status=200)

            # Create Payment
            Payment.objects.create(
                user_id=actual_user_id, # Use the correctly parsed user_id (int or None)
                product=product,
                stripe_payment_intent_id=payment_intent,
                amount_cents=int(float(product.price) * 100), # Corrected calculation
                succeeded=True,
                succeeded_at=timezone.now(),
            )

            # Create Order
            Order.objects.create(
                product=product,
                buyer_id=actual_user_id, # Use the correctly parsed user_id (int or None)
                payment_status='succeeded',
                payment_reference=payment_intent,
            )

            logger.info(f"Webhook: Payment and Order created for user {user_id_from_metadata}, product {product_id}.")

        except Product.DoesNotExist:
            logger.warning(f"Webhook error: Product {product_id} not found.")
            return HttpResponse(status=404) # <-- Return 404 if product not found
        except Exception as e:
            logger.error(f"Unexpected error handling webhook for payment_intent {payment_intent}: {e}", exc_info=True)
            return HttpResponse(status=500)

    return HttpResponse(status=200)


# ------------------ Stripe Connect Onboarding ------------------

class StripeConnectOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        product_id = request.data.get('product_id')

        if not product_id:
            return Response({'error': 'product_id is required'}, status=400)

        if not user.stripe_account_id:
            account = stripe.Account.create(
                type="express",
                country=getattr(user, 'country', 'PT'),
                email=user.email,
                capabilities={"transfers": {"requested": True}},
            )
            user.stripe_account_id = account.id
            user.save()

        account_link = stripe.AccountLink.create(
            account=user.stripe_account_id,
            refresh_url=f"{settings.FRONTEND_URL}/onboarding-refresh.html",
            return_url=f"{settings.FRONTEND_URL}/frontend/my_products/onboarding-return.html?product_id={product_id}",
            type="account_onboarding",
        )

        return Response({"url": account_link.url})



class StripeOnboardingRefreshView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Logic to refresh Stripe onboarding link, if needed
        return Response({"message": "Onboarding refresh endpoint"})

class StripeOnboardingReturnView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Logic to handle user return from Stripe onboarding
        return Response({"message": "Onboarding return endpoint"})
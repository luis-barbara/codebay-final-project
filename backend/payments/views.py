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

from .models import Product, Payment
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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id, published=True)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        if not product.owner.stripe_account_id:
            return Response({"error": "Vendor has no Stripe account"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='payment',
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'unit_amount': product.price_cents,
                        'product_data': {
                            'name': product.title,
                        },
                    },
                    'quantity': 1,
                }],
                payment_intent_data={
                    'application_fee_amount': int(product.price_cents * 0.10),
                    'transfer_data': {
                        'destination': product.owner.stripe_account_id,
                    },
                    'metadata': {
                        'product_id': product.id,
                        'user_id': request.user.id,
                    }
                },
                success_url='http://localhost:5500/payment-success.html?session_id={CHECKOUT_SESSION_ID}',
                cancel_url='http://localhost:5500/payment-cancel.html',
            )

            return Response({'sessionId': checkout_session.id})
        except Exception as e:
            logger.error(f"Error creating checkout session: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ------------------ Webhook Stripe ------------------

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        product_id = session['metadata']['product_id']
        user_id = session['metadata']['user_id']
        payment_intent = session.get('payment_intent')

        try:
            product = Product.objects.get(id=product_id)
            Payment.objects.create(
                user_id=user_id,
                product=product,
                stripe_payment_intent_id=payment_intent,
                amount_cents=product.price_cents,
                succeeded=True,
                succeeded_at=timezone.now(),
            )
        except Product.DoesNotExist:
            logger.warning(f"Produto {product_id} não encontrado para pagamento.")

    return HttpResponse(status=200)

# ------------------ Stripe Connect Onboarding ------------------

class StripeConnectOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

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
            return_url=f"{settings.FRONTEND_URL}/onboarding-return.html",
            type="account_onboarding",
        )

        return Response({"url": account_link.url})

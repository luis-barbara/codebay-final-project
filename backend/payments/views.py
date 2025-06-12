# payments/views

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
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
from .serializers import PaymentSerializer
from .models import Product, Payment
from .serializers import ProductSerializer

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

# View para listar os produtos
class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(published=True)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


# View para detalhes do produto
class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.filter(published=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


# View para criar um PaymentIntent com Stripe
class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id, published=True)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        vendor = product.owner
        if not vendor.stripe_account_id:
            return Response({"error": "Vendor has no Stripe account"}, status=status.HTTP_400_BAD_REQUEST)

        # Verifique se o produto tem um preço válido
        if product.price_cents <= 0:
            return Response({"error": "Product price must be greater than 0."}, status=status.HTTP_400_BAD_REQUEST)

        fee_cents = int(product.price_cents * 0.10)  # 10% comissão

        try:
            intent = stripe.PaymentIntent.create(
                amount=product.price_cents,
                currency="eur",
                application_fee_amount=fee_cents,
                transfer_data={"destination": vendor.stripe_account_id},
                metadata={'product_id': product.id, 'user_id': request.user.id}
            )

            # Criar o pagamento na base de dados
            payment = Payment.objects.create(
                user=request.user,
                product=product,
                stripe_payment_intent_id=intent['id'],
                amount_cents=product.price_cents,
                succeeded=False,
            )
            return Response({'client_secret': intent['client_secret']})
        except Exception as e:
            logger.error(f"Error creating payment intent: {e}")
            return Response({"error": "Error creating payment intent"}, status=status.HTTP_400_BAD_REQUEST)


# View para confirmar o pagamento após o PaymentIntent ser aprovado
class ConfirmPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_intent_id = request.data.get('payment_intent_id')
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            if intent.status == 'succeeded':
                payment.succeeded = True
                payment.succeeded_at = timezone.now()
                payment.save()
                return Response({"message": "Payment confirmed successfully"})
            else:
                return Response({"message": "Payment not successful"}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return Response({"error": "Stripe error during payment confirmation"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# View para detalhar o pagamento
class PaymentDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def get_object(self):
        return Payment.objects.get(id=self.kwargs['pk'], user=self.request.user)


# Webhook para o Stripe
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        logger.error("Invalid payload")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature")
        return HttpResponse(status=400)

    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        intent_id = payment_intent['id']
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=intent_id)
            payment.succeeded = True
            payment.succeeded_at = timezone.now()
            payment.save()
            logger.info(f"Payment {intent_id} succeeded.")
        except Payment.DoesNotExist:
            logger.warning(f"Payment with intent ID {intent_id} not found on webhook payment_intent.succeeded")

    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        intent_id = payment_intent['id']
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=intent_id)
            payment.succeeded = False
            payment.save()
            logger.info(f"Payment {intent_id} failed.")
        except Payment.DoesNotExist:
            logger.warning(f"Payment with intent ID {intent_id} not found on webhook payment_intent.payment_failed")

    return HttpResponse(status=200)


# View para iniciar o onboarding do Stripe Connect
class StripeConnectOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if not user.stripe_account_id:
            account = stripe.Account.create(
                type="express",
                country="PT",
                email=user.email,
                capabilities={"transfers": {"requested": True}},
            )
            user.stripe_account_id = account.id
            user.save()

        account_link = stripe.AccountLink.create(
            account=user.stripe_account_id,
            refresh_url="https://localhost:8000/payments/stripe/onboarding/refresh/",
            return_url="https://localhost:8000/payments/stripe/onboarding/return/",
            type="account_onboarding",
        )

        return Response({"url": account_link.url})


# Endpoint para quando o onboarding for necessário ser atualizado
@api_view(['GET'])
def stripe_onboarding_refresh(request):
    return redirect('https://seu-frontend.com/onboarding')  # Ajustar URL conforme necessário


# Endpoint para quando o onboarding for bem-sucedido
@api_view(['GET'])
def stripe_onboarding_return(request):
    return redirect('https://seu-frontend.com/dashboard')  # Ajustar URL conforme necessário

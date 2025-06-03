# payments/views.py


from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Product, UserProfile
from .serializers import ProductSerializer
from .stripe import create_stripe_account_and_link
import stripe

# Certifica-te que a chave Stripe está configurada na stripe.py
stripe.api_key = 'sk_test_...'  # Ou importa das settings

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_profile = UserProfile.objects.get(user=self.request.user)
        return Product.objects.filter(owner=user_profile)

    def perform_create(self, serializer):
        user_profile = UserProfile.objects.get(user=self.request.user)

        if not user_profile.stripe_account_id:
            onboarding_url = create_stripe_account_and_link(user_profile)
            # Levanta exceção com o link para o frontend tratar
            from rest_framework.exceptions import APIException
            raise APIException({'onboarding_url': onboarding_url})

        serializer.save(owner=user_profile, published=True)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session_api(request, product_id):
    user_profile = UserProfile.objects.get(user=request.user)
    product = get_object_or_404(Product, id=product_id)

    seller_account_id = product.owner.stripe_account_id
    if not seller_account_id:
        return Response({'error': 'Seller is not onboarded'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {'name': product.name},
                    'unit_amount': product.price_cents,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=request.build_absolute_uri('/payments/success/'),
            cancel_url=request.build_absolute_uri('/payments/cancel/'),
            payment_intent_data={
                'application_fee_amount': int(product.price_cents * 0.1),  # 10% fee
                'transfer_data': {'destination': seller_account_id},
            },
        )
        return Response({'checkout_url': session.url})

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# payments/urls.py

from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    CreatePaymentIntentView,
    ConfirmPaymentView,
    stripe_webhook,
    StripeConnectOnboardingView,
    stripe_onboarding_refresh,
    stripe_onboarding_return,
    PaymentDetailView,
    CreateCheckoutSessionView,  
)

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create_checkout_session'),  
    path('confirm-payment/', ConfirmPaymentView.as_view(), name='confirm_payment'),
    path('stripe-webhook/', stripe_webhook, name='stripe_webhook'),
    path('stripe/onboarding/', StripeConnectOnboardingView.as_view(), name='stripe_onboarding'),
    path('stripe/onboarding/refresh/', stripe_onboarding_refresh, name='stripe_onboarding_refresh'),
    path('stripe/onboarding/return/', stripe_onboarding_return, name='stripe_onboarding_return'),
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
]



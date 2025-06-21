# payments/urls.py

from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    stripe_webhook,
    StripeConnectOnboardingView,
    StripeOnboardingRefreshView,
    StripeOnboardingReturnView,
    CreateCheckoutSessionView,
    StripePublishableKeyView
)

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create_checkout_session'),
    path('stripe-webhook/', stripe_webhook, name='stripe_webhook'),
    path('stripe/onboarding/', StripeConnectOnboardingView.as_view(), name='stripe_onboarding'),
    path('stripe/onboarding/refresh/', StripeOnboardingRefreshView.as_view(), name='stripe_onboarding_refresh'),
    path('stripe/onboarding/return/', StripeOnboardingReturnView.as_view(), name='stripe_onboarding_return'),
    path('stripe/publishable-key/', StripePublishableKeyView.as_view(), name='stripe_publishable_key'),
]


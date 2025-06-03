# payments/stripe.py

import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_stripe_account_and_link(user_profile):
    if not user_profile.stripe_account_id:
        account = stripe.Account.create(
            type='express',
            country='PT',
            email=user_profile.user.email,
        )
        user_profile.stripe_account_id = account.id
        user_profile.save()

    account_link = stripe.AccountLink.create(
        account=user_profile.stripe_account_id,
        refresh_url='https://yourapp.com/reauth',  # substitui com URL real
        return_url='https://yourapp.com/onboarding-complete',
        type='account_onboarding',
    )
    return account_link.url

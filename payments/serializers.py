# payments/serializers.py

from rest_framework import serializers
from .models import Product, Payment
import stripe

class ProductSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Product
        fields = ['id', 'owner', 'owner_username', 'name', 'description', 'price_cents', 'published']


class PaymentSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    product = ProductSerializer(read_only=True)
    amount_eur = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'user_username',
            'product',
            'stripe_payment_intent_id',
            'amount_cents',
            'amount_eur',
            'succeeded',
            'created_at',
        ]
        read_only_fields = ['user', 'succeeded', 'created_at']

    def get_amount_eur(self, obj):
        return obj.amount_cents / 100  

    def validate_stripe_payment_intent_id(self, value):
        try:
            stripe.PaymentIntent.retrieve(value)
        except stripe.error.StripeError:
            raise serializers.ValidationError("Invalid Stripe Payment Intent ID.")
        return value

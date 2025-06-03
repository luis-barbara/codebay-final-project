# payments/serializers.py

from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'owner', 'name', 'price_cents', 'published']
        read_only_fields = ['owner', 'published']

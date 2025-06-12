# payments/admin

from django.contrib import admin
from .models import Product, Payment

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'price_cents', 'published')
    list_filter = ('published',)
    search_fields = ('name', 'owner__email')
    list_editable = ('published',)
    ordering = ('-id',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('stripe_payment_intent_id', 'user', 'product', 'amount_cents', 'succeeded', 'created_at')
    list_filter = ('succeeded', 'created_at')
    search_fields = ('stripe_payment_intent_id', 'user__email', 'product__name')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)




# payments/admin

from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('stripe_payment_intent_id', 'user', 'product', 'amount_cents', 'succeeded', 'created_at')
    list_filter = ('succeeded', 'created_at')
    search_fields = ('stripe_payment_intent_id', 'user__email', 'product__title')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)






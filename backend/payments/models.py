# payments/models.py


from django.db import models
from django.conf import settings
from marketplace.models import Product  

class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)
    amount_cents = models.PositiveIntegerField()
    succeeded = models.BooleanField(default=False)
    succeeded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.stripe_payment_intent_id} - {self.user}"




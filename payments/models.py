# payments/models.py


from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    stripe_account_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.user.username

class Product(models.Model):
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    price_cents = models.IntegerField()  # preço em cêntimos
    published = models.BooleanField(default=False)

    def __str__(self):
        return self.name

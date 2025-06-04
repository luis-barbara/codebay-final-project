# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
import base64
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import Image

class User(AbstractUser):
    # username will be unique, but not required
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)

    full_name = models.CharField(max_length=255)
    avatar = models.BinaryField(blank=True, null=True)  # Storing the image as binary data
    description = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    github_account = models.URLField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)

    # email as login, and username is no longer needed for login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def clean(self):
        """Custom validation to ensure the username is unique only if provided."""
        if self.username:
            existing_user = User.objects.filter(username=self.username).exclude(id=self.id).first()
            if existing_user:
                raise ValidationError({'username': 'This username is already in use.'})

    def save(self, *args, **kwargs):
        """Override save method to store the avatar as binary data."""
        if self.avatar:
            # Convert image to binary data
            self.avatar = self.convert_image_to_binary(self.avatar)

        super().save(*args, **kwargs)

    def convert_image_to_binary(self, image_field):
        """Converts the uploaded image to binary format."""
        image = Image.open(image_field)
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format='PNG')  
        img_byte_arr.seek(0)  
        return img_byte_arr.read()  # Return the binary data

    def get_avatar_url(self):
        """Method to retrieve the image URL (if needed)."""
        return base64.b64encode(self.avatar).decode('utf-8') 



# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
from io import BytesIO
from PIL import Image
import base64
import os

class User(AbstractUser):
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
        """Override save method to store the avatar as binary data with validations."""
        if self.avatar:
            self.validate_image(self.avatar)
            self.avatar = self.convert_image_to_binary(self.avatar)
        super().save(*args, **kwargs)

    def convert_image_to_binary(self, image_field):
        """Converts the uploaded image to binary format (WEBP)."""
        image = Image.open(image_field).convert("RGBA")
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format='WEBP')
        img_byte_arr.seek(0)
        return img_byte_arr.read()

    def validate_image(self, image_field):
        """Validates if the uploaded file is an image and meets the size and dimension requirements."""
        try:
            image = Image.open(image_field)
            image.verify()
        except (IOError, ValueError):
            raise ValidationError("The uploaded file is not a valid image.")

        image = Image.open(image_field)
        width, height = image.size
        min_width, min_height = 100, 100
        max_width, max_height = 1000, 1000

        if width < min_width or height < min_height:
            raise ValidationError(f"The image must be at least {min_width}x{min_height} pixels.")
        if width > max_width or height > max_height:
            raise ValidationError(f"The image cannot exceed {max_width}x{max_height} pixels.")

        image_field.seek(0, os.SEEK_END)
        image_size = image_field.tell()
        max_size = 5 * 1024 * 1024  # 5 MB

        if image_size > max_size:
            raise ValidationError("The image cannot be larger than 5 MB.")

    def get_avatar_url(self):
        """Returns the avatar as a base64-encoded webp data URI. Falls back to default avatar."""
        if self.avatar:
            return f"data:image/webp;base64,{base64.b64encode(self.avatar).decode('utf-8')}"

        default_path = os.path.join(settings.BASE_DIR, 'accounts', 'defaults', 'default_avatar.webp')
        if os.path.exists(default_path):
            with open(default_path, 'rb') as f:
                default_avatar = f.read()
                return f"data:image/webp;base64,{base64.b64encode(default_avatar).decode('utf-8')}"
        return None


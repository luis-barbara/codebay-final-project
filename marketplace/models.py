# marketplace/models.py

from django.conf import settings
from django.db import models
from django.db.models import Avg
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from io import BytesIO
from PIL import Image
import os


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('bot', 'Bot'),
        ('api', 'API'),
        ('micro_saas', 'MicroSaaS'),
        ('automation', 'Automation Template'),
        ('script', 'Script'),
        ('integration', 'Integration'),
        ('digital_business', 'Digital Business'),
        ('template', 'Template'),
        ('dashboard', 'Dashboard'),
    ]
    
    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('typescript', 'TypeScript'),
        ('ruby', 'Ruby'),
        ('go', 'Go'),
        ('nodejs', 'Node.js'),
        ('java', 'Java'),
        ('php', 'PHP'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('react', 'React'),
        ('vuejs', 'Vue.js'),
        ('angular', 'Angular'),
        ('rust', 'Rust'),
    ]

    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    # file removido para usar ProjectFile do storage

    def average_rating(self):
        avg = self.ratings.aggregate(Avg('score'))['score__avg']
        return round(avg, 2) if avg else None

    @property
    def main_file(self):
        return self.files.filter(is_main_file=True).first()

    def __str__(self):
        return f"{self.title} by {self.seller.username}"


class Media(models.Model):
    IMAGE = 'image'
    VIDEO = 'video'
    MEDIA_TYPE_CHOICES = [
        (IMAGE, 'Image'),
        (VIDEO, 'Video'),
    ]

    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='media')
    type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)

    # Para imagens, armazenar os bytes
    image_data = models.BinaryField(blank=True, null=True)

    # Para vídeo, armazenar URL (ex: YouTube)
    video_url = models.URLField(blank=True, null=True, validators=[URLValidator()])

    def __str__(self):
        return f"{self.type} for {self.product.title}"

    def clean(self):
        # Validação customizada para garantir campos corretos conforme tipo
        if self.type == self.IMAGE:
            if not self.image_data:
                raise ValidationError("Image data is required for media type image.")
            if self.video_url:
                raise ValidationError("Video URL should be empty for media type image.")
        elif self.type == self.VIDEO:
            if not self.video_url:
                raise ValidationError("Video URL is required for media type video.")
            if self.image_data:
                raise ValidationError("Image data should be empty for media type video.")

    def save(self, *args, **kwargs):
        # Caso seja imagem, validar e converter (similar a accounts.models.User.avatar)
        if self.type == self.IMAGE and self.image_data:
            # Convert bytes to PIL Image for validation
            try:
                image = Image.open(BytesIO(self.image_data))
                image.verify()
            except Exception:
                raise ValidationError("Invalid image data.")

            # Re-open to convert to webp and normalize format
            image = Image.open(BytesIO(self.image_data)).convert("RGBA")
            img_byte_arr = BytesIO()
            image.save(img_byte_arr, format='WEBP')
            img_byte_arr.seek(0)
            self.image_data = img_byte_arr.read()

        super().save(*args, **kwargs)


class Wishlist(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    products = models.ManyToManyField(Product, related_name='wishlisted_by')

    def __str__(self):
        return f"Wishlist of {self.user.username}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('delivered', 'Delivered'),
    ]
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.buyer.username} - {self.status}"


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - Read: {self.is_read}"


class Rating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ratings')
    score = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])  # 1–5
    comment = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"Rating {self.score} by {self.user.username} for {self.product.title}"

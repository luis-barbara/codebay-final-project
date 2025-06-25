# marketplace/models.py

from django.conf import settings
from django.db import models
from django.db.models import Avg
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys


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
    published = models.BooleanField(default=False)  
    pending_publication = models.BooleanField(default=False)  
   

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
    image = models.ImageField(
        upload_to='products/images/%Y/%m/%d/',
        blank=True,
        null=True,
        help_text="Upload de imagens (JPEG, PNG, WEBP)"
    )
    video_url = models.URLField(blank=True, null=True, validators=[URLValidator()])
    thumbnail = models.ImageField(upload_to='products/thumbnails/%Y/%m/%d/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_primary = models.BooleanField(default=False, help_text="Imagem principal do produto")

    class Meta:
        ordering = ['-is_primary', '-created_at']
        verbose_name_plural = "Media"

    def __str__(self):
        return f"{self.get_type_display()} for {self.product.title}"

    def clean(self):
        super().clean()
        if self.type == self.IMAGE:
            if not self.image:
                raise ValidationError("Uma imagem é necessária para este tipo de mídia.")
            if self.image and not self.image.name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                raise ValidationError("Formato de imagem inválido. Aceitos: PNG, JPG, JPEG, WEBP.")
        if self.type == self.VIDEO and not self.video_url:
            raise ValidationError("Uma URL de vídeo é necessária para este tipo de mídia.")

    def save(self, *args, **kwargs):
        # Otimização automática da imagem
        if self.image and not self.thumbnail:
            self._optimize_image()

        super().save(*args, **kwargs)

    def _optimize_image(self):
        img = Image.open(self.image)
        
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        if img.width > 1200 or img.height > 1200:
            img.thumbnail((1200, 1200))
        
        thumb = img.copy()
        thumb.thumbnail((300, 300))
        
        output = BytesIO()
        img.save(output, format='JPEG', quality=85)
        output.seek(0)
        output_size = output.tell()
        
        self.image = InMemoryUploadedFile(
            output,
            'ImageField',
            f"{self.image.name.split('.')[0]}.jpg",
            'image/jpeg',
            output_size,
            None
        )
        
        thumb_output = BytesIO()
        thumb.save(thumb_output, format='JPEG', quality=80)
        thumb_output.seek(0)
        thumb_output_size = thumb_output.tell()
        
        self.thumbnail = InMemoryUploadedFile(
            thumb_output,
            'ImageField',
            f"thumb_{self.image.name.split('.')[0]}.jpg",
            'image/jpeg',
            thumb_output_size,
            None
        )

    @property
    def url(self):
        if self.type == self.IMAGE and self.image:
            return self.image.url
        return self.video_url

    @property
    def thumbnail_url(self):
        if self.thumbnail:
            return self.thumbnail.url
        return self.url


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

    # pagamento Stripe
    stripe_payment_intent = models.CharField(max_length=255, blank=True, null=True)
    payment_status = models.CharField(max_length=50, default='pending')  # ex: 'pending', 'succeeded', 'failed'
    paid_at = models.DateTimeField(blank=True, null=True)

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

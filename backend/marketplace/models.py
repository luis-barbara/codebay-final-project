# marketplace/models.py

from django.conf import settings
from django.db import models
from django.db.models import Avg
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from PIL import Image
from io import BytesIO



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
    published = models.BooleanField(default=False)  # controla se aparece no marketplace
    pending_publication = models.BooleanField(default=False)  # usado quando o onboarding Stripe ainda está incompleto
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
    
    # Trocar o BinaryField pelo ImageField para armazenar caminho da imagem
    image = models.ImageField(upload_to='products/images/', blank=True, null=True)
    
    video_url = models.URLField(blank=True, null=True, validators=[URLValidator()])
    content_type = models.CharField(max_length=100, blank=True, null=True)  
    created_at = models.DateTimeField(auto_now_add=True)  

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} for {self.product.title}"

    def clean(self):
        if self.type not in dict(self.MEDIA_TYPE_CHOICES):
            raise ValidationError("Tipo de mídia inválido.")
        
        if self.type == self.IMAGE:
            if not self.image:
                raise ValidationError("Image is required for media type image.")
            if self.video_url:
                raise ValidationError("Video URL should be empty for media type image.")
        elif self.type == self.VIDEO:
            if not self.video_url:
                raise ValidationError("Video URL is required for media type video.")
            if self.image:
                raise ValidationError("Image should be empty for media type video.")

    def save(self, *args, **kwargs):
        self.full_clean()
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

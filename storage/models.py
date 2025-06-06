# storage/models.py


from django.db import models
from django.contrib.auth import get_user_model
from marketplace.models import Product  

User = get_user_model()

class ProjectFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.CASCADE, related_name='files')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file_url = models.URLField()  # URL no S3
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


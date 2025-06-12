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
    file_url = models.URLField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    is_main_file = models.BooleanField(default=False)  # ← ZIP ou arquivo principal
    file_type = models.CharField(max_length=20, blank=True)  # zip, code, doc, image...
    
    def __str__(self):
        return self.title



# storage/admin.py

from django.contrib import admin
from .models import ProjectFile

@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'product', 'is_main_file', 'file_type', 'uploaded_at')
    search_fields = ('title', 'user__email', 'user__full_name', 'product__title')
    list_filter = ('uploaded_at', 'is_main_file', 'file_type')


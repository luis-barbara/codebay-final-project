# storage/admin.py

from django.contrib import admin
from .models import ProjectFile

@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'uploaded_at')
    search_fields = ('title', 'user__email', 'user__full_name')
    list_filter = ('uploaded_at',)

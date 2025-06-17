# storage/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import ProjectFile

@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'product', 'is_main_file', 'file_type', 'uploaded_at', 'file_link')
    search_fields = ('title', 'user__email', 'product__title')
    list_filter = ('uploaded_at', 'is_main_file', 'file_type')

    def file_link(self, obj):
        return format_html("<a href='{}' target='_blank'>Abrir</a>", obj.file_url)
    file_link.short_description = "Arquivo"

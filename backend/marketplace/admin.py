# marketplace/admin.py

from django.contrib import admin
from django.utils.html import format_html
from rest_framework.reverse import reverse
from django import forms
import base64
from .models import (
    Product,
    Order,
    Notification,
    Rating,
    Media,
    Wishlist
)
from storage.models import ProjectFile

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'seller', 'price', 'category', 'language',
        'created_at', 'published', 'pending_publication'
    )
    search_fields = ('title', 'description', 'seller__username')
    list_filter = ('category', 'language', 'created_at', 'published', 'pending_publication')
    ordering = ('-created_at',)
    list_per_page = 25

    class ProjectFileInline(admin.TabularInline):
        model = ProjectFile
        extra = 0
        readonly_fields = ('file_url', 'uploaded_at')
        fields = ('title', 'description', 'file_url', 'uploaded_at')

    inlines = [ProjectFileInline]
    

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('product', 'buyer', 'status', 'created_at')
    search_fields = ('product__title', 'buyer__username')
    list_filter = ('status', 'created_at')
    ordering = ('-created_at',)
    list_per_page = 25


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'content')
    ordering = ('-created_at',)
    list_per_page = 25

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'score', 'comment')
    list_filter = ('score',)
    search_fields = ('user__username', 'product__title', 'comment')
    ordering = ('-id',)
    list_per_page = 25



@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'type', 'media_preview', 'created_at', 'has_media')
    list_filter = ('type', 'created_at')
    search_fields = ('product__title',)
    ordering = ('-created_at',)
    readonly_fields = ('media_preview_large', 'created_at')  # <- aqui está ok
    fields = ('product', 'type', 'image', 'video_url', 'media_preview_large')  # <- sem 'created_at'

    def has_media(self, obj):
        if obj.type == obj.IMAGE:
            return bool(obj.image)
        return bool(obj.video_url)
    has_media.boolean = True
    has_media.short_description = 'Tem Mídia'

    def media_preview(self, obj):
        if obj.type == obj.IMAGE and obj.image:
            return format_html(
                '<img src="{}" width="100" style="border-radius: 5px;" />',
                obj.image.url
            )
        elif obj.type == obj.VIDEO and obj.video_url:
            return format_html(
                '<a href="{}" target="_blank" style="padding: 3px 6px; background: #eee; border-radius: 3px;">▶ Assistir</a>',
                obj.video_url
            )
        return "-"

    def media_preview_large(self, obj):
        if obj.type == obj.IMAGE and obj.image:
            return format_html(
                '<img src="{}" style="max-width: 500px; max-height: 500px; border-radius: 5px;" />',
                obj.image.url
            )
        elif obj.type == obj.VIDEO and obj.video_url:
            return format_html(
                '<div style="margin-top: 10px;">'
                '<a href="{}" target="_blank" style="padding: 5px 10px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">▶ Assistir Vídeo</a>'
                '</div>',
                obj.video_url
            )
        return "Nenhuma pré-visualização disponível"


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product_count')
    search_fields = ('user__username',)

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Number of Products'

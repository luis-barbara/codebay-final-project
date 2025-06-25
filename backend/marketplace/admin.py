# marketplace/admin.py

from django.contrib import admin
from django.utils.html import format_html
from rest_framework.reverse import reverse
from django.conf import settings
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
    list_display = ('product_info', 'media_preview', 'type', 'is_primary', 'created_at')
    list_filter = ('type', 'is_primary', 'product__seller')
    search_fields = ('product__title',)
    list_editable = ('is_primary',)
    readonly_fields = ('media_preview',)
    actions = ['make_primary']

    def get_fieldsets(self, request, obj=None):
        fieldsets = [
            (None, {
                'fields': ('product', 'type', 'is_primary')
            }),
            ('Image', {
                'fields': ('image', 'media_preview'),
                'classes': ('collapse',)
            }),
            ('Video', {
                'fields': ('video_url',),
                'classes': ('collapse',)
            }),
        ]
        return fieldsets

    def product_info(self, obj):
        return f"{obj.product.title} (by {obj.product.seller.username})"
    product_info.short_description = "Product"

    def media_preview(self, obj):
        if obj.type == obj.IMAGE and obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 100px;" />',
                obj.image.url
            )
        elif obj.type == obj.VIDEO and obj.video_url:
            return format_html(
                '<a href="{}" target="_blank">🔗 Video Link</a>',
                obj.video_url
            )
        return "-"
    media_preview.short_description = "Preview"

    def make_primary(self, request, queryset):
        for media in queryset:
            Media.objects.filter(product=media.product).exclude(pk=media.pk).update(is_primary=False)
            media.is_primary = True
            media.save()
        self.message_user(request, f"{queryset.count()} media items set as primary.")
    make_primary.short_description = "Mark selected as primary"



@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product_count')
    search_fields = ('user__username',)

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Number of Products'

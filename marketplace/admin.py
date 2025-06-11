# marketplace/admin.py

from django.contrib import admin
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
    list_display = ('title', 'seller', 'price', 'category', 'language', 'created_at')
    search_fields = ('title', 'description', 'seller__username')
    list_filter = ('category', 'language', 'created_at')
    ordering = ('-created_at',)
    list_per_page = 25

    # Inline para mostrar arquivos relacionados diretamente no admin do produto
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
    list_display = ('product', 'type', 'has_media')
    list_filter = ('type',)
    search_fields = ('product__title',)
    ordering = ('-id',)
    list_per_page = 25

    def has_media(self, obj):
        if obj.type == obj.IMAGE:
            return bool(obj.image_data)
        else:
            return bool(obj.video_url)
    has_media.boolean = True
    has_media.short_description = 'Media Present'



@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product_count')
    search_fields = ('user__username',)

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Number of Products'

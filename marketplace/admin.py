# marketplace/admin.py

from django.contrib import admin
from .models import (
    Product,
    Order,
    Message,
    Notification,
    Rating,
    Media
)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'price', 'category', 'language', 'created_at')
    search_fields = ('title', 'description', 'seller__username')
    list_filter = ('category', 'language', 'created_at')
    ordering = ('-created_at',)
    list_per_page = 25

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('product', 'buyer', 'status', 'created_at')
    search_fields = ('product__title', 'buyer__username')
    list_filter = ('status', 'created_at')
    ordering = ('-created_at',)
    list_per_page = 25

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'timestamp')
    search_fields = ('sender__username', 'receiver__username', 'content')
    ordering = ('-timestamp',)
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
    list_display = ('product', 'type', 'file')
    list_filter = ('type',)
    search_fields = ('product__title',)
    ordering = ('-id',)
    list_per_page = 25

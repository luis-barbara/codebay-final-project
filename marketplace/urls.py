from django.urls import path
from . import views

urlpatterns = [
    # Produtos
    path('products/', views.ProductListCreateAPIView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', views.ProductRetrieveUpdateDestroyAPIView.as_view(), name='product-detail'),

    # Orders
    path('orders/', views.OrderListCreateAPIView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', views.OrderRetrieveUpdateDestroyAPIView.as_view(), name='order-detail'),

    # Mensagens
    path('messages/', views.MessageListCreateAPIView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/', views.MessageRetrieveDestroyAPIView.as_view(), name='message-detail'),

    # Ratings
    path('ratings/', views.RatingListCreateAPIView.as_view(), name='rating-list-create'),
    path('ratings/<int:pk>/', views.RatingRetrieveUpdateDestroyAPIView.as_view(), name='rating-detail'),

    # Notificações
    path('notifications/', views.NotificationListAPIView.as_view(), name='notification-list'),

    # Wish List (exemplo simples)
    path('wishlist/', views.WishListAPIView.as_view(), name='wishlist'),
]

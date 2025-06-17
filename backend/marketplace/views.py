# marketplace/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import stripe
from .models import Product
from .serializers import ProductSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        max_products = 10  # Limite por vendedor

        if user.products.count() >= max_products:
            raise PermissionDenied(f"You have reached the limit of {max_products} products.")

        serializer.save(owner=user)  


class PublishProductView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        product = get_object_or_404(Product, pk=pk, owner=user)

        if product.published:
            return Response({"detail": "Product already published."}, status=status.HTTP_400_BAD_REQUEST)

        # Cria conta Stripe Connect Express se não existir
        if not user.stripe_account_id:
            account = stripe.Account.create(
                type="express",
                country="PT",
                email=user.email,
                capabilities={"transfers": {"requested": True}},
            )
            user.stripe_account_id = account.id
            user.save()

        # Cria link de onboarding Stripe
        account_link = stripe.AccountLink.create(
            account=user.stripe_account_id,
            refresh_url=f"{settings.FRONTEND_URL}/onboarding-refresh.html",
            return_url=f"{settings.FRONTEND_URL}/onboarding-return.html?product_id={product.id}",
            type="account_onboarding",
        )

        product.pending_publication = True
        product.save()

        return Response({"onboarding_url": account_link.url}, status=status.HTTP_200_OK)




class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Compras feitas pelo user
        return self.queryset.filter(buyer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def sales(self, request):
        # Orders onde o produto é do user (vendas)
        sales = self.queryset.filter(product__seller=request.user, payment_status='succeeded')
        serializer = self.get_serializer(sales, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def pending_orders(self, request):
        # Listar apenas os pedidos pendentes
        pending_orders = self.queryset.filter(buyer=request.user, payment_status='pending')
        serializer = self.get_serializer(pending_orders, many=True)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return self.queryset

    def perform_create(self, serializer):
        product = serializer.validated_data.get('product')
        if product.seller != self.request.user:
            raise PermissionDenied("You do not have permission to add media for this product.")
        serializer.save()

    def perform_update(self, serializer):
        media = self.get_object()
        if media.product.seller != self.request.user:
            raise PermissionDenied("You do not have permission to update this media.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.product.seller != self.request.user:
            raise PermissionDenied("You do not have permission to delete this media.")
        instance.delete()


class WishlistViewSet(viewsets.ModelViewSet):  
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProductFilesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, product_id):
        user = request.user

        # Verifica se o utilizador comprou o produto
        if not Payment.objects.filter(product_id=product_id, user=user, succeeded=True).exists():
            raise PermissionDenied("Access denied. You have not purchased this product.")

        # Procura arquivos relacionados ao produto
        files = ProjectFile.objects.filter(product_id=product_id)
        if not files.exists():
            raise NotFound("No files found for this product.")

        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        file_urls = []
        for f in files:
            key = f.file_url.split(f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/")[-1]
            presigned_url = s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': key},
                ExpiresIn=3600,  # 1 hora
            )
            file_urls.append({
                'title': f.title,
                'description': f.description,
                'url': presigned_url,
            })

        return Response(file_urls)

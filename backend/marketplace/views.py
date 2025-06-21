# marketplace/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.reverse import reverse
from django.conf import settings
from django.http import HttpResponse, Http404
from rest_framework.exceptions import NotFound
import stripe
import boto3
import base64
from .models import Product, Order, Notification, Rating, Media, Wishlist
from storage.models import ProjectFile
from payments.models import Payment
from .serializers import (
    ProductSerializer,
    OrderSerializer,
    NotificationSerializer,
    RatingSerializer,
    MediaSerializer,
    WishlistSerializer,
    ProjectFileSerializer,

)


import logging
logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Permitir qualquer usuário acessar os produtos

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Product.objects.filter(seller=self.request.user).order_by('-created_at')
        else:
            return Product.objects.filter(published=True).order_by('-created_at')

    def perform_create(self, serializer):
        # Limite de 10 produtos por usuário
        if self.request.user.products.count() >= 10:
            raise PermissionDenied("Você atingiu o limite máximo de 10 produtos.")
        
        # Cria o produto com o usuário como vendedor
        product = serializer.save(seller=self.request.user)

        # Salva as imagens enviadas
        images = self.request.FILES.getlist('images')
        for i, image in enumerate(images):
            Media.objects.create(
                product=product,
                type=Media.IMAGE,
                image=image,
                is_primary=(i == 0)  # A primeira imagem será a principal
            )

    def get_serializer(self, *args, **kwargs):
        # Garante que o contexto tem o request, importante para gerar URLs absolutas
        kwargs.setdefault('context', {})
        kwargs['context']['request'] = self.request
        return super().get_serializer(*args, **kwargs)




class ProductFilesView(APIView):
    permission_classes = [AllowAny]  # Permite acesso público temporariamente para testes

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            files = ProjectFile.objects.filter(product=product)
            
            if not files.exists():
                # Retorna array vazio com status 200 se não houver arquivos
                return Response([], status=status.HTTP_200_OK)
                
            serializer = ProjectFileSerializer(files, many=True, context={'request': request})
            return Response(serializer.data)
            
        except Product.DoesNotExist:
            # Retorna array vazio com status 200 mesmo se o produto não existir
            return Response([], status=status.HTTP_200_OK)


class PublishProductView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        # Procura o produto, garantindo que pertence ao user
        product = get_object_or_404(Product, pk=pk, seller=user)

        # Verifica se o produto já está publicado
        if product.published:
            return Response({"detail": "Product already published."}, status=status.HTTP_400_BAD_REQUEST)

        # Define o código do país, default "PT"
        country_code = getattr(user, 'country', None) or "PT"

        # Se o user não tem conta Stripe, cria uma
        if not user.stripe_account_id:
            account = stripe.Account.create(
                type="express",
                country=country_code,
                email=user.email,
                capabilities={"transfers": {"requested": True}},
            )
            user.stripe_account_id = account.id
            user.save()

        # Cria link de onboarding para completar conta no Stripe
        account_link = stripe.AccountLink.create(
            account=user.stripe_account_id,
            refresh_url=f"{settings.FRONTEND_URL}/onboarding-refresh.html",
            return_url=f"{settings.FRONTEND_URL}/onboarding-return.html?product_id={product.id}",
            type="account_onboarding",
        )

        # Marca produto como pendente para publicação
        product.pending_publication = True
        product.save()

        return Response({"onboarding_url": account_link.url}, status=status.HTTP_200_OK)


class UnpublishProductView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        product = get_object_or_404(Product, pk=pk, seller=user)

        if not product.published:
            return Response({"detail": "Product is already unpublished."}, status=status.HTTP_400_BAD_REQUEST)

        # Marca o produto como não publicado
        product.published = False
        product.pending_publication = False
        product.save()

        return Response({"detail": "Product unpublished successfully."}, status=status.HTTP_200_OK)



class PublicProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]  

    def get_queryset(self):
        return Product.objects.filter(published=True)



class CompleteOnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({"detail": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id, seller=user)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found or not owned by user."}, status=status.HTTP_404_NOT_FOUND)

        if product.published:
            return Response({"detail": "Product already published."}, status=status.HTTP_400_BAD_REQUEST)

        # Validação do status da conta Stripe
        stripe_account = stripe.Account.retrieve(user.stripe_account_id)
        if not stripe_account['charges_enabled']:
            return Response({"detail": "Stripe account is not fully enabled yet."}, status=status.HTTP_400_BAD_REQUEST)

        # Publicação do produto
        product.published = True
        product.pending_publication = False
        product.save()

        return Response({"detail": "Product published successfully."})


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
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        # O DRF já valida a autenticação, então a verificação manual não é mais necessária
        product_id = request.data.get('product')
        if not product_id:
            return Response(
                {"detail": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Garante que o produto pertence ao usuário autenticado
            product = Product.objects.get(id=product_id, seller=request.user)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found or not owned by user."},
                status=status.HTTP_404_NOT_FOUND
            )

        media_type = request.data.get('type')

        # Validação do tipo de mídia
        if media_type == Media.IMAGE:
            if 'image' not in request.FILES:
                return Response({"detail": "No image file was provided."}, status=400)
        elif media_type == Media.VIDEO:
            if not request.data.get('video_url'):
                return Response({"detail": "Video URL is required."}, status=400)
        else:
            return Response({"detail": "Invalid media type."}, status=400)

        # Passa o produto no contexto do serializer
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Passa o produto diretamente para a criação
        product_id = self.request.data.get('product')
        try:
            product = Product.objects.get(id=product_id, seller=self.request.user)
            serializer.save(product=product)  # Associando o produto ao media
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist or is not owned by user.")

    def get_serializer(self, *args, **kwargs):
        kwargs.setdefault('context', {})
        kwargs['context']['request'] = self.request  # Garante que a requisição seja passada
        return super().get_serializer(*args, **kwargs)



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

    def get(self, request, pk):
        user = request.user

        # Verifica se o produto existe
        product = get_object_or_404(Product, id=pk)

        # Verifica se o user é o vendedor ou um comprador do produto
        is_seller = product.seller == user
        has_purchased = Payment.objects.filter(product_id=pk, user=user, succeeded=True).exists()

        if not is_seller and not has_purchased:
            raise PermissionDenied("Access denied. You are neither the seller nor a purchaser of this product.")

        # Procura arquivos relacionados ao produto
        files = ProjectFile.objects.filter(product_id=pk)
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

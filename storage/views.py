# storage/views.py

import boto3
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import ProjectFile
from marketplace.models import Product
from .serializers import ProjectFileSerializer
from uuid import uuid4


class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        title = request.data.get('title')
        description = request.data.get('description', '')
        product_id = request.data.get('product_id')
        is_main_file = request.data.get('is_main_file', 'false').lower() == 'true'
        file_type = request.data.get('file_type', '')  # e.g., 'zip', 'code', 'doc'

        # Validações básicas
        if not uploaded_file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if not title:
            return Response({'error': 'Title is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if uploaded_file.size > 20 * 1024 * 1024:
            return Response({'error': 'File size exceeds 20MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validação de product (se enviado, verifica se pertence ao user)
        product = None
        if product_id:
            try:
                product = Product.objects.get(id=product_id, seller=request.user)
            except Product.DoesNotExist:
                return Response({'error': 'Product not found or not owned by you.'}, status=status.HTTP_403_FORBIDDEN)

        # Upload para S3
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        filename = f"user_uploads/{uuid4()}_{uploaded_file.name}"
        try:
            s3.upload_fileobj(
                uploaded_file,
                settings.AWS_STORAGE_BUCKET_NAME,
                filename,
                ExtraArgs={'ContentType': uploaded_file.content_type}
            )
        except Exception as e:
            return Response({'error': f'Failed to upload file: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        s3_domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', f"{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com")
        file_url = f"https://{s3_domain}/{filename}"

        # Criação da instância do arquivo
        file_instance = ProjectFile.objects.create(
            user=request.user,
            product=product,
            title=title,
            description=description,
            file_url=file_url,
            is_main_file=is_main_file,
            file_type=file_type,
        )

        serializer = ProjectFileSerializer(file_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# storage/views.py

import boto3
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import ProjectFile
from .serializers import ProjectFileSerializer
from uuid import uuid4

class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        title = request.data.get('title')
        description = request.data.get('description', '')

        if not uploaded_file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if not title:
            return Response({'error': 'Title is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if uploaded_file.size > 10 * 1024 * 1024:  # 10MB
            return Response({'error': 'File size exceeds 10MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

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

        file_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{filename}"

        file_instance = ProjectFile.objects.create(
            user=request.user,
            title=title,
            description=description,
            file_url=file_url
        )

        serializer = ProjectFileSerializer(file_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

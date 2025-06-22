# storage/views.py

import boto3
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import ProjectFile
from marketplace.models import Product
from .serializers import ProjectFileSerializer # Certifique-se que ProjectFileSerializer é capaz de criar/atualizar
from uuid import uuid4

import logging
logger = logging.getLogger(__name__)

class FileUploadView(APIView):
    # Permissão para upload de ficheiros. Requer utilizador autenticado.
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logger.info(f"FileUploadView: POST request received from user {request.user.email} (ID: {request.user.id}, Authenticated: {request.user.is_authenticated})")
        
        uploaded_file = request.FILES.get('file')
        title = request.data.get('title')
        description = request.data.get('description', '')
        product_id = request.data.get('product_id')
        is_main_file = request.data.get('is_main_file', 'false').lower() == 'true'
        file_type = request.data.get('file_type', '')

        logger.info(f"FileUploadView: Data received - title='{title}', product_id='{product_id}', file_type='{file_type}'")
        logger.info(f"FileUploadView: File received - uploaded_file present: {uploaded_file is not None}")

        # --- 1. Validações Básicas Iniciais ---
        if not uploaded_file:
            logger.error("FileUploadView: No file provided in the request.")
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not title:
            logger.error("FileUploadView: Title is required for the file.")
            return Response({'error': 'Title is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if uploaded_file.size > settings.MAX_FILE_SIZE * 1024 * 1024: # Usar uma variável do settings
            logger.error(f"FileUploadView: File size ({uploaded_file.size} bytes) exceeds limit of {settings.MAX_FILE_SIZE}MB.")
            return Response({'error': f'File size exceeds {settings.MAX_FILE_SIZE}MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- 2. Validação e Associação do Produto ---
        product = None
        if product_id:
            try:
                # Tenta converter product_id para inteiro antes de usar
                product_id_int = int(product_id) 
                product = Product.objects.get(id=product_id_int, seller=request.user)
                logger.info(f"FileUploadView: Product found (ID: {product.id}, Title: '{product.title}') for user {request.user.email}.")
            except ValueError:
                logger.error(f"FileUploadView: Invalid product_id format received: '{product_id}'. Must be an integer.")
                return Response({'error': 'Invalid product ID format. Must be a number.'}, status=status.HTTP_400_BAD_REQUEST)
            except Product.DoesNotExist:
                logger.error(f"FileUploadView: Product with ID {product_id} not found or not owned by user {request.user.id}.")
                return Response({'error': 'Product not found or not owned by you.'}, status=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                logger.error(f"FileUploadView: Unexpected error during product lookup for ID {product_id}: {e}", exc_info=True)
                return Response({'error': 'An internal error occurred during product association.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Se product_id não é fornecido (ex: upload de ficheiro sem produto associado, ou upload direto de ficheiro de utilizador)
            logger.warning("FileUploadView: No product_id provided. File will be uploaded without product association.")
            # Dependendo da sua lógica, pode querer exigir product_id aqui, ou permitir.
            # Se for sempre para associar a um produto, remova 'null=True, blank=True' do ProjectFile.product
            # ou retorne um erro HTTP_400_BAD_REQUEST.


        # --- 3. Upload para AWS S3 ---
        try:
            s3 = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME,
            )
            # Adicionando um log antes do upload para confirmar credenciais/bucket
            logger.info(f"FileUploadView: Attempting S3 upload to bucket '{settings.AWS_STORAGE_BUCKET_NAME}' in region '{settings.AWS_S3_REGION_NAME}'.")

            # Gerar nome de ficheiro único
            filename = f"user_uploads/{uuid4()}_{uploaded_file.name}"
            
            s3.upload_fileobj(
                uploaded_file,
                settings.AWS_STORAGE_BUCKET_NAME,
                filename,
                ExtraArgs={ 
                    'ContentType': uploaded_file.content_type,
                    'ACL': 'bucket-owner-full-control' # Garante que o dono da conta tem controlo total
                }
            )
            file_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{filename}"
            logger.info(f"FileUploadView: File '{filename}' uploaded successfully to S3. URL: {file_url}")

        except Exception as e:
            # Este bloco apanhará erros de autenticação AWS (InvalidAccessKeyId, SignatureDoesNotMatch),
            # permissões (Access Denied), ou problemas de rede/bucket.
            logger.error(f"FileUploadView: Critical error during S3 upload for file '{uploaded_file.name}': {str(e)}", exc_info=True)
            if "Access Denied" in str(e) or "InvalidAccessKeyId" in str(e) or "SignatureDoesNotMatch" in str(e):
                return Response({'error': 'S3 permissions error. Check AWS credentials and bucket policy.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({'error': f'Failed to upload file to S3: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        # --- 4. Criação da Instância ProjectFile na Base de Dados ---
        try:
            file_instance = ProjectFile.objects.create(
                user=request.user, # Já sabemos que request.user é autenticado
                product=product,   # product é None se não foi fornecido, ou o objeto Product
                title=title,
                description=description,
                file_url=file_url, # URL do S3
                is_main_file=is_main_file,
                file_type=file_type,
            )
            logger.info(f"FileUploadView: ProjectFile instance created in DB (ID: {file_instance.id}, Title: '{file_instance.title}').")
        except Exception as e:
            # Este bloco apanhará erros na base de dados (ex: campos obrigatórios não preenchidos).
            logger.error(f"FileUploadView: Error creating ProjectFile instance in DB: {e}", exc_info=True)
            return Response({'error': f'Failed to save file details in database: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # --- 5. Resposta de Sucesso ---
        serializer = ProjectFileSerializer(file_instance) # Assumindo que ProjectFileSerializer é válido
        logger.info(f"FileUploadView: File upload and DB record successful for '{file_instance.title}'.")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
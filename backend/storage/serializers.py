# storage/serializers.py

from rest_framework import serializers
from .models import ProjectFile

class ProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFile
        fields = [
            'id',
            'user',
            'product',
            'title',
            'description',
            'file_url',
            'uploaded_at',
            'is_main_file',
            'file_type',
        ]
        read_only_fields = ['id', 'uploaded_at', 'user', 'file_url']


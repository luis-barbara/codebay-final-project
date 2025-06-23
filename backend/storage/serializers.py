# storage/serializers.py

from rest_framework import serializers
from storage.models import ProjectFile


class ProjectFileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

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
        read_only_fields = ['id', 'uploaded_at', 'user']



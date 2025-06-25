# chat/serializers

from rest_framework import serializers
from .models import Message
from accounts.models import User

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    recipient = serializers.PrimaryKeyRelatedField(queryset=User.objects.none())

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['recipient'].queryset = User.objects.all()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'content', 'timestamp']
        read_only_fields = ['id', 'sender', 'timestamp']





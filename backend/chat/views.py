# chat/views

from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class MessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.request.query_params.get('user')
        if other_user_id:
            return Message.objects.filter(
                (Q(sender=user) & Q(recipient__id=other_user_id)) |
                (Q(sender__id=other_user_id) & Q(recipient=user))
            ).order_by('-timestamp')
        return Message.objects.filter(Q(sender=user) | Q(recipient=user)).order_by('-timestamp')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)




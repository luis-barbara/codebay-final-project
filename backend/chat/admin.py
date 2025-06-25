# chat/admin


from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'recipient', 'timestamp')
    search_fields = ('sender__email', 'recipient__email', 'content')
    list_filter = ('timestamp',)
    ordering = ('-timestamp',)



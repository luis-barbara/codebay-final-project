# accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    
    # Colunas no painel de usuários
    list_display = ('username', 'email', 'full_name', 'is_staff', 'is_active', 'last_login')
    
    # Filtros para facilitar a pesquisa
    list_filter = ('is_staff', 'is_active', 'is_superuser')
    
    # Exibição detalhada das informações do utilizador
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email', 'avatar', 'description', 'phone', 'position', 'location', 'website', 'github_account', 'rating')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Campos quando um novo utilizador for adicionado
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'full_name', 'email', 'password1', 'password2', 'is_staff', 'is_active')
        }),
    )
    
    search_fields = ('username', 'email', 'full_name')
    
    ordering = ('username',)


    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['password1'].widget.attrs['autocomplete'] = 'new-password'
        form.base_fields['password2'].widget.attrs['autocomplete'] = 'new-password'
        return form

admin.site.register(User, UserAdmin)



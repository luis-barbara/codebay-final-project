# accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'username', 'stripe_account_id', 'stripe_customer_id', 'is_staff', 'is_active', 'last_login')

    list_filter = ('is_staff', 'is_active', 'is_superuser')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {
            'fields': (
                'full_name', 'username', 'avatar', 'description', 'phone', 'position',
                'location', 'website', 'github_account', 'rating',
                'stripe_account_id', 'stripe_customer_id'  
            )
        }),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'is_staff', 'is_active')
        }),
    )

    search_fields = ('email', 'full_name', 'username', 'stripe_account_id', 'stripe_customer_id')  

    ordering = ('email',)


    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['password1'].widget.attrs['autocomplete'] = 'new-password'
        form.base_fields['password2'].widget.attrs['autocomplete'] = 'new-password'
        return form

admin.site.register(User, UserAdmin)

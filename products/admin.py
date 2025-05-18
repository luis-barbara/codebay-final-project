from django.contrib import admin
from products.models import Product

# Register your models here.

class CharacterAdmin(admin.ModelAdmin):
    # Fields to be displayed in the admin list view
    list_display = (
        "title", "gender", "age", "skin", "ethnicity", "eye_color", "hair_color",
        "hair_style", "clothing_style", "expression", "pose", "image_style", "date", "user", "image_url"
    )

    # Sidebar filters
    list_filter = (
        "gender", "ethnicity", "eye_color", "hair_color", "clothing_style", "image_style"
    )

    # Searchable fields in the admin
    search_fields = ("title", "gender", "ethnicity", "eye_color", "hair_color")

    # Field grouping for better visualization in the admin detail page
    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "gender", "age", "skin", "ethnicity")
        }),
        ("Appearance", {
            "fields": ("eye_color", "hair_color", "hair_style", "clothing_style")
        }),
        ("Expression and Pose", {
            "fields": ("expression", "pose")
        }),
        ("Image Details", {
            "fields": ("image_style", "image_texture", "image_dominant_colors", "image_contrast", "image_shading")
        }),
        ("Additional Information", {
            "fields": ("image_lighting", "image_additional_details", "additional_details")
        }),
        ("User Information", {
            "fields": ("user", "image_url")
        }),
    )


    # Sorting order for the list view
    ordering = ('-date',)

# Registering the Character model with custom admin interface
admin.site.register(Character, CharacterAdmin)
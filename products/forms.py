from django import forms
from products.models import Products 

class ProductsForm(forms.ModelForm):

    class Meta:
        model = Product
        exclude = ['user']


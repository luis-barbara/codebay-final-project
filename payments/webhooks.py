# payments/webhooks.py

from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
import stripe
import json
from django.conf import settings
from .models import Product

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        # Payload inválido
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        # Assinatura inválida
        return HttpResponse(status=400)

    # Tratamento de eventos Stripe
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        # Obter o id do produto do metadata
        product_id = session.get('metadata', {}).get('product_id')

        if product_id:
            try:
                product = Product.objects.get(id=product_id)
                # Atualizar o estado do produto ou outra lógica
                product.published = True
                product.save()
            except Product.DoesNotExist:
                # Produto não encontrado, podes logar ou ignorar
                pass

        # Aqui podes adicionar lógica para criar encomendas, enviar emails, etc.

    # Podes tratar outros eventos aqui se precisares

    return HttpResponse(status=200)

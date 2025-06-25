
## Stripe Onboarding demo

https://rocketrides.io/


## ngrok terminal install (antes de correr o make compose.start)
docker run -it --rm -p 4041:4040 ngrok/ngrok http --authtoken ******* host.docker.internal:8080
- rodar e ver o url gerado
- criar novo destino webhook no stripe
- configurar destino
- se ngrok instalado no pc, no comand meter: ngrok http 8000


### O que selecionar (mínimo recomendado)
Para começar com pagamentos, o mínimo geralmente é:

- Checkout
checkout.session.completed → essencial! Quando um pagamento via checkout for concluído com sucesso.

checkout.session.expired → opcional, caso queira lidar com sessões expiradas.

- Payment Intent
payment_intent.succeeded → quando um pagamento é bem-sucedido (pode ser redundante com o checkout).

payment_intent.payment_failed → quando o pagamento falha.

- Invoice (se estiver usando assinaturas)
invoice.paid

invoice.payment_failed

invoice.created

- Customer (opcional)
customer.created

customer.subscription.created

customer.subscription.updated

customer.subscription.deleted

- depois meter url de destino e confirmar

- url ngrok + /api/payments/stripe-webhook/



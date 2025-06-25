### django admin:

email: luis_barbara@eticalgarve.com
password: qwerty



## Adminer

utilizador: codebay
senha: qwerty



## Stripe Onboarding demo

https://rocketrides.io/


## ngrok terminal install (antes de correr o make compose.start)
docker run -it --rm -p 4041:4040 ngrok/ngrok http --authtoken 2yHkS8RhM1Dzkb6UVh84XomlXi1_3JM5EQosbHP3oKUJ1cKq3 host.docker.internal:8080
- rodar e ver o url gerado
- criar novo destino webhook no stripe
- configurar destino

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

- https://954d-85-245-162-240.ngrok-free.app/api/payments/stripe-webhook/

- url + /api/payments/stripe-webhook/



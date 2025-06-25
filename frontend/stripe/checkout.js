// frontend/stripe/checkout.js


import { authFetch } from '../registrations/auth.js';

let stripePromise = null;

// Função para buscar a chave pública do backend e criar instância Stripe
async function getStripe() {
  if (!stripePromise) {
    try {
      const response = await fetch('http://localhost:8000/api/payments/stripe/publishable-key/');
      if (!response.ok) {
        throw new Error('Falha ao buscar chave pública do Stripe');
      }
      const data = await response.json();
      stripePromise = Stripe(data.publishableKey);
    } catch (error) {
      console.error('Erro ao carregar a chave do Stripe:', error);
      alert('Erro ao carregar a chave de pagamento. Tente novamente mais tarde.');
      throw error;
    }
  }
  return stripePromise;
}

export async function createCheckoutSession(productId) {
  try {
    const stripe = await getStripe();  

    // Mostrar um carregando para o usuário enquanto cria a sessão de checkout
    document.querySelector('.buy-btn').textContent = 'Loading...';
    document.querySelector('.buy-btn').disabled = true;  // Desabilitar o botão enquanto a requisição é feita

    const response = await authFetch('http://localhost:8000/api/payments/create-checkout-session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Falha ao criar sessão de checkout');
    }

    const data = await response.json();
    const sessionId = data.sessionId;

    // Redirecionar para o checkout do Stripe
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error('Erro ao redirecionar para o checkout:', error.message);
      alert('Erro ao redirecionar para o checkout: ' + error.message);
    }
  } catch (error) {
    console.error('Falha ao criar sessão de checkout:', error);
    alert('Falha ao iniciar o checkout: ' + error.message);
  } finally {
    // Restaurar o botão de compra
    document.querySelector('.buy-btn').textContent = 'Buy Now';
    document.querySelector('.buy-btn').disabled = false;
  }
}

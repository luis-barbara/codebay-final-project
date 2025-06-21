// frontend/stripe/checkout.js


import { authFetch } from '../registrations/auth.js';

let stripePromise = null;

// Função para buscar a chave pública do backend e criar instância Stripe
async function getStripe() {
  if (!stripePromise) {
    const response = await fetch('http://localhost:8000/api/payments/stripe/publishable-key/');
    const data = await response.json();
    stripePromise = Stripe(data.publishableKey);
  }
  return stripePromise;
}

export async function createCheckoutSession(productId) {
  try {
    const stripe = await getStripe();  

    const response = await authFetch('http://localhost:8000/api/payments/create-checkout-session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    const sessionId = data.sessionId;

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error('Stripe checkout error:', error.message);
      alert('Error redirecting to checkout: ' + error.message);
    }
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    alert('Failed to start checkout: ' + error.message);
  }
}

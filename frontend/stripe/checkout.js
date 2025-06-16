// frontend/stripe/checkout.js

import { authFetch, getAccessToken } from './auth.js';

// Use your publishable Stripe key here (you can hardcode or inject dynamically)
const stripe = Stripe('pk_test_your_publishable_key_here'); 

async function createCheckoutSession(productId) {
  try {
    const response = await authFetch('/api/create-checkout-session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product_id: productId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    const sessionId = data.sessionId;

    // Redirect to Stripe Checkout
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

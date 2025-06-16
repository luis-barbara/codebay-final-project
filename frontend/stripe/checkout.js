// frontend/stripe/checkout.js

// Replace this URL with your API endpoint to create the checkout session
const API_CREATE_CHECKOUT_SESSION_URL = '/api/create-checkout-session/';

const stripePublicKey = 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX'; // Put your Stripe public key here
const stripe = Stripe(stripePublicKey);

/**
 * Create a Stripe Checkout session for the given product ID
 * Sends a POST request to your backend to create the session,
 * then redirects the user to the Stripe Checkout page.
 */
async function createCheckoutSession(productId) {
  try {
    const response = await fetch(API_CREATE_CHECKOUT_SESSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // If you're using token authentication, add the Authorization header here
        // 'Authorization': 'Bearer <token>',
      },
      body: JSON.stringify({ product_id: productId }),
    });

    const data = await response.json();

    if (response.ok) {
      // Redirect to Stripe Checkout page using the session ID received from the backend
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      alert('Error creating payment session: ' + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Communication error with the server.');
  }
}

export { createCheckoutSession };


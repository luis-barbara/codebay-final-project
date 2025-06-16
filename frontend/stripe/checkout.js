// frontend/stripe/checkout.js

// frontend/stripe/checkout.js

const API_CREATE_CHECKOUT_SESSION_URL = '/api/create-checkout-session/';
const stripePublicKey = 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX'; // Replace with your Stripe public key
const stripe = Stripe(stripePublicKey);

/**
 * Create a Stripe Checkout session for the given product ID
 * Sends a POST request to your backend with token authentication,
 * then redirects the user to the Stripe Checkout page.
 * 
 * @param {string} productId - ID of the product to buy
 * @param {string} token - User's authentication token
 */
async function createCheckoutSession(productId, token) {
  try {
    const response = await fetch(API_CREATE_CHECKOUT_SESSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,  // Adjust prefix if you use 'Bearer'
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

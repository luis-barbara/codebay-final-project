// frontend/product_details/script.js

import { createCheckoutSession } from '../stripe/checkout.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (!productId) {
    alert('Product not specified.');
    return;
  }

  try {
    const res = await fetch(`http://localhost:8000/api/products/${productId}/`);
    const product = await res.json();

    document.querySelector('.product-title').textContent = product.title;
    document.querySelector('.product-description').textContent = product.description;
    document.querySelector('.price').textContent = `€${(product.price_cents / 100).toFixed(2)}`;

    const buyBtn = document.querySelector('.buy-btn');
    buyBtn.addEventListener('click', () => {
      createCheckoutSession(product.id);
    });
  } catch (error) {
    alert('Error loading product.');
  }
});

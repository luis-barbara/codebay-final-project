// frontend/product_details/script.js

import { createCheckoutSession } from '../stripe/checkout.js';


console.log('script.js loaded');

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || '25';

  // Buscar o produto do backend via API REST
  const response = await fetch(`http://localhost:8000/api/payments/products/${productId}/`);
  if (!response.ok) {
    console.error('Failed to fetch product');
    return;
  }
  const product = await response.json();

  // Atualizando os dados na página com o produto real
  document.querySelector('.product-title').textContent = product.name || product.title || 'Produto sem nome';
  document.querySelector('.product-description').textContent = product.description || '';
  document.querySelector('.price').textContent = `€${(product.price_cents / 100).toFixed(2)}`;

  const buyBtn = document.querySelector('.buy-btn');
  buyBtn.setAttribute('data-product-id', product.id);

  buyBtn.addEventListener('click', () => {
    const productId = buyBtn.getAttribute('data-product-id');
    console.log('Product ID:', productId);
    createCheckoutSession(productId);
  });
});

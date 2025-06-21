// frontend/product_details/script.js


import { createCheckoutSession } from '../stripe/checkout.js';

// Configurações
const API_BASE_URL = 'http://localhost:8000/api/marketplace';
const DEFAULT_PRODUCT_ID = '1'; // ID para testes

console.log('Product details script loaded');

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Obter ID do produto
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id') || DEFAULT_PRODUCT_ID;

    // 2. Buscar dados do produto
    const product = await fetchProduct(productId);
    if (!product) return;

    // 3. Atualizar a UI
    updateProductUI(product);

    // 4. Configurar botão de compra
    setupBuyButton(product.id);

  } catch (error) {
    console.error('Initialization error:', error);
    showErrorToUser();
  }
});

// Função para buscar produto
async function fetchProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Failed to fetch product:', error);
    showErrorToUser('Produto não encontrado ou erro de conexão');
    return null;
  }
}

// Função para atualizar a interface
function updateProductUI(product) {
  try {
    document.querySelector('.product-title').textContent = product.title || 'Produto sem nome'; // Corrigido de `product.name` para `product.title`
    document.querySelector('.product-description').textContent = product.description || '';
    
    // Formatação de preço segura (converte de string para número e divide por 100 para centavos)
    const price = product.price ? (parseFloat(product.price).toFixed(2)) : '0.00';
    document.querySelector('.price').textContent = `€${price}`;
    
    // Atualizar imagem do produto se existir
    if (product.media && product.media[0] && product.media[0].url) { // Corrigido de `product.images` para `product.media`
      const imgElement = document.querySelector('.product-image');
      if (imgElement) {
        imgElement.src = product.media[0].url;
        imgElement.alt = product.title || 'Imagem do produto';
      }
    }
  } catch (error) {
    console.error('UI update error:', error);
  }
}

// Função para configurar o botão de compra
function setupBuyButton(productId) {
  const buyBtn = document.querySelector('.buy-btn');
  if (!buyBtn) return;

  buyBtn.setAttribute('data-product-id', productId);
  
  buyBtn.addEventListener('click', async () => {
    try {
      console.log('Initiating checkout for product:', productId);
      await createCheckoutSession(productId);
    } catch (error) {
      console.error('Checkout error:', error);
      showErrorToUser('Erro ao iniciar o checkout');
    }
  });
}

// Função para mostrar erros ao usuário
function showErrorToUser(message = 'Ocorreu um erro') {
  const errorElement = document.querySelector('.error-message') || document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.color = 'red';
  errorElement.style.margin = '1rem 0';
  
  if (!document.querySelector('.error-message')) {
    document.querySelector('main').prepend(errorElement);
  }
}

// frontend/product_details/script.js


import { createCheckoutSession } from '../stripe/checkout.js';

// Configurações
const API_BASE_URL = 'http://localhost:8000/api/marketplace';


console.log('Product details script loaded');

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Obter ID do produto
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id');

    // 2. Buscar dados do produto
    const product = await fetchProduct(productId);
    console.log(product)
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
    const response = await fetch(`${API_BASE_URL}/public/products/${productId}/`);

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
async function updateProductUI(product) {
  try {
    document.querySelector('.product-title').textContent = product.title || 'Produto sem nome';
    document.querySelector('.product-description').textContent = product.description || '';

    const price = product.price ? (parseFloat(product.price).toFixed(2)) : '0.00';
    document.querySelector('.price').textContent = `€${price}`;

    if (product.media && Array.isArray(product.media)) {
      const imgElement = document.querySelector('.product-image img');
      if (imgElement) {
        const primaryMedia = product.media.find(m => m.is_primary === true) || product.media.find(m => m.type === 'image');
        if (primaryMedia?.url) {
          imgElement.src = `${primaryMedia.url}?t=${Date.now()}`;
          imgElement.alt = product.title || 'Imagem do produto';
        } else {
          imgElement.src = '';
          imgElement.alt = 'Sem imagem disponível';
        }
      }
    }

    if (product.media && Array.isArray(product.media)) {
      window.updateMediaArrays(product.media);
    }


    const filesList = document.querySelector('.files ul');
    if (filesList && Array.isArray(product.files)) {
      filesList.innerHTML = '';

      product.files.forEach(file => {
        const li = document.createElement('li');
        const link = document.createElement('p');
        link.href = file.file_url;
        link.textContent = file.title || 'Ficheiro sem nome';
        link.className = 'file-name';
        link.target = '_blank';
        li.appendChild(link);
        filesList.appendChild(li);
      });

      // Detectar ficheiro README (case insensitive)
      const readmeFile = product.files.find(f => f.title.toLowerCase().includes('readme'));
      const readmeContainer = document.querySelector('.readme');

      if (readmeContainer) {
        readmeContainer.innerHTML = '<h2>Readme</h2>'; // Reset cabeçalho

        if (readmeFile) {
          // Buscar conteúdo do ficheiro readme
          try {
            const readmeResponse = await fetch(readmeFile.file_url);
            if (!readmeResponse.ok) throw new Error('Erro ao carregar readme');

            const readmeText = await readmeResponse.text();

            // Exibir o conteúdo dentro da caixa readme
            const pre = document.createElement('pre');
            pre.style.whiteSpace = 'pre-wrap'; // permite quebra de linha automática
            pre.textContent = readmeText;

            readmeContainer.appendChild(pre);

          } catch (err) {
            console.error('Erro ao buscar conteúdo do readme:', err);
            readmeContainer.innerHTML += '<p>Erro ao carregar o conteúdo do readme.</p>';
          }
        } else {
          readmeContainer.innerHTML += '<p>No readme file added.</p>';
        }
      }

    } else {
      console.warn('Nenhum ficheiro encontrado neste produto.');

      const readmeContainer = document.querySelector('.readme');
      if (readmeContainer) {
        readmeContainer.innerHTML = `
          <h2>Readme</h2>
          <p>No readme file added.</p>
        `;
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


document.addEventListener('DOMContentLoaded', () => {
  const imagesBtn = document.querySelector('.buttons-row button:nth-child(1)');
  const videosBtn = document.querySelector('.buttons-row button:nth-child(2)');
  const popup = document.getElementById('media-popup');
  const popupBody = popup.querySelector('.popup-body');
  const popupClose = popup.querySelector('.popup-close-btn');

  let images = [];
  let videos = [];

  function updateMediaArrays(media) {
    images = media.filter(m => m.type === 'image');
    videos = media.filter(m => m.type === 'video');

    if (videos.length === 0) {
      videosBtn.disabled = true;
      videosBtn.title = 'No videos available';
    } else {
      videosBtn.disabled = false;
      videosBtn.title = '';
    }
  }

  function createImageCarousel(images) {
    if (images.length === 0) return '<p>No images available.</p>';

    const container = document.createElement('div');
    container.classList.add('carousel');

    images.forEach(img => {
      const imageEl = document.createElement('img');
      imageEl.src = img.url;
      imageEl.alt = img.alt || 'Product Image';
      container.appendChild(imageEl);
    });

    return container;
  }

  function createVideoList(videos) {
    if (videos.length === 0) return '<p>No videos available.</p>';

    const ul = document.createElement('ul');
    ul.classList.add('video-list');

    videos.forEach(video => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = video.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = video.title || video.url;
      li.appendChild(a);
      ul.appendChild(li);
    });

    return ul;
  }

  function openPopup(content) {
    popupBody.innerHTML = '';
    if (typeof content === 'string') {
      popupBody.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      popupBody.appendChild(content);
    }
    popup.classList.remove('hidden-popup');
  }

  function closePopup() {
    popup.classList.add('hidden-popup');
    popupBody.innerHTML = '';
  }

  imagesBtn.addEventListener('click', () => {
    const carousel = createImageCarousel(images);
    openPopup(carousel);
  });

  videosBtn.addEventListener('click', () => {
    if (videos.length === 0) return;
    const videoList = createVideoList(videos);
    openPopup(videoList);
  });

  popupClose.addEventListener('click', closePopup);

  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      closePopup();
    }
  });

  window.updateMediaArrays = updateMediaArrays;
});

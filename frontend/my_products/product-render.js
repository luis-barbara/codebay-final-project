// frontend/my_products/product-render.js

import { authFetch } from '../registrations/auth.js';

// 1. Função para decodificar token JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erro ao decodificar token:", e);
    return null;
  }
}

// 2. Injetar CSS de opções
function injectCardOptionsStyles() {
  if (document.getElementById('card-options-styles')) return;

  const styles = `
    .card { position: relative; }
    .options-button {
      position: absolute;
      top: 20px;
      right: 15px;
      background: none;
      border: none;
      color: white;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      z-index: 10;
    }
    .options-menu {
      display: none;
      position: absolute;
      top: 45px;
      right: 15px;
      background-color: #161B22;
      border: 0.6px solid #6B6E72;
      border-radius: 8px;
      padding: 8px;
      z-index: 20;
      width: 150px;
    }
    .options-menu.active { display: block; }
    .options-menu-item {
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      border-radius: 6px;
    }
    .options-menu-item:hover {
      background-color: #2c333e;
    }
  `;
  const styleSheet = document.createElement("style");
  styleSheet.id = 'card-options-styles';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

// 3. Buscar produtos
async function fetchSellerProducts(sellerId) {
  try {
    const response = await authFetch(`http://localhost:8000/api/marketplace/products/?seller_id=${sellerId}`, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.status === 404) return [];

    if (response.status === 400) {
      const fallbackResponse = await authFetch(`http://localhost:8000/api/marketplace/products/`, {
        headers: {
          "Accept": "application/json"
        }
      });

      if (fallbackResponse.ok) {
        const products = await fallbackResponse.json();
        return products.filter(p => p.seller?.id === sellerId);
      }
    }

    if (!response.ok) throw new Error(`Erro ${response.status} ao buscar produtos`);

    const products = await response.json();
    return Array.isArray(products) ? products : [];

  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

// 4. Buscar arquivos do produto
async function fetchProductFiles(productId, token) {
  try {
    const response = await fetch(`http://localhost:8000/api/marketplace/products/${productId}/files/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      console.warn(`Falha ao buscar arquivos do produto ${productId}`);
      return [];
    }

    return await response.json();
  } catch {
    return [];
  }
}

// 5. Renderizar um card
function renderProductCard(gridContainer, cardHTML, product) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'product-card-wrapper';
  cardWrapper.id = `product-${product.id}`;
  cardWrapper.innerHTML = cardHTML;

  // Imagem
  const img = cardWrapper.querySelector('.preview img');
  if (img) {
    const imageMedia = Array.isArray(product.media)
      ? product.media.find(m => m.type === 'image')
      : null;

    if (imageMedia?.image_url) {
      img.src = `${imageMedia.image_url}?t=${Date.now()}`;
      img.onerror = function () {
        console.error(`Erro ao carregar imagem do produto ${product.id}`);
        img.src = '';
      };
    } else {
      console.warn(`Produto ${product.id} não tem image_url válido`);
      img.src = '';
    }
  }

  // Título
  const heading = cardWrapper.querySelector('.details .heading');
  if (heading) heading.textContent = product.title || 'Untitled';

  // Descrição
  const description = cardWrapper.querySelector('.details .description');
  if (description) description.textContent = product.description || 'No description';

  // Categoria
  const tech = cardWrapper.querySelector('.details .tech');
  if (tech) {
    if (typeof product.category === 'string') {
      tech.textContent = product.category;
    } else if (product.category?.name) {
      tech.textContent = product.category.name;
    } else {
      tech.textContent = 'No category';
    }
  }

  // Preço
  const price = cardWrapper.querySelector('.details .price');
  if (price) {
    const parsedPrice = parseFloat(product.price);
    price.textContent = !isNaN(parsedPrice)
      ? `${parsedPrice.toFixed(2)}€`
      : 'Price unavailable';
  }

  // Menu de opções
  const card = cardWrapper.querySelector('.card');
  if (card) {
    const optionsButton = document.createElement('button');
    optionsButton.className = 'options-button';
    optionsButton.innerHTML = '⋮';

    const optionsMenu = document.createElement('div');
    optionsMenu.className = 'options-menu';
    optionsMenu.innerHTML = `
      <div class="options-menu-item share-item"><span>&#10149;</span> Share</div>
      <div class="options-menu-item edit-item"><span>&#9998;</span> Edit</div>
      <div class="options-menu-item delete-item"><span>&#128465;</span> Delete</div>
    `;

    // Eventos de ação
    optionsMenu.querySelector('.edit-item')?.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(product);
      optionsMenu.classList.remove('active');
    });

    optionsMenu.querySelector('.share-item')?.addEventListener("click", (e) => {
      e.stopPropagation();
      shareProduct(product.id);
      optionsMenu.classList.remove('active');
    });

    optionsMenu.querySelector('.delete-item')?.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteProduct(product.id);
      optionsMenu.classList.remove('active');
    });

    optionsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      optionsMenu.classList.toggle('active');
    });

    card.appendChild(optionsButton);
    card.appendChild(optionsMenu);

    // Botão principal
    const mainButton = cardWrapper.querySelector('.button');
    if (mainButton) {
      mainButton.textContent = 'Unlist product';
    }
  }

  // Fecha menus ao clicar fora – apenas 1 vez
  if (!window.optionsMenuListenerAdded) {
    document.addEventListener('click', () => {
      document.querySelectorAll('.options-menu.active').forEach(menu => {
        menu.classList.remove('active');
      });
    });
    window.optionsMenuListenerAdded = true;
  }

  gridContainer.appendChild(cardWrapper);
}



// 6. Fechar modal (opcional)
function closeModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) modal.style.display = "none";
}

// 7. Função principal
async function handleAfterCreate(productId = null, token = null) {
  token = token || localStorage.getItem("accessToken");
  if (!token) return alert("Você precisa estar logado para visualizar os produtos.");

  try {
    injectCardOptionsStyles();

    const payload = parseJwt(token);
    if (!payload || !payload.user_id) throw new Error("Token inválido ou expirado");

    const sellerId = payload.user_id;
    const cardResponse = await fetch('../components/card.html');
    if (!cardResponse.ok) throw new Error(`Erro ao carregar template (${cardResponse.status})`);
    const cardHTML = await cardResponse.text();

    const products = await fetchSellerProducts(sellerId, token);

    const gridContainer = document.querySelector(".card-grid");
    if (!gridContainer) throw new Error("Container .card-grid não encontrado no DOM");
    gridContainer.innerHTML = '';

    for (const product of products) {
      try {
        const files = await fetchProductFiles(product.id, token);
        product.files = files || [];
        renderProductCard(gridContainer, cardHTML, product);
      } catch (fileError) {
        console.error(`Erro ao carregar arquivos do produto ${product.id}:`, fileError);
        product.files = [];
        renderProductCard(gridContainer, cardHTML, product);
      }
    }

    closeModal();

    if (productId) {
      setTimeout(() => {
        const newProductCard = document.getElementById(`product-${productId}`);
        newProductCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }

  } catch (error) {
    console.error("Erro em handleAfterCreate:", error);
    if (error.message.includes("Token inválido") || error.message.includes("401")) {
      localStorage.removeItem("accessToken");
      alert("Sessão expirada. Por favor, faça login novamente.");
    } else {
      alert(`Erro ao carregar produtos: ${error.message}`);
    }
  }
}

// 8. Fechar dropdowns ao clicar fora
document.addEventListener('click', () => {
  document.querySelectorAll('.options-menu.active').forEach(menu => {
    menu.classList.remove('active');
  });
});

// 9. Chamada inicial
handleAfterCreate();
window.closeModal = closeModal;
window.handleAfterCreate = handleAfterCreate;
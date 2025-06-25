// frontend/my_products/product-render.js


import { authFetch } from '../registrations/auth.js'; 

import { 
    openEditModal,   
    deleteProduct,   
    shareProduct,
    startStripeOnboarding,    
} from './product-actions.js'; 


import { 
    closeModal, 
    validateForm, 
    handleAfterCreate 
} from './script.js'; 



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


export function getSellerIdFromToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("Token de acesso não encontrado.");
    return null;
  }

  const payload = parseJwt(token);
  if (!payload || !payload.user_id) {
    console.warn("Payload inválido ou user_id ausente no token.");
    return null;
  }

  return payload.user_id;
}

function injectCardOptionsStyles() {
  if (document.getElementById('card-options-styles')) return;

  const styles = `
    .card {
      position: relative;
    }

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

    .options-menu.active {
      display: block;
    }

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

async function initProductRender() {
    
  const sellerId = getSellerIdFromToken();
  if (!sellerId) return;

  const products = await fetchSellerProducts(sellerId);


  const cardResponse = await fetch('../components/card.html');
  const cardHTML = await cardResponse.text();

  const gridContainer = document.querySelector(".card-grid");
  if (!gridContainer) {
    console.error("Container .card-grid não encontrado");
    return;
  }

  gridContainer.innerHTML = '';
  for (const product of products) {
    renderProductCard(gridContainer, cardHTML, product);
  }
}

initProductRender(); 



export async function fetchSellerProducts(sellerId) { 
    try {
        const response = await authFetch(`http://localhost:8000/api/marketplace/products/?seller_id=${sellerId}`, {
            headers: { "Accept": "application/json" }
        });

        if (response.status === 404) {
            console.warn("No products found for this user.");
            return [];
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Erro ${response.status} ao buscar produtos:`, errorData);
            throw new Error(`Erro ao buscar produtos: ${errorData.detail || response.statusText}`);
        }

        const products = await response.json();
        return Array.isArray(products) ? products : (products ? [products] : []);

    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return [];
    }
}



// Renderizar um card 
export function renderProductCard(gridContainer, cardHTML, product) { 
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'product-card-wrapper';
    cardWrapper.id = `product-${product.id}`;
    cardWrapper.innerHTML = cardHTML;
    const mainButton = cardWrapper.querySelector('.card-details');

if(product.published == true) {
  if (mainButton) {
    mainButton.textContent = 'Unlist product';
  }
} else {
  mainButton.textContent = 'List product';
}

if (mainButton) {
  mainButton.addEventListener("click", async () => {
    startStripeOnboarding(product.id);
  });
}


    // Imagem 
    const img = cardWrapper.querySelector('.preview img');
    if (img) {
        const primaryMedia = Array.isArray(product.media)
            ? product.media.find(m => m.is_primary === true) || product.media.find(m => m.type === 'image')
            : null;

        if (primaryMedia?.url) { 
            img.src = `${primaryMedia.url}?t=${Date.now()}`;
            img.onerror = function () {
                console.error(`Erro ao carregar imagem do produto ${product.id}`);
                img.src = ''; 
            };
        } else {
            console.warn(`Produto ${product.id} não tem URL de imagem principal válido na mídia.`);
            img.src = ''; 
        }
    }

    // Título, Descrição, Categoria, Preço
    const heading = cardWrapper.querySelector('.details .heading');
    if (heading) heading.textContent = product.title || 'Untitled';
    const description = cardWrapper.querySelector('.details .description');
    if (description) description.textContent = product.description || 'No description';
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
    const price = cardWrapper.querySelector('.details .price');
    if (price) {
        const parsedPrice = parseFloat(product.price);
        price.textContent = !isNaN(parsedPrice)
            ? `${parsedPrice.toFixed(2)}€`
            : 'Price unavailable';
    }

    // Options menu
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

        
        optionsMenu.querySelector('.edit-item')?.addEventListener("click", (e) => {
            e.stopPropagation();
            openEditModal(product, validateForm, handleAfterCreate); 
            optionsMenu.classList.remove('active');
        });

        optionsMenu.querySelector('.share-item')?.addEventListener("click", (e) => {
            e.stopPropagation();
            shareProduct(product.id); 
            optionsMenu.classList.remove('active');
        });

        optionsMenu.querySelector('.delete-item')?.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteProduct(product.id, { closeModal: closeModal, handleAfterCreate: handleAfterCreate }); 
            optionsMenu.classList.remove('active');
        });

        // Toggle options menu visibility
        optionsButton.addEventListener('click', (event) => {
            event.stopPropagation();
            optionsMenu.classList.toggle('active');
            document.querySelectorAll('.options-menu.active').forEach(menu => {
                if (menu !== optionsMenu) {
                    menu.classList.remove('active');
                }
            });
        });

        card.appendChild(optionsButton);
        card.appendChild(optionsMenu);
    }

  
    if (!window.optionsMenuListenerAdded) {
        document.addEventListener('click', () => {
            document.querySelectorAll('.options-menu.active').forEach(menu => {
                menu.classList.remove('active');
            });
        });
        window.optionsMenuListenerAdded = true;
    }

    gridContainer.appendChild(cardWrapper);
    injectCardOptionsStyles();
}
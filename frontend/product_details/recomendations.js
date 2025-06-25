// frontend/product_details/recomendations.js 

// Importa authFetch do módulo de autenticação
import { authFetch } from '../registrations/auth.js'; 

async function initProductRender() {
  const products = await fetchSellerProducts();


  const topProducts = products.slice(0, 5);

  const cardResponse = await fetch('../components/card.html');
  const cardHTML = await cardResponse.text();

  const gridContainer = document.querySelector(".card-grid");
  if (!gridContainer) {
    console.error("Container .card-grid não encontrado");
    return;
  }

  gridContainer.innerHTML = '';
  for (const product of topProducts) {
    renderProductCard(gridContainer, cardHTML, product);
  }
}


initProductRender(); 


// produtos
export async function fetchSellerProducts() { 
    try {
        const response = await authFetch(`http://localhost:8000/api/marketplace/public/products/`, {
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




// Render card 
export function renderProductCard(gridContainer, cardHTML, product) { 
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'product-card-wrapper';
    cardWrapper.id = `product-${product.id}`;
    cardWrapper.innerHTML = cardHTML;

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
        // event listener no botão .card-details
    const detailsButton = cardWrapper.querySelector('.card-details');
    if (detailsButton) {
        detailsButton.addEventListener('click', () => {
            window.location.href = `../product_details/index.html?id=${product.id}`;
        });
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

    
    const card = cardWrapper.querySelector('.card');
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
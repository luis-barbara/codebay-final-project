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


initProductRender(); // chamada inicial


// 3. Buscar produtos (EXPORTADA para ser chamada pelo script principal da página)
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

// 4. Fetch images (Media) - REMOVIDA (se ProductSerializer já inclui mídia)


// 5. Renderizar um card (EXPORTADA para ser chamada pelo script principal da página)
export function renderProductCard(gridContainer, cardHTML, product) { 
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'product-card-wrapper';
    cardWrapper.id = `product-${product.id}`;
    cardWrapper.innerHTML = cardHTML;

    // Imagem (usando 'url' ou 'thumbnail_url' do MediaSerializer)
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
        // Adicionar event listener no botão .card-details
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

    // Options menu
    const card = cardWrapper.querySelector('.card');
    // Global listener to close all menus when clicking outside
    // Esta lógica deve ser adicionada APENAS UMA VEZ por toda a aplicação
    // É mais seguro se for adicionada no seu script.js principal ou noutro script de orquestração global.
    // Assumimos que o script.js adiciona este listener globalmente.
    // Aqui, vamos apenas adicionar uma guarda para não duplicar listeners.
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
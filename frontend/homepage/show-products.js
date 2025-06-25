// frontend/my_products/show-products.js


// A IMPORTAÇÃO DE authFetch, pois não é necessária para produtos públicos.
// import { authFetch } from '../registrations/auth.js'; 

async function initProductRender() {
    console.log("Initializing product render...");

    const products = await fetchSellerProducts();

    // Assuming you already have the card HTML loaded:
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

// 3. Fetch products (NOW USING STANDARD 'fetch' for public data)
export async function fetchSellerProducts() { 
    try {
        // Use standard 'fetch', no authentication needed for public endpoints.
        const response = await fetch(`http://localhost:8000/api/marketplace/public/products/`, {
            method: 'GET', // Default method, but good to specify for clarity.
            headers: { 
                "Accept": "application/json" 
            }
        });

        if (response.status === 404) {
            console.warn("No products found for this user.");
            return [];
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Error ${response.status} fetching products:`, errorData);
            throw new Error(`Error fetching products: ${errorData.detail || response.statusText}`);
        }

        const products = await response.json();
        return Array.isArray(products) ? products : (products ? [products] : []);

    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

// 5. Render a card (Keep this function as is)
export function renderProductCard(gridContainer, cardHTML, product) { 
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'product-card-wrapper';
    cardWrapper.id = `product-${product.id}`;
    cardWrapper.innerHTML = cardHTML;

    // Image (using 'url' or 'thumbnail_url' from MediaSerializer)
    const img = cardWrapper.querySelector('.preview img');
    if (img) {
        const primaryMedia = Array.isArray(product.media)
            ? product.media.find(m => m.is_primary === true) || product.media.find(m => m.type === 'image')
            : null;

        if (primaryMedia?.url) { 
            img.src = `${primaryMedia.url}?t=${Date.now()}`;
            img.onerror = function () {
                console.error(`Error loading product image ${product.id}`);
                img.src = ''; 
            };
        } else {
            console.warn(`Product ${product.id} does not have a valid primary image URL in media.`);
            img.src = ''; 
        }
        // Add event listener to .card-details button
        const detailsButton = cardWrapper.querySelector('.card-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                window.location.href = `../product_details/index.html?id=${product.id}`;
            });
        }
    }

    // Title, Description, Category, Price
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
    // This logic should be added ONLY ONCE per application
    // It's safer if added in your main script.js or another global orchestration script.
    // Here, we'll just add a guard to avoid duplicating listeners.
    const card = cardWrapper.querySelector('.card'); // Assuming 'card' is meant to be used here
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

// Call initProductRender only when the DOM is fully loaded.
// This ensures that all imports (though now none for authFetch) are processed
// and the DOM elements are available.
document.addEventListener('DOMContentLoaded', initProductRender);
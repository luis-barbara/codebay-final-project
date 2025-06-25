import { authFetch } from "../registrations/auth.js";

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



export async function showProfile() {
    try {
        const response = await authFetch("http://localhost:8000/api/accounts/profile/me/");

        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || JSON.stringify(data));
            }

            if (typeof renderProfile === "function") {
                renderProfile(data);
            }

        } else {
            const text = await response.text();
            console.error("Resposta inesperada (texto):", text);
            throw new Error(`Resposta inesperada: ${text}`);
        }

    } catch (error) {
        console.error("Erro ao carregar perfil:", error.message);
        alert("Erro ao carregar perfil. Faça login novamente.");
    }
}


function renderProfile(profile) {
   const fullNameElement = document.getElementById("full-name");
if (fullNameElement) {
    console.log(profile.full_name);
    fullNameElement.textContent = profile.full_name;
}

    document.querySelector('.username').textContent = profile.username || "Utilizador";
    document.querySelector('.readme-content').innerHTML = profile.bio || "<p>Ainda não escreveste o teu README.</p>";

    document.querySelector('.info-item:nth-child(2) span').textContent = profile.role || "Função indefinida";
    document.querySelector('.info-item:nth-child(3) span').textContent = profile.location || "Sem localização";
    document.querySelector('.info-item:nth-child(4) a').textContent = profile.website || "";
    document.querySelector('.info-item:nth-child(4) a').href = profile.website || "#";
    document.querySelector('.info-item:nth-child(5) a').textContent = profile.email || "";
    console.log("Data recebida do backend:", profile.date_joined);

    const date = new Date(profile.date_joined);
    const formattedDate = date.toLocaleDateString('pt-PT', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    document.querySelector('.info-item:nth-child(6) span').textContent = `Entrou em ${formattedDate}`;

}




async function initProductRender() {

    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error("Token não encontrado.");
        return;
    }
    const payload = parseJwt(token);
    const userId = payload?.user_id;

    if (!userId) {
        console.error("user_id não encontrado no token.");
        return;
    }

    const products = await fetchSellerProducts(userId);


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

    // Options menu
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

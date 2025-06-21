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
      headers: { "Accept": "application/json" }
    });

    if (response.status === 404) return [];

    if (response.status === 400) {
      const fallbackResponse = await authFetch(`http://localhost:8000/api/marketplace/products/`, {
        headers: { "Accept": "application/json" }
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

// 4. Buscar imagens (Media)
async function fetchProductMedia(productId, token) {
  try {
    const response = await fetch(`http://localhost:8000/api/marketplace/media/?product=${productId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      console.warn(`Falha ao buscar media do produto ${productId}`);
      return [];
    }

    return await response.json();
  } catch (err) {
    console.error("Erro ao buscar media:", err);
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

// 6. Fechar modal
function closeModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) modal.style.display = "none";
}

// 7. Função para editar um produto
function openEditModal(product) {
  const modal = document.getElementById("editProductModal");
  if (!modal) return;

  modal.querySelector('#edit-title').value = product.title;
  modal.querySelector('#edit-description').value = product.description;
  modal.querySelector('#edit-category').value = product.category;
  modal.querySelector('#edit-price').value = product.price;

  modal.style.display = 'block';

  modal.querySelector('#saveEdit').onclick = async () => {
    await saveProductEdits(product.id);
  };
}

// Função para salvar a edição do produto
async function saveProductEdits(productId) {
  const title = document.getElementById('edit-title').value;
  const description = document.getElementById('edit-description').value;
  const category = document.getElementById('edit-category').value;
  const price = parseFloat(document.getElementById('edit-price').value);

  try {
    const response = await authFetch(`http://localhost:8000/api/marketplace/products/${productId}/`, {
      method: 'PUT',
      body: JSON.stringify({
        title, description, category, price
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    const updatedProduct = await response.json();

    if (!response.ok) throw new Error(`Erro ao editar produto: ${updatedProduct.detail || 'Erro desconhecido'}`);

    // Atualizar o produto na UI
    const productCard = document.getElementById(`product-${productId}`);
    if (productCard) {
      productCard.querySelector('.details .heading').textContent = updatedProduct.title;
      productCard.querySelector('.details .description').textContent = updatedProduct.description;
      productCard.querySelector('.details .price').textContent = `${updatedProduct.price.toFixed(2)}€`;
    }

    closeModal();
  } catch (err) {
    console.error("Erro ao salvar edição do produto:", err);
    alert(`Erro: ${err.message}`);
  }
}

// 8. Função para excluir um produto
async function deleteProduct(productId) {
  try {
    const response = await authFetch(`http://localhost:8000/api/marketplace/products/${productId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao excluir o produto: ${response.statusText}`);
    }

    // Remover o produto da UI
    const productCard = document.getElementById(`product-${productId}`);
    if (productCard) {
      productCard.remove();
    }

    alert('Produto excluído com sucesso!');
  } catch (err) {
    console.error("Erro ao excluir produto:", err);
    alert(`Erro: ${err.message}`);
  }
}

// 9. Função para compartilhar o produto
function shareProduct(productId) {
  const productUrl = `http://localhost:8000/product/${productId}`;
  if (navigator.share) {
    navigator.share({
      title: 'Compartilhe este produto',
      url: productUrl
    }).then(() => {
      console.log('Produto compartilhado!');
    }).catch(err => {
      console.error("Erro ao compartilhar:", err);
    });
  } else {
    prompt('Copie o link para compartilhar:', productUrl);
  }
}

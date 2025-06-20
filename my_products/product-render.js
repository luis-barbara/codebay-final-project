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

// 2. Injetar CSS de opções (uma vez)
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

// 3. Buscar produtos
async function fetchSellerProducts(sellerId, token) {
  const response = await fetch(`http://localhost:8000/api/market/products/?seller_id=${sellerId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar produtos do vendedor");
  }

  return await response.json();
}

// 4. Buscar arquivos do produto
async function fetchProductFiles(productId, token) {
  const response = await fetch(`http://localhost:8000/api/storage/files/?product_id=${productId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    console.warn(`Falha ao buscar arquivos do produto ${productId}`);
    return [];
  }

  return await response.json();
}

// 5. Renderizar um card
function renderProductCard(gridContainer, cardHTML, product) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'product-card-wrapper';
  cardWrapper.innerHTML = cardHTML;

  const img = cardWrapper.querySelector('.preview img');
  if (img) {
    let imageUrl = 'default-image.jpg';
    if (product.files && product.files.length > 0) {
      const imageFile = product.files.find(f => f.file_type && f.file_type.startsWith('image'));
      if (imageFile) imageUrl = imageFile.file_url;
    }
    img.src = imageUrl;
    img.alt = product.title || "Produto";
  }

  const heading = cardWrapper.querySelector('.details .heading');
  if (heading) heading.textContent = product.title || 'Sem título';

  const description = cardWrapper.querySelector('.details .description');
  if (description) description.textContent = product.description || 'No description';

  // Corrigir categoria (não é tecnologia, é category.name)
const tech = cardWrapper.querySelector('.details .tech');
if (tech) {
  tech.textContent = product.category || 'No category';
}

// Corrigir verificação do preço (string ou number)
const price = cardWrapper.querySelector('.details .price');
if (price) {
  const parsedPrice = parseFloat(product.price);
  if (!isNaN(parsedPrice)) {
    price.textContent = `${parsedPrice.toFixed(2)}€`;
  } else {
    price.textContent = 'Price unavailable';
  }
}


  // 6. Botão de opções e menu
  const card = cardWrapper.querySelector('.card');

  if (card) {
    const optionsButton = document.createElement('button');
    optionsButton.className = 'options-button';
    optionsButton.innerHTML = '⋮';

    const optionsMenu = document.createElement('div');
    optionsMenu.className = 'options-menu';
    optionsMenu.innerHTML = `
  <div class="options-menu-item share-item">
    <span>&#10149;</span> Share
  </div>
  <div class="options-menu-item edit-item">
    <span>&#9998;</span> Edit
  </div>
  <div class="options-menu-item delete-item">
    <span>&#128465;</span> Delete
  </div>
`;

// Adiciona evento ao botão Editar
const editBtn = optionsMenu.querySelector('.edit-item');
if (editBtn) {
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openEditModal(product); // product vem da função renderProductCard
    optionsMenu.classList.remove('active'); // fecha o menu após clicar
  });
}

const shareBtn = optionsMenu.querySelector('.share-item');
if (shareBtn) {
  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    shareProduct(product.id);
    optionsMenu.classList.remove('active');
  });
}

// Eliminar
const deleteBtn = optionsMenu.querySelector('.delete-item');
if (deleteBtn) {
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteProduct(product.id);
    optionsMenu.classList.remove('active');
  });
}


    card.appendChild(optionsButton);
    card.appendChild(optionsMenu);

    optionsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      optionsMenu.classList.toggle('active');
    });

    // Altera texto do botão principal do card (opcional)
    const mainButton = cardWrapper.querySelector('.button');
    if (mainButton) {
      mainButton.textContent = 'Unlist product';
    }
  }

  gridContainer.appendChild(cardWrapper);
}

// 7. Fechar modal (opcional)
function closeModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) {
    modal.style.display = "none";
  }
}

// 8. Função principal
async function handleAfterCreate() {
  injectCardOptionsStyles();

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Você precisa estar logado para visualizar os produtos.");
      return;
    }

    const payload = parseJwt(token);
    const sellerId = payload?.user_id;

    if (!sellerId) {
      alert("ID do vendedor não encontrado no token.");
      return;
    }

    const response = await fetch('../components/card.html');
    if (!response.ok) throw new Error(`Erro ao carregar template: ${response.status}`);
    const cardHTML = await response.text();

    const products = await fetchSellerProducts(sellerId, token);
    const gridContainer = document.querySelector(".card-grid");
    if (!gridContainer) {
      alert("Container .card-grid não encontrado.");
      return;
    }

    for (const product of products) {
      const files = await fetchProductFiles(product.id, token);
      product.files = files;
      renderProductCard(gridContainer, cardHTML, product);
    }

    closeModal();

  } catch (error) {
    console.error(error);
    alert(`Erro ao carregar produtos: ${error.message}`);
  }
}

// 9. Evento global para fechar dropdowns ao clicar fora
document.addEventListener('click', () => {
  document.querySelectorAll('.options-menu.active').forEach(menu => {
    menu.classList.remove('active');
  });
});

// Chamada inicial
handleAfterCreate();

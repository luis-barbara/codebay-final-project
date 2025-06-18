// frontend/my_products/product-render.js


// Função para buscar produto pelo ID
async function fetchProduct(productId, token) {
  const response = await fetch(`http://localhost:8000/api/market/products/${productId}/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return await response.json();
}

// Função para renderizar o produto na div .card-grid usando o template HTML
function renderProductCard(gridContainer, cardHTML, product) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'product-card-wrapper';

  // Injeta o HTML do template
  cardWrapper.innerHTML = cardHTML;

  // Substitui os valores estáticos pelos dados do produto
  const img = cardWrapper.querySelector('.preview img');
  if (img) {
    img.src = product.main_image_url || (product.media && product.media[0]?.file_url) || 'default-image.jpg';
    img.alt = product.title || "Produto";
  }

  const heading = cardWrapper.querySelector('.details .heading');
  if (heading) heading.textContent = product.title || 'Sem título';

  const description = cardWrapper.querySelector('.details .description');
  if (description) description.textContent = product.description || 'Sem descrição';

  const tech = cardWrapper.querySelector('.details .tech');
  if (tech) tech.textContent = product.technology || product.tech || 'Sem tecnologia';

  const price = cardWrapper.querySelector('.details .price');
  if (price && typeof product.price === "number") {
    price.textContent = `${product.price.toFixed(2)}€`;
  } else if (price) {
    price.textContent = 'Preço indisponível';
  }

  // Aqui pode continuar para rating e reviews se tiver esses dados no produto

  // Insere o card no container da grid
  gridContainer.appendChild(cardWrapper);
}

// Função para fechar o modal (ajuste se seu modal fecha de outro jeito)
function closeModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) {
    modal.style.display = "none";
  }
}

// Função para ser chamada depois que o produto for criado e arquivos enviados
async function handleAfterCreate(productId) {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Você precisa estar logado para visualizar o produto.");
      return;
    }

    // Busca o template do card
    const response = await fetch('../components/card.html');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const cardHTML = await response.text();

    // Busca o produto pelo ID
    const product = await fetchProduct(productId, token);

    // Busca o container onde os cards serão inseridos
    const gridContainer = document.querySelector(".card-grid");
    if (!gridContainer) {
      alert("Container .card-grid não encontrado.");
      return;
    }

    // Renderiza o card com o template e os dados do produto
    renderProductCard(gridContainer, cardHTML, product);

    // Fecha o modal
    closeModal();

  } catch (error) {
    console.error(error);
    alert(`Erro ao carregar produto: ${error.message}`);
  }
}

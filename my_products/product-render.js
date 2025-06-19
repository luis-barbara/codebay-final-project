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

// 2. Função para buscar produtos do seller
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

// 3. Função para renderizar cada produto no HTML
function renderProductCard(gridContainer, cardHTML, product) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'product-card-wrapper';

  // Injeta o template
  cardWrapper.innerHTML = cardHTML;

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

  // Adiciona ao DOM
  gridContainer.appendChild(cardWrapper);
}

// 4. Fechar modal (opcional)
function closeModal() {
  const modal = document.getElementById("modalOverlay");
  if (modal) {
    modal.style.display = "none";
  }
}

// 5. Função principal
async function handleAfterCreate() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Você precisa estar logado para visualizar os produtos.");
      return;
    }

    const payload = parseJwt(token);
    const sellerId = payload?.user_id; // ou payload?.seller_id, conforme o backend

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

    // 🔧 Aqui estava o erro: esta função precisa estar definida antes!
    products.forEach(product => {
      renderProductCard(gridContainer, cardHTML, product);
    });

    closeModal();

  } catch (error) {
    console.error(error);
    alert(`Erro ao carregar produtos: ${error.message}`);
  }
}

// Chama no load da página
handleAfterCreate();

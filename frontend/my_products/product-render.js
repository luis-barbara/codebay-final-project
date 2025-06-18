// frontend/my_products/product-render.js


// Função para buscar o produto pelo ID usando GET
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
  
  // Função para criar o HTML do produto para exibir na página
  function renderProduct(product) {
    const container = document.getElementById("productDisplayContainer");
    if (!container) {
      console.warn("Container para exibir o produto não encontrado!");
      return;
    }
  
    // Exemplo simples de card do produto com imagem principal
    const mainImageUrl = product.media && product.media.length > 0 ? product.media[0].file_url : null;
  
    container.innerHTML = `
      <h2>${product.title}</h2>
      ${mainImageUrl ? `<img src="${mainImageUrl}" alt="${product.title}" style="max-width: 300px;"/>` : ""}
      <p>${product.description}</p>
      <p><strong>Categoria:</strong> ${product.category}</p>
      <p><strong>Linguagem:</strong> ${product.language}</p>
      <p><strong>Preço:</strong> €${product.price.toFixed(2)}</p>
    `;
  }
  
  // Exemplo de uso: busca e renderiza o produto com ID passado
  async function loadAndRenderProduct(productId) {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Você precisa estar logado para ver o produto.");
        return;
      }
  
      const product = await fetchProduct(productId, token);
      renderProduct(product);
  
    } catch (error) {
      console.error(error);
      alert(`Erro ao buscar produto: ${error.message}`);
    }
  }
  
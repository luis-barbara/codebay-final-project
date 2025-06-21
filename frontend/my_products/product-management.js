// frontend/my_products/product-management.js

import { authFetch, getAccessToken } from '../registrations/auth.js';

// Função para criar o produto (dados principais em JSON)
async function createProduct(data) {
  const response = await authFetch("http://localhost:8000/api/marketplace/products/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const responseData = await response.json().catch(() => ({}));

  if (response.status === 400) {
    const errorMsg = responseData.detail ||
      Object.values(responseData).flat().join(", ") ||
      "Dados inválidos";
    throw new Error(`Erro de validação: ${errorMsg}`);
  }

  if (!response.ok) {
    throw new Error(responseData.detail || "Falha ao criar produto");
  }

  return responseData;
}



// Upload de arquivos genéricos (ZIP, código, etc.)
async function uploadFile(file, productId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("product_id", productId);
  formData.append("title", file.name);
  formData.append("is_main_file", false);
  formData.append("file_type", file.type || "unknown");

  const response = await authFetch("http://localhost:8000/api/storage/upload/", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Falha no upload do arquivo");
  }

  return await response.json();
}

// Upload de imagens como Media
async function uploadImageAsMedia(file, productId) {
  // Validação do tipo de arquivo
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validImageTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.');
  }

  // Validação do tamanho do arquivo (máx. 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('O tamanho da imagem não pode exceder 5MB.');
  }

  const formData = new FormData();
  formData.append("product", productId);
  formData.append("type", "image");
  formData.append("image", file);

  // Adiciona feedback visual do upload
  const uploadIndicator = document.getElementById('upload-progress');
  if (uploadIndicator) {
    uploadIndicator.style.display = 'block';
  }

  try {
    const response = await authFetch("http://localhost:8000/api/marketplace/media/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Tratamento específico para erros conhecidos
      if (response.status === 400) {
        const errorMsg = errorData.detail || 
                        Object.values(errorData).flat().join(", ") || 
                        "Dados inválidos";
        throw new Error(`Erro de validação: ${errorMsg}`);
      }

      if (response.status === 401) {
        throw new Error('Autenticação necessária. Faça login novamente.');
      }

      throw new Error(errorData.detail || "Erro ao salvar imagem");
    }

    const responseData = await response.json();
    console.log("Upload bem-sucedido:", responseData);

    // Exibir a imagem no frontend após o upload
    const imageUrl = responseData.image_url;  // Supondo que a API retorna image_url
    const imageElement = document.getElementById('uploaded-image'); 
    
    if (imageElement) {
      imageElement.src = imageUrl;  // Atualiza a imagem com a URL retornada
      imageElement.style.display = 'block';  // Exibe a imagem
    }

    return responseData;
  } catch (error) {
    console.error("Erro no upload:", error);

    // Mostra erro para o usuário
    showNotification(`Erro: ${error.message}`, 'error');
    throw error;
  } finally {
    if (uploadIndicator) {
      uploadIndicator.style.display = 'none';
    }
  }
}


// Criação de Media com vídeo (via URL)
async function createVideoMedia(videoUrl, productId) {
  const response = await authFetch("http://localhost:8000/api/marketplace/media/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "video",
      product: productId,
      video_url: videoUrl
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Erro ao salvar vídeo");
  }

  return await response.json();
}

// Handler do botão de criação de produto
document.getElementById("createProductBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  const createBtn = e.currentTarget; // ou document.getElementById("createProductBtn")
  createBtn.disabled = true;
  createBtn.textContent = "Criando...";

  try {
    if (!getAccessToken()) {
      alert("Você precisa estar logado para criar um produto.");
      return;
    }

    const getValidatedValue = (id, minLength = 1, label = id) => {
      const value = document.getElementById(id)?.value?.trim() || '';
      if (value.length < minLength) {
        throw new Error(`O campo "${label}" é obrigatório`);
      }
      return value;
    };

    const productData = {
      title: getValidatedValue("title", 3, "Título"),
      description: getValidatedValue("description", 10, "Descrição"),
      category: getValidatedValue("categories", 1, "Categoria"),
      language: getValidatedValue("languages", 1, "Linguagem"),
      price: parseFloat(getValidatedValue("pricing", 1, "Preço"))
    };

    if (!productData.category) {
      throw new Error("Categoria inválida");
    }
    if (!productData.language) {
      throw new Error("Linguagem inválida");
    }
    if (isNaN(productData.price) || productData.price < 0) {
      throw new Error("Preço inválido");
    }

    // criar o produto e o ID
    const createdProduct = await createProduct(productData);

    // Agora que o produto está criado, pode enviar imagens
    const imageInput = document.getElementById("imageUpload");
    if (imageInput?.files?.length > 0) {
      await Promise.all(
        Array.from(imageInput.files).map(file =>
          uploadImageAsMedia(file, createdProduct.id)
        )
      );
    }

    // Upload de arquivos genéricos
    const fileInput = document.getElementById("fileUpload");
    if (fileInput?.files?.length > 0) {
      await Promise.all(
        Array.from(fileInput.files).map(file =>
          uploadFile(file, createdProduct.id)
        )
      );
    }

    // Adicionar vídeo por URL
    const videoUrl = document.getElementById("videoUrl")?.value?.trim();
    if (videoUrl) {
      const isValidUrl = /^(https?:\/\/)/i.test(videoUrl);
      if (!isValidUrl) {
        throw new Error("URL do vídeo inválida");
      }

      try {
        await createVideoMedia(videoUrl, createdProduct.id);
      } catch (err) {
        console.warn("Erro ao adicionar vídeo:", err);
        alert("Produto criado, mas houve um erro ao adicionar o vídeo.");
      }
    }

    alert("Produto criado com sucesso!");

    if (typeof handleAfterCreate === 'function') {
      await handleAfterCreate();
    } else {
      window.location.reload();
    }

  } catch (error) {
    console.error("Erro completo:", error);
    alert(`Erro: ${error.message}`);
  } finally {
    createBtn.disabled = false;
    createBtn.textContent = "Criar Produto";
  }

}
);
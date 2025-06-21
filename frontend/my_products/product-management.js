// frontend/my_products/product-management.js


import { authFetch, getAccessToken } from '../registrations/auth.js';

// Função para criar o produto e enviar junto com as imagens
async function createProductWithFiles(data, files) {
  const formData = new FormData();

  // Adiciona os dados do produto
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("language", data.language);
  formData.append("price", data.price);

  // Adiciona as imagens, caso existam
  if (files && files.image) {
    files.image.forEach(file => {
      formData.append("images", file);
    });
  }

  // Enviar a requisição com multipart/form-data
  const response = await authFetch("http://localhost:8000/api/marketplace/products/", {
    method: "POST",
    body: formData,
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

  return responseData;  // Retorna o produto com o ID
}

// Função para upload de arquivos genéricos
async function uploadFile(file, productId) {
  const maxSize = 20 * 1024 * 1024; // Limite opcional de 20MB 

  if (file.size > maxSize) {
    throw new Error('O tamanho do arquivo não pode exceder 20MB.');
  }

  const formData = new FormData();
  formData.append("product", productId);
  formData.append("type", "file");
  formData.append("file", file);

  try {
    const response = await authFetch("http://localhost:8000/api/marketplace/media/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Falha ao salvar arquivo");
    }

    const responseData = await response.json();
    console.log("Arquivo enviado com sucesso:", responseData);
    return responseData;
  } catch (error) {
    console.error("Erro no upload de arquivo:", error);
    throw error;
  }
}

// Função para adicionar vídeo via URL
async function createVideoMedia(videoUrl, productId) {
  const formData = new FormData();
  formData.append("product", productId);
  formData.append("type", "video");
  formData.append("video_url", videoUrl);

  try {
    const response = await authFetch("http://localhost:8000/api/marketplace/media/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Falha ao salvar vídeo");
    }

    const responseData = await response.json();
    console.log("Vídeo adicionado com sucesso:", responseData);
    return responseData;
  } catch (error) {
    console.error("Erro ao adicionar vídeo:", error);
    throw error;
  }
}

// Handler do botão de criação de produto
document.getElementById("createProductBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  const createBtn = e.currentTarget;
  createBtn.disabled = true;
  createBtn.textContent = "Creating...";

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

    // Obter imagens do input
    const imageInput = document.getElementById("imageUpload");
    const images = imageInput?.files ? Array.from(imageInput.files) : [];

    // Criar o produto junto com as imagens
    const createdProduct = await createProductWithFiles(productData, { image: images });

    // Agora que o produto foi criado com sucesso, podemos associar os arquivos genéricos (se houver)
    const fileInput = document.getElementById("fileUpload");
    if (fileInput?.files?.length > 0) {
      await Promise.all(
        Array.from(fileInput.files).map(file =>
          uploadFile(file, createdProduct.id)
        )
      );
    }

    // Adicionar vídeo por URL (se houver)
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
      await handleAfterCreate(); // Atualizar o frontend com o produto criado
    } else {
      window.location.reload(); // Recarregar a página
    }

  } catch (error) {
    console.error("Erro completo:", error);
    alert(`Erro: ${error.message}`);
  } finally {
    createBtn.disabled = false;
    createBtn.textContent = "Criar Produto";
  }
});

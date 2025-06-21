// frontend/my_products/product-actions.js

// Abre o modal e preenche os campos com os dados do produto selecionado
function openEditModal(product) {
    document.getElementById("modalOverlay").style.display = "flex";

    // Preenche os campos
    document.getElementById("title").value = product.title;
    document.getElementById("description").value = product.description;
    document.getElementById("categories").value = product.category;
    document.getElementById("languages").value = product.language;
    document.getElementById("pricing").value = product.price;
    document.getElementById("github").value = product.github_repo || "";

    // --- AQUI COMEÇA O BLOCO A ADICIONAR ---
    const createBtn = document.getElementById("createProductBtn");

    // Substitui o botão antigo por um novo (remove listeners antigos)
    const newBtn = createBtn.cloneNode(true);
    createBtn.parentNode.replaceChild(newBtn, createBtn);

    // Atualiza o texto do botão
    newBtn.textContent = "Edit Product";

    // Listener para atualizar
    newBtn.addEventListener("click", () => updateProduct(product.id));

    // Valida já com os dados carregados (garante que botão esteja corretamente ativo/desativo)
    validateForm();
}


// Função para atualizar o produto
async function updateProduct(productId) {
    const token = localStorage.getItem("accessToken");

    const updatedData = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        category: document.getElementById("categories").value,
        language: document.getElementById("languages").value,
        price: parseFloat(document.getElementById("pricing").value.trim()),
        github_repo: document.getElementById("github").value.trim()
    };

    // Validação simples
    if (!updatedData.title || !updatedData.description || isNaN(updatedData.price) || updatedData.price < 0) {
        alert("Por favor, preencha os campos obrigatórios corretamente.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/marketplace/products/${productId}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to update product");
        }

        alert("Product updated successfully!");
        closeModal();
        await handleAfterCreate();  // Atualiza lista sem reload

    } catch (error) {
        console.error(error);
        alert(`Error updating product: ${error.message}`);
    }
}

async function deleteProduct(productId) {
    const token = localStorage.getItem("accessToken");

    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
        const response = await fetch(`http://localhost:8000/api/marketplace/products/${productId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to delete product");
        }

        alert("Product deleted successfully!");
        closeModal();
        document.getElementById(`product-${productId}`)?.remove();
        await handleAfterCreate();  // Atualiza lista para evitar inconsistências

    } catch (error) {
        console.error(error);
        alert(`Error deleting product: ${error.message}`);
    }
}


// Função para partilhar o link do produto
function shareProduct(productId) {
    const shareUrl = `http://localhost:5500/frontend/product_details/index.html/${productId}`;
    navigator.clipboard.writeText(shareUrl)
        .then(() => alert("Product link copied to clipboard!"))
        .catch(() => alert("Failed to copy the product link."));
}

// Exportar para usar noutros scripts
window.openEditModal = openEditModal;
window.deleteProduct = deleteProduct;
window.shareProduct = shareProduct;


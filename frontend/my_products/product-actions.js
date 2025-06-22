// frontend/my_products/product-actions.js


import { authFetch } from '../registrations/auth.js'; 

/**
 * Função auxiliar interna para obter valores do modal, sabendo que é o script.js que gere o DOM.
 * @param {string} id - ID do elemento DOM.
 * @returns {string} O valor do input.
 */
function getModalInputValue(id) {
    return document.getElementById(id)?.value?.trim() || '';
}

/**
 * Função auxiliar interna para definir valores no modal, sabendo que é o script.js que gere o DOM.
 * @param {string} id - ID do elemento DOM.
 * @param {string} value - O valor a definir.
 */
function setModalInputValue(id, value) {
    const input = document.getElementById(id);
    if (input) input.value = value;
}

/**
 * Abre o modal de edição e preenche os campos.
 * @param {Object} product - O objeto produto a ser editado.
 * @param {Function} validateFormCallback - Callback para validar o formulário após preenchimento.
 */
export function openEditModal(product, validateFormCallback) {
    // Assumimos que 'modalOverlay' é o ID do modal principal (no script.js)
    document.getElementById("modalOverlay").style.display = "flex";

    // Preenche os campos do formulário do modal
    setModalInputValue("title", product.title);
    setModalInputValue("description", product.description);
    setModalInputValue("categories", product.category);
    setModalInputValue("languages", product.language);
    setModalInputValue("pricing", product.price);
    setModalInputValue("github", product.github_repo || ""); 

    const createProductBtn = document.getElementById("createProductBtn"); 
    createProductBtn.dataset.mode = 'edit';
    createProductBtn.dataset.productId = product.id;
    createProductBtn.textContent = "Edit Product"; 

    // Chama o callback para revalidar o formulário principal
    if (typeof validateFormCallback === 'function') {
        validateFormCallback(); 
    }
    // Nota: Lógica de pré-visualização de imagens/ficheiros para edição (se houver)
    // teria que ser tratada no script.js que gere o modal, e não aqui.
}

/**
 * Atualiza um produto existente no backend.
 * @param {number} productId - O ID do produto a ser atualizado.
 * @param {Object} updatedData - Os dados atualizados do produto (já validados).
 * @param {Object} callbacks - Objeto com funções de callback: {closeModal, handleAfterCreate, setButtonState}
 */
export async function updateProduct(productId, updatedData, callbacks) {
    const { closeModal, handleAfterCreate, setButtonState } = callbacks;

    setButtonState(true, "Updating..."); // Desativa e muda texto

    const MIN_TITLE_LENGTH = 3;
    const MIN_DESC_LENGTH = 10; 
    // Validação robusta ANTES de enviar para a API (redundante se o script.js já valida, mas seguro)
    if (updatedData.title.length < MIN_TITLE_LENGTH) { alert(`Title must be at least ${MIN_TITLE_LENGTH} characters.`); setButtonState(false, "Edit Product"); return; }
    if (updatedData.description.length < MIN_DESC_LENGTH) { alert(`Description must be at least ${MIN_DESC_LENGTH} characters.`); setButtonState(false, "Edit Product"); return; }
    if (updatedData.category === '') { alert('Category is required.'); setButtonState(false, "Edit Product"); return; }
    if (updatedData.language === '') { alert('Language is required.'); setButtonState(false, "Edit Product"); return; }
    if (isNaN(updatedData.price) || updatedData.price < 0) { alert('Price must be a positive number.'); setButtonState(false, "Edit Product"); return; }

    try {
        const response = await authFetch(`http://localhost:8000/api/marketplace/products/${productId}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Backend error during product update:", response.status, errorData);
            throw new Error(errorData.detail || JSON.stringify(errorData) || "Failed to update product");
        }

        alert("Product updated successfully!");
        closeModal(); // Chama o callback para fechar o modal
        await handleAfterCreate(); // Chama o callback para atualizar a UI

    } catch (error) {
        console.error("Error updating product:", error);
        alert(`Error updating product: ${error.message}`);
    } finally {
        // Reseta o estado do botão para o modo 'create'
        setButtonState(false, "Create Product"); 
        document.getElementById("createProductBtn").dataset.mode = 'create';
        delete document.getElementById("createProductBtn").dataset.productId;
        // Não chamamos validateForm aqui, pois já está implícito no setButtonState para o modo 'create'
    }
}

/**
 * Exclui um produto do backend.
 * @param {number} productId - O ID do produto a ser excluído.
 * @param {Object} callbacks - Objeto com funções de callback: {closeModal, handleAfterCreate}
 */
export async function deleteProduct(productId, callbacks) {
    const { closeModal, handleAfterCreate } = callbacks;

    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
        const response = await authFetch(`http://localhost:8000/api/marketplace/products/${productId}/`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Backend error during product deletion:", response.status, errorData);
            throw new Error(errorData.detail || JSON.stringify(errorData) || "Failed to delete product");
        }

        alert("Product deleted successfully!");
        closeModal(); // Chama o callback para fechar o modal

        document.getElementById(`product-${productId}`)?.remove(); // Remove o cartão da UI
        
        await handleAfterCreate(); // Chama o callback para atualizar a UI

    } catch (error) {
        console.error("Error deleting product:", error);
        alert(`Error deleting product: ${error.message}`);
    }
}

/**
 * Compartilha o link de um produto.
 * @param {number} productId - O ID do produto a ser compartilhado.
 */
export function shareProduct(productId) {
    const productUrl = `http://localhost:5500/frontend/product_details/index.html?id=${productId}`; 

    if (navigator.share) {
        navigator.share({
            title: 'Check out this product on CodeBay!',
            url: productUrl
        }).then(() => {
            console.log('Product shared successfully!');
        }).catch(err => {
            console.error("Error sharing product:", err);
            navigator.clipboard.writeText(productUrl)
                .then(() => alert("Product link copied to clipboard!"))
                .catch(() => alert("Failed to copy the product link."));
        });
    } else {
        prompt('Copy the link to share this product:', productUrl);
    }
}
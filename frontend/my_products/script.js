// frontend/my_products/script.js


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

import { authFetch, getAccessToken } from '../registrations/auth.js';


import { 
    openEditModal as importedOpenEditModal, 
    updateProduct, 
    deleteProduct, 
    shareProduct 
} from './product-actions.js';

// Variáveis Globais do Módulo 
let modalOverlay;
let openModalBtn;
let closeModalBtn;
let cancelBtn;
let titleInput;
let descriptionInput;
let categoriesSelect;
let languagesSelect;
let githubInput;
let pricingInput;
let addVideoBtn;
let addImageBtn;
let addFileBtn;
let imageUploadInput;
let fileUploadInput;
let videoLinksContainer;
let imagePlaceholders;
let fileListContainer;
let createProductBtn;
let videoCounter = 0; 


let selectedPrimaryImages = [];
let selectedProjectFiles = [];


const MIN_TITLE_LENGTH = 3;
const MIN_DESC_LENGTH = 10;
const MAX_IMAGES = 4;
const MAX_VIDEOS = 2;
const MAX_FILE_SIZE_MB = 20;

const BTN_DISABLED_COLOR = '#CBE1CC';
const BTN_ENABLED_COLOR = '#238636';




export const updateButtonState = (button, disabled) => { 
    if (!button) return;
    button.disabled = disabled;
    button.style.cursor = disabled ? 'not-allowed' : 'pointer';
    button.style.opacity = disabled ? '0.6' : '1';
};

// Funções internas auxiliares 
const checkVideoLimit = () => {
    if (!videoLinksContainer || !addVideoBtn) return;
    const currentVideos = videoLinksContainer.querySelectorAll('.video-url-input').length;
    updateButtonState(addVideoBtn, currentVideos >= MAX_VIDEOS);
};

const checkImageLimit = () => {
    if (!imagePlaceholders.length || !addImageBtn) return;
    updateButtonState(addImageBtn, selectedPrimaryImages.length >= MAX_IMAGES);
};

const handleImageUploadPreview = async (event) => {
    const files = Array.from(event.target.files);
    event.target.value = '';

    const currentImageCount = selectedPrimaryImages.length;
    const availableSlots = MAX_IMAGES - currentImageCount;

    if (availableSlots === 0) { alert(`You can only add a maximum of ${MAX_IMAGES} images.`); return; }
    const filesToProcess = files.slice(0, availableSlots);

    for (const file of filesToProcess) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { alert(`Image "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit and will not be added.`); continue; }

        selectedPrimaryImages.push(file);

        let placeholder = null;
        for (let i = 0; i < imagePlaceholders.length; i++) {
            if (!imagePlaceholders[i].querySelector('img.temp-preview')) {
                placeholder = imagePlaceholders[i];
                break;
            }
        }
        if (!placeholder) continue;

        placeholder.innerHTML = '<div class="image-loader"></div>';
        const reader = new FileReader();
        reader.onload = (e) => {
            placeholder.innerHTML = `
                <img src="${e.target.result}" class="temp-preview" alt="Preview">
                <button type="button" class="remove-image-btn" data-file-name="${file.name}" data-file-size="${file.size}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            placeholder.querySelector('.remove-image-btn').addEventListener('click', (btnEvent) => {
                btnEvent.stopPropagation();
                placeholder.innerHTML = '<i class="fas fa-image"></i>';
                
                const fileNameToRemove = btnEvent.currentTarget.dataset.fileName;
                const fileSizeToRemove = parseInt(btnEvent.currentTarget.dataset.fileSize);
                selectedPrimaryImages = selectedPrimaryImages.filter(f => 
                    !(f.name === fileNameToRemove && f.size === fileSizeToRemove)
                );

                validateForm();
                checkImageLimit();
            });
            validateForm();
            checkImageLimit();
        };
        reader.readAsDataURL(file);
    }
};

const handleProjectFileUploadPreview = (event) => {
    const files = Array.from(event.target.files);
    event.target.value = '';

    fileListContainer.innerHTML = '';
    selectedProjectFiles = [];

    for (const file of files) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { alert(`File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit and will not be added.`); continue; }

        selectedProjectFiles.push(file);

        const fileElement = document.createElement('div');
        fileElement.classList.add('file-item');
        const iconClass = file.type.startsWith('image/') ? 'fa-file-image' :
                          file.name.toLowerCase().endsWith('.zip') ? 'fa-file-archive' :
                          file.name.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf' :
                          file.name.toLowerCase().endsWith(('.js', '.py', '.html', '.css')) ? 'fa-file-code' :
                          'fa-file-alt';
        fileElement.innerHTML = `
            <i class="fas ${iconClass}"></i> <span>${file.name}</span>
            <button type="button" class="remove-file-btn" data-file-name="${file.name}" data-file-size="${file.size}">
                <i class="fas fa-times"></i>
            </button>
        `;
        fileListContainer.appendChild(fileElement);

        fileElement.querySelector('.remove-file-btn').addEventListener('click', (btnEvent) => {
            btnEvent.stopPropagation();
            fileElement.remove();

            const fileNameToRemove = btnEvent.currentTarget.dataset.fileName;
            const fileSizeToRemove = parseInt(btnEvent.currentTarget.dataset.fileSize);
            selectedProjectFiles = selectedProjectFiles.filter(f => !(f.name === fileNameToRemove && f.size === fileSizeToRemove));

            validateForm();
        });
    }
};

// Lógica principal de validação do formulário 
export const validateForm = () => { 
    const isTitleValid = titleInput.value.trim().length >= MIN_TITLE_LENGTH;
    const isDescriptionValid = descriptionInput.value.trim().length >= MIN_DESC_LENGTH;
    const priceValue = pricingInput.value.trim();
    const isPriceValid = priceValue !== '' && !isNaN(parseFloat(priceValue)) && parseFloat(priceValue) >= 0;
    const isCategorySelected = categoriesSelect.value !== '';
    const isLanguageSelected = languagesSelect.value !== '';

    const hasPrimaryImage = selectedPrimaryImages.length > 0;
    const hasProjectFile = selectedProjectFiles.length > 0;

    const isFormValid = isTitleValid && isDescriptionValid && isPriceValid && isCategorySelected && isLanguageSelected && hasPrimaryImage && hasProjectFile;

    updateButtonState(createProductBtn, !isFormValid);
    createProductBtn.style.backgroundColor = isFormValid ? BTN_ENABLED_COLOR : BTN_DISABLED_COLOR;
    return isFormValid;
};

// Lógica de Abrir/Fechar Modal 
export const closeModal = () => { 
    if (modalOverlay) modalOverlay.style.display = 'none';
};

export const openAddModal = () => { 
    if (!modalOverlay) return;

    titleInput.value = '';
    descriptionInput.value = '';
    pricingInput.value = '';
    categoriesSelect.value = '';
    languagesSelect.value = '';
    if (githubInput) githubInput.value = '';

    imagePlaceholders.forEach(p => { p.innerHTML = '<i class="fas fa-image"></i>'; });
    imageUploadInput.value = '';
    selectedPrimaryImages = [];

    fileListContainer.innerHTML = '';
    fileUploadInput.value = '';
    selectedProjectFiles = [];

    videoLinksContainer.innerHTML = '';
    videoCounter = 0;

    createProductBtn.textContent = "Create Product";
    createProductBtn.dataset.mode = 'create';
    delete createProductBtn.dataset.productId;

    modalOverlay.style.display = 'flex';
    validateForm();
    checkImageLimit();
    checkVideoLimit();
};

export const handleAfterCreate = async () => { 
    window.location.reload(); 
};


// Funções de Interação com a API
async function createProductWithPrimaryImages(productData, primaryImageFiles) {
    const formData = new FormData();
    formData.append("title", productData.title);
    formData.append("description", productData.description);
    formData.append("category", productData.category);
    formData.append("language", productData.language);
    formData.append("price", productData.price);
    if (productData.github_repo) formData.append("github_repo", productData.github_repo);

    primaryImageFiles.forEach(file => { formData.append("images", file); });

    const response = await authFetch("http://localhost:8000/api/marketplace/products/", { method: "POST", body: formData });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) { 
        console.error("Backend error for Product creation:", response.status, responseData);
        const errorMsg = responseData.detail || JSON.stringify(responseData) || "Invalid product data";
        throw new Error(`Error creating product: ${errorMsg}`);
    }
    return responseData;
}

async function uploadMediaFile(fileOrUrl, productId, type) {
    const formData = new FormData();
    formData.append("product", productId);
    formData.append("type", type);
    if (type === "image" && fileOrUrl instanceof File) {
        if (fileOrUrl.size > MAX_FILE_SIZE_MB * 1024 * 1024) { throw new Error(`Image file size exceeds ${MAX_FILE_SIZE_MB}MB limit.`); }
        formData.append("image", fileOrUrl);
    } else if (type === "video" && typeof fileOrUrl === 'string') {
        formData.append("video_url", fileOrUrl);
    } else { throw new Error(`Invalid media file or URL for type "${type}": ${fileOrUrl}`); }

    console.log(`Sending FormData to /api/marketplace/media/ (type: ${type}):`, Array.from(formData.entries()));
    try {
        const response = await authFetch("http://localhost:8000/api/marketplace/media/", { method: "POST", body: formData });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Backend error details (MediaViewSet):", response.status, errorData);
            throw new Error(errorData.error || errorData.detail || "Failed to save media file");
        }
        return await response.json();
    } catch (error) { console.error("Error uploading media file:", error); throw error; }
}


async function uploadProjectFile(file, productId, title, description = '', isMain = false, fileType = '') {
    // Validação de tamanho do ficheiro
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { 
        throw new Error(`Project file size exceeds ${MAX_FILE_SIZE_MB}MB limit.`); 
    }

    // Construção do FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("product_id", productId);
    formData.append("is_main_file", isMain);
    formData.append("file_type", fileType);

    console.log(`Sending FormData to /api/storage/upload/: ${Array.from(formData.entries()).map(([k,v]) => `${k}=${v instanceof File ? v.name : v}`).join(', ')}`);
    
    let response;
    let responseText = ''; 
    let responseData = {}; 

    try {
        // requisição autenticada
        response = await authFetch("http://localhost:8000/api/storage/upload/", { method: "POST", body: formData });
        
        try {
            responseText = await response.text();
            console.log("uploadProjectFile: Raw response text from API:", responseText);
        } catch (textError) {
            console.warn("uploadProjectFile: Failed to read response body as text.", textError);
            responseText = ''; 
        }

        // parse do texto para JSON
        if (responseText) { 
            try {
                responseData = JSON.parse(responseText);
            } catch (jsonError) {
                console.warn("uploadProjectFile: Failed to parse JSON from response text.", jsonError);
                // Se o parsing JSON falhar, responseData permanece {}, mas o erro não é relançado aqui.
            }
        }
        
        // Verificar o status da resposta HTTP
        if (!response.ok) { 
            console.error("uploadProjectFile: Backend returned a non-OK status.", response.status, responseData || responseText);
            const errorMsg = responseData.error || responseData.detail || responseText || `Unknown server error (Status: ${response.status}).`;
            throw new Error(`Failed to upload project file: ${errorMsg}`);
        }
        
        console.log("Project file successfully uploaded and processed by backend:", responseData || responseText);
        return responseData || {};

    } catch (error) { 
        
        console.error("Caught unhandled error during project file upload request (rethrowing):", error, error.message, error.stack);
        throw error; 
    }
}




document.addEventListener('DOMContentLoaded', () => {
   
    modalOverlay = document.getElementById('modalOverlay');
    openModalBtn = document.getElementById('openModalBtn'); 
    closeModalBtn = document.getElementById('closeModalBtn');
    cancelBtn = document.getElementById('cancelBtn');
    titleInput = document.getElementById('title');
    descriptionInput = document.getElementById('description');
    categoriesSelect = document.getElementById('categories');
    languagesSelect = document.getElementById('languages');
    githubInput = document.getElementById('github');
    pricingInput = document.getElementById('pricing');
    addVideoBtn = document.getElementById('addVideoBtn');
    addImageBtn = document.getElementById('addImageBtn');
    addFileBtn = document.getElementById('addFileBtn');
    imageUploadInput = document.getElementById('imageUpload');
    fileUploadInput = document.getElementById('fileUpload');
    videoLinksContainer = document.getElementById('videoLinksContainer');
    imagePlaceholders = document.querySelectorAll('.image-placeholder');
    fileListContainer = document.querySelector('.file-list');
    createProductBtn = document.getElementById('createProductBtn');

    // Configuração dos Event Listeners
    if (openModalBtn) openModalBtn.addEventListener('click', openAddModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    titleInput.addEventListener('input', validateForm);
    descriptionInput.addEventListener('input', validateForm);
    pricingInput.addEventListener('input', validateForm);
    categoriesSelect.addEventListener('change', validateForm);
    languagesSelect.addEventListener('change', validateForm);

    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => {
            if (videoLinksContainer.querySelectorAll('.video-url-input').length >= MAX_VIDEOS) {
                alert(`You can only add a maximum of ${MAX_VIDEOS} video links.`);
                return;
            }
            videoCounter++;
            const inputId = `videoUrl-${videoCounter}`;
            const videoDiv = document.createElement('div');
            videoDiv.classList.add('video-link-item');
            videoDiv.innerHTML = `
                <label for="${inputId}">Video URL ${videoCounter}</label>
                <input type="url" id="${inputId}" class="video-url-input" placeholder="Enter video URL (e.g., YouTube, Vimeo)" />
                <button type="button" class="remove-video-btn btn-danger">
                    <i class="fas fa-times"></i>
                </button>
            `;
            videoLinksContainer.appendChild(videoDiv);

            videoDiv.querySelector('.remove-video-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                videoDiv.remove();
                checkVideoLimit();
                validateForm();
            });
            checkVideoLimit();
            validateForm();
        });
    }

    if (addImageBtn) { addImageBtn.addEventListener('click', () => imageUploadInput && imageUploadInput.click()); }
    if (imageUploadInput) { imageUploadInput.addEventListener('change', handleImageUploadPreview); }

    if (addFileBtn) { addFileBtn.addEventListener('click', () => fileUploadInput && fileUploadInput.click()); }
    if (fileUploadInput) { fileUploadInput.addEventListener('change', handleProjectFileUploadPreview); }

    // Main Product Creation/Edit
    if (createProductBtn) {
        createProductBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            if (!validateForm()) { 
                alert("Please fill in all required fields and ensure all files are selected correctly.");
                return;
            }

            createProductBtn.disabled = true;
            createProductBtn.textContent = (createProductBtn.dataset.mode === 'edit') ? "Saving..." : "Creating...";

            try {
                if (!getAccessToken()) {
                    alert("Você precisa estar logado para criar um produto.");
                    return;
                }

                const productData = {
                    title: titleInput.value.trim(),
                    description: descriptionInput.value.trim(),
                    category: categoriesSelect.value,
                    language: languagesSelect.value,
                    price: parseFloat(pricingInput.value.trim()),
                    github_repo: githubInput.value.trim() 
                };

                const mode = createProductBtn.dataset.mode || 'create';
                const productId = createProductBtn.dataset.productId;

                if (mode === 'create') {
                    const primaryImagesToUpload = selectedPrimaryImages;
                    const videoUrlsToUpload = Array.from(videoLinksContainer.querySelectorAll('.video-url-input'))
                                                   .map(input => input.value.trim())
                                                   .filter(url => url !== '');
                    const projectFilesToUpload = selectedProjectFiles;

                    if (primaryImagesToUpload.length === 0) { throw new Error("Pelo menos uma imagem principal é obrigatória."); }
                    if (projectFilesToUpload.length === 0) { throw new Error("Pelo menos um ficheiro de projeto é obrigatório."); }

                    const createdProduct = await createProductWithPrimaryImages(productData, primaryImagesToUpload);
                    
                    // console.log do produto criado
                    console.log("DEBUG SCRIPT.JS: Produto criado:", createdProduct); 
                    console.log("DEBUG SCRIPT.JS: ID do Produto criado para upload de ficheiros:", createdProduct ? createdProduct.id : "undefined/null");
                    
                    if (!createdProduct || !createdProduct.id) { throw new Error("Falha ao criar o produto principal. Verifique os detalhes do produto ou as imagens primárias."); }

                    await Promise.all(videoUrlsToUpload.map(url => uploadMediaFile(url, createdProduct.id, "video")));
                    await Promise.all(projectFilesToUpload.map((file, index) => {
                        const isMainFile = projectFilesToUpload.length === 1 || index === 0;
                        const fileExtension = file.name.split('.').pop() || '';
                        return uploadProjectFile(file, createdProduct.id, file.name, `Ficheiro do projeto: ${file.name}`, isMainFile, fileExtension);
                    }));

                    alert("Produto criado com sucesso!");

                } else if (mode === 'edit') {
                    if (!productId) { throw new Error("ID do produto para edição não encontrado."); }
                    
                    await updateProduct(productId, productData, { 
                        closeModal: closeModal, 
                        handleAfterCreate: handleAfterCreate,
                        setButtonState: (disabled, text) => { 
                            createProductBtn.disabled = disabled;
                            createProductBtn.textContent = text;
                            updateButtonState(createProductBtn, disabled); 
                        }
                    });
                }
                
                // Redirecionamento/Atualização 
                if (mode === 'create') { 
                    closeModal(); 
                    if (typeof window.handleAfterCreate === 'function') { await window.handleAfterCreate(); }
                    else { window.location.reload(); }
                }

            } catch (error) { 
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error("Erro completo no fluxo do produto:", error); 
                alert(`Erro: ${errorMessage}`); 
               
            } finally {
               
                if (createProductBtn.dataset.mode !== 'edit') { 
                    createProductBtn.disabled = false;
                    createProductBtn.textContent = "Criar Produto";
                }
            }
        });
    }

    validateForm();
    checkImageLimit();
    checkVideoLimit();
});
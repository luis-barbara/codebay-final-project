// frontend/my_products/script.js


document.addEventListener('DOMContentLoaded', () => {
    // ==================================
    // === LÓGICA DO MODAL DE PRODUTO ===
    // ==================================

    // Limites de Validação e Upload
    const MIN_TITLE_LENGTH = 3;
    const MIN_DESC_LENGTH = 10;
    const MAX_IMAGES = 4;
    const MAX_VIDEOS = 2;

    // Cores do Botão Principal
    const BTN_DISABLED_COLOR = '#CBE1CC';
    const BTN_ENABLED_COLOR = '#238636';

    // Elementos do Modal (mantidos os existentes)
    const modalOverlay = document.getElementById('modalOverlay');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const pricingInput = document.getElementById('pricing');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const addImageBtn = document.getElementById('addImageBtn');
    const addFileBtn = document.getElementById('addFileBtn');
    const imageUpload = document.getElementById('imageUpload');
    const fileUpload = document.getElementById('fileUpload');
    const videoLinksContainer = document.getElementById('videoLinksContainer');
    const imagePlaceholders = document.querySelectorAll('.image-placeholder');
    const fileListContainer = document.querySelector('.file-list');

    // --- Funções Auxiliares ---
    const updateButtonState = (button, disabled) => {
        if (!button) return;
        button.disabled = disabled;
        button.style.cursor = disabled ? 'not-allowed' : 'pointer';
        button.style.opacity = disabled ? '0.6' : '1';
    };

    const checkVideoLimit = () => {
        if (!videoLinksContainer || !addVideoBtn) return;
        const currentVideos = videoLinksContainer.querySelectorAll('input').length;
        updateButtonState(addVideoBtn, currentVideos >= MAX_VIDEOS);
    };

    const checkImageLimit = () => {
        if (!imagePlaceholders.length || !addImageBtn) return;
        const filledPlaceholders = Array.from(imagePlaceholders).filter(p => 
            p.querySelector('img') && p.querySelector('img').src
        ).length;
        updateButtonState(addImageBtn, filledPlaceholders >= MAX_IMAGES);
    };

    // --- Nova função de upload de imagens ---
    const handleImageUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        const emptyPlaceholders = Array.from(imagePlaceholders).filter(p => 
            !p.querySelector('img') || !p.querySelector('img').src
        );
        
        if (emptyPlaceholders.length === 0) {
            alert("Todos os espaços para imagens estão preenchidos");
            return;
        }

        // Mostra loaders durante o upload
        emptyPlaceholders.forEach(p => {
            p.innerHTML = '<div class="image-loader"></div>';
        });

        try {
            const filesToProcess = Array.from(files).slice(0, emptyPlaceholders.length);
            
            for (let i = 0; i < filesToProcess.length; i++) {
                const file = filesToProcess[i];
                const placeholder = emptyPlaceholders[i];
                
                // Pré-visualização temporária
                const reader = new FileReader();
                reader.onload = (e) => {
                    placeholder.innerHTML = `<img src="${e.target.result}" class="temp-preview" alt="Pré-visualização">`;
                };
                reader.readAsDataURL(file);
            }

            validateForm();
            
        } catch (error) {
            console.error("Erro no upload:", error);
            emptyPlaceholders.forEach(p => {
                p.innerHTML = '<i class="fas fa-image"></i>';
            });
            alert("Erro ao processar imagens");
        } finally {
            imageUpload.value = '';
        }
    };

    // --- Validação do Formulário Atualizada ---
    const validateForm = () => {
        const createProductBtn = document.getElementById('createProductBtn');
        if (!createProductBtn) return;

        // Validações básicas
        const isTitleValid = titleInput.value.trim().length >= MIN_TITLE_LENGTH;
        const isDescriptionValid = descriptionInput.value.trim().length >= MIN_DESC_LENGTH;
        const priceValue = pricingInput.value.trim();
        const isPriceValid = priceValue !== '' && !isNaN(parseFloat(priceValue));

        // Validação de imagens (agora verifica tags img)
        const hasImage = Array.from(imagePlaceholders).some(p => 
            p.querySelector('img') && p.querySelector('img').src
        );

        // Validação de arquivos
        const hasFile = fileListContainer.children.length > 0;

        // Atualiza estado do botão
        const isFormValid = isTitleValid && isDescriptionValid && isPriceValid && hasImage && hasFile;
        createProductBtn.disabled = !isFormValid;
        createProductBtn.style.backgroundColor = isFormValid ? BTN_ENABLED_COLOR : BTN_DISABLED_COLOR;
        createProductBtn.style.cursor = isFormValid ? 'pointer' : 'not-allowed';
    };

    // --- Abertura/Fecho do Modal (mantido) ---
    const openAddModal = () => {
        if (!modalOverlay) return;

        // Limpa os campos
        titleInput.value = '';
        descriptionInput.value = '';
        pricingInput.value = '';
        document.getElementById('categories').value = '';
        document.getElementById('languages').value = '';
        document.getElementById('github').value = '';

        // Limpa imagens
        imagePlaceholders.forEach(p => {
            p.innerHTML = '<i class="fas fa-image"></i>';
        });

        // Limpa ficheiros
        fileListContainer.innerHTML = '';

        // Limpa vídeos
        videoLinksContainer.innerHTML = '';

        // Atualiza o texto do botão
        const createBtn = document.getElementById("createProductBtn");
        createBtn.textContent = "Add Product";

        modalOverlay.style.display = 'flex';
        validateForm();
    };

    const closeModal = () => {
        if (modalOverlay) modalOverlay.style.display = 'none';
    };

    // --- Event Listeners Atualizados ---
    if (openModalBtn) openModalBtn.addEventListener('click', openAddModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) closeModal();
        });
    }

    if (titleInput) titleInput.addEventListener('input', validateForm);
    if (descriptionInput) descriptionInput.addEventListener('input', validateForm);
    if (pricingInput) pricingInput.addEventListener('input', validateForm);

    // Adicionar Vídeo (mantido)
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => {
            if (videoLinksContainer.querySelectorAll('input').length >= MAX_VIDEOS) {
                alert(`You can only add a maximum of ${MAX_VIDEOS} video links.`);
                return;
            }
            const newVideoInput = document.createElement('input');
            newVideoInput.type = 'text';
            newVideoInput.placeholder = 'Type video link here...';
            videoLinksContainer.appendChild(newVideoInput);
            checkVideoLimit();
        });
    }

    // Adicionar Imagem (atualizado)
    if (addImageBtn) {
        addImageBtn.addEventListener('click', () => imageUpload && imageUpload.click());
    }

    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }

    // Adicionar Ficheiro (mantido)
    if (addFileBtn) {
        addFileBtn.addEventListener('click', () => fileUpload && fileUpload.click());
    }

    if (fileUpload) {
        fileUpload.addEventListener('change', (event) => {
            const files = event.target.files;
            if (!files.length || !fileListContainer) return;

            for (const file of files) {
                const fileElement = document.createElement('p');
                const iconClass = file.type.startsWith('image/') ? 'fa-file-image' : 'fa-file-alt';
                fileElement.innerHTML = `<i class="fas ${iconClass}"></i> ${file.name}`;
                fileListContainer.appendChild(fileElement);
            }
            validateForm();
        });
    }

    // Inicialização
    checkVideoLimit();
    checkImageLimit();
    validateForm();

    // ===================================
    // === LÓGICA DO FILTRO RESPONSIVO ===
    // ===================================
    const toggleFiltersBtn = document.querySelector(".toggle-filters");
    const filtersSidebar = document.getElementById("filters-sidebar");
    const filtersOverlay = document.getElementById("filters-overlay");
    const closeFiltersBtn = document.getElementById("close-filters-sidebar");

    if (toggleFiltersBtn && filtersSidebar && filtersOverlay && closeFiltersBtn) {
        const closeFilterSidebar = () => {
            filtersSidebar.classList.remove("show");
            filtersSidebar.classList.add("hidden");
            filtersOverlay.classList.remove("show");
            filtersOverlay.classList.add("hidden");
        };

        toggleFiltersBtn.addEventListener("click", () => {
            filtersSidebar.classList.add("show");
            filtersSidebar.classList.remove("hidden");
            filtersOverlay.classList.add("show");
            filtersOverlay.classList.remove("hidden");
        });

        closeFiltersBtn.addEventListener("click", closeFilterSidebar);
        filtersOverlay.addEventListener("click", closeFilterSidebar);
    } else {
        console.warn("Filtro mobile: elementos não encontrados.");
    }
});
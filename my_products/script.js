document.addEventListener('DOMContentLoaded', () => {
    // ==================================
    // === LÓGICA DO MODAL DE PRODUTO ===
    // ==================================

    // Limites de Validação e Upload
    const MIN_TITLE_LENGTH = 3;
    const MIN_DESC_LENGTH = 30;
    const MAX_IMAGES = 4;
    const MAX_VIDEOS = 2;

    // Cores do Botão Principal
    const BTN_DISABLED_COLOR = '#CBE1CC';
    const BTN_ENABLED_COLOR = '#238636'; // Cor original do .btn-primary

    // Elementos do Modal
    const modalOverlay = document.getElementById('modalOverlay');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Elementos do Formulário para Validação
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const pricingInput = document.getElementById('pricing');
    const createProductBtn = document.getElementById('createProductBtn');

    // Botões de Ação do Modal
    const addVideoBtn = document.getElementById('addVideoBtn');
    const addImageBtn = document.getElementById('addImageBtn');
    const addFileBtn = document.getElementById('addFileBtn');

    // Inputs escondidos
    const imageUpload = document.getElementById('imageUpload');
    const fileUpload = document.getElementById('fileUpload');

    // Containers de conteúdo dinâmico
    const videoLinksContainer = document.getElementById('videoLinksContainer');
    const imagePlaceholders = document.querySelectorAll('.image-placeholder');
    const fileListContainer = document.querySelector('.file-list');

    // --- Lógica de Validação Central ---
    const validateForm = () => {
        if (!createProductBtn) return;

        // 1. Validar Título
        const isTitleValid = titleInput.value.trim().length >= MIN_TITLE_LENGTH;

        // 2. Validar Descrição
        const isDescriptionValid = descriptionInput.value.trim().length >= MIN_DESC_LENGTH;

        // 3. Validar Preço (tem que ser um número, pode ser 0)
        const priceValue = pricingInput.value.trim();
        const isPriceValid = priceValue !== '' && !isNaN(parseFloat(priceValue)) && isFinite(priceValue);

        // 4. Validar Imagens (pelo menos uma)
        const hasImage = Array.from(imagePlaceholders).some(p => p.style.backgroundImage);

        // 5. Validar Ficheiros (pelo menos um)
        const hasFile = fileListContainer.children.length > 0;

        // Verifica se todas as condições são verdadeiras
        const isFormValid = isTitleValid && isDescriptionValid && isPriceValid && hasImage && hasFile;

        // Atualiza o estado do botão
        if (isFormValid) {
            createProductBtn.disabled = false;
            createProductBtn.style.backgroundColor = BTN_ENABLED_COLOR;
            createProductBtn.style.cursor = 'pointer';
        } else {
            createProductBtn.disabled = true;
            createProductBtn.style.backgroundColor = BTN_DISABLED_COLOR;
            createProductBtn.style.cursor = 'not-allowed';
        }
    };

    // --- Abertura/Fecho do Modal ---
    const openModal = () => {
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            validateForm(); // Valida o formulário assim que o modal abre
        }
    };

    const closeModal = () => {
        if (modalOverlay) modalOverlay.style.display = 'none';
    };

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
    }

    window.closeModal = closeModal;

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay && modalOverlay.style.display === 'flex') {
            closeModal();
        }
    });


    // Adiciona os event listeners para validar em tempo real
    if (titleInput) titleInput.addEventListener('input', validateForm);
    if (descriptionInput) descriptionInput.addEventListener('input', validateForm);
    if (pricingInput) pricingInput.addEventListener('input', validateForm);

    // --- Funções de Controlo de Limites ---
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
        const filledPlaceholders = Array.from(imagePlaceholders).filter(p => p.style.backgroundImage).length;
        updateButtonState(addImageBtn, filledPlaceholders >= MAX_IMAGES);
    };

    // --- Funcionalidades dos Botões do Modal (com validação integrada) ---

    // 1. Adicionar Link de Vídeo
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

    // 2. Adicionar Imagem
    if (addImageBtn) {
        addImageBtn.addEventListener('click', () => {
            if (imageUpload) imageUpload.click();
        });
    }

    if (imageUpload) {
        imageUpload.addEventListener('change', (event) => {
            const files = event.target.files;
            if (!files.length) return;

            const emptyPlaceholders = Array.from(imagePlaceholders).filter(p => !p.style.backgroundImage);
            if (emptyPlaceholders.length === 0) {
                alert("All image slots are already filled.");
                return;
            }

            const filesToProcess = Array.from(files).slice(0, emptyPlaceholders.length);
            if (files.length > emptyPlaceholders.length) {
                alert(`You can only add ${emptyPlaceholders.length} more image(s). Processing the first ${emptyPlaceholders.length}.`);
            }

            filesToProcess.forEach((file, index) => {
                const placeholder = emptyPlaceholders[index];
                const reader = new FileReader();
                reader.onload = (e) => {
                    placeholder.style.backgroundImage = `url(${e.target.result})`;
                    placeholder.innerHTML = '';
                    checkImageLimit();
                    validateForm(); // Valida o formulário após adicionar uma imagem
                };
                reader.readAsDataURL(file);
            });
            imageUpload.value = '';
        });
    }

    // 3. Adicionar Ficheiro
    if (addFileBtn) {
        addFileBtn.addEventListener('click', () => {
            if (fileUpload) fileUpload.click();
        });
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
            validateForm(); // Valida o formulário após adicionar um ficheiro
        });
    }

    // Verifica os limites e o estado do formulário quando a página carrega
    checkVideoLimit();
    checkImageLimit();
    validateForm(); // Define o estado inicial do botão 'Create Product'

    // ===================================
    // === LÓGICA DO FILTRO RESPONSIVO ===
    // ===================================
    const toggleFiltersBtn = document.querySelector(".toggle-filters");
    const filtersSidebar = document.getElementById("filters-sidebar");
    const filtersOverlay = document.getElementById("filters-overlay");
    const closeFiltersBtn = document.getElementById("close-filters-sidebar");

    if (toggleFiltersBtn && filtersSidebar && filtersOverlay && closeFiltersBtn) {
        toggleFiltersBtn.addEventListener("click", () => {
            filtersSidebar.classList.add("show");
            filtersSidebar.classList.remove("hidden");
            filtersOverlay.classList.add("show");
            filtersOverlay.classList.remove("hidden");
        });

        const closeFilterSidebar = () => {
            filtersSidebar.classList.remove("show");
            filtersSidebar.classList.add("hidden");
            filtersOverlay.classList.remove("show");
            filtersOverlay.classList.add("hidden");
        };

        closeFiltersBtn.addEventListener("click", closeFilterSidebar);
        filtersOverlay.addEventListener("click", closeFilterSidebar);
    } else {
        console.warn("Filtro mobile: elementos não encontrados.");
    }
});



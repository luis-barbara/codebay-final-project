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

async function loadcard() {
    const gridContainer = document.querySelector('.card-grid');

    // 1. CSS para os novos elementos (botão de opções e menu)
    // Este CSS será injetado no <head> da página uma única vez.
    const styles = `
        /* Adiciona posicionamento relativo ao card para que o menu fique dentro dele */
        .card {
            position: relative;
        }

        .options-button {
            position: absolute;
            top: 22px;
            right: 15px;
            background: none;
            border: none;
            color: white;
            font-size: 28px;
            line-height: 1;
            cursor: pointer;
            z-index: 10;
        }

        .options-menu {
            display: none; /* Escondido por defeito */
            position: absolute;
            top: 45px;
            right: 15px;
            background-color: #161B22;
            border: 0.6px solid #6B6E72;
            border-radius: 8px;
            padding: 8px;
            z-index: 20;
            width: 150px;
        }

        .options-menu.active {
            display: block; /* Mostra o menu quando tem a classe 'active' */
        }

        .options-menu-item {
            padding: 10px 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            border-radius: 6px;
        }

        .options-menu-item:hover {
            background-color: #2c333e;
        }
    `;

    // Injeta o CSS no <head> se ainda não tiver sido injetado
    if (!document.getElementById('card-options-styles')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = 'card-options-styles';
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }


    try {
        const response = await fetch('../components/card.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cardHTML = await response.text();

        gridContainer.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const cardWrapper = document.createElement('div');
            cardWrapper.id = 'product_card_' + i;
            cardWrapper.className = 'product-card-wrapper';
            cardWrapper.innerHTML = cardHTML;
            
            // --- INÍCIO DA MODIFICAÇÃO ---

            // 2. Seleciona o card dentro do wrapper que acabamos de criar
            const cardElement = cardWrapper.querySelector('.card');
            
            // 3. Cria o botão de opções (três pontos)
            const optionsButton = document.createElement('button');
            optionsButton.className = 'options-button';
            optionsButton.innerHTML = '⋮'; // Caractere para os três pontos verticais

            // 4. Cria a estrutura do menu dropdown
            const optionsMenu = document.createElement('div');
            optionsMenu.className = 'options-menu';
            optionsMenu.innerHTML = `
                <div class="options-menu-item">
                    <span>&#10149;</span> Share
                </div>
                <div class="options-menu-item">
                    <span>&#9998;</span> Edit
                </div>
                <div class="options-menu-item">
                    <span>&#128465;</span> Delete
                </div>
            `;

            // 5. Adiciona o botão e o menu ao card
            cardElement.appendChild(optionsButton);
            cardElement.appendChild(optionsMenu);

            // 6. Adiciona o evento de clique para mostrar/esconder o menu
            optionsButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Impede que o clique feche o menu imediatamente
                optionsMenu.classList.toggle('active');
            });
            
            // Altera o texto do botão para corresponder à imagem
            const mainButton = cardWrapper.querySelector('.button');
            if (mainButton) {
                mainButton.textContent = 'List product';
            }

            // --- FIM DA MODIFICAÇÃO ---
            
            gridContainer.appendChild(cardWrapper);
        }

        // Adiciona um evento global para fechar qualquer menu ativo ao clicar fora
        document.addEventListener('click', () => {
            document.querySelectorAll('.options-menu.active').forEach(menu => {
                menu.classList.remove('active');
            });
        });

    } catch (error) {
        console.error("Não foi possível carregar os cards:", error);
        gridContainer.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
    }
}
async function loadcopyright() {
    const year = new Date().getFullYear();
    document.getElementById('copyright-year').innerHTML = `© ${year} CodeBay - all rights reserved`;
}

async function loadfooter() {
    const response = await fetch('../components/footer.html');
    const footer = await response.text();
    document.getElementById('foot').innerHTML = footer;
    loadcopyright();
}

async function loadheader() {
    const response = await fetch('../components/header_logged_in.html');
    const header = await response.text();
    document.getElementById('head').innerHTML = header;

    await loadavat();
    setupNotificationDropdown();
}


// Alterei a função loadhamb para remover o 'hidden' do sidebar, pois o CSS já cuida disso.
async function loadhamb() {
    const response = await fetch('../components/hamb_menu.html');
    const hamb = await response.text();
    document.getElementById('hamb').innerHTML = hamb;
    
    // Adiciona o sidebar ao DOM mas mantém-no fora da tela. 
    // A classe .sidebar já o posiciona com transform: translateX(-100%);
    const sidebar = document.getElementById('hamburger-sidebar');
    if (sidebar) {
        sidebar.classList.remove('hidden'); 
    }
    
    setTimeout(setupSidebar, 0);
}

async function loadavat() {
    const response = await fetch('../components/avat_menu.html');
    const avat = await response.text();
    document.getElementById('avat').innerHTML = avat;
    setTimeout(setupAvatarSidebar, 0);
}

(async () => {
    await loadfooter();
    await loadheader(); 
    await loadhamb();   
    await loadcard();
})();

async function setupSidebar() {
    const hamburger = document.querySelector('.left-section .hamburger');
    const sidebar = document.getElementById('hamburger-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('hamburger-overlay');
    
    // Seleciona todos os itens de menu que podem ser abertos
    const submenuToggles = document.querySelectorAll('.hamb-sidebar__submenu-toggle');

    if (!hamburger || !sidebar || !closeBtn || !overlay) {
        console.warn('Hamburger sidebar elements not found');
        return;
    }

    hamburger.addEventListener('click', () => {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('show');
        overlay.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('show');
        // A transição do CSS precisa de tempo, por isso usamos um timeout
        // para adicionar 'hidden' apenas depois da animação de saída.
        setTimeout(() => sidebar.classList.add('hidden'), 600); // 600ms = transition duration
        overlay.classList.add('hidden');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        setTimeout(() => sidebar.classList.add('hidden'), 600);
        overlay.classList.add('hidden');
    });

    // --- LÓGICA DO SUBMENU ADICIONADA AQUI ---
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Encontra o elemento <li> pai
            const parentMenuItem = toggle.closest('.hamb-sidebar__menu-item--has-submenu');
            
            // Adiciona ou remove a classe que controla o estado (aberto/fechado)
            if (parentMenuItem) {
                parentMenuItem.classList.toggle('submenu-is-open');
            }
        });
    });
    // --- FIM DA LÓGICA DO SUBMENU ---
}


async function setupAvatarSidebar() {
    const avatarSidebar = document.getElementById('avatar-sidebar');
    const avatarOverlay = document.getElementById('avatar-overlay');
    const closeAvatarBtn = document.getElementById('close-avatar-sidebar');
    const avatarIcon = document.querySelector('.right-section .logo-circle');

    if (!avatarSidebar || !avatarOverlay || !closeAvatarBtn || !avatarIcon) {
        console.warn('Avatar sidebar elements not found');
        return;
    }

    avatarIcon.addEventListener('click', () => {
        avatarSidebar.classList.add('show');
        avatarSidebar.classList.remove('hidden');
        avatarOverlay.classList.remove('hidden');
    });

    closeAvatarBtn.addEventListener('click', () => {
        avatarSidebar.classList.remove('show');
        avatarSidebar.classList.add('hidden');
        avatarOverlay.classList.add('hidden');
    });

    avatarOverlay.addEventListener('click', () => {
        avatarSidebar.classList.remove('show');
        avatarSidebar.classList.add('hidden');
        avatarOverlay.classList.add('hidden');
    });
}

function setupNotificationDropdown() {
    const bell = document.getElementById('notificationToggle');
    const dropdown = document.getElementById('notificationDropdown');

    if (bell && dropdown) {
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target.id !== 'notificationToggle') {
                dropdown.classList.remove('show');
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const toggleFiltersBtn = document.querySelector(".toggle-filters");
    const filtersSidebar = document.getElementById("filters-sidebar");
    const filtersOverlay = document.getElementById("filters-overlay");
    const closeFiltersBtn = document.getElementById("close-filters-sidebar");

    if (!toggleFiltersBtn || !filtersSidebar || !filtersOverlay || !closeFiltersBtn) {
        console.warn("Filtro mobile: elementos não encontrados.");
        return;
    }

    toggleFiltersBtn.addEventListener("click", () => {
        filtersSidebar.classList.add("show");
        filtersSidebar.classList.remove("hidden");
        filtersOverlay.classList.add("show");
        filtersOverlay.classList.remove("hidden");
    });

    closeFiltersBtn.addEventListener("click", () => {
        filtersSidebar.classList.remove("show");
        filtersSidebar.classList.add("hidden");
        filtersOverlay.classList.remove("show");
        filtersOverlay.classList.add("hidden");
    });

    filtersOverlay.addEventListener("click", () => {
        filtersSidebar.classList.remove("show");
        filtersSidebar.classList.add("hidden");
        filtersOverlay.classList.remove("show");
        filtersOverlay.classList.add("hidden");
    });
});


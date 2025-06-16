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


async function loadcard() {
    const response = await fetch('../components/card.html');
    const card = await response.text();
    for (let i = 0; i < 5; i++) {
        document.getElementById('product_card_' + i).innerHTML += card;
    }
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
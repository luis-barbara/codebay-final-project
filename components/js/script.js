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
    for (let i = 0; i < 9; i++) {
        document.getElementById('product_card_' + i).innerHTML += card;
    }
}

async function loadhamb() {
    const response = await fetch('../components/hamb_menu.html');
    const hamb = await response.text();
    document.getElementById('hamb').innerHTML = hamb;
    setTimeout(setupSidebar, 0);
}

async function loadavat() {
    const response = await fetch('../components/avat_menu.html');
    const avat = await response.text();
    document.getElementById('avat').innerHTML = avat;
    setTimeout(setupAvatarSidebar, 0);
}

async function setupSidebar() {
    const hamburger = document.querySelector('.left-section .hamburger');
    const sidebar = document.getElementById('hamburger-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('hamburger-overlay');

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
            sidebar.classList.add('hidden');
            overlay.classList.add('hidden');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            sidebar.classList.add('hidden');
            overlay.classList.add('hidden');
        });
   
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

document.querySelector(".toggle-filters").addEventListener("click", () => {
    document.getElementById("filters-sidebar").classList.add("show");
    document.getElementById("filters-overlay").classList.remove("hidden");
});

document.getElementById("close-filters-sidebar").addEventListener("click", () => {
    document.getElementById("filters-sidebar").classList.remove("show");
    document.getElementById("filters-overlay").classList.add("hidden");
});

document.getElementById("filters-overlay").addEventListener("click", () => {
    document.getElementById("filters-sidebar").classList.remove("show");
    document.getElementById("filters-overlay").classList.add("hidden");
});

(async () => {
    await loadfooter();
    await loadheader(); 
    await loadhamb();   
    await loadcard();
})();


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

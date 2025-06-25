// frontend/components/js/shared-components.js


// Update copyright year
async function loadCopyright() {
    const year = new Date().getFullYear();
    const el = document.getElementById('copyright-year');
    if (el) {
        el.innerHTML = `© ${year} CodeBay - all rights reserved`;
    }
}

// Load footer and update copyright
async function loadFooter() {
    const response = await fetch('../components/footer.html');
    const footer = await response.text();
    const footEl = document.getElementById('foot');
    if (footEl) {
        footEl.innerHTML = footer;
        await loadCopyright();
    }
}

// Carregar a navbar conforme o estado de login
async function loadHeaderBasedOnAuth() {
  const headEl = document.getElementById('head');
  if (!headEl) return;

  if (localStorage.getItem('accessToken')) {
    const response = await fetch('../components/header_logged_in.html');
    headEl.innerHTML = await response.text();
    await loadAvatar();
    setupNotificationDropdown();
  } else {
    const response = await fetch('../components/header_logged_out.html');
    headEl.innerHTML = await response.text();
  }
}


// // Load product cards
// async function loadCard() {
//     const response = await fetch('../components/card.html');
//     const card = await response.text();
//     for (let i = 0; i < 9; i++) {
//         const cardContainer = document.getElementById('product_card_' + i);
//         if (cardContainer) {
//             cardContainer.innerHTML += card;
//         }
//     }
// }



// Load hamburger menu and setup sidebar
async function loadHamb() {
    const response = await fetch('../components/hamb_menu.html');
    const hamb = await response.text();
    const hambEl = document.getElementById('hamb');
    if (hambEl) {
        hambEl.innerHTML = hamb;
        // Remove 'hidden' since CSS controls visibility
        const sidebar = document.getElementById('hamburger-sidebar');
        if (sidebar) {
            sidebar.classList.remove('hidden');
        }
        setTimeout(setupSidebar, 0);
    }
}

// Load avatar menu and setup avatar sidebar
async function loadAvatar() {
    const response = await fetch('../components/avat_menu.html');
    const avat = await response.text();
    const avatEl = document.getElementById('avat');
    if (avatEl) {
        avatEl.innerHTML = avat;
        setTimeout(setupAvatarSidebar, 0);
    }
}

// Setup hamburger menu sidebar and submenus
async function setupSidebar() {
    const hamburger = document.querySelector('.left-section .hamburger');
    const sidebar = document.getElementById('hamburger-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('hamburger-overlay');
    const submenuToggles = document.querySelectorAll('.hamb-sidebar__submenu-toggle');

    if (!hamburger || !sidebar || !closeBtn || !overlay) {
        console.warn('Hamburger sidebar elements not found');
        return;
    }

    function showSidebar() {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('show');
        overlay.classList.remove('hidden');
    }

    function hideSidebar() {
        sidebar.classList.remove('show');
        setTimeout(() => sidebar.classList.add('hidden'), 600); // wait for animation to finish
        overlay.classList.add('hidden');
    }

    hamburger.addEventListener('click', showSidebar);
    closeBtn.addEventListener('click', hideSidebar);
    overlay.addEventListener('click', hideSidebar);

    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const parent = toggle.closest('.hamb-sidebar__menu-item--has-submenu');
            if (parent) {
                parent.classList.toggle('submenu-is-open');
            }
        });
    });
}

// Setup avatar sidebar
async function setupAvatarSidebar() {
    const avatarSidebar = document.getElementById('avatar-sidebar');
    const avatarOverlay = document.getElementById('avatar-overlay');
    const closeAvatarBtn = document.getElementById('close-avatar-sidebar');
    const avatarIcon = document.querySelector('.right-section .logo-circle');
    const logoutBtn = document.getElementById('logout-btn');  // botão logout

    if (!avatarSidebar || !avatarOverlay || !closeAvatarBtn || !avatarIcon) {
        console.warn('Avatar sidebar elements not found');
        return;
    }

    function showAvatarSidebar() {
        avatarSidebar.classList.remove('hidden');
        avatarSidebar.classList.add('show');
        avatarOverlay.classList.remove('hidden');
    }

    function hideAvatarSidebar() {
        avatarSidebar.classList.remove('show');
        setTimeout(() => avatarSidebar.classList.add('hidden'), 600);
        avatarOverlay.classList.add('hidden');
    }

    avatarIcon.addEventListener('click', showAvatarSidebar);
    closeAvatarBtn.addEventListener('click', hideAvatarSidebar);
    avatarOverlay.addEventListener('click', hideAvatarSidebar);

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '../registrations/signin.html';
        });
    }
}




// Setup notifications dropdown
function setupNotificationDropdown() {
    const bell = document.getElementById('notificationToggle');
    const message = document.getElementById('messageToggle')
    const dropdown = document.getElementById('notificationDropdown');
    const mdropdown = document.getElementById('messageDropdown')

    if (!bell || !dropdown) {
        console.warn('Notification elements not found');
        return;
    }


    if (!message || !mdropdown) {
        console.warn('Message elements not found');
        return;
    }
    bell.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    message.addEventListener('click', (e) => {
        e.stopPropagation();
        mdropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target.id !== 'notificationToggle') {
            dropdown.classList.remove('show');
        }
         if (!mdropdown.contains(e.target) && e.target.id !== 'messageToggle') {
            mdropdown.classList.remove('show');
        }
    });
}

// Setup filters sidebar and overlay
function setupFilters() {
    const toggleFiltersBtn = document.querySelector(".toggle-filters");
    const filtersSidebar = document.getElementById("filters-sidebar");
    const filtersOverlay = document.getElementById("filters-overlay");
    const closeFiltersBtn = document.getElementById("close-filters-sidebar");

    if (!toggleFiltersBtn || !filtersSidebar || !filtersOverlay || !closeFiltersBtn) {
        console.warn("Mobile filters: elements not found.");
        return;
    }

    toggleFiltersBtn.addEventListener("click", () => {
        filtersSidebar.classList.add("show");
        filtersSidebar.classList.remove("hidden");
        filtersOverlay.classList.add("show");
        filtersOverlay.classList.remove("hidden");
    });

    function closeFilters() {
        filtersSidebar.classList.remove("show");
        filtersSidebar.classList.add("hidden");
        filtersOverlay.classList.remove("show");
        filtersOverlay.classList.add("hidden");
    }

    closeFiltersBtn.addEventListener("click", closeFilters);
    filtersOverlay.addEventListener("click", closeFilters);
}

// Main initialization on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  await loadFooter();
  await loadHeaderBasedOnAuth();
  await loadHamb();
//   await loadCard();

  if (document.querySelector(".toggle-filters")) {
    setupFilters();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '../registrations/signin.html';  
    });
  }
});

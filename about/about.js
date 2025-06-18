
async function loadCopyright() {
    const year = new Date().getFullYear();
    const el = document.getElementById('copyright-year');
    if (el) {
        el.innerHTML = `© ${year} CodeBay - all rights reserved`;
    }
}

/**
 * Loads the footer component
 */
async function loadFooter() {
    try {
        const response = await fetch('../components/footer.html');
        if (!response.ok) throw new Error('Failed to load footer');
        const footer = await response.text();
        const footEl = document.getElementById('foot');
        if (footEl) {
            footEl.innerHTML = footer;
            await loadCopyright();
        }
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

/**
 * Loads the appropriate header based on auth state
 */
async function loadHeaderBasedOnAuth() {
    try {
        const headEl = document.getElementById('head');
        if (!headEl) return;

        if (localStorage.getItem('access_token')) {
            const response = await fetch('../components/header_logged_in.html');
            if (!response.ok) throw new Error('Failed to load logged-in header');
            headEl.innerHTML = await response.text();
            await loadAvatar();
            setupNotificationDropdown();
        } else {
            const response = await fetch('../components/header_logged_out.html');
            if (!response.ok) throw new Error('Failed to load logged-out header');
            headEl.innerHTML = await response.text();
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

/**
 * Loads the hamburger menu component
 */
async function loadHamb() {
    try {
        const response = await fetch('../components/hamb_menu.html');
        if (!response.ok) throw new Error('Failed to load hamburger menu');
        const hamb = await response.text();
        const hambEl = document.getElementById('hamb');
        if (hambEl) {
            hambEl.innerHTML = hamb;
            setTimeout(setupSidebar, 0);
        }
    } catch (error) {
        console.error('Error loading hamburger menu:', error);
    }
}

/**
 * Loads the avatar menu component
 */
async function loadAvatar() {
    try {
        const response = await fetch('../components/avat_menu.html');
        if (!response.ok) throw new Error('Failed to load avatar menu');
        const avat = await response.text();
        const avatEl = document.getElementById('avat');
        if (avatEl) {
            avatEl.innerHTML = avat;
            setTimeout(setupAvatarSidebar, 0);
        }
    } catch (error) {
        console.error('Error loading avatar menu:', error);
    }
}

// ======================
// COMPONENT SETUP FUNCTIONS
// ======================

/**
 * Sets up the notification dropdown functionality
 */
function setupNotificationDropdown() {
    const bell = document.getElementById('notificationToggle');
    const dropdown = document.getElementById('notificationDropdown');

    if (!bell || !dropdown) {
        console.warn('Notification elements not found');
        return;
    }

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

/**
 * Sets up the hamburger sidebar functionality
 */
function setupSidebar() {
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
        setTimeout(() => sidebar.classList.add('hidden'), 600);
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

/**
 * Sets up the avatar sidebar functionality
 */
function setupAvatarSidebar() {
    const avatarSidebar = document.getElementById('avatar-sidebar');
    const avatarOverlay = document.getElementById('avatar-overlay');
    const closeAvatarBtn = document.getElementById('close-avatar-sidebar');
    const avatarIcon = document.querySelector('.right-section .logo-circle');
    const logoutBtn = document.getElementById('logout-btn');

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
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/signin.html';
        });
    }
}

// ======================
// INITIALIZATION
// ======================

/**
 * Main initialization function
 */
async function initializeSupportPage() {
    // Load all components
    await loadHeaderBasedOnAuth();
    await loadFooter();
    await loadHamb();
    await loadAvatar();
    
    // Setup any additional components
    if (typeof setupNotificationDropdown === 'function') {
        setupNotificationDropdown();
    }
    if (typeof setupSidebar === 'function') {
        setupSidebar();
    }
    if (typeof setupAvatarSidebar === 'function') {
        setupAvatarSidebar();
    }
}

// Start the page initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSupportPage);
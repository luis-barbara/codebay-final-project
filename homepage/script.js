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

    setupSidebar();
    setupAvatarSidebar();
}

async function loadcard() {
    const response = await fetch('../components/card.html');
    const card = await response.text();
    document.getElementById('product_card').innerHTML = card;
}

loadfooter();
loadheader();
loadcard();

function setupSidebar() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (hamburger && sidebar && closeBtn && overlay) {
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
    } else {
        console.warn('Sidebar elements not found');
    }
}

function setupAvatarSidebar() {


    const avatarSidebar = document.getElementById('avatar-sidebar');
    const avatarOverlay = document.getElementById('avatar-overlay');
    const closeAvatarBtn = document.getElementById('close-avatar-sidebar');
    const avatarIcon = document.querySelector('.right-section .logo-circle');

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
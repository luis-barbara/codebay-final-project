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

// Load navbar based on auth state
async function loadHeaderBasedOnAuth() {
  const headEl = document.getElementById('head');
  if (!headEl) return;

  if (localStorage.getItem('access_token')) {
    const response = await fetch('../components/header_logged_in.html');
    headEl.innerHTML = await response.text();
    await loadAvatar();
    setupNotificationDropdown();
  } else {
    const response = await fetch('../components/header_logged_out.html');
    headEl.innerHTML = await response.text();
  }
}

// Load product cards
async function loadCard() {
    const response = await fetch('../components/card.html');
    const card = await response.text();
    for (let i = 0; i < 9; i++) {
        const cardContainer = document.getElementById('product_card_' + i);
        if (cardContainer) {
            cardContainer.innerHTML += card;
        }
    }
}

// Load hamburger menu and setup sidebar
async function loadHamb() {
    const response = await fetch('../components/hamb_menu.html');
    const hamb = await response.text();
    const hambEl = document.getElementById('hamb');
    if (hambEl) {
        hambEl.innerHTML = hamb;
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

// Setup avatar sidebar
async function setupAvatarSidebar() {
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

// Setup notifications dropdown
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


// Status Filter Functionality
function setupStatusFilter() {
    const statusFilterButton = document.getElementById('statusFilterButton');
    const statusFilterDropdown = document.getElementById('statusFilterDropdown');
    const statusItems = document.querySelectorAll('.status-filter__item');
    const tableRows = document.querySelectorAll('.orders-table tbody tr');
    const searchInput = document.querySelector('.search-bar input');

    // Toggle dropdown visibility
    statusFilterButton.addEventListener('click', function(e) {
        e.stopPropagation();
        statusFilterDropdown.classList.toggle('filter-show');
        statusFilterButton.classList.toggle('filter-open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        statusFilterDropdown.classList.remove('filter-show');
        statusFilterButton.classList.remove('filter-open');
    });

    // Prevent dropdown from closing when clicking inside
    statusFilterDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Handle item selection
    statusItems.forEach(item => {
        item.addEventListener('click', function() {
            // Update active state
            statusItems.forEach(i => i.classList.remove('status-filter__item--active'));
            this.classList.add('status-filter__item--active');
            
            // Update button label
            document.getElementById('statusFilterLabel').textContent = this.textContent;
            
            // Close dropdown
            statusFilterDropdown.classList.remove('filter-show');
            statusFilterButton.classList.remove('filter-open');
            
            // Filter orders
            filterOrders(searchInput.value, this.textContent);
        });
    });

    // Search input handler
    searchInput.addEventListener('input', function() {
        const activeStatus = document.querySelector('.status-filter__item--active').textContent;
        filterOrders(this.value, activeStatus);
    });

    // Filter function
    function filterOrders(searchTerm = '', status = 'All Status') {
        searchTerm = searchTerm.toLowerCase();
        
        tableRows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            const rowStatus = row.querySelector('.status-badge').textContent;
            
            const matchesSearch = rowText.includes(searchTerm);
            const matchesStatus = status === 'All Status' || status === rowStatus;
            
            if (matchesSearch && matchesStatus) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// Main initialization
document.addEventListener("DOMContentLoaded", async () => {
    await loadFooter();
    await loadHeaderBasedOnAuth();
    await loadHamb();
    await loadCard();
    handleOrdersVisibility();
    setupStatusFilter(); // Replace setupSearchAndFilter with this
    
    if (document.querySelector(".toggle-filters")) {
        setupFilters();
    }
});


// Function to show/hide orders based on auth status
function handleOrdersVisibility() {
  const isLoggedIn = localStorage.getItem('access_token');
  const tableBody = document.querySelector('.orders-table tbody');
  
  if (!tableBody) return;
  
  if (!isLoggedIn) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px;">
          <div style="font-size: 1.2rem; margin-bottom: 20px;">
            Please sign in to view your orders
          </div>
        </td>
      </tr>
    `;
  } else {
    // If logged in, the existing orders will show (loaded from HTML)
    // You could also fetch orders from an API here if needed
  }
}

// Main initialization - update this function
document.addEventListener("DOMContentLoaded", async () => {
  await loadFooter();
  await loadHeaderBasedOnAuth();
  await loadHamb();
  await loadCard();
  handleOrdersVisibility(); // Add this line
  setupSearchAndFilter();
  
  if (document.querySelector(".toggle-filters")) {
    setupFilters();
  }
});


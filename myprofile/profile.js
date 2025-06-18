
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
// PROFILE FUNCTIONALITY
// ======================

/**
 * Sets up the view option buttons
 */
function setupViewOptions() {
    const viewButtons = document.querySelectorAll('.view-options .btn');
    
    if (!viewButtons.length) {
        console.warn('View option buttons not found');
        return;
    }

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Here you would typically load different product views
            const viewType = this.textContent.toLowerCase();
            loadProducts(viewType);
        });
    });
}

/**
 * Loads products based on view type
 */
async function loadProducts(viewType = 'recent') {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    // Show loading state
    productsGrid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading products...</div>';

    try {
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/products?view=${viewType}`);
        // const products = await response.json();
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes - replace with actual product loading
        const hasProducts = false; // Change to true to test with sample products
        
        if (hasProducts) {
            // Sample product data - replace with actual data from API
            const sampleProducts = [
                {
                    id: 1,
                    name: 'Web Development Template',
                    price: '$49.99',
                    rating: 4,
                    image: 'sample-product-1.jpg'
                },
                {
                    id: 2,
                    name: 'Mobile App UI Kit',
                    price: '$39.99',
                    rating: 5,
                    image: 'sample-product-2.jpg'
                }
            ];
            
            renderProducts(sampleProducts);
        } else {
            // Show empty state
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>You haven't published any products yet</p>
                    <button class="btn btn-primary">Create your first product</button>
                </div>
            `;
            setupCreateProductButton();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load products. Please try again.</p>
            </div>
        `;
    }
}

/**
 * Renders products in the grid
 */
function renderProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price}</div>
                <div class="product-rating">
                    ${'<span class="fa fa-star checked"></span>'.repeat(product.rating)}
                    ${'<span class="fa fa-star"></span>'.repeat(5 - product.rating)}
                </div>
                <button class="btn btn-sm btn-secondary">Edit</button>
            </div>
        </div>
    `).join('');
}

/**
 * Sets up the README editor functionality
 */
function setupReadmeEditor() {
    const editBtn = document.querySelector('.edit-readme-btn');
    const readmeContent = document.querySelector('.readme-content');

    if (!editBtn || !readmeContent) {
        console.warn('README editor elements not found');
        return;
    }

    // Load saved README if exists
    if (localStorage.getItem('userReadme')) {
        readmeContent.innerHTML = localStorage.getItem('userReadme');
    }

    editBtn.addEventListener('click', () => {
        const isEditable = readmeContent.getAttribute('contenteditable') === 'true';
        if (isEditable) {
            // Save mode
            readmeContent.setAttribute('contenteditable', 'false');
            editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Edit';
            localStorage.setItem('userReadme', readmeContent.innerHTML);
            
            // Show save confirmation
            const originalText = editBtn.innerHTML;
            editBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => {
                editBtn.innerHTML = originalText;
            }, 2000);
        } else {
            // Edit mode
            readmeContent.setAttribute('contenteditable', 'true');
            readmeContent.focus();
            editBtn.innerHTML = '<i class="fas fa-check"></i> Save';
        }
    });
}

/**
 * Sets up the "Create Product" button
 */
function setupCreateProductButton() {
    const createBtn = document.querySelector('.empty-state .btn-primary');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            // Redirect to product creation page
            window.location.href = '/create-product.html';
        });
    }
}

// ======================
// INITIALIZATION
// ======================

/**
 * Main initialization function
 */
async function initializeProfilePage() {
    // Load all components
    await loadHeaderBasedOnAuth();
    await loadFooter();
    await loadHamb();
    await loadAvatar();
    
    // Setup profile functionality
    setupViewOptions();
    setupReadmeEditor();
    loadProducts(); // Load initial products
    
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
document.addEventListener('DOMContentLoaded', initializeProfilePage);
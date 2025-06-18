document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initSidebarNavigation();
    initSessionManagement();
    initButtons();
    
    // Form submission handler
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                const formData = prepareFormData();
                
                try {
                    // Replace with your actual API endpoint
                    const response = await fetch('/api/security/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        showSuccessAlert('Security settings updated successfully!');
                    } else {
                        showErrorAlert(data.message || 'Failed to update security settings');
                    }
                } catch (error) {
                    showErrorAlert('Network error. Please try again.');
                    console.error('Error:', error);
                }
            }
        });
    }
});

function initSidebarNavigation() {
    // Highlight active menu item
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item').forEach(item => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function initSessionManagement() {
    // Load active sessions
    loadActiveSessions();
    
    // Set up revoke buttons
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('btn-outline') && e.target.textContent.includes('Revoke')) {
            e.preventDefault();
            const sessionItem = e.target.closest('.session-item');
            const sessionId = sessionItem.dataset.sessionId;
            
            try {
                const response = await fetch(`/api/sessions/revoke/${sessionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                    }
                });
                
                if (response.ok) {
                    sessionItem.remove();
                    showSuccessAlert('Session revoked successfully!');
                } else {
                    const data = await response.json();
                    showErrorAlert(data.message || 'Failed to revoke session');
                }
            } catch (error) {
                showErrorAlert('Network error. Please try again.');
                console.error('Error:', error);
            }
        }
    });
}

async function loadActiveSessions() {
    try {
        const response = await fetch('/api/sessions', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            const sessions = await response.json();
            renderSessions(sessions);
        } else {
            console.error('Failed to load sessions');
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

function renderSessions(sessions) {
    const sessionsList = document.querySelector('.sessions-list');
    if (sessionsList) {
        sessionsList.innerHTML = '';
        
        sessions.forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            sessionItem.dataset.sessionId = session.id;
            
            sessionItem.innerHTML = `
                <div class="session-info">
                    <i class="fas ${session.deviceType === 'mobile' ? 'fa-mobile-alt' : 'fa-desktop'}"></i>
                    <div>
                        <strong>${session.os} - ${session.browser}</strong>
                        <span>${session.location} • ${session.lastActive}</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline">Revoke</button>
            `;
            
            sessionsList.appendChild(sessionItem);
        });
    }
}

function validateForm() {
    const question1 = document.getElementById('question1').value;
    const answer1 = document.getElementById('answer1').value;
    const question2 = document.getElementById('question2').value;
    const answer2 = document.getElementById('answer2').value;
    
    if ((question1 && !answer1) || (question2 && !answer2)) {
        showErrorAlert('Please provide answers for all selected security questions');
        return false;
    }
    
    return true;
}

function prepareFormData() {
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const recoveryOptions = {};
    
    checkboxes.forEach(checkbox => {
        recoveryOptions[checkbox.nextSibling.textContent.trim()] = checkbox.checked;
    });
    
    return {
        twoFactorEnabled: document.getElementById('two-factor').value === 'enabled',
        recoveryOptions: recoveryOptions,
        securityQuestions: {
            question1: document.getElementById('question1').value,
            answer1: document.getElementById('answer1').value,
            question2: document.getElementById('question2').value,
            answer2: document.getElementById('answer2').value
        }
    };
}

function initButtons() {
    // Primary button styling and behavior
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.style.backgroundColor = '#5A69EA';
        btn.style.color = 'white';
        btn.style.fontWeight = '600';
        btn.style.padding = '12px';
        btn.style.borderRadius = '10px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'background-color 0.3s ease';
        btn.style.width = '100%';
        
        btn.addEventListener('mouseover', () => {
            btn.style.backgroundColor = '#7E91F3';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.backgroundColor = '#5A69EA';
        });
    });
    
    // Outline button styling and behavior
    document.querySelectorAll('.btn-outline').forEach(btn => {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'white';
        btn.style.fontWeight = '500';
        btn.style.padding = '12px';
        btn.style.borderRadius = '10px';
        btn.style.border = '0.6px solid #6b6e72';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'background-color 0.3s ease';
        btn.style.width = '100%';
        
        btn.addEventListener('mouseover', () => {
            btn.style.backgroundColor = 'rgba(110, 118, 129, 0.1)';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.backgroundColor = 'transparent';
        });
        
        // Cancel button behavior
        if (btn.textContent.includes('Cancel')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'publicAccount.html';
            });
        }
    });
    
    // Small outline buttons (revoke buttons)
    document.querySelectorAll('.btn-sm.btn-outline').forEach(btn => {
        btn.style.padding = '6px 12px';
        btn.style.fontSize = '14px';
    });
}

// Helper functions
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function showSuccessAlert(message) {
    Swal.fire({
        title: 'Success!',
        text: message,
        icon: 'success',
        confirmButtonColor: '#5A69EA'
    });
}

function showErrorAlert(message) {
    Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        confirmButtonColor: '#5A69EA'
    });
}


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
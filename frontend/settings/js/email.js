document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initSidebarNavigation();
    initFormValidation();
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
                    const response = await fetch('/api/email/preferences', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        showSuccessAlert('Email preferences saved successfully!');
                    } else {
                        showErrorAlert(data.message || 'Failed to save preferences');
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

function initFormValidation() {
    const backupEmailInput = document.getElementById('backup-email');
    
    if (backupEmailInput) {
        backupEmailInput.addEventListener('blur', validateBackupEmail);
    }
}

function validateBackupEmail() {
    const email = document.getElementById('backup-email').value;
    const errorElement = document.querySelector('.email-error');
    
    if (email && !validateEmail(email)) {
        if (!errorElement) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message email-error';
            errorDiv.textContent = 'Please enter a valid email address';
            document.getElementById('backup-email').parentNode.appendChild(errorDiv);
        }
        return false;
    } else if (errorElement) {
        errorElement.remove();
    }
    
    return true;
}

function validateForm() {
    return validateBackupEmail();
}

function prepareFormData() {
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const notifications = {};
    
    checkboxes.forEach(checkbox => {
        notifications[checkbox.nextSibling.textContent.trim()] = checkbox.checked;
    });
    
    return {
        primaryEmail: document.getElementById('primary-email').value,
        backupEmail: document.getElementById('backup-email').value,
        frequency: document.getElementById('notification-frequency').value,
        notifications: notifications
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
}

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

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

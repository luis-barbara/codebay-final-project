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
                    const response = await fetch('/api/account/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        showSuccessAlert('Account updated successfully!');
                    } else {
                        showErrorAlert(data.message || 'Failed to update account');
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
    const passwordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    if (passwordInput && confirmPasswordInput) {
        [passwordInput, confirmPasswordInput].forEach(input => {
            input.addEventListener('input', validatePassword);
        });
    }
}

function validatePassword() {
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.querySelector('.password-error');
    
    if (password && confirmPassword && password !== confirmPassword) {
        if (!errorElement) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message password-error';
            errorDiv.textContent = 'Passwords do not match';
            document.getElementById('confirm-password').parentNode.appendChild(errorDiv);
        }
        return false;
    } else if (errorElement) {
        errorElement.remove();
    }
    
    return true;
}

function validateForm() {
    let isValid = true;
    
    // Validate password fields if they have values
    const password = document.getElementById('new-password').value;
    const currentPassword = document.getElementById('current-password').value;
    
    if (password && !currentPassword) {
        showErrorAlert('Please enter your current password to make changes');
        isValid = false;
    }
    
    return isValid && validatePassword();
}

function prepareFormData() {
    return {
        username: document.getElementById('username').value,
        email: document.getElementById('account-email').value,
        timezone: document.getElementById('timezone').value,
        currentPassword: document.getElementById('current-password').value,
        newPassword: document.getElementById('new-password').value
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




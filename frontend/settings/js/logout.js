document.addEventListener('DOMContentLoaded', function() {
    // Initialize buttons
    initButtons();
    
    // Logout button handler
    const logoutBtn = document.querySelector('.btn-danger');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                // Replace with your actual API endpoint
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                    }
                });
                
                if (response.ok) {
                    // Clear local storage and redirect
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    window.location.href = '../index.html';
                } else {
                    const data = await response.json();
                    showErrorAlert(data.message || 'Failed to logout');
                }
            } catch (error) {
                showErrorAlert('Network error. Please try again.');
                console.error('Error:', error);
            }
        });
    }
});

function initButtons() {
    // Danger button styling and behavior
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.style.backgroundColor = '#B72324';
        btn.style.color = 'white';
        btn.style.fontWeight = '600';
        btn.style.padding = '12px';
        btn.style.borderRadius = '10px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'background-color 0.3s ease';
        btn.style.width = '100%';
        
        btn.addEventListener('mouseover', () => {
            btn.style.backgroundColor = '#ef4444';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.backgroundColor = '#B72324';
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

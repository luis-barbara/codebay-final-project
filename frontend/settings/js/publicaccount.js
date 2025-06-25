document.addEventListener('DOMContentLoaded', function() {
    
    initSidebarNavigation();
    initAvatarUpload();
    initButtons();
    
    // Form submission handler
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = prepareFormData();
            
            try {
                
                const response = await fetch('/api/profile/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showSuccessAlert('Profile updated successfully!');
                } else {
                    showErrorAlert(data.message || 'Failed to update profile');
                }
            } catch (error) {
                showErrorAlert('Network error. Please try again.');
                console.error('Error:', error);
            }
        });
    }
});

function initSidebarNavigation() {
   
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

function initAvatarUpload() {
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.querySelector('.current-avatar');
    const removeBtn = document.querySelector('.btn-danger');
    
    if (avatarUpload && avatarPreview) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) { 
                    showErrorAlert('Image size should be less than 2MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    avatarPreview.src = event.target.result;
                    uploadAvatar(file); 
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                const response = await fetch('/api/profile/avatar', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                    }
                });
                
                if (response.ok) {
                    avatarPreview.src = '';
                    document.getElementById('avatar-upload').value = '';
                    showSuccessAlert('Avatar removed successfully!');
                } else {
                    const data = await response.json();
                    showErrorAlert(data.message || 'Failed to remove avatar');
                }
            } catch (error) {
                showErrorAlert('Network error. Please try again.');
                console.error('Error:', error);
            }
        });
    }
}

async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
        const response = await fetch('/api/profile/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const data = await response.json();
            showErrorAlert(data.message || 'Failed to upload avatar');
        }
    } catch (error) {
        showErrorAlert('Network error. Please try again.');
        console.error('Error:', error);
    }
}

function prepareFormData() {
    return {
        fullName: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        bio: document.getElementById('bio').value,
        phone: document.getElementById('phone').value,
        position: document.getElementById('position').value,
        location: document.getElementById('location').value,
        website: document.getElementById('website').value
    };
}

function initButtons() {
    
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
        
        
        if (btn.textContent.includes('Cancel')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.reload();
            });
        }
    });
    
    
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.style.backgroundColor = '#B72324';
        btn.style.color = 'white';
        btn.style.fontWeight = '500';
        btn.style.padding = '8px 16px';
        btn.style.borderRadius = '6px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'background-color 0.3s ease';
        
        btn.addEventListener('mouseover', () => {
            btn.style.backgroundColor = '#ef4444';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.backgroundColor = '#B72324';
        });
    });
}

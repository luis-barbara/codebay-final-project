document.addEventListener('DOMContentLoaded', function() {
   
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
                window.location.href = 'publicAccount.html';
            });
        }
    });
    
  
    document.querySelectorAll('.btn-sm.btn-outline').forEach(btn => {
        btn.style.padding = '6px 12px';
        btn.style.fontSize = '14px';
    });
}

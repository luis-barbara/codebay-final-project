document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchForm = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch(searchInput.value);
        });
        
        document.querySelector('.search-btn').addEventListener('click', function() {
            performSearch(searchInput.value);
        });
    }
    
    // Mock search function (would be replaced with real search in production)
    function performSearch(query) {
        if (!query.trim()) {
            showNotification('Please enter a search term', 'error');
            return;
        }
        
        showNotification(`Searching for: "${query}"`, 'info');
        console.log('Performing search for:', query);
        setTimeout(() => {
            showNotification(`Displaying results for "${query}"`, 'success');
        }, 1000);
    }
    
    // Article list interaction
    const articleItems = document.querySelectorAll('.article-item');
    articleItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const articleTitle = this.querySelector('span').textContent;
            showNotification(`Loading article: ${articleTitle}`, 'info');
            console.log('Article clicked:', articleTitle);
        });
    });
    
    // Contact button handlers
    document.querySelector('.contact-btn')?.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') {
            e.preventDefault();
            showNotification('Preparing contact form...', 'info');
            console.log('Email support requested');
            // Would open email form or redirect to contact page
        }
    });
    
    document.querySelector('.contact-btn.alt')?.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Connecting you to live chat support...', 'info');
        console.log('Live chat requested');
        
        // Simulate chat connection
        setTimeout(() => {
            showNotification('Live chat connected! How can we help?', 'success');
        }, 1500);
    });
    
    // Category card interactions
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Only follow link if clicking on the actual link
            if (!e.target.closest('.category-link')) {
                const link = this.querySelector('.category-link');
                if (link) {
                    showNotification(`Loading ${link.textContent.trim()}`, 'info');
                    console.log('Category selected:', this.querySelector('h3').textContent);
                    // In a real implementation, you might track this selection
                }
            }
        });
    });
    
    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Add animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Add notification styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        }
        .notification-info {
            background-color: var(--primary-color);
        }
        .notification-success {
            background-color: var(--success-color);
        }
        .notification-error {
            background-color: var(--error-color);
        }
    `;
    document.head.appendChild(style);
    
    // Analytics tracking (example)
    function trackEvent(eventName, metadata = {}) {
        console.log('Tracking event:', eventName, metadata);

    }
    
    // Track page view
    trackEvent('support_page_view', {
        path: window.location.pathname,
        referrer: document.referrer
    });
});
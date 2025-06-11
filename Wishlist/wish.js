// Wishlist Manager
const wishlistManager = {
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || {},
  
    init: function() {
      this.loadComponents();
      this.setupEventListeners();
    },
  
    loadComponents: async function() {
      await this.loadHeader();
      await this.loadCards();
      await this.loadFooter();
      await this.loadMenu();
    },
  
    loadHeader: async function() {
      try {
        const response = await fetch('../components/header_logged_in.html');
        const header = await response.text();
        document.getElementById('head').innerHTML = header;
        this.setupAvatarSidebar();
      } catch (error) {
        console.error('Error loading header:', error);
      }
    },
  
    loadCards: async function() {
      try {
        const response = await fetch('../components/card.html');
        const cardTemplate = await response.text();
        const cardGrid = document.querySelector('.card-grid');
        cardGrid.innerHTML = '';
  
        // Sample products data
        const products = [
          { id: '1', name: 'E-commerce Template', price: '100€', rating: '5.0', reviews: '40' },
          { id: '2', name: 'UI Kit Moderno', price: '75€', rating: '4.8', reviews: '32' },
          { id: '3', name: 'Dashboard SaaS', price: '120€', rating: '4.9', reviews: '28' },
          { id: '4', name: 'Landing Page Pro', price: '60€', rating: '4.7', reviews: '45' }
        ];
  
        products.forEach(product => {
          const card = document.createElement('div');
          card.className = 'card';
          card.dataset.productId = product.id;
          card.innerHTML = `
            <i class="${this.wishlist[product.id] ? 'fas' : 'far'} fa-heart favorite-heart"></i>
            <div class="preview">
              <img src="https://img.youtube.com/vi/7V5jdOjWVU4/maxresdefault.jpg" alt="${product.name}" class="image-placeholder">
            </div>
            <div class="details">
              <div class="heading">${product.name}</div>
              <div class="description">Modern and ready-to-use template</div>
              <div class="tech">HTML, CSS, Javascript</div>
              <div class="price-rating">
                <div class="price">${product.price}</div>
                <div class="rating">
                  <div class="stars">★★★★★</div>
                  <div>${product.rating}</div>
                  <div style="color: #aaa;">${product.reviews} reviews</div>
                </div>
              </div>
              <div class="button">View details</div>
            </div>
          `;
          cardGrid.appendChild(card);
        });
  
        this.setupFavoriteHearts();
      } catch (error) {
        console.error('Error loading cards:', error);
      }
    },
  
    setupFavoriteHearts: function() {
      document.querySelectorAll('.favorite-heart').forEach(heart => {
        heart.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = heart.closest('.card');
          const productId = card.dataset.productId;
  
          if (heart.classList.contains('far')) {
            this.addToWishlist(heart, productId, card);
          } else {
            this.removeFromWishlist(heart, productId, card);
          }
        });
      });
    },
  
    addToWishlist: function(heart, productId, card) {
      heart.classList.replace('far', 'fas');
      this.wishlist[productId] = true;
      this.updateLocalStorage();
      
      // Visual feedback
      heart.style.transform = 'scale(1.3)';
      setTimeout(() => {
        heart.style.transform = 'scale(1)';
      }, 200);
    },
  
    removeFromWishlist: function(heart, productId, card) {
      heart.classList.replace('fas', 'far');
      delete this.wishlist[productId];
      this.updateLocalStorage();
      
      // Removal animation
      card.classList.add('removing');
      setTimeout(() => {
        card.remove();
      }, 300);
    },
  
    updateLocalStorage: function() {
      localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
      this.updateWishlistCount();
    },
  
    updateWishlistCount: function() {
      const count = Object.keys(this.wishlist).length;
      const countElement = document.querySelector('.wishlist-count');
      if (countElement) {
        countElement.textContent = count;
      }
    },
  
    loadFooter: async function() {
      try {
        const response = await fetch('../components/footer.html');
        const footer = await response.text();
        document.getElementById('foot').innerHTML = footer;
        this.updateCopyright();
      } catch (error) {
        console.error('Error loading footer:', error);
      }
    },
  
    updateCopyright: function() {
      const year = new Date().getFullYear();
      document.getElementById('copyright-year').innerHTML = `© ${year} CodeBay - all rights reserved`;
    },
  
    loadMenu: async function() {
      try {
        const [hambResponse, avatResponse] = await Promise.all([
          fetch('../components/hamb_menu.html'),
          fetch('../components/avat_menu.html')
        ]);
        
        document.getElementById('hamb').innerHTML = await hambResponse.text();
        document.getElementById('avat').innerHTML = await avatResponse.text();
        
        this.setupSidebar();
        setTimeout(() => this.setupAvatarSidebar(), 0);
      } catch (error) {
        console.error('Error loading menus:', error);
      }
    },
  
    setupSidebar: function() {
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
      }
    },
  
    setupAvatarSidebar: function() {
      const avatarSidebar = document.getElementById('avatar-sidebar');
      const avatarOverlay = document.getElementById('avatar-overlay');
      const closeAvatarBtn = document.getElementById('close-avatar-sidebar');
      const avatarIcon = document.querySelector('.right-section .logo-circle');
  
      if (avatarSidebar && avatarOverlay && closeAvatarBtn && avatarIcon) {
        avatarIcon.addEventListener('click', () => {
          avatarSidebar.classList.add('show');
          avatarOverlay.classList.remove('hidden');
        });
  
        closeAvatarBtn.addEventListener('click', () => {
          avatarSidebar.classList.remove('show');
          avatarOverlay.classList.add('hidden');
        });
  
        avatarOverlay.addEventListener('click', () => {
          avatarSidebar.classList.remove('show');
          avatarOverlay.classList.add('hidden');
        });
      }
    }
  };
  
  // Initialize the wishlist manager when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    wishlistManager.init();
  });
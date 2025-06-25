// Wishlist Manager
const wishlistManager = {
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || {},
  

  
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
  
  };
  

  document.addEventListener('DOMContentLoaded', () => {
    wishlistManager.init();
  });
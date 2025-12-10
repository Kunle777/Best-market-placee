// Main JavaScript for index.html

// Load featured products from Supabase
async function loadFeaturedProducts() {
  const featuredContainer = document.getElementById('featuredProducts');
  const loadingSpinner = document.getElementById('loadingSpinner');
  
  if (!featuredContainer) return;
  
  try {
    const response = await fetch('http://localhost:5000/api/products');
    const products = await response.json();
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    const featuredProducts = products.slice(0, 6);
    
    featuredContainer.innerHTML = `
      <div class="product-row">
        ${featuredProducts.slice(0, 4).map(product => `
          <article class="product-card-new" onclick="viewProduct(${product.id})">
            ${product.on_sale ? '<div class="badge sale">Sale</div>' : ''}
            ${product.is_new ? '<div class="badge">New</div>' : ''}
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-info-new">
              <p class="brand-name">${product.brand}</p>
              <h4>${product.name}</h4>
              <div class="price-new">
                <span class="current">₦${product.price.toLocaleString()}</span>
                ${product.original_price ? `<span class="was">₦${product.original_price.toLocaleString()}</span>` : ''}
              </div>
            </div>
          </article>
        `).join('')}
      </div>
      ${featuredProducts.length > 4 ? `
        <div class="product-row">
          ${featuredProducts.slice(4, 6).map(product => `
            <article class="product-card-new" onclick="viewProduct(${product.id})">
              ${product.on_sale ? '<div class="badge sale">Sale</div>' : ''}
              ${product.is_new ? '<div class="badge">New</div>' : ''}
              <img src="${product.image}" alt="${product.name}" loading="lazy">
              <div class="product-info-new">
                <p class="brand-name">${product.brand}</p>
                <h4>${product.name}</h4>
                <div class="price-new">
                  <span class="current">₦${product.price.toLocaleString()}</span>
                  ${product.original_price ? `<span class="was">₦${product.original_price.toLocaleString()}</span>` : ''}
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      ` : ''}
    `;
    
  } catch (error) {
    console.error('Error loading products:', error);
    if (loadingSpinner) {
      loadingSpinner.innerHTML = '<p>Unable to load products. Please try again later.</p>';
    }
  }
}

function viewProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

document.addEventListener('DOMContentLoaded', function() {
  // Check user login and add navigation (not on cart page)
  const isCartPage = window.location.pathname.includes('cart.html');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.name && !isCartPage) {
    addUserNavigation(user);
  }
  
  loadFeaturedProducts();
  // Brand carousel functionality
  const brandList = document.querySelector('.brand-list');
  const brandPrev = document.getElementById('brandPrev');
  const brandNext = document.getElementById('brandNext');
  
  if (brandList && brandPrev && brandNext) {
    brandPrev.addEventListener('click', () => {
      brandList.scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    brandNext.addEventListener('click', () => {
      brandList.scrollBy({ left: 200, behavior: 'smooth' });
    });
  }

  // Newsletter form with API integration
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = this.email.value;
      
      if (email && email.includes('@')) {
        try {
          const result = await API.subscribeNewsletter(email);
          alert(result.message || 'Thank you for subscribing!');
          this.reset();
        } catch (error) {
          console.error('Newsletter subscription error:', error);
          alert('Error subscribing to newsletter. Please try again.');
        }
      } else {
        alert('Please enter a valid email address.');
      }
    });
  }

  // Mobile navigation
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');
  
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', function() {
      mainNav.classList.toggle('show');
    });
  }

  // Testimonial slider (simple)
  const testiSlider = document.getElementById('testiSlider');
  if (testiSlider) {
    const slides = testiSlider.querySelectorAll('.testi-slide');
    let currentSlide = 0;
    
    // Hide all slides except first
    slides.forEach((slide, index) => {
      slide.style.display = index === 0 ? 'block' : 'none';
    });
    
    // Auto-rotate testimonials
    setInterval(() => {
      slides[currentSlide].style.display = 'none';
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].style.display = 'block';
    }, 5000);
  }

  // Add to cart functionality for product cards
  const productCards = document.querySelectorAll('.product-card-new');
  productCards.forEach((card, index) => {
    card.addEventListener('click', async function(e) {
      if (e.target.tagName !== 'A') {
        // Extract product info
        const name = this.querySelector('h4').textContent;
        const productId = index + 1; // Simple ID mapping
        
        try {
          await CartManager.addProduct(productId);
          showNotification(`${name} added to cart!`);
        } catch (error) {
          showNotification('Error adding to cart', 'error');
        }
      }
    });
  });

  // Category cards click handler
  const categoryCards = document.querySelectorAll('.cat-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', function() {
      const category = this.querySelector('span').textContent;
      window.location.href = `shop.html?category=${encodeURIComponent(category)}`;
    });
  });
});

// Add user dropdown when logged in
function addUserNavigation(user) {
  const headerActions = document.querySelector('.header-actions');
  
  if (headerActions) {
    const userDropdown = document.createElement('div');
    userDropdown.className = 'user-dropdown';
    userDropdown.innerHTML = `
      <button class="user-btn" onclick="toggleUserMenu()">
        <span class="user-greeting">Hi, ${user.name.split(' ')[0]}!</span>
        <span class="dropdown-arrow">▼</span>
      </button>
      <div class="user-menu" id="userMenu">
        <a href="orders.html" class="menu-item">My Orders</a>
        <a href="profile.html" class="menu-item">Profile</a>
        <a href="payment-history.html" class="menu-item">Payment History</a>
        <button onclick="logout()" class="menu-item logout-btn">Logout</button>
      </div>
    `;
    
    headerActions.insertBefore(userDropdown, headerActions.firstChild);
  }
}

// Toggle user dropdown menu
function toggleUserMenu() {
  const userMenu = document.getElementById('userMenu');
  if (userMenu) {
    userMenu.classList.toggle('show');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const userDropdown = document.querySelector('.user-dropdown');
  const userMenu = document.getElementById('userMenu');
  
  if (userDropdown && userMenu && !userDropdown.contains(event.target)) {
    userMenu.classList.remove('show');
  }
});

// Logout function
function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  localStorage.removeItem('sessionId');
  showNotification('Logged out successfully');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Utility function to show notifications
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 1000;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
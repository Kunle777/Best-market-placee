// Product data - same as shop.js
const products = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    brand: 'Premium Basics',
    price: 18000,
    originalPrice: 24000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop'
    ],
    category: 'Tops',
    rating: 4.5,
    reviews: 128,
    colors: ['White', 'Black', 'Gray'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    isNew: false,
    onSale: true,
    description: 'Premium quality cotton t-shirt with a classic fit. Perfect for everyday wear, this versatile piece can be dressed up or down. Made from 100% combed cotton for maximum comfort and durability.',
    features: [
      'Premium 100% combed cotton fabric',
      'Classic crew neck design',
      'Pre-shrunk for perfect fit',
      'Double-stitched hems for durability',
      'Breathable and lightweight',
      'Machine washable'
    ],
    specifications: {
      sku: 'PB-TS-001-WH',
      weight: '200g',
      material: '100% Combed Cotton',
      madeIn: 'Nigeria'
    },
    stock: 45,
    seller: {
      name: 'Premium Basics Official Store',
      rating: 4.8,
      totalReviews: 2450
    },
    shipping: {
      deliveryFee: 1500,
      estimatedDays: '2-4 business days',
      returnPolicy: '7 days return policy'
    }
  },
  {
    id: '2',
    name: 'Slim Fit Denim Jeans',
    brand: 'Urban Denim Co.',
    price: 35600,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=800&fit=crop'
    ],
    category: 'Bottoms',
    rating: 4.8,
    reviews: 256,
    colors: ['Dark Blue', 'Light Blue', 'Black'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    isNew: true,
    onSale: false,
    description: 'Modern slim-fit jeans crafted from premium stretch denim. Features a comfortable mid-rise waist and tapered leg for a contemporary silhouette.',
    features: [
      'Premium stretch denim fabric',
      'Slim fit design with tapered leg',
      'Five-pocket styling',
      'Button fly closure',
      'Belt loops',
      'Comfortable mid-rise waist'
    ],
    specifications: {
      sku: 'UDC-JN-002-DB',
      weight: '650g',
      material: '98% Cotton, 2% Elastane',
      madeIn: 'Turkey'
    },
    stock: 32,
    seller: {
      name: 'Urban Denim Co. Store',
      rating: 4.7,
      totalReviews: 1820
    },
    shipping: {
      deliveryFee: 2000,
      estimatedDays: '3-5 business days',
      returnPolicy: '14 days return policy'
    }
  }
];

let currentProduct = null;
let selectedColor = '';
let selectedSize = '';
let currentImageIndex = 0;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadProduct();
});

// Load product from URL parameter
async function loadProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    window.location.href = 'shop.html';
    return;
  }

  try {
    // Try to get from API first
    currentProduct = await API.getProduct(productId);
  } catch (error) {
    // Fallback to local data
    currentProduct = products.find(p => p.id === productId);
  }

  if (!currentProduct) {
    window.location.href = 'shop.html';
    return;
  }

  renderProduct();
  loadRelatedProducts();
}

// Render product details
function renderProduct() {
  if (!currentProduct) return;

  // Update breadcrumb
  document.getElementById('productCategory').textContent = currentProduct.category;
  document.getElementById('productName').textContent = currentProduct.name;

  // Update page title
  document.title = `${currentProduct.name} - Best Market Place`;

  const productDetail = document.getElementById('productDetail');
  productDetail.innerHTML = `
    <div class="product-detail-grid">
      <!-- Product Images -->
      <div class="product-images">
        <div class="main-image">
          <img id="mainImage" src="${currentProduct.images ? currentProduct.images[0] : currentProduct.image}" alt="${currentProduct.name}">
          ${currentProduct.isNew ? '<span class="product-badge badge-new">New</span>' : ''}
          ${currentProduct.onSale ? '<span class="product-badge badge-sale">Sale</span>' : ''}
        </div>
        ${currentProduct.images && currentProduct.images.length > 1 ? `
          <div class="thumbnail-images">
            ${currentProduct.images.map((img, index) => `
              <img class="thumbnail ${index === 0 ? 'active' : ''}" 
                   src="${img}" 
                   alt="${currentProduct.name} ${index + 1}"
                   onclick="changeImage(${index})">
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <div class="product-brand">${currentProduct.brand}</div>
        <h1 class="product-title">${currentProduct.name}</h1>
        
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(currentProduct.rating))}${currentProduct.rating % 1 ? '☆' : ''}</span>
          <span class="rating-text">${currentProduct.rating} (${currentProduct.reviews} reviews)</span>
        </div>

        <div class="product-price">
          <span class="current-price">₦${currentProduct.price.toLocaleString()}</span>
          ${currentProduct.originalPrice ? `
            <span class="original-price">₦${currentProduct.originalPrice.toLocaleString()}</span>
            <span class="discount">${Math.round((1 - currentProduct.price / currentProduct.originalPrice) * 100)}% OFF</span>
          ` : ''}
        </div>

        <div class="product-description">
          <p>${currentProduct.description}</p>
        </div>

        <!-- Color Selection -->
        ${currentProduct.colors ? `
          <div class="product-options">
            <label class="option-label">Color:</label>
            <div class="color-options">
              ${currentProduct.colors.map(color => `
                <button class="color-option ${color === selectedColor ? 'selected' : ''}" 
                        onclick="selectColor('${color}')" 
                        title="${color}">
                  ${color}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Size Selection -->
        ${currentProduct.sizes ? `
          <div class="product-options">
            <label class="option-label">Size:</label>
            <div class="size-options">
              ${currentProduct.sizes.map(size => `
                <button class="size-option ${size === selectedSize ? 'selected' : ''}" 
                        onclick="selectSize('${size}')">
                  ${size}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Quantity and Add to Cart -->
        <div class="product-actions">
          <div class="quantity-selector">
            <button onclick="changeQuantity(-1)">-</button>
            <input type="number" id="quantity" value="1" min="1" max="${currentProduct.stock}">
            <button onclick="changeQuantity(1)">+</button>
          </div>
          <button class="add-to-cart-btn primary" onclick="addToCart()">
            Add to Cart - ₦${currentProduct.price.toLocaleString()}
          </button>
          <button class="wishlist-btn" onclick="toggleWishlist()">♡ Add to Wishlist</button>
        </div>

        <!-- Stock Info -->
        <div class="stock-info">
          <span class="stock-count">${currentProduct.stock} items left in stock</span>
        </div>

        <!-- Shipping Info -->
        <div class="shipping-info">
          <div class="shipping-item">
            <strong>Delivery:</strong> ${currentProduct.shipping.estimatedDays} (₦${currentProduct.shipping.deliveryFee.toLocaleString()})
          </div>
          <div class="shipping-item">
            <strong>Return Policy:</strong> ${currentProduct.shipping.returnPolicy}
          </div>
        </div>
      </div>
    </div>

    <!-- Product Details Tabs -->
    <div class="product-tabs">
      <div class="tab-buttons">
        <button class="tab-btn active" onclick="showTab('description')">Description</button>
        <button class="tab-btn" onclick="showTab('specifications')">Specifications</button>
        <button class="tab-btn" onclick="showTab('reviews')">Reviews (${currentProduct.reviews})</button>
        <button class="tab-btn" onclick="showTab('seller')">Seller Info</button>
      </div>

      <div class="tab-content">
        <div id="tab-description" class="tab-panel active">
          <h3>Product Description</h3>
          <p>${currentProduct.description}</p>
          ${currentProduct.features ? `
            <h4>Features:</h4>
            <ul>
              ${currentProduct.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          ` : ''}
        </div>

        <div id="tab-specifications" class="tab-panel">
          <h3>Specifications</h3>
          <table class="specs-table">
            ${Object.entries(currentProduct.specifications || {}).map(([key, value]) => `
              <tr>
                <td><strong>${key.toUpperCase()}:</strong></td>
                <td>${value}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div id="tab-reviews" class="tab-panel">
          <h3>Customer Reviews</h3>
          <div class="reviews-summary">
            <div class="rating-overview">
              <span class="big-rating">${currentProduct.rating}</span>
              <div>
                <div class="stars">${'★'.repeat(Math.floor(currentProduct.rating))}${currentProduct.rating % 1 ? '☆' : ''}</div>
                <div>${currentProduct.reviews} reviews</div>
              </div>
            </div>
          </div>
          <p>Reviews functionality coming soon...</p>
        </div>

        <div id="tab-seller" class="tab-panel">
          <h3>Seller Information</h3>
          <div class="seller-info">
            <h4>${currentProduct.seller.name}</h4>
            <div class="seller-rating">
              <span class="stars">${'★'.repeat(Math.floor(currentProduct.seller.rating))}${currentProduct.seller.rating % 1 ? '☆' : ''}</span>
              <span>${currentProduct.seller.rating} (${currentProduct.seller.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Set default selections
  if (currentProduct.colors && currentProduct.colors.length > 0) {
    selectedColor = currentProduct.colors[0];
  }
  if (currentProduct.sizes && currentProduct.sizes.length > 0) {
    selectedSize = currentProduct.sizes[0];
  }
}

// Image gallery functions
function changeImage(index) {
  if (!currentProduct.images) return;
  
  currentImageIndex = index;
  document.getElementById('mainImage').src = currentProduct.images[index];
  
  // Update thumbnail active state
  document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Option selection functions
function selectColor(color) {
  selectedColor = color;
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.trim() === color);
  });
}

function selectSize(size) {
  selectedSize = size;
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.trim() === size);
  });
}

// Quantity functions
function changeQuantity(delta) {
  const quantityInput = document.getElementById('quantity');
  const newValue = parseInt(quantityInput.value) + delta;
  if (newValue >= 1 && newValue <= currentProduct.stock) {
    quantityInput.value = newValue;
  }
}

// Tab functions
function showTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Cart and wishlist functions
async function addToCart() {
  const quantity = parseInt(document.getElementById('quantity').value);
  const options = {};
  
  if (selectedColor) options.color = selectedColor;
  if (selectedSize) options.size = selectedSize;
  
  try {
    await CartManager.addProduct(currentProduct.id, { quantity, ...options });
    showNotification(`Added ${quantity} item(s) to cart!`);
  } catch (error) {
    console.error('Error adding to cart:', error);
    showNotification('Error adding item to cart', 'error');
  }
}

function toggleWishlist() {
  const wishlistBtn = document.querySelector('.wishlist-btn');
  const isWishlisted = wishlistBtn.innerHTML.includes('♥');
  
  wishlistBtn.innerHTML = isWishlisted ? '♡ Add to Wishlist' : '♥ Remove from Wishlist';
  wishlistBtn.style.color = isWishlisted ? '' : '#dc3545';
  
  showNotification(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
}

// Load related products
function loadRelatedProducts() {
  const relatedProducts = products
    .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, 4);
  
  const relatedGrid = document.getElementById('relatedProducts');
  relatedGrid.innerHTML = relatedProducts.map(product => `
    <div class="product-card" onclick="viewProduct('${product.id}')">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.isNew ? '<span class="product-badge badge-new">New</span>' : ''}
        ${product.onSale ? '<span class="product-badge badge-sale">Sale</span>' : ''}
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">
          <span class="current-price">₦${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span class="original-price">₦${product.originalPrice.toLocaleString()}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// Navigation function
function viewProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// Notification system
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Mobile navigation toggle
const mobileToggle = document.getElementById('mobileToggle');
if (mobileToggle) {
  mobileToggle.addEventListener('click', function() {
    const nav = document.getElementById('mainNav');
    if (nav) {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    }
  });
}
// Fallback product data
const products = [
  {
    id: "1",
    name: "Classic White T-Shirt",
    brand: "Premium Basics",
    price: 18000,
    originalPrice: 24000,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
    category: "Tops",
    rating: 4.5,
    reviews: 128,
    colors: ["White", "Black", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 45,
    isNew: false,
    onSale: true
  },
  {
    id: "2",
    name: "Slim Fit Denim Jeans",
    brand: "Urban Denim Co.",
    price: 35600,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop",
    category: "Bottoms",
    rating: 4.8,
    reviews: 256,
    colors: ["Dark Blue", "Light Blue", "Black"],
    sizes: ["28", "30", "32", "34", "36"],
    stock: 32,
    isNew: true,
    onSale: false
  },
  {
    id: "3",
    name: "Leather Crossbody Bag",
    brand: "Luxe Leather",
    price: 48000,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop",
    category: "Accessories",
    rating: 4.9,
    reviews: 89,
    colors: ["Brown", "Black", "Tan"],
    sizes: ["One Size"],
    stock: 18,
    isNew: false,
    onSale: false
  },
  {
    id: "4",
    name: "Wool Blend Overcoat",
    brand: "Elite Fashion",
    price: 89000,
    originalPrice: 120000,
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=800&fit=crop",
    category: "Jackets",
    rating: 4.7,
    reviews: 45,
    colors: ["Camel", "Black", "Gray"],
    sizes: ["S", "M", "L", "XL"],
    stock: 15,
    isNew: false,
    onSale: true
  },
  {
    id: "5",
    name: "Striped Cotton Shirt",
    brand: "Modern Threads",
    price: 25000,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
    category: "Tops",
    rating: 4.6,
    reviews: 92,
    colors: ["Blue", "White", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    stock: 28,
    isNew: true,
    onSale: false
  },
  {
    id: "6",
    name: "Summer Floral Dress",
    brand: "Elegant Style",
    price: 28000,
    originalPrice: 40000,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    category: "Dresses",
    rating: 4.4,
    reviews: 27,
    colors: ["Floral", "Pink", "Blue"],
    sizes: ["XS", "S", "M", "L"],
    stock: 22,
    isNew: false,
    onSale: true
  },
  {
    id: "7",
    name: "Leather Biker Jacket",
    brand: "Urban Edge",
    price: 120000,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop",
    category: "Jackets",
    rating: 4.9,
    reviews: 45,
    colors: ["Black", "Brown"],
    sizes: ["S", "M", "L", "XL"],
    stock: 8,
    isNew: false,
    onSale: false
  },
  {
    id: "8",
    name: "Cotton Hoodie",
    brand: "Comfort Zone",
    price: 38000,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop",
    category: "Hoodies",
    rating: 4.1,
    reviews: 33,
    colors: ["Gray", "Black", "Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 35,
    isNew: false,
    onSale: false
  },
  {
    id: "9",
    name: "Chino Pants",
    brand: "Smart Casual",
    price: 42000,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop",
    category: "Pants",
    rating: 4.0,
    reviews: 21,
    colors: ["Khaki", "Navy", "Black"],
    sizes: ["30", "32", "34", "36", "38"],
    stock: 19,
    isNew: true,
    onSale: false
  },
  {
    id: "10",
    name: "Casual Sneakers",
    brand: "Street Style",
    price: 55000,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop",
    category: "Footwear",
    rating: 4.3,
    reviews: 67,
    colors: ["White", "Black", "Gray"],
    sizes: ["40", "41", "42", "43", "44"],
    stock: 25,
    isNew: false,
    onSale: true
  },
  {
    id: "11",
    name: "Designer Sunglasses",
    brand: "Luxury Optics",
    price: 32000,
    originalPrice: 45000,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop",
    category: "Accessories",
    rating: 4.6,
    reviews: 34,
    colors: ["Black", "Brown", "Gold"],
    sizes: ["One Size"],
    stock: 12,
    isNew: true,
    onSale: true
  }
];

let filteredProducts = [];
let allProducts = [];
let currentFilters = {
  search: '',
  categories: [],
  brands: [],
  priceMin: 0,
  priceMax: 200000
};

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const productCount = document.getElementById('productCount');
const searchInput = document.getElementById('searchInput');
const categoriesFilter = document.getElementById('categoriesFilter');

const priceMinSlider = document.getElementById('priceMin');
const priceMaxSlider = document.getElementById('priceMax');
const minPriceDisplay = document.getElementById('minPrice');
const maxPriceDisplay = document.getElementById('maxPrice');
const sortSelect = document.getElementById('sortSelect');
const clearFiltersBtn = document.getElementById('clearFilters');
const noResults = document.getElementById('noResults');
const mobileFilterBtn = document.getElementById('mobileFilterBtn');
const mobileFilterModal = document.getElementById('mobileFilterModal');
const modalClose = document.getElementById('modalClose');

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
  await loadProducts();
  await updateCartCount();
  setupEventListeners();
  setupModalEventListeners();
  
  // Check for category filter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  if (category) {
    const categoryCheckbox = document.querySelector(`input[value="${category}"]`);
    if (categoryCheckbox) {
      categoryCheckbox.checked = true;
      handleCategoryFilter();
    }
  }
});

// Modal event listeners
function setupModalEventListeners() {
  // Close modal
  document.getElementById('modalCloseBtn').addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
  });
  
  // Quantity controls
  document.getElementById('decreaseQty').addEventListener('click', () => {
    if (modalQuantity > 1) {
      modalQuantity--;
      document.getElementById('quantity').textContent = modalQuantity;
    }
  });
  
  document.getElementById('increaseQty').addEventListener('click', () => {
    modalQuantity++;
    document.getElementById('quantity').textContent = modalQuantity;
  });
  
  // Add to cart from modal
  document.getElementById('addToCartModalBtn').addEventListener('click', async () => {
    // Check if size/color selection is required
    const sizes = selectedProduct.sizes || [];
    const colors = selectedProduct.colors || [];
    const needsSize = sizes.length > 1 || (sizes.length === 1 && sizes[0] !== 'One Size');
    const needsColor = colors.length > 1;
    
    if ((needsSize && !selectedSize) || (needsColor && !selectedColor)) {
      let missing = [];
      if (needsSize && !selectedSize) missing.push('size');
      if (needsColor && !selectedColor) missing.push('color');
      showMessage(`Please select ${missing.join(' and ')}`, 'error');
      return;
    }
    
    try {
      await API.addToCart(selectedProduct.id, {
        quantity: modalQuantity,
        size: selectedSize || 'N/A',
        color: selectedColor || 'N/A'
      });
      showMessage(`${selectedProduct.name} added to cart!`, 'success');
      await updateCartCount();
      document.getElementById('productModal').style.display = 'none';
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback: add to localStorage
      addToLocalCart({
        id: selectedProduct.id,
        product_id: selectedProduct.id,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        price: selectedProduct.price,
        image: selectedProduct.image,
        quantity: modalQuantity,
        color: selectedColor || null,
        size: selectedSize || null
      });
      await updateCartCount();
      showMessage(`${selectedProduct.name} added to cart!`, 'success');
      document.getElementById('productModal').style.display = 'none';
    }
  });
  
  // Close modal when clicking outside
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') {
      document.getElementById('productModal').style.display = 'none';
    }
  });
}

// Load products from API
async function loadProducts() {
  try {
    const response = await fetch('http://localhost:5000/api/products');
    
    if (response.ok) {
      const apiProducts = await response.json();
      console.log('API returned', apiProducts.length, 'products');
      
      // Add default colors/sizes if missing
      apiProducts.forEach(product => {
        if (!product.colors || product.colors.length === 0) {
          product.colors = ['Black', 'White', 'Gray'];
        }
        if (!product.sizes || product.sizes.length === 0) {
          product.sizes = ['S', 'M', 'L', 'XL'];
        }
      });
      
      allProducts = apiProducts;
    } else {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    filteredProducts = [...allProducts];
    renderProducts();
  } catch (error) {
    console.error('Error loading products from API:', error);
    console.log('Using fallback products:', products.length);
    allProducts = products;
    filteredProducts = [...allProducts];
    renderProducts();
  }
}

// Event Listeners
function setupEventListeners() {
  if (searchInput) searchInput.addEventListener('input', handleSearch);
  if (categoriesFilter) categoriesFilter.addEventListener('change', handleCategoryFilter);


  if (priceMinSlider) priceMinSlider.addEventListener('input', handlePriceFilter);
  if (priceMaxSlider) priceMaxSlider.addEventListener('input', handlePriceFilter);
  if (sortSelect) sortSelect.addEventListener('change', handleSort);
  if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);
  
  // Mobile filter modal
  if (mobileFilterBtn) {
    mobileFilterBtn.addEventListener('click', () => {
      mobileFilterModal.style.display = 'block';
    });
  }
  
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      mobileFilterModal.style.display = 'none';
    });
  }
  
  if (mobileFilterModal) {
    mobileFilterModal.addEventListener('click', (e) => {
      if (e.target === mobileFilterModal) {
        mobileFilterModal.style.display = 'none';
      }
    });
  }
}

// Render Products
function renderProducts() {
  if (!productsGrid) return;
  
  if (filteredProducts.length === 0) {
    productsGrid.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
    if (productCount) productCount.textContent = '0 products';
    return;
  }
  
  productsGrid.style.display = 'grid';
  if (noResults) noResults.style.display = 'none';
  if (productCount) productCount.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
  
  productsGrid.innerHTML = filteredProducts.map(product => {
    // Ensure colors and sizes exist
    const colors = product.colors || ['Black', 'White', 'Gray'];
    const sizes = product.sizes || ['S', 'M', 'L', 'XL'];
    
    return `
    <div class="product-card" onclick="viewProduct('${product.id}')">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.isNew || product.is_new ? '<span class="product-badge badge-new">New</span>' : ''}
        ${product.onSale || product.on_sale ? '<span class="product-badge badge-sale">Sale</span>' : ''}
        <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">♡</button>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(product.rating || 4))}${(product.rating || 4) % 1 ? '☆' : ''}</span>
          <span class="rating-count">(${product.reviews || 0})</span>
        </div>
        <div class="product-price">
          <span class="current-price">₦${product.price.toLocaleString()}</span>
          ${product.originalPrice || product.original_price ? `<span class="original-price">₦${(product.originalPrice || product.original_price).toLocaleString()}</span>` : ''}
        </div>
        <div class="color-options">
          ${colors.slice(0, 3).map(color => `<span class="color-dot" title="${color}" style="background-color: ${getColorCode(color)}"></span>`).join('')}
          ${colors.length > 3 ? `<span class="color-more">+${colors.length - 3}</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="view-details-btn" onclick="event.stopPropagation(); viewProduct('${product.id}')">View Details</button>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); openProductModal('${product.id}')">Add to Cart</button>
        </div>
      </div>
    </div>
    `;
  }).join('');
}

// Filter Functions
function handleSearch() {
  currentFilters.search = searchInput.value.toLowerCase();
  applyFilters();
}

function handleCategoryFilter() {
  const checkedCategories = Array.from(categoriesFilter.querySelectorAll('input:checked'))
    .map(input => input.value);
  currentFilters.categories = checkedCategories;
  applyFilters();
}





function handlePriceFilter() {
  currentFilters.priceMin = parseInt(priceMinSlider.value);
  currentFilters.priceMax = parseInt(priceMaxSlider.value);
  
  // Ensure min doesn't exceed max
  if (currentFilters.priceMin > currentFilters.priceMax) {
    currentFilters.priceMin = currentFilters.priceMax;
    priceMinSlider.value = currentFilters.priceMin;
  }
  
  if (minPriceDisplay) minPriceDisplay.textContent = currentFilters.priceMin.toLocaleString();
  if (maxPriceDisplay) maxPriceDisplay.textContent = currentFilters.priceMax.toLocaleString();
  
  applyFilters();
}

function applyFilters() {
  filteredProducts = allProducts.filter(product => {
    // Search filter
    if (currentFilters.search && 
        !product.name.toLowerCase().includes(currentFilters.search) &&
        !product.brand.toLowerCase().includes(currentFilters.search)) {
      return false;
    }
    
    // Category filter
    if (currentFilters.categories.length > 0 && 
        !currentFilters.categories.includes(product.category)) {
      return false;
    }
    
    // Brand filter
    if (currentFilters.brands.length > 0 && 
        !currentFilters.brands.includes(product.brand)) {
      return false;
    }
    
    // Price filter
    if (product.price < currentFilters.priceMin || 
        product.price > currentFilters.priceMax) {
      return false;
    }
    
    return true;
  });
  
  renderProducts();
}

function handleSort() {
  const sortValue = sortSelect.value;
  
  switch (sortValue) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      filteredProducts = [...allProducts];
      applyFilters();
      return;
  }
  
  renderProducts();
}

function clearAllFilters() {
  // Reset form inputs
  if (searchInput) searchInput.value = '';
  if (categoriesFilter) categoriesFilter.querySelectorAll('input').forEach(input => input.checked = false);


  if (priceMinSlider) priceMinSlider.value = 0;
  if (priceMaxSlider) priceMaxSlider.value = 200000;
  if (sortSelect) sortSelect.value = 'featured';
  
  // Reset filters
  currentFilters = {
    search: '',
    categories: [],
    brands: [],
    priceMin: 0,
    priceMax: 200000
  };
  
  if (minPriceDisplay) minPriceDisplay.textContent = '0';
  if (maxPriceDisplay) maxPriceDisplay.textContent = '200,000';
  
  filteredProducts = [...allProducts];
  renderProducts();
}

// Product navigation
function viewProduct(productId) {
  // Map product IDs to specific product pages
  const productPages = {
    '1': 'whiteTshirt.html',
    '2': 'SlimfitJeans.html'
  };
  
  const productPage = productPages[productId] || 'product.html';
  window.location.href = `${productPage}?id=${productId}`;
}

// Product modal functionality
let selectedProduct = null;
let selectedSize = null;
let selectedColor = null;
let modalQuantity = 1;

function openProductModal(productId) {
  selectedProduct = allProducts.find(p => p.id == productId) || products.find(p => p.id == productId);
  if (!selectedProduct) return;
  
  // Check if modal elements exist
  if (!document.getElementById('modalProductName')) {
    // Create simple modal if elements don't exist
    createSimpleModal();
    return;
  }
  
  // Populate modal
  document.getElementById('modalProductName').textContent = selectedProduct.name;
  document.getElementById('modalProductBrand').textContent = selectedProduct.brand;
  document.getElementById('modalProductPrice').textContent = `₦${selectedProduct.price.toLocaleString()}`;
  document.getElementById('modalProductImage').src = selectedProduct.image;
  
  // Handle sizes - only show if product has sizes
  const sizeOptions = document.getElementById('sizeOptions');
  let sizes = selectedProduct.sizes || selectedProduct.size || [];
  if (typeof sizes === 'string') {
    sizes = sizes.split(',').map(s => s.trim()).filter(s => s);
  }
  
  if (sizes.length > 0 && sizes[0] !== 'One Size') {
    sizeOptions.innerHTML = sizes.map(size => 
      `<button class="size-btn" onclick="selectSize('${size}')">${size}</button>`
    ).join('');
    sizeOptions.parentElement.style.display = 'block';
    selectedSize = null; // Require selection
  } else {
    sizeOptions.parentElement.style.display = 'none';
    selectedSize = sizes.length > 0 ? sizes[0] : null; // Auto-select One Size or null
  }
  
  // Handle colors - only show if product has colors
  const colorOptions = document.getElementById('colorOptions');
  let colors = selectedProduct.colors || selectedProduct.color || [];
  if (typeof colors === 'string') {
    colors = colors.split(',').map(c => c.trim()).filter(c => c);
  }
  
  if (colors.length > 1) {
    colorOptions.innerHTML = colors.map(color => 
      `<button class="color-btn" onclick="selectColor('${color}')" style="background-color: ${getColorCode(color)}" title="${color}"></button>`
    ).join('');
    colorOptions.parentElement.style.display = 'block';
    selectedColor = null; // Require selection
  } else {
    colorOptions.parentElement.style.display = 'none';
    selectedColor = colors.length > 0 ? colors[0] : null; // Auto-select single color or null
  }
  
  modalQuantity = 1;
  document.getElementById('quantity').textContent = '1';
  
  // Show modal
  document.getElementById('productModal').style.display = 'block';
}

// Create simple modal for products without size/color options
function createSimpleModal() {
  const modal = document.createElement('div');
  modal.id = 'simpleProductModal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%;">
      <h3>${selectedProduct.name}</h3>
      <p>${selectedProduct.brand}</p>
      <p style="font-size: 18px; font-weight: bold; color: #059669;">₦${selectedProduct.price.toLocaleString()}</p>
      <div style="margin: 16px 0;">
        <button onclick="modalQuantity = Math.max(1, modalQuantity - 1); updateSimpleQuantity()">-</button>
        <span id="simpleQuantity" style="margin: 0 16px;">1</span>
        <button onclick="modalQuantity++; updateSimpleQuantity()">+</button>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 20px;">
        <button onclick="closeSimpleModal()" style="flex: 1; padding: 12px; background: #ccc; border: none; border-radius: 6px;">Cancel</button>
        <button onclick="addSimpleToCart()" style="flex: 1; padding: 12px; background: #059669; color: white; border: none; border-radius: 6px;">Add to Cart</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  modalQuantity = 1;
  selectedSize = 'N/A';
  selectedColor = 'N/A';
}

function updateSimpleQuantity() {
  document.getElementById('simpleQuantity').textContent = modalQuantity;
}

function closeSimpleModal() {
  const modal = document.getElementById('simpleProductModal');
  if (modal) modal.remove();
}

async function addSimpleToCart() {
  try {
    await API.addToCart(selectedProduct.id, {
      quantity: modalQuantity,
      size: selectedSize,
      color: selectedColor
    });
    showMessage(`${selectedProduct.name} added to cart!`, 'success');
    await updateCartCount();
    closeSimpleModal();
  } catch (error) {
    console.error('Error adding to cart:', error);
    addToLocalCart({
      id: selectedProduct.id,
      product_id: selectedProduct.id,
      name: selectedProduct.name,
      brand: selectedProduct.brand,
      price: selectedProduct.price,
      image: selectedProduct.image,
      quantity: modalQuantity,
      color: selectedColor || null,
      size: selectedSize || null
    });
    await updateCartCount();
    showMessage(`${selectedProduct.name} added to cart!`, 'success');
    closeSimpleModal();
  }
}

function selectSize(size) {
  selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
  event.target.classList.add('selected');
}

function selectColor(color) {
  selectedColor = color;
  document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
  event.target.classList.add('selected');
}

function getColorCode(colorName) {
  const colorMap = {
    'Black': '#000000',
    'White': '#ffffff',
    'Gray': '#808080',
    'Red': '#ff0000',
    'Blue': '#0000ff',
    'Green': '#008000',
    'Brown': '#8B4513',
    'Navy': '#000080',
    'Pink': '#FFC0CB'
  };
  return colorMap[colorName] || colorName;
}

// Add to cart functionality
async function addToCart(productId, options = {}) {
  try {
    await API.addToCart(productId, options);
    showMessage('Product added to cart!', 'success');
    updateCartCount();
  } catch (error) {
    console.error('Error adding to cart:', error);
    showMessage('Error adding to cart', 'error');
  }
}

// Add to localStorage fallback
function addToLocalCart(item) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const itemKey = `${item.product_id}_${item.color}_${item.size}`;
  const existingItem = cart.find(cartItem => cartItem.item_key === itemKey);
  
  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push({
      ...item,
      id: item.product_id, // Add id field for order creation
      item_key: itemKey
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count
async function updateCartCount() {
  try {
    const cart = await API.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => el.textContent = count);
  } catch (error) {
    console.error('Error updating cart count:', error);
    // Fallback: get from localStorage
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = localCart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => el.textContent = count);
  }
}

// Wishlist functionality
async function toggleWishlist(productId) {
  const wishlistBtn = document.querySelector(`[onclick*="toggleWishlist('${productId}')"]`);
  if (wishlistBtn) {
    wishlistBtn.innerHTML = wishlistBtn.innerHTML === '♡' ? '♥' : '♡';
    wishlistBtn.style.color = wishlistBtn.innerHTML === '♥' ? '#dc3545' : '';
  }
}

// Custom message function
function showMessage(text, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `custom-message ${type}`;
  messageDiv.textContent = text;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    messageDiv.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, 300);
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
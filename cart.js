// Cart functionality with API integration
let cartItems = [];
let appliedPromo = null;

// Load cart from API with localStorage fallback
async function loadCartFromAPI() {
  try {
    // Try to load from API first
    cartItems = await API.getCart();
    console.log(`📦 Loaded ${cartItems.length} items from API cart`);
    
    // If API cart is empty, try localStorage fallback
    if (cartItems.length === 0) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        console.log(`📦 Found ${localCart.length} items in localStorage, using as fallback`);
        cartItems = localCart;
      }
    }
    
    if (cartItems.length === 0) {
      showEmptyCart();
    } else {
      renderCartItems();
      updateCartDisplay();
    }
  } catch (error) {
    console.error('❌ Error loading cart from API:', error);
    
    // Fallback to localStorage
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (localCart.length > 0) {
      console.log(`📦 Using localStorage fallback: ${localCart.length} items`);
      cartItems = localCart;
      renderCartItems();
      updateCartDisplay();
    } else {
      cartItems = [];
      showEmptyCart();
    }
  }
}

// Render cart items
function renderCartItems() {
  const cartContainer = document.querySelector('.cart-items');
  if (!cartContainer || cartItems.length === 0) {
    showEmptyCart();
    return;
  }

  cartContainer.innerHTML = cartItems.map(item => `
    <div class="cart-item" data-item-key="${item.item_key}">
      <div class="item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="item-details">
        <div class="item-info">
          <p class="item-brand">${item.brand}</p>
          <h3 class="item-name">${item.name}</h3>
          <div class="item-attributes">
            ${item.size ? `<span class="attribute">Size: ${item.size.toUpperCase()}</span>` : ''}
            ${item.color ? `<span class="attribute">Color: ${item.color}</span>` : ''}
          </div>
          ${item.stock <= 5 ? '<p class="out-of-stock">Low stock</p>' : ''}
        </div>
        <div class="item-price">
          <span class="current-price">₦${item.price.toLocaleString()}</span>
          ${item.originalPrice ? `<span class="original-price">₦${item.originalPrice.toLocaleString()}</span>` : ''}
        </div>
      </div>
      <div class="item-actions">
        <div class="quantity-controls">
          <button class="qty-btn" onclick="updateQuantity('${item.item_key}', -1)">−</button>
          <span class="quantity">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.item_key}', 1)">+</button>
        </div>
        <div class="action-buttons">
          <button class="action-btn remove-btn" onclick="removeItem('${item.item_key}')">🗑 Remove</button>
        </div>
      </div>
      <div class="item-subtotal">
        <span class="subtotal">₦${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    </div>
  `).join('');
}

// Update quantity
async function updateQuantity(itemKey, change) {
  const item = cartItems.find(item => item.item_key === itemKey);
  if (item) {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      try {
        // Try API update first
        await API.updateCartItem(itemKey, newQuantity);
        item.quantity = newQuantity;
      } catch (error) {
        console.error('API update failed, updating locally:', error);
        // Fallback to local update
        item.quantity = newQuantity;
        updateLocalStorage();
      }
      renderCartItems();
      updateCartDisplay();
    } else if (newQuantity === 0) {
      removeItem(itemKey);
    }
  }
}

// Remove item
async function removeItem(itemKey) {
  try {
    // Try API removal first
    await API.removeFromCart(itemKey);
  } catch (error) {
    console.error('API removal failed, removing locally:', error);
  }
  
  // Always remove from local array and update localStorage
  cartItems = cartItems.filter(item => item.item_key !== itemKey);
  updateLocalStorage();
  renderCartItems();
  updateCartDisplay();
  showNotification('Item removed from cart');
  
  if (cartItems.length === 0) {
    showEmptyCart();
  }
}

// Apply promo code
async function applyPromo() {
  const promoCode = document.getElementById('promoCode').value.trim();
  if (promoCode) {
    try {
      const result = await API.validatePromo(promoCode);
      if (result.valid) {
        appliedPromo = result;
        showNotification(result.message);
        updateCartDisplay();
        document.getElementById('promoCode').disabled = true;
        document.querySelector('.apply-btn').textContent = 'Applied';
        document.querySelector('.apply-btn').disabled = true;
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Error validating promo:', error);
      showNotification('Error validating promo code', 'error');
    }
  }
}

// Calculate totals
function calculateTotals() {
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discount = subtotal * (appliedPromo.discount / 100);
    } else if (appliedPromo.type === 'fixed') {
      discount = appliedPromo.discount;
    }
  }
  
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * 0.075; // 7.5% VAT
  const shipping = discountedSubtotal > 50000 ? 0 : 2500;
  const total = discountedSubtotal + tax + shipping;
  
  return { subtotal, discount, tax, shipping, total };
}

// Update cart display
function updateCartDisplay() {
  const { subtotal, discount, tax, shipping, total } = calculateTotals();
  
  // Update cart count
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(el => el.textContent = cartCount);
  
  const itemCountEl = document.querySelector('.cart-item-count');
  if (itemCountEl) {
    itemCountEl.textContent = `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`;
  }
  
  // Update totals
  const subtotalEl = document.getElementById('subtotal');
  const shippingEl = document.getElementById('shipping');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');
  
  if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
  if (shippingEl) {
    if (shipping === 0) {
      shippingEl.innerHTML = '<span class="free-badge">Free</span>';
    } else {
      shippingEl.textContent = `₦${shipping.toLocaleString()}`;
    }
  }
  if (taxEl) taxEl.textContent = `₦${tax.toLocaleString()}`;
  if (totalEl) totalEl.textContent = `₦${total.toLocaleString()}`;
  
  // Show discount if applied
  const priceBreakdown = document.querySelector('.price-breakdown');
  if (appliedPromo && discount > 0) {
    let discountRow = document.querySelector('.discount-row');
    if (!discountRow) {
      discountRow = document.createElement('div');
      discountRow.className = 'price-row discount-row';
      priceBreakdown.insertBefore(discountRow, priceBreakdown.children[1]);
    }
    discountRow.innerHTML = `
      <span>Discount (${appliedPromo.description})</span>
      <span style="color: #10b981">-₦${discount.toLocaleString()}</span>
    `;
  }
}

// Show empty cart
function showEmptyCart() {
  const cartLayout = document.getElementById('cartLayout');
  const emptyCart = document.getElementById('emptyCart');
  const cartHeader = document.querySelector('.cart-header h1');
  const itemCount = document.querySelector('.cart-item-count');
  
  if (cartLayout) cartLayout.style.display = 'none';
  if (emptyCart) emptyCart.style.display = 'block';
  if (cartHeader) cartHeader.textContent = 'Your cart is empty';
  if (itemCount) itemCount.textContent = '0 items in your cart';
}

// Proceed to checkout
function proceedToCheckout() {
  if (cartItems.length === 0) {
    showNotification('Your cart is empty', 'error');
    return;
  }
  
  // Check if user is logged in FIRST
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.email) {
    showNotification('Please login to continue', 'error');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 1500);
    return;
  }
  
  // Validate phone number
  const phoneInput = document.getElementById('phoneNumber');
  if (!phoneInput) {
    showNotification('Phone number field not found', 'error');
    return;
  }
  
  const phone = phoneInput.value.trim();
  if (!phone || phone.length < 10) {
    showNotification('Please enter a valid phone number', 'error');
    phoneInput.focus();
    return;
  }
  
  // Only proceed to payment if user is logged in
  initiatePayment({ phone: phone });
}





// Load Paystack script dynamically
function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      console.log('✅ Paystack already loaded');
      resolve();
      return;
    }
    
    console.log('📦 Loading Paystack script...');
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => {
      console.log('✅ Paystack script loaded successfully');
      resolve();
    };
    script.onerror = (error) => {
      console.error('❌ Failed to load Paystack script:', error);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

// Initiate Paystack payment
async function initiatePayment(userInfo) {
  console.log('💳 Initiating payment...');
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Check if user is logged in
  if (!user || !user.email) {
    showNotification('Please login to continue with payment', 'error');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 1500);
    return;
  }
  
  if (!cartItems || cartItems.length === 0) {
    showNotification('Your cart is empty', 'error');
    return;
  }
  
  // Show loading state
  const checkoutBtn = document.querySelector('.checkout-btn');
  const originalText = checkoutBtn.textContent;
  checkoutBtn.textContent = '⏳ Loading payment...';
  checkoutBtn.disabled = true;
  
  // Load Paystack script first
  try {
    await loadPaystackScript();
    
    // Wait a bit for script to fully initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!window.PaystackPop) {
      throw new Error('PaystackPop not available');
    }
    
  } catch (error) {
    console.error('❌ Paystack loading error:', error);
    showNotification('Failed to load payment system. Please try again.', 'error');
    checkoutBtn.textContent = originalText;
    checkoutBtn.disabled = false;
    return;
  }
  
  const { total } = calculateTotals();
  const paymentRef = 'BMP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  console.log('💰 Payment details:', {
    email: user.email,
    amount: total,
    amountInKobo: total * 100,
    reference: paymentRef
  });
  
  try {
    // Initialize Paystack payment
    const handler = PaystackPop.setup({
      key: 'pk_test_1a02cd39d012700224114ac89a954e52168907b4',
      email: user.email,
      amount: Math.round(total * 100), // Convert to kobo and round
      currency: 'NGN',
      ref: paymentRef,
      metadata: {
        custom_fields: [
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: userInfo.phone
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: user.name
          }
        ]
      },
      callback: function(response) {
        console.log('✅ Payment successful:', response);
        handlePaymentSuccess(response, userInfo);
      },
      onClose: function() {
        console.log('❌ Payment popup closed');
        showNotification('Payment cancelled', 'error');
        checkoutBtn.textContent = originalText;
        checkoutBtn.disabled = false;
      }
    });
    
    console.log('🚀 Opening Paystack popup...');
    checkoutBtn.textContent = '💳 Complete Payment';
    handler.openIframe();
    
  } catch (error) {
    console.error('❌ Paystack setup error:', error);
    showNotification('Payment setup failed. Please try again.', 'error');
    checkoutBtn.textContent = originalText;
    checkoutBtn.disabled = false;
  }
}

// Handle successful payment
function handlePaymentSuccess(response, userInfo) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Validate user is still logged in
  if (!user || !user.email) {
    showNotification('Session expired. Please login again.', 'error');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 1500);
    return;
  }
  
  // Get delivery address and location from form
  const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
  const deliveryLocation = document.getElementById('deliveryLocation').value;
  
  // Create order with address and phone
  const order = {
    id: Date.now(),
    customer_name: user.name,
    customer_email: user.email,
    customer_phone: userInfo.phone,
    delivery_address: deliveryAddress,
    delivery_location: deliveryLocation,
    total: calculateTotals().total,
    status: 'confirmed',
    payment_reference: response.reference,
    created_at: new Date().toISOString(),
    items: [...cartItems]
  };
  
  // Save order
  localStorage.setItem('lastOrder', JSON.stringify(order));
  const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  userOrders.unshift(order);
  localStorage.setItem('userOrders', JSON.stringify(userOrders));
  
  // Create payment history entry
  const paymentEntry = {
    reference: response.reference,
    orderId: order.id,
    amount: order.total,
    status: 'completed',
    date: order.created_at,
    paymentMethod: 'Card',
    customer_phone: userInfo.phone,
    delivery_address: deliveryAddress,
    delivery_location: deliveryLocation,
    items: [...cartItems]
  };
  
  const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
  paymentHistory.unshift(paymentEntry);
  localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
  
  // Clear cart
  clearCartAfterOrder();
  
  showNotification('Payment successful! Order confirmed.', 'success');
  setTimeout(() => {
    window.location.href = 'orders.html';
  }, 1500);
}

// Clear cart after successful order
async function clearCartAfterOrder() {
  const sessionId = getSessionId();
  
  try {
    await fetch(`http://localhost:5000/api/cart/${sessionId}/clear`, { 
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.log('Backend cart clear error:', error);
  }
  
  cartItems = [];
  localStorage.removeItem('cart');
  updateLocalStorage();
  renderCartItems();
  updateCartDisplay();
  showEmptyCart();
}

// Get session ID
function getSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

// Update localStorage with current cart items
function updateLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cartItems));
  console.log('Updated localStorage with', cartItems.length, 'items');
}

// Notification system
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${colors[type] || colors.success};
    color: white;
    border-radius: 8px;
    z-index: 1001;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  const duration = type === 'info' ? 2000 : 3000;
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Debug function to add test item to cart
window.addTestItem = function() {
  const testItems = [
    {
      item_key: 'test_1_black_m',
      product_id: '1',
      name: 'Classic White T-Shirt',
      brand: 'Premium Basics',
      price: 18000,
      originalPrice: 24000,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      quantity: 1,
      size: 'M',
      color: 'White',
      stock: 45
    },
    {
      item_key: 'test_2_blue_l',
      product_id: '2',
      name: 'Slim Fit Denim Jeans',
      brand: 'Urban Denim Co.',
      price: 35600,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      quantity: 2,
      size: 'L',
      color: 'Dark Blue',
      stock: 32
    }
  ];
  
  cartItems = testItems;
  updateLocalStorage();
  renderCartItems();
  updateCartDisplay();
  console.log('Test items added to cart:', testItems.length);
};

// Initialize cart
document.addEventListener('DOMContentLoaded', async function() {
  // Debug: Check user login status
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  console.log('🔍 User login status:', user ? `Logged in as ${user.name} (${user.email})` : 'Not logged in');
  

  
  // Add notification animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Check if we're returning from a successful order
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('orderSuccess') === 'true') {
    console.log('🎉 Returning from successful order, ensuring cart is cleared');
    await clearCartAfterOrder();
  }
  
  console.log('🚀 Initializing cart page...');
  

  
  await loadCartFromAPI();
  console.log('✅ Cart initialization complete');
  
  // Add checkout button listener
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
  }
  
  // Add debug buttons for testing (only in development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const debugPanel = document.createElement('div');
    debugPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 1000;
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    `;
    
    const buttons = [
      { text: 'Test Paystack', fn: 'testPaystack()' },
      { text: 'Check Paystack', fn: 'checkPaystack()' },
      { text: 'Test Payment', fn: 'testPaymentFlow()' },
      { text: 'Add Test Items', fn: 'addTestItem()' }
    ];
    
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn.text;
      button.onclick = () => eval(btn.fn);
      button.style.cssText = 'padding: 4px 8px; font-size: 10px; border: none; border-radius: 4px; cursor: pointer;';
      debugPanel.appendChild(button);
    });
    
    document.body.appendChild(debugPanel);
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
});



// Debug function to test cart clearing
window.testCartClear = function() {
  console.log('🧪 Testing cart clear...');
  console.log('Cart items before:', cartItems.length);
  clearCartAfterOrder().then(() => {
    console.log('Cart items after:', cartItems.length);
    console.log('LocalStorage cart:', localStorage.getItem('cart'));
  });
};

// Debug function to check cart status
window.checkCartStatus = function() {
  console.log('🔍 Cart Status:');
  console.log('- cartItems array:', cartItems.length, 'items');
  console.log('- localStorage cart:', JSON.parse(localStorage.getItem('cart') || '[]').length, 'items');
  console.log('- sessionId:', getSessionId());
  console.log('- cartItems:', cartItems);
  console.log('- localStorage cart:', JSON.parse(localStorage.getItem('cart') || '[]'));
};

// Debug function to check Paystack status
window.checkPaystack = function() {
  console.log('🔍 Paystack Status:');
  console.log('- PaystackPop available:', !!window.PaystackPop);
  console.log('- PaystackPop.setup available:', !!(window.PaystackPop && window.PaystackPop.setup));
  console.log('- Script in head:', !!document.querySelector('script[src*="paystack"]'));
  
  if (window.PaystackPop) {
    console.log('- PaystackPop object:', window.PaystackPop);
  }
  
  return {
    available: !!window.PaystackPop,
    setup: !!(window.PaystackPop && window.PaystackPop.setup),
    scriptLoaded: !!document.querySelector('script[src*="paystack"]')
  };
};

// Debug function to test order creation
window.testOrderCreation = function() {
  console.log('🧪 Testing order creation...');
  if (cartItems.length === 0) {
    console.log('❌ No items in cart to test with');
    return;
  }
  proceedToPayment();
};

// Debug function to force cart clear
window.forceCartClear = function() {
  console.log('🧪 Force clearing cart...');
  cartItems = [];
  localStorage.removeItem('cart');
  localStorage.removeItem(`cart_${getSessionId()}`);
  renderCartItems();
  updateCartDisplay();
  showEmptyCart();
  console.log('✅ Cart force cleared');
};

// Debug function to test payment flow
window.testPaymentFlow = function() {
  console.log('🧪 Testing complete payment flow...');
  
  // Check prerequisites
  const user = checkLogin();
  if (!user) {
    alert('Please login first');
    return;
  }
  
  if (cartItems.length === 0) {
    alert('Please add items to cart first');
    return;
  }
  
  const paystack = checkPaystack();
  if (!paystack.available) {
    alert('Paystack not available. Check console.');
    return;
  }
  
  // Set test phone number
  const phoneInput = document.getElementById('phoneNumber');
  if (phoneInput && !phoneInput.value) {
    phoneInput.value = '08012345678';
  }
  
  console.log('✅ All prerequisites met, initiating payment...');
  proceedToCheckout();
};

// Debug function to reload cart
window.reloadCart = function() {
  console.log('🔄 Reloading cart...');
  loadCartFromAPI();
};

// Debug function to check login status
window.checkLogin = function() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  console.log('🔍 Login Status:');
  console.log('- User object:', user);
  console.log('- Is logged in:', !!user);
  console.log('- Has email:', !!(user && user.email));
  console.log('- Has name:', !!(user && user.name));
  return user;
};

// Debug function to test Paystack popup
window.testPaystack = function() {
  console.log('🧪 Testing Paystack popup...');
  
  if (!window.PaystackPop) {
    console.error('❌ PaystackPop not available');
    alert('PaystackPop not loaded. Check console for errors.');
    return;
  }
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || !user.email) {
    alert('Please login first to test payment');
    return;
  }
  
  try {
    const handler = PaystackPop.setup({
      key: 'pk_test_1a02cd39d012700224114ac89a954e52168907b4',
      email: user.email,
      amount: 100000, // 1000 NGN in kobo
      currency: 'NGN',
      ref: 'TEST_' + Date.now(),
      callback: function(response) {
        console.log('✅ Test payment successful:', response);
        alert('Test payment successful! Reference: ' + response.reference);
      },
      onClose: function() {
        console.log('❌ Test payment cancelled');
        alert('Test payment cancelled');
      }
    });
    
    console.log('🚀 Opening test Paystack popup...');
    handler.openIframe();
  } catch (error) {
    console.error('❌ Test Paystack error:', error);
    alert('Test failed: ' + error.message);
  }
};

// Logout function
window.logout = function() {
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  localStorage.removeItem('sessionId');
  showNotification('Logged out successfully');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
};
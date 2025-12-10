// API utility functions for frontend
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api' 
  : '/api';

// Generate session ID for cart
function getSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

// API functions
const API = {
  // Products
  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/products?${params}`);
    return response.json();
  },

  async getProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  },

  // Cart
  async getCart() {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
    return response.json();
  },

  async addToCart(productId, options = {}) {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        quantity: options.quantity || 1,
        color: options.color,
        size: options.size
      })
    });
    return response.json();
  },

  async updateCartItem(itemKey, quantity) {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_key: itemKey,
        quantity
      })
    });
    return response.json();
  },

  async removeFromCart(itemKey) {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/remove`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_key: itemKey })
    });
    return response.json();
  },

  // Newsletter
  async subscribeNewsletter(email) {
    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  // Orders
  async createOrder(customerInfo) {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        customer_info: customerInfo
      })
    });
    return response.json();
  },

  // Promo codes
  async validatePromo(code) {
    const response = await fetch(`${API_BASE_URL}/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return response.json();
  },

  // Authentication
  async register(userData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server may be slow, please wait...');
      }
      console.error('Registration API error:', error);
      throw error;
    }
  },

  async login(credentials) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server may be slow, please wait...');
      }
      console.error('Login API error:', error);
      throw error;
    }
  }
};

// Cart management utilities
const CartManager = {
  async updateCartCount() {
    try {
      const cart = await API.getCart();
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(el => el.textContent = totalItems);
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  },

  async addProduct(productId, options = {}) {
    try {
      const result = await API.addToCart(productId, options);
      if (result.message) {
        showNotification(result.message);
        this.updateCartCount();
      }
      return result;
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Error adding item to cart', 'error');
    }
  }
};

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

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
  CartManager.updateCartCount();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API, CartManager, getSessionId };
}
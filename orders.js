// Orders Management System
class OrderManager {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.init();
    }

    init() {
        this.loadOrders();
        this.renderOrders();
        this.updateCartCount();
    }

    loadOrders() {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!currentUser.email) {
            this.showEmptyState();
            return;
        }
        
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        this.orders = userOrders.filter(order => 
            order.customer_email === currentUser.email || 
            order.customer_info?.email === currentUser.email
        );
        this.filteredOrders = [...this.orders];
        
        if (this.orders.length === 0) {
            this.showEmptyState();
        }
    }

    loadFromLocalStorage() {
        // Load from localStorage as fallback and filter by current user
        const storedOrders = localStorage.getItem('userOrders');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (storedOrders && currentUser.email) {
            const allOrders = JSON.parse(storedOrders);
            // Filter orders for current user only
            this.orders = allOrders.filter(order => 
                order.customer_info?.email === currentUser.email || 
                order.customer_email === currentUser.email
            );
            this.filteredOrders = [...this.orders];
            console.log(`Loaded ${this.orders.length} orders from localStorage for ${currentUser.email}`);
        } else {
            this.orders = [];
            this.filteredOrders = [];
        }
    }

    renderOrders() {
        const ordersList = document.getElementById('ordersList');
        const emptyOrders = document.getElementById('emptyOrders');

        if (this.filteredOrders.length === 0) {
            ordersList.style.display = 'none';
            emptyOrders.style.display = 'block';
            return;
        }

        ordersList.style.display = 'block';
        emptyOrders.style.display = 'none';

        ordersList.innerHTML = this.filteredOrders.map(order => `
            <div class="order-item ${order.status}">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order #${order.id}</h3>
                        <span class="order-date">Placed on ${this.formatDate(order.created_at)}</span>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${order.status}">${this.formatStatus(order.status)}</span>
                        <span class="order-total">₦${order.total.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="delivery-info">
                        <div class="delivery-address">
                            <strong>Delivery Address:</strong>
                            <p>${order.delivery_address || 'No address provided'}</p>
                        </div>
                        <div class="delivery-dates">
                            <div class="delivery-date">
                                <strong>Expected Delivery:</strong>
                                <span>${this.calculateDeliveryDate(order.created_at, order.status)}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${order.items && order.items.length > 0 ? `
                        <div class="order-items-preview">
                            <strong>Items (${order.items.length}):</strong>
                            <div class="items-preview">
                                ${order.items.slice(0, 3).map(item => `
                                    <div class="item-preview">
                                        <span>${item.name || 'Unknown Product'}</span>
                                        <span>×${item.quantity || 1}</span>
                                    </div>
                                `).join('')}
                                ${order.items.length > 3 ? `<div class="more-items">+${order.items.length - 3} more</div>` : ''}
                            </div>
                        </div>
                    ` : '<div class="no-items">No items information available</div>'}
                </div>
                
                <div class="order-actions">
                    <button onclick="orderManager.viewOrderDetails('${order.id}')" class="btn outline">View Details</button>
                    <button onclick="orderManager.trackOrder('${order.id}')" class="btn outline">Track Order</button>
                    ${order.status === 'pending' || order.status === 'confirmed' ? 
                        `<button onclick="orderManager.cancelOrder('${order.id}')" class="btn danger">Cancel Order</button>` : 
                        ''}
                </div>
            </div>
        `).join('');
    }

    filterOrders() {
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        this.filteredOrders = this.orders.filter(order => {
            let matches = true;

            // Status filter
            if (statusFilter && order.status !== statusFilter) {
                matches = false;
            }

            // Date range filter
            if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) {
                matches = false;
            }
            if (dateTo && new Date(order.created_at) > new Date(dateTo)) {
                matches = false;
            }

            return matches;
        });

        this.renderOrders();
    }

    clearFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        this.filteredOrders = [...this.orders];
        this.renderOrders();
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) return;

        const modalBody = document.getElementById('orderModalBody');
        modalBody.innerHTML = `
            <div class="order-detail-content">
                <div class="detail-section">
                    <h3>Order Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Order ID:</label>
                            <span>#${order.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Order Date:</label>
                            <span>${this.formatDate(order.created_at)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status-badge ${order.status}">${this.formatStatus(order.status)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Total Amount:</label>
                            <span>₦${order.total.toLocaleString()}</span>
                        </div>
                        ${order.customer_phone ? `
                        <div class="detail-item">
                            <label>Phone Number:</label>
                            <span>${order.customer_phone}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Delivery Information</h3>
                    <div class="delivery-details">
                        <div class="detail-item">
                            <label>Delivery Address:</label>
                            <p>${order.delivery_address || 'No address provided'}</p>
                        </div>
                        <div class="detail-item">
                            <label>Expected Delivery:</label>
                            <span>${this.calculateDeliveryDate(order.created_at, order.status)}</span>
                        </div>
                    </div>
                </div>

                ${order.items && order.items.length > 0 ? `
                    <div class="detail-section">
                        <h3>Order Items</h3>
                        <div class="items-detail">
                            ${order.items.map(item => `
                                <div class="item-detail">
                                    <div class="item-info">
                                        <span class="item-name">${item.name || 'Unknown Product'}</span>
                                        <span class="item-brand">${item.brand ? `by ${item.brand}` : ''}</span>
                                        <span class="item-details">Qty: ${item.quantity || 1} | Price: ₦${(item.price || 0).toLocaleString()}</span>
                                        ${item.color && item.color !== 'N/A' && item.color !== null ? `<span class="item-color">Color: ${item.color}</span>` : ''}
                                        ${item.size && item.size !== 'N/A' && item.size !== null ? `<span class="item-size">Size: ${item.size}</span>` : ''}
                                    </div>
                                    <span class="item-total">₦${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : '<div class="detail-section"><h3>Order Items</h3><p>No items information available</p></div>'}

                <div class="detail-section">
                    <h3>Payment Summary</h3>
                    <div class="payment-summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>₦${(order.subtotal || order.total).toLocaleString()}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping:</span>
                            <span>₦${(order.shipping || 0).toLocaleString()}</span>
                        </div>
                        <div class="summary-row">
                            <span>Tax:</span>
                            <span>₦${(order.tax || 0).toLocaleString()}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total:</span>
                            <span>₦${order.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('orderModal').style.display = 'flex';
    }

    trackOrder(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) return;

        // Simple tracking simulation
        const trackingSteps = [
            { status: 'pending', label: 'Order Placed', completed: true },
            { status: 'confirmed', label: 'Order Confirmed', completed: order.status !== 'pending' },
            { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(order.status) },
            { status: 'delivered', label: 'Delivered', completed: order.status === 'delivered' }
        ];

        const modalBody = document.getElementById('orderModalBody');
        modalBody.innerHTML = `
            <div class="tracking-content">
                <h3>Order Tracking - #${order.id}</h3>
                <div class="tracking-timeline">
                    ${trackingSteps.map(step => `
                        <div class="tracking-step ${step.completed ? 'completed' : ''}">
                            <div class="step-icon">${step.completed ? '✓' : '○'}</div>
                            <div class="step-info">
                                <span class="step-label">${step.label}</span>
                                <span class="step-date">${step.completed ? this.formatDate(order.created_at) : 'Pending'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="tracking-info">
                    <p><strong>Current Status:</strong> ${this.formatStatus(order.status)}</p>
                    <p><strong>Expected Delivery:</strong> ${this.calculateDeliveryDate(order.created_at, order.status)}</p>
                </div>
            </div>
        `;

        document.getElementById('orderModal').style.display = 'flex';
    }

    async cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                // Update local order status
                const order = this.orders.find(o => o.id == orderId);
                if (order) {
                    order.status = 'cancelled';
                }
                
                this.renderOrders();
                this.showMessage('Order cancelled successfully', 'success');
            } else {
                this.showMessage('Failed to cancel order', 'error');
            }
        } catch (error) {
            // Fallback for local storage
            const order = this.orders.find(o => o.id == orderId);
            if (order) {
                order.status = 'cancelled';
                localStorage.setItem('userOrders', JSON.stringify(this.orders));
                this.renderOrders();
                this.showMessage('Order cancelled successfully', 'success');
            }
        }
    }

    calculateDeliveryDate(orderDate, status) {
        const date = new Date(orderDate);
        let deliveryDays = 7; // Default 7 days

        switch (status) {
            case 'pending':
                deliveryDays = 7;
                break;
            case 'confirmed':
                deliveryDays = 5;
                break;
            case 'shipped':
                deliveryDays = 2;
                break;
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
        }

        date.setDate(date.getDate() + deliveryDays);
        return this.formatDate(date.toISOString());
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    showEmptyState() {
        document.getElementById('ordersList').style.display = 'none';
        document.getElementById('emptyOrders').style.display = 'block';
    }

    async updateCartCount() {
        try {
            const sessionId = this.getSessionId();
            const response = await fetch(`http://localhost:5000/api/cart/${sessionId}`);
            if (response.ok) {
                const cart = await response.json();
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                document.querySelector('.cart-count').textContent = totalItems;
            }
        } catch (error) {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = localCart.reduce((sum, item) => sum + item.quantity, 0);
            document.querySelector('.cart-count').textContent = totalItems;
        }
    }

    getSessionId() {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    showMessage(text, type = 'info') {
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
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // Static method to add new order
    static addOrder(orderData) {
        const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        storedOrders.unshift(orderData);
        localStorage.setItem('userOrders', JSON.stringify(storedOrders));
    }
}

// Global functions
function filterOrders() {
    if (window.orderManager) {
        window.orderManager.filterOrders();
    }
}

function clearFilters() {
    if (window.orderManager) {
        window.orderManager.clearFilters();
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.orderManager = new OrderManager();
});
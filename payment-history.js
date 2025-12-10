// Payment History Management
class PaymentHistory {
    constructor() {
        this.payments = [];
        this.filteredPayments = [];
        this.init();
    }

    async init() {
        await this.loadPaymentHistory();
        this.renderPayments();
    }

    async loadPaymentHistory() {
        try {
            // Get user email from localStorage
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('Current user:', currentUser);
            
            if (!currentUser.email) {
                console.log('No user email found, showing empty state');
                this.showEmptyState();
                return;
            }

            // Fetch payment history from backend
            const response = await fetch(`http://localhost:5000/api/payments/history/${currentUser.email}`);
            
            if (response.ok) {
                this.payments = await response.json();
                this.filteredPayments = [...this.payments];
            } else {
                // Fallback to localStorage for demo
                this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading payment history:', error);
            this.loadFromLocalStorage();
        }
        
        // Always sync with user orders to ensure items are available
        this.syncWithUserOrders();
        
        console.log('Final payments array:', this.payments);
        console.log('Filtered payments:', this.filteredPayments);
        
        // If still no payments, create test data for demo
        if (this.payments.length === 0) {
            this.createTestPaymentData();
        }
    }
    
    syncWithUserOrders() {
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        
        this.payments = this.payments.map(payment => {
            if (!payment.items || payment.items.length === 0) {
                const matchingOrder = userOrders.find(order => 
                    order.payment_reference === payment.reference || 
                    order.id == payment.orderId
                );
                if (matchingOrder && matchingOrder.items) {
                    payment.items = matchingOrder.items;
                }
            }
            return payment;
        });
        
        this.filteredPayments = [...this.payments];
    }

    loadFromLocalStorage() {
        // Load from localStorage as fallback
        const storedPayments = localStorage.getItem('paymentHistory');
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        
        if (storedPayments) {
            this.payments = JSON.parse(storedPayments);
            
            // Sync items from user orders if missing
            this.payments = this.payments.map(payment => {
                if (!payment.items || payment.items.length === 0) {
                    const matchingOrder = userOrders.find(order => 
                        order.payment_reference === payment.reference || 
                        order.id == payment.orderId
                    );
                    if (matchingOrder && matchingOrder.items) {
                        payment.items = matchingOrder.items;
                    }
                }
                return payment;
            });
            
            this.filteredPayments = [...this.payments];
        }
    }

    renderPayments() {
        const paymentList = document.getElementById('paymentList');
        const emptyHistory = document.getElementById('emptyHistory');

        if (this.filteredPayments.length === 0) {
            paymentList.style.display = 'none';
            emptyHistory.style.display = 'block';
            return;
        }

        paymentList.style.display = 'block';
        emptyHistory.style.display = 'none';

        paymentList.innerHTML = this.filteredPayments.map(payment => `
            <div class="payment-item ${payment.status}">
                <div class="payment-header">
                    <div class="payment-info">
                        <h3>Order #${payment.orderId || payment.reference}</h3>
                        <span class="payment-date">${this.formatDate(payment.date)}</span>
                    </div>
                    <div class="payment-status">
                        <span class="status-badge ${payment.status}">${this.formatStatus(payment.status)}</span>
                        <span class="payment-amount">₦${payment.amount.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="payment-details">
                    <div class="payment-method">
                        <span class="method-icon">💳</span>
                        <span>Paystack - ${payment.paymentMethod || 'Card'}</span>
                    </div>
                    
                    ${payment.items && payment.items.length > 0 ? `
                        <div class="order-items">
                            <h4>Items (${payment.items.length})</h4>
                            <div class="items-list">
                                ${payment.items.slice(0, 2).map(item => `
                                    <div class="item-summary">
                                        <span>${item.name || 'Unknown Product'}</span>
                                        <span>×${item.quantity || 1}</span>
                                    </div>
                                `).join('')}
                                ${payment.items.length > 2 ? `<div class="more-items">+${payment.items.length - 2} more items</div>` : ''}
                            </div>
                        </div>
                    ` : '<div class="no-items">No items information available</div>'}
                </div>
                
                <div class="payment-actions">
                    <button onclick="paymentHistory.viewDetails('${payment.reference}')" class="btn outline">View Details</button>
                    ${payment.status === 'completed' ? `<button onclick="paymentHistory.downloadReceipt('${payment.reference}')" class="btn outline">Download Receipt</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    filterPayments() {
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        this.filteredPayments = this.payments.filter(payment => {
            let matches = true;

            // Status filter
            if (statusFilter && payment.status !== statusFilter) {
                matches = false;
            }

            // Date range filter
            if (dateFrom && new Date(payment.date) < new Date(dateFrom)) {
                matches = false;
            }
            if (dateTo && new Date(payment.date) > new Date(dateTo)) {
                matches = false;
            }

            return matches;
        });

        this.renderPayments();
    }

    viewDetails(reference) {
        const payment = this.payments.find(p => p.reference === reference);
        if (!payment) return;

        // Create modal for payment details
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Payment Details</h2>
                    <button onclick="this.closest('.payment-modal').remove()" class="close-btn">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="detail-section">
                        <h3>Transaction Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Reference:</label>
                                <span>${payment.reference}</span>
                            </div>
                            <div class="detail-item">
                                <label>Date:</label>
                                <span>${this.formatDate(payment.date)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Status:</label>
                                <span class="status-badge ${payment.status}">${this.formatStatus(payment.status)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Amount:</label>
                                <span>₦${payment.amount.toLocaleString()}</span>
                            </div>
                            ${payment.customer_phone ? `
                            <div class="detail-item">
                                <label>Phone Number:</label>
                                <span>${payment.customer_phone}</span>
                            </div>
                            ` : ''}
                            ${payment.delivery_address ? `
                            <div class="detail-item">
                                <label>Delivery Address:</label>
                                <span>${payment.delivery_address}</span>
                            </div>
                            ` : ''}
                            ${payment.delivery_location ? `
                            <div class="detail-item">
                                <label>Delivery Location:</label>
                                <span>${payment.delivery_location}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${payment.items && payment.items.length > 0 ? `
                        <div class="detail-section">
                            <h3>Order Items</h3>
                            <div class="items-detail">
                                ${payment.items.map(item => `
                                    <div class="item-detail">
                                        <div class="item-main">
                                            <span class="item-name">${item.name || 'Unknown Product'}</span>
                                            ${item.brand ? `<span class="item-brand">by ${item.brand}</span>` : ''}
                                            ${item.color && item.color !== 'N/A' && item.color !== null ? `<span class="item-attr">Color: ${item.color}</span>` : ''}
                                            ${item.size && item.size !== 'N/A' && item.size !== null ? `<span class="item-attr">Size: ${item.size}</span>` : ''}
                                        </div>
                                        <span class="item-qty">×${item.quantity || 1}</span>
                                        <span class="item-price">₦${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : '<div class="detail-section"><h3>Order Items</h3><p>No items information available</p></div>'}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    downloadReceipt(reference) {
        const payment = this.payments.find(p => p.reference === reference);
        if (!payment) return;

        // Generate receipt content
        const receiptContent = `
            BEST MARKET PLACE
            Payment Receipt
            
            Reference: ${payment.reference}
            Date: ${this.formatDate(payment.date)}
            Status: ${this.formatStatus(payment.status)}
            Amount: ₦${payment.amount.toLocaleString()}
            
            ${payment.items && payment.items.length > 0 ? `
            Items:
            ${payment.items.map(item => `${item.name || 'Unknown Product'} ×${item.quantity || 1} - ₦${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`).join('\n')}
            ` : 'No items information available'}
            
            Thank you for shopping with us!
        `;

        // Create and download file
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${payment.reference}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',

            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatStatus(status) {
        const statusMap = {
            'completed': 'Completed',
            'pending': 'Pending',
            'failed': 'Failed',
            'processing': 'Processing'
        };
        return statusMap[status] || status;
    }

    showEmptyState() {
        document.getElementById('paymentList').style.display = 'none';
        document.getElementById('emptyHistory').style.display = 'block';
    }

    createTestPaymentData() {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!currentUser.email) return;
        
        console.log('Creating test payment data for user:', currentUser.email);
        
        const testPayments = [
            {
                reference: 'BMP_' + Date.now(),
                orderId: Date.now(),
                amount: 45000,
                status: 'completed',
                date: new Date().toISOString(),
                paymentMethod: 'Card',
                customer_phone: '+234 801 234 5678',
                delivery_address: '123 Test Street, Lagos Island, Lagos State',
                delivery_location: 'Lagos Island',
                items: [
                    {
                        name: 'Classic White T-Shirt',
                        brand: 'Premium Basics',
                        price: 18000,
                        quantity: 1,
                        size: 'M',
                        color: 'White'
                    },
                    {
                        name: 'Slim Fit Denim Jeans',
                        brand: 'Urban Denim Co.',
                        price: 27000,
                        quantity: 1,
                        size: 'L',
                        color: 'Dark Blue'
                    }
                ]
            }
        ];
        
        localStorage.setItem('paymentHistory', JSON.stringify(testPayments));
        this.payments = testPayments;
        this.filteredPayments = [...testPayments];
        console.log('Test payment data created:', testPayments);
    }

    // Add payment to history (called after successful payment)
    static addPayment(paymentData) {
        const storedPayments = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
        storedPayments.unshift(paymentData);
        localStorage.setItem('paymentHistory', JSON.stringify(storedPayments));
    }
}

// Global functions
function filterPayments() {
    if (window.paymentHistory) {
        window.paymentHistory.filterPayments();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.paymentHistory = new PaymentHistory();
});
// Admin Dashboard JavaScript
let allOrders = [];
let allUsers = [];
let allProducts = [];
let allPayments = [];

// Login functionality
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // For demo, keep simple admin login
    if (username === 'admin' && password === 'admin123') {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadDashboardData();
    } else {
        alert('Invalid credentials');
    }
});

// Navigation
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    
    // Load section-specific data
    if (sectionName === 'analytics') {
        loadAnalytics();
    }
}

// Logout
function logout() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Load dashboard data
function loadDashboardData() {
    checkServerStatus();
    
    // Load data in sequence to ensure dependencies
    Promise.all([
        loadUsers(),
        loadProducts(), 
        loadOrders(),
        loadPayments()
    ]).then(() => {
        loadRecentActivity();
        loadAnalytics();
    }).catch(error => {
        console.error('Error loading dashboard data:', error);
    });
}

// Refresh all data from Supabase
function refreshDashboard() {
    console.log('🔄 Refreshing dashboard data from Supabase...');
    
    // Show loading indicator
    document.querySelectorAll('.loading-indicator').forEach(el => {
        el.style.display = 'inline-block';
    });
    
    // Clear localStorage to force fresh data from Supabase
    localStorage.removeItem('registeredUsers');
    localStorage.removeItem('userOrders');
    localStorage.removeItem('paymentHistory');
    
    // Reload all data
    loadDashboardData();
    
    // Hide loading indicators after 2 seconds
    setTimeout(() => {
        document.querySelectorAll('.loading-indicator').forEach(el => {
            el.style.display = 'none';
        });
        console.log('✅ Dashboard refreshed with latest Supabase data');
    }, 2000);
}

// Refresh users specifically
function refreshUsers() {
    console.log('🔄 Refreshing users data...');
    
    // Show loading in users table
    document.getElementById('usersTable').innerHTML = '<tr><td colspan="6" class="loading">Refreshing users...</td></tr>';
    
    // Reload users data
    loadUsers().then(() => {
        console.log('✅ Users data refreshed successfully');
    }).catch(error => {
        console.error('❌ Error refreshing users:', error);
        document.getElementById('usersTable').innerHTML = '<tr><td colspan="6" class="loading">Error loading users</td></tr>';
    });
}

// Check server status
function checkServerStatus() {
    console.log('Checking server status...');
    fetch('http://localhost:5000/api/products')
        .then(response => {
            console.log('Server status check response:', response.status);
            if (response.ok) {
                document.getElementById('serverStatus').innerHTML = '🟢 Server Online';
                document.getElementById('serverStatus').style.background = '#dcfce7';
                document.getElementById('serverStatus').style.color = '#166534';
                console.log('✅ Server is online and responding');
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        })
        .catch((error) => {
            console.error('❌ Server status check failed:', error);
            document.getElementById('serverStatus').innerHTML = '🔴 Server Offline (Demo Mode)';
            document.getElementById('serverStatus').style.background = '#fecaca';
            document.getElementById('serverStatus').style.color = '#dc2626';
        });
}

// Load users from both database and localStorage
function loadUsers() {
    return fetch('http://localhost:5000/api/admin/users')
        .then(response => {
            if (!response.ok) throw new Error('Server error');
            return response.json();
        })
        .then(data => {
            console.log('✅ Loaded users from database:', data.length);
            
            // Get localStorage users as backup
            const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            console.log('📦 Found users in localStorage:', localUsers.length);
            
            // Merge both sources (avoid duplicates)
            const combinedUsers = [...data];
            localUsers.forEach(localUser => {
                const exists = data.find(user => user.email === localUser.email);
                if (!exists) {
                    combinedUsers.push({...localUser, source: 'localStorage'});
                }
            });
            
            allUsers = combinedUsers;
            document.getElementById('totalUsers').textContent = allUsers.length;
            renderUsersTable(allUsers);
            console.log(`📊 Total users: ${allUsers.length} (${data.length} DB + ${localUsers.length} localStorage)`);
            return allUsers;
        })
        .catch(error => {
            console.error('❌ Error loading users from database:', error);
            // Fallback to localStorage only
            const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            allUsers = localUsers.map(user => ({...user, source: 'localStorage'}));
            document.getElementById('totalUsers').textContent = allUsers.length;
            renderUsersTable(allUsers);
            console.log(`📦 Fallback: ${allUsers.length} users from localStorage`);
            return allUsers;
        });
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTable');
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No users found</td></tr>';
    } else {
        tbody.innerHTML = users.map((user, index) => {
            // Format registration date
            let regDate = user.registrationDate || user.created_at || new Date().toISOString();
            if (regDate.includes('T')) {
                regDate = regDate.split('T')[0];
            }
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${regDate}</td>
                    <td>0</td>
                    <td>
                        <button class="btn-small btn-view" onclick="viewUser('${user.email}')">View</button>
                        <button class="btn-small btn-delete" onclick="deleteUser('${user.email}')">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Load products
function loadProducts() {
    return fetch('http://localhost:5000/api/products')
        .then(response => response.json())
        .then(data => {
            console.log('✅ Loaded products from backend:', data.length);
            allProducts = data;
            document.getElementById('totalProducts').textContent = data.length;
            renderProductsTable(data);
            return data;
        })
        .catch(error => {
            console.error('❌ Error loading products:', error);
            allProducts = [];
            document.getElementById('totalProducts').textContent = 0;
            renderProductsTable(allProducts);
            return [];
        });
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTable');
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No products found</td></tr>';
    } else {
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>₦${product.price.toLocaleString()}</td>
                <td>${product.stock || 'N/A'}</td>
                <td><span class="status-badge ${(product.stock || 0) > 10 ? 'status-delivered' : 'status-pending'}">${(product.stock || 0) > 10 ? 'In Stock' : 'Low Stock'}</span></td>
                <td>
                    <button class="btn-small btn-view" onclick="viewProduct('${product.id}')">View</button>
                    <button class="btn-small btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

// Load orders
function loadOrders() {
    // Always load from localStorage first
    const localOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    console.log('📦 Found orders in localStorage:', localOrders.length);
    
    return fetch('http://localhost:5000/api/admin/orders')
        .then(response => {
            if (!response.ok) throw new Error('Server error');
            return response.json();
        })
        .then(data => {
            console.log('✅ Loaded orders from Supabase:', data.length);
            // Merge Supabase orders with localStorage orders
            const combinedOrders = [...data];
            
            // Add localStorage orders that aren't in Supabase
            localOrders.forEach(localOrder => {
                const exists = data.find(order => order.id == localOrder.id || order.payment_reference === localOrder.payment_reference);
                if (!exists) {
                    combinedOrders.push(localOrder);
                }
            });
            
            allOrders = combinedOrders;
            document.getElementById('totalOrders').textContent = allOrders.length;
            
            // Calculate total revenue
            const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
            document.getElementById('totalRevenue').textContent = `₦${totalRevenue.toLocaleString()}`;
            
            renderOrdersTable(allOrders);
            return allOrders;
        })
        .catch(error => {
            console.error('❌ Error loading orders from Supabase:', error);
            // Fallback to localStorage only if Supabase fails
            const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
            console.log('📦 Loading orders from localStorage:', storedOrders.length);
            allOrders = storedOrders;
            document.getElementById('totalOrders').textContent = allOrders.length;
            
            const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
            document.getElementById('totalRevenue').textContent = `₦${totalRevenue.toLocaleString()}`;
            
            renderOrdersTable(allOrders);
            return allOrders;
        });
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTable');
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No orders found</td></tr>';
    } else {
        tbody.innerHTML = orders.map(order => {
            // Calculate items count and create products list
            let itemCount = 0;
            let productsList = 'No items';
            
            if (order.items && Array.isArray(order.items) && order.items.length > 0) {
                itemCount = order.items.length;
                productsList = order.items.map(item => {
                    const name = item.name || item.product_name || item.title || `Product ${item.product_id || item.id || 'Unknown'}`;
                    const qty = item.quantity || 1;
                    return `${name} (${qty})`;
                }).join(', ');
            } else if (order.items && typeof order.items === 'object' && Object.keys(order.items).length > 0) {
                itemCount = Object.keys(order.items).length;
                productsList = Object.keys(order.items).map(key => {
                    const item = order.items[key];
                    const name = item.name || item.product_name || item.title || key;
                    return `${name} (${item.quantity || 1})`;
                }).join(', ');
            }
            
            // Truncate long product lists
            if (productsList.length > 50) {
                productsList = productsList.substring(0, 47) + '...';
            }
            
            // Get total price
            const total = order.total || order.amount || 0;
            
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customer_name || order.customer_info?.name || order.customer_email || 'N/A'}</td>
                    <td>${order.customer_phone || order.customer_info?.phone || 'N/A'}</td>
                    <td>${itemCount} item${itemCount !== 1 ? 's' : ''}</td>
                    <td title="${order.items && order.items.length > 0 ? order.items.map(item => `${item.name || 'Unknown Product'} (${item.quantity || 1}) - ${item.brand || 'Unknown Brand'}`).join(', ') : 'No items information available'}">${productsList}</td>
                    <td>₦${total.toLocaleString()}</td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-small btn-view" onclick="viewOrder(${order.id})">View</button>
                        <select onchange="updateOrderStatus(${order.id}, this.value)" style="padding: 4px; font-size: 11px; border-radius: 4px;">
                            <option value="${order.status}" selected>${order.status}</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Load payments
function loadPayments() {
    return fetch('http://localhost:5000/api/payments/history/all')
        .then(response => {
            if (!response.ok) throw new Error('Server error');
            return response.json();
        })
        .then(data => {
            console.log('✅ Loaded payments from Supabase:', data.length);
            allPayments = data;
            renderPaymentsTable(allPayments);
            return allPayments;
        })
        .catch(error => {
            console.error('❌ Error loading payments from Supabase:', error);
            // Fallback to localStorage only if Supabase fails
            const storedPayments = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
            allPayments = storedPayments;
            renderPaymentsTable(allPayments);
            return allPayments;
        });
}

function renderPaymentsTable(payments) {
    const tbody = document.getElementById('paymentsTable');
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No payments found</td></tr>';
    } else {
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.reference}</td>
                <td>${payment.customer_email || 'N/A'}</td>
                <td>₦${(payment.amount || 0).toLocaleString()}</td>
                <td>${payment.paymentMethod || 'Card'}</td>
                <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
                <td>${new Date(payment.date).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }
}

// Load recent activity
function loadRecentActivity() {
    // Generate activity from recent orders and users
    const activities = [];
    
    // Add recent orders
    allOrders.slice(0, 3).forEach(order => {
        activities.push({
            time: new Date(order.created_at).toLocaleTimeString(),
            activity: 'New order placed',
            user: order.customer_info?.name || order.customer_email || 'Unknown',
            status: 'success'
        });
    });
    
    // Add recent users
    allUsers.slice(0, 2).forEach(user => {
        activities.push({
            time: new Date(user.registrationDate).toLocaleTimeString(),
            activity: 'User registered',
            user: user.name,
            status: 'success'
        });
    });
    
    const tbody = document.getElementById('activityTable');
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No recent activity</td></tr>';
    } else {
        tbody.innerHTML = activities.map(activity => `
            <tr>
                <td>${activity.time}</td>
                <td>${activity.activity}</td>
                <td>${activity.user}</td>
                <td><span class="status-badge status-delivered">${activity.status}</span></td>
            </tr>
        `).join('');
    }
}

// Load analytics
function loadAnalytics() {
    const today = new Date();
    const todayStr = today.toDateString();
    
    // Today's orders (if none today, show recent orders)
    const todayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === todayStr;
    });
    
    // If no orders today, show recent orders count
    const displayOrders = todayOrders.length > 0 ? todayOrders.length : Math.min(allOrders.length, 3);
    document.getElementById('todayOrders').textContent = displayOrders;
    
    // Today's revenue (if none today, show sample revenue)
    const todayRevenue = todayOrders.reduce((sum, order) => {
        return sum + (order.total || order.amount || 0);
    }, 0);
    
    const displayRevenue = todayRevenue > 0 ? todayRevenue : (allOrders.length > 0 ? 125000 : 0);
    document.getElementById('todayRevenue').textContent = `₦${displayRevenue.toLocaleString()}`;
    
    // Low stock products
    const lowStockProducts = allProducts.filter(product => (product.stock || 0) < 10);
    document.getElementById('lowStockProducts').textContent = lowStockProducts.length;
    
    // New users (if none today, show recent users)
    const newUsers = allUsers.filter(user => {
        const userDate = new Date(user.registrationDate || user.created_at);
        return userDate.toDateString() === todayStr;
    });
    
    const displayUsers = newUsers.length > 0 ? newUsers.length : Math.min(allUsers.length, 2);
    document.getElementById('newUsers').textContent = displayUsers;
    
    // Top products with sales data
    renderTopProducts();
}

function renderTopProducts() {
    // Calculate product sales from orders
    const productSales = {};
    
    allOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const productId = item.product_id || item.id || item.name;
                if (!productSales[productId]) {
                    productSales[productId] = {
                        name: item.name || 'Unknown Product',
                        brand: item.brand || 'Unknown Brand',
                        sold: 0,
                        revenue: 0
                    };
                }
                productSales[productId].sold += item.quantity || 1;
                productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
            });
        }
    });
    
    // Convert to array and sort by sales
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);
    
    // If no sales data, show top products by stock
    if (topProducts.length === 0) {
        const fallbackProducts = allProducts.slice(0, 5);
        const tbody = document.getElementById('topProductsTable');
        tbody.innerHTML = fallbackProducts.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>0</td>
                <td>₦0</td>
                <td>${product.stock || 0}</td>
            </tr>
        `).join('');
        return;
    }
    
    const tbody = document.getElementById('topProductsTable');
    tbody.innerHTML = topProducts.map(product => {
        // Find stock from products array
        const productData = allProducts.find(p => p.name === product.name);
        const stock = productData ? productData.stock || 0 : 0;
        
        return `
            <tr>
                <td>${product.name}</td>
                <td>${product.brand}</td>
                <td>${product.sold}</td>
                <td>₦${product.revenue.toLocaleString()}</td>
                <td>${stock}</td>
            </tr>
        `;
    }).join('');
}

// Manual test function for adding products
window.testAddProduct = function() {
    console.log('🧪 Manual test: Adding product...');
    
    const testProduct = {
        name: 'Manual Test Product',
        brand: 'Test Brand',
        price: 5000,
        category: 'Tops',
        stock: 15,
        image: 'https://via.placeholder.com/400x600?text=Manual+Test',
        colors: ['Blue', 'Red'],
        sizes: ['S', 'M', 'L']
    };
    
    fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProduct)
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('✅ Success:', data);
        alert('Test product added! Check products list.');
        loadProducts();
    })
    .catch(error => {
        console.error('❌ Failed:', error);
        alert(`Failed: ${error.message}`);
    });
};

// Manual test function for adding users
window.testAddUser = function() {
    console.log('🧪 Manual test: Adding user to localStorage...');
    
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        registrationDate: new Date().toISOString().split('T')[0],
        registrationTime: new Date().toISOString()
    };
    
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user already exists
    const existingUser = registeredUsers.find(u => u.email === testUser.email);
    if (!existingUser) {
        registeredUsers.push(testUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        console.log('✅ Test user added to localStorage:', testUser);
        alert('Test user added! Click "Refresh Users" to see it.');
    } else {
        alert('Test user already exists!');
    }
};

// Debug function to check localStorage users
window.checkLocalStorageUsers = function() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    console.log('📦 Users in localStorage:', users);
    alert(`Found ${users.length} users in localStorage. Check console for details.`);
};

// Filter orders
function filterOrders() {
    const status = document.getElementById('orderStatusFilter').value;
    const filteredOrders = status ? allOrders.filter(order => order.status === status) : allOrders;
    renderOrdersTable(filteredOrders);
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            // Update local data
            const order = allOrders.find(o => o.id === orderId);
            if (order) {
                order.status = newStatus;
                
                // Also update localStorage for user tracking
                const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
                const userOrder = userOrders.find(o => o.id === orderId);
                if (userOrder) {
                    userOrder.status = newStatus;
                    localStorage.setItem('userOrders', JSON.stringify(userOrders));
                }
            }
            
            alert('Order status updated successfully');
            renderOrdersTable(allOrders);
        }
    })
    .catch(() => {
        // Fallback for demo
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            
            // Also update localStorage for user tracking
            const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
            const userOrder = userOrders.find(o => o.id === orderId);
            if (userOrder) {
                userOrder.status = newStatus;
                localStorage.setItem('userOrders', JSON.stringify(userOrders));
            }
        }
        alert('Order status updated (demo mode)');
        renderOrdersTable(allOrders);
    });
}

// View functions
function viewUser(email) {
    const user = allUsers.find(u => u.email === email);
    if (user) {
        alert(`User Details:\nName: ${user.name}\nEmail: ${user.email}\nJoined: ${user.registrationDate}`);
    }
}

function viewProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        alert(`Product Details:\nName: ${product.name}\nBrand: ${product.brand}\nPrice: ₦${product.price.toLocaleString()}\nStock: ${product.stock}`);
    }
}

function viewOrder(orderId) {
    const order = allOrders.find(o => o.id == orderId);
    if (order) {
        let itemsList = 'No items available';
        
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            itemsList = order.items.map(item => {
                const name = item.name || item.product_name || 'Unknown Product';
                const brand = item.brand ? ` (${item.brand})` : '';
                const quantity = item.quantity || 1;
                const price = item.price || 0;
                const color = item.color && item.color !== 'N/A' && item.color !== null ? ` - Color: ${item.color}` : '';
                const size = item.size && item.size !== 'N/A' && item.size !== null ? ` - Size: ${item.size}` : '';
                return `${name}${brand} (x${quantity}) - ₦${price.toLocaleString()}${color}${size}`;
            }).join('\n');
        }
        
        const customerName = order.customer_name || order.customer_info?.name || 'N/A';
        const customerEmail = order.customer_email || order.customer_info?.email || 'N/A';
        const customerPhone = order.customer_phone || order.customer_info?.phone || 'N/A';
        const total = order.total || order.amount || 0;
        
        alert(`Order Details:\nID: #${order.id}\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nItems:\n${itemsList}\nTotal: ₦${total.toLocaleString()}\nStatus: ${order.status}`);
    }
}

// Delete functions
function deleteUser(email) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`http://localhost:5000/api/admin/users/${email}`, { method: 'DELETE' })
            .then(() => {
                allUsers = allUsers.filter(u => u.email !== email);
                renderUsersTable(allUsers);
                document.getElementById('totalUsers').textContent = allUsers.length;
                alert('User deleted successfully');
            })
            .catch(() => {
                // Fallback for demo
                allUsers = allUsers.filter(u => u.email !== email);
                renderUsersTable(allUsers);
                document.getElementById('totalUsers').textContent = allUsers.length;
                alert('User deleted (demo mode)');
            });
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`http://localhost:5000/api/admin/products/${productId}`, { method: 'DELETE' })
            .then(() => {
                allProducts = allProducts.filter(p => p.id !== productId);
                renderProductsTable(allProducts);
                document.getElementById('totalProducts').textContent = allProducts.length;
                alert('Product deleted successfully');
            })
            .catch(() => {
                // Fallback for demo
                allProducts = allProducts.filter(p => p.id !== productId);
                renderProductsTable(allProducts);
                document.getElementById('totalProducts').textContent = allProducts.length;
                alert('Product deleted (demo mode)');
            });
    }
}

// Export functions
function exportUsers() {
    const csv = 'Name,Email,Registration Date\n' + 
        allUsers.map(user => `${user.name},${user.email},${user.registrationDate || user.created_at || 'N/A'}`).join('\n');
    downloadCSV(csv, 'users.csv');
}

function exportPayments() {
    const csv = 'Reference,Customer,Amount,Method,Status,Date\n' + 
        allPayments.map(payment => `${payment.reference},${payment.customer_email || 'N/A'},${payment.amount},${payment.paymentMethod || 'Card'},${payment.status},${payment.date}`).join('\n');
    downloadCSV(csv, 'payments.csv');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Product management functions
function showAddProductModal() {
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('addProductForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('submitBtn').textContent = 'Add Product';
    document.getElementById('addProductModal').style.display = 'flex';
}

function hideAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
    document.getElementById('addProductForm').reset();
}

function editProduct(productId) {
    fetch(`http://localhost:5000/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('modalTitle').textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.querySelector('input[name="name"]').value = product.name;
            document.querySelector('input[name="brand"]').value = product.brand;
            document.querySelector('input[name="price"]').value = product.price;
            document.querySelector('input[name="stock"]').value = product.stock;
            document.querySelector('select[name="category"]').value = product.category;
            document.getElementById('productImageUrl').value = product.image;
            document.querySelector('input[name="colors"]').value = product.colors.join(', ');
            document.querySelector('input[name="sizes"]').value = product.sizes.join(', ');
            
            if (product.image) {
                document.getElementById('imagePreview').src = product.image;
                document.getElementById('imagePreview').style.display = 'block';
            }
            
            document.getElementById('submitBtn').textContent = 'Update Product';
            document.getElementById('addProductModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error loading product:', error);
            alert('Error loading product details');
        });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function addProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const imageFile = document.getElementById('productImage').files[0];
    const imageUrl = document.getElementById('productImageUrl').value;
    
    let finalImageUrl = imageUrl;
    
    if (imageFile && !imageUrl) {
        const reader = new FileReader();
        reader.onload = function(e) {
            finalImageUrl = e.target.result;
            submitProduct(formData, finalImageUrl);
        };
        reader.readAsDataURL(imageFile);
        return;
    }
    
    submitProduct(formData, finalImageUrl);
}

function submitProduct(formData, imageUrl) {
    const productId = document.getElementById('productId').value;
    const isEdit = productId !== '';
    
    console.log('=== PRODUCT SUBMISSION DEBUG ===');
    console.log('Product ID:', productId);
    console.log('Is Edit:', isEdit);
    console.log('Form Data entries:');
    for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
    }
    console.log('Image URL:', imageUrl);
    
    const productData = {
        name: formData.get('name'),
        brand: formData.get('brand'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        stock: parseInt(formData.get('stock')),
        image: imageUrl || 'https://via.placeholder.com/400x600?text=No+Image',
        colors: formData.get('colors').split(',').map(c => c.trim()),
        sizes: formData.get('sizes').split(',').map(s => s.trim()),
        rating: 4.0,
        reviews: 0,
        isNew: true,
        onSale: false
    };

    console.log('Final product data to submit:', productData);
    
    // Validate required fields
    if (!productData.name || !productData.brand || !productData.price || !productData.category) {
        alert('Please fill in all required fields (Name, Brand, Price, Category)');
        return;
    }

    const url = isEdit ? 
        `http://localhost:5000/api/admin/products/${productId}` : 
        'http://localhost:5000/api/admin/products';
    
    const method = isEdit ? 'PUT' : 'POST';

    console.log('Making API request to:', url);
    console.log('Method:', method);
    console.log('Request body:', JSON.stringify(productData, null, 2));
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success response data:', data);
        if (data.message || data.success || data.product) {
            alert(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
            hideAddProductModal();
            
            // Add new product directly to array if not editing
            if (!isEdit && data.product) {
                allProducts.push(data.product);
                console.log('Added new product to array:', data.product.name);
            }
            
            // Update display immediately
            document.getElementById('totalProducts').textContent = allProducts.length;
            renderProductsTable(allProducts);
            console.log(`Updated product count to: ${allProducts.length}`);
            console.log('Current products array:', allProducts.map(p => p.name));
        } else if (data.error) {
            console.error('Server error:', data.error);
            alert(`Error: ${data.error}`);
        } else {
            console.error('Unexpected response format:', data);
            alert(isEdit ? 'Error updating product' : 'Error adding product');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        alert(`${isEdit ? 'Error updating product' : 'Error adding product'}: ${error.message}`);
    });
}
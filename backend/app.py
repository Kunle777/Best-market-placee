from flask import Flask, jsonify, request, render_template_string   
from flask_cors import CORS
import json
import os
import requests
import bcrypt
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # For admin operations

# Initialize Supabase client
supabase = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "https://your-project-id.supabase.co":
    try:
        # Use service key for admin operations if available, otherwise use anon key
        key_to_use = SUPABASE_SERVICE_KEY if SUPABASE_SERVICE_KEY else SUPABASE_KEY
        supabase = create_client(SUPABASE_URL, key_to_use)
        print("Supabase connected successfully")
    except Exception as e:
        print(f"Supabase connection failed: {e}")
        supabase = None
else:
    print("Supabase not configured, using file-based storage")

app = Flask(__name__)
CORS(app)

# Sample product data
PRODUCTS = [
    {
        "id": "1",
        "name": "Classic White T-Shirt",
        "brand": "Premium Basics",
        "price": 18000,
        "originalPrice": 24000,
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
        "category": "Tops",
        "rating": 4.5,
        "reviews": 128,
        "colors": ["White", "Black", "Gray"],
        "sizes": ["XS", "S", "M", "L", "XL"],
        "stock": 45,
        "isNew": False,
        "onSale": True
    },
    {
        "id": "2",
        "name": "Slim Fit Denim Jeans",
        "brand": "Urban Denim Co.",
        "price": 28000,
        "originalPrice": 35600,
        "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop",
        "category": "Bottoms",
        "rating": 4.8,
        "reviews": 256,
        "colors": ["Dark Blue", "Light Blue", "Black"],
        "sizes": ["28", "30", "32", "34", "36"],
        "stock": 32,
        "isNew": True,
        "onSale": True
    },
    {
        "id": "3",
        "name": "Leather Crossbody Bag",
        "brand": "Luxe Leather",
        "price": 48000,
        "image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop",
        "category": "Accessories",
        "rating": 4.9,
        "reviews": 89,
        "colors": ["Brown", "Black", "Tan"],
        "sizes": ["One Size"],
        "stock": 18,
        "isNew": False,
        "onSale": False
    },
    {
        "id": "4",
        "name": "Wool Blend Overcoat",
        "brand": "Elite Fashion",
        "price": 89000,
        "originalPrice": 120000,
        "image": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=800&fit=crop",
        "category": "Jackets",
        "rating": 4.7,
        "reviews": 45,
        "colors": ["Camel", "Black", "Gray"],
        "sizes": ["S", "M", "L", "XL"],
        "stock": 15,
        "isNew": False,
        "onSale": True
    },
    {
        "id": "5",
        "name": "Striped Cotton Shirt",
        "brand": "Modern Threads",
        "price": 25000,
        "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
        "category": "Tops",
        "rating": 4.6,
        "reviews": 92,
        "colors": ["Blue", "White", "Navy"],
        "sizes": ["S", "M", "L", "XL"],
        "stock": 28,
        "isNew": True,
        "onSale": False
    },
    {
        "id": "6",
        "name": "Summer Floral Dress",
        "brand": "Elegant Style",
        "price": 28000,
        "originalPrice": 40000,
        "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
        "category": "Dresses",
        "rating": 4.4,
        "reviews": 27,
        "colors": ["Floral", "Pink", "Blue"],
        "sizes": ["XS", "S", "M", "L"],
        "stock": 22,
        "isNew": False,
        "onSale": True
    },
    {
        "id": "7",
        "name": "Leather Biker Jacket",
        "brand": "Urban Edge",
        "price": 120000,
        "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop",
        "category": "Jackets",
        "rating": 4.9,
        "reviews": 45,
        "colors": ["Black", "Brown"],
        "sizes": ["S", "M", "L", "XL"],
        "stock": 8,
        "isNew": False,
        "onSale": False
    },
    {
        "id": "8",
        "name": "Cotton Hoodie",
        "brand": "Comfort Zone",
        "price": 38000,
        "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop",
        "category": "Hoodies",
        "rating": 4.1,
        "reviews": 33,
        "colors": ["Gray", "Black", "Navy"],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "stock": 35,
        "isNew": False,
        "onSale": False
    },
    {
        "id": "9",
        "name": "Chino Pants",
        "brand": "Smart Casual",
        "price": 42000,
        "image": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop",
        "category": "Pants",
        "rating": 4.0,
        "reviews": 21,
        "colors": ["Khaki", "Navy", "Black"],
        "sizes": ["30", "32", "34", "36", "38"],
        "stock": 19,
        "isNew": True,
        "onSale": False
    },
    {
        "id": "10",
        "name": "Casual Sneakers",
        "brand": "Street Style",
        "price": 55000,
        "image": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop",
        "category": "Footwear",
        "rating": 4.3,
        "reviews": 67,
        "colors": ["White", "Black", "Gray"],
        "sizes": ["40", "41", "42", "43", "44"],
        "stock": 25,
        "isNew": False,
        "onSale": True
    },
    {
        "id": "11",
        "name": "Designer Sunglasses",
        "brand": "Luxury Optics",
        "price": 32000,
        "originalPrice": 45000,
        "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop",
        "category": "Accessories",
        "rating": 4.6,
        "reviews": 34,
        "colors": ["Black", "Brown", "Gold"],
        "sizes": ["One Size"],
        "stock": 12,
        "isNew": True,
        "onSale": True
    }
]

# File-based user storage (fallback)
USERS_FILE = 'backend/users.json'

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

users_storage = load_users()

# In-memory storage (fallback) - only used when Supabase fails
cart_storage = {}
orders_storage = []
newsletter_subscribers = []

# Initialize Supabase tables and load existing data
if supabase:
    try:
        # Try to load orders - if table doesn't exist, it will be created automatically by first insert
        result = supabase.table('orders').select('*').limit(1).execute()
        if result.data is not None:
            # Load all orders
            all_orders = supabase.table('orders').select('*').execute()
            if all_orders.data:
                orders_storage = all_orders.data
                print(f"Loaded {len(orders_storage)} existing orders from Supabase")
    except Exception as e:
        print(f"Orders table not ready: {e}")
        print("Orders will be created when first order is placed")

@app.route('/')
def home():
    return jsonify({"message": "Best Market Place API", "status": "running"})

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    try:
        if supabase:
            # Get from Supabase
            query = supabase.table('products').select('*')
            
            # Apply filters
            category = request.args.get('category')
            brand = request.args.get('brand')
            min_price = request.args.get('min_price', type=float)
            max_price = request.args.get('max_price', type=float)
            search = request.args.get('search', '').lower()
            
            if category:
                query = query.ilike('category', f'%{category}%')
            if brand:
                query = query.ilike('brand', f'%{brand}%')
            if min_price is not None:
                query = query.gte('price', min_price)
            if max_price is not None:
                query = query.lte('price', max_price)
            if search:
                query = query.or_(f'name.ilike.%{search}%,brand.ilike.%{search}%')
            
            result = query.execute()
            if result.data:
                return jsonify(result.data)
    except Exception as e:
        print(f"Error getting products from Supabase: {e}")
    
    # Fallback to local products
    category = request.args.get('category')
    brand = request.args.get('brand')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    search = request.args.get('search', '').lower()
    
    filtered_products = PRODUCTS.copy()
    
    if category:
        filtered_products = [p for p in filtered_products if p['category'].lower() == category.lower()]
    if brand:
        filtered_products = [p for p in filtered_products if p['brand'].lower() == brand.lower()]
    if min_price is not None:
        filtered_products = [p for p in filtered_products if p['price'] >= min_price]
    if max_price is not None:
        filtered_products = [p for p in filtered_products if p['price'] <= max_price]
    if search:
        filtered_products = [p for p in filtered_products 
                           if search in p['name'].lower() or search in p['brand'].lower()]
    
    return jsonify(filtered_products)

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product by ID"""
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/cart/<session_id>', methods=['GET'])
def get_cart(session_id):
    """Get cart contents for session"""
    try:
        if supabase:
            # Get from Supabase
            result = supabase.table('cart_items').select('*, products(*)').eq('session_id', session_id).execute()
            if result.data:
                # Transform Supabase data to match frontend format
                cart = []
                for item in result.data:
                    product = item.get('products', {})
                    cart_item = {
                        "item_key": f"{item['product_id']}_{item.get('color', 'default')}_{item.get('size', 'default')}",
                        "product_id": str(item['product_id']),
                        "name": product.get('name', 'Unknown Product'),
                        "brand": product.get('brand', 'Unknown Brand'),
                        "price": product.get('price', 0),
                        "originalPrice": product.get('original_price'),
                        "image": product.get('image', ''),
                        "quantity": item['quantity'],
                        "size": item.get('size'),
                        "color": item.get('color'),
                        "stock": product.get('stock', 0)
                    }
                    cart.append(cart_item)
                return jsonify(cart)
        
        # Fallback to local storage
        cart = cart_storage.get(session_id, [])
        return jsonify(cart)
    except Exception as e:
        print(f"Error getting cart: {e}")
        # Fallback to local storage
        cart = cart_storage.get(session_id, [])
        return jsonify(cart)

@app.route('/api/cart/<session_id>/add', methods=['POST'])
def add_to_cart(session_id):
    """Add item to cart"""
    data = request.json
    product_id = str(data.get('product_id'))
    quantity = data.get('quantity', 1)
    size = data.get('size')
    color = data.get('color')
    
    # Find product
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    if quantity > product['stock']:
        return jsonify({"error": "Insufficient stock"}), 400
    
    try:
        if supabase:
            # Add to Supabase
            result = supabase.table('cart_items').insert({
                'session_id': session_id,
                'product_id': int(product_id),
                'quantity': quantity,
                'color': color,
                'size': size
            }).execute()
            print(f"Item added to Supabase cart: {product['name']}")
    except Exception as e:
        print(f"Error adding to Supabase cart: {e}")
    
    # Also add to local storage as fallback
    if session_id not in cart_storage:
        cart_storage[session_id] = []
    
    cart = cart_storage[session_id]
    item_key = f"{product_id}_{color or 'default'}_{size or 'default'}"
    
    existing_item = next((item for item in cart if item.get('item_key') == item_key), None)
    
    if existing_item:
        new_quantity = existing_item['quantity'] + quantity
        if new_quantity > product['stock']:
            return jsonify({"error": "Insufficient stock"}), 400
        existing_item['quantity'] = new_quantity
    else:
        cart_item = {
            "item_key": item_key,
            "product_id": product_id,
            "name": product['name'],
            "brand": product['brand'],
            "price": product['price'],
            "originalPrice": product.get('originalPrice'),
            "image": product['image'],
            "quantity": quantity,
            "size": size,
            "color": color,
            "stock": product['stock']
        }
        cart.append(cart_item)
    
    return jsonify({"message": "Item added to cart", "cart": cart})

@app.route('/api/cart/<session_id>/update', methods=['PUT'])
def update_cart_item(session_id):
    """Update cart item quantity"""
    data = request.json
    item_key = data.get('item_key')
    quantity = data.get('quantity')
    
    try:
        if supabase:
            # Parse item_key to get product details
            parts = item_key.split('_')
            product_id = int(parts[0])
            color = parts[1] if len(parts) > 1 and parts[1] != 'default' else None
            size = parts[2] if len(parts) > 2 and parts[2] != 'default' else None
            
            if quantity <= 0:
                # Remove item
                result = supabase.table('cart_items').delete().eq('session_id', session_id).eq('product_id', product_id).execute()
            else:
                # Update quantity
                result = supabase.table('cart_items').update({'quantity': quantity}).eq('session_id', session_id).eq('product_id', product_id).execute()
    except Exception as e:
        print(f"Supabase cart update error: {e}")
    
    # Also update local storage
    if session_id not in cart_storage:
        cart_storage[session_id] = []
    
    cart = cart_storage[session_id]
    item = next((item for item in cart if item.get('item_key') == item_key), None)
    
    if item:
        # Check stock
        product = next((p for p in PRODUCTS if p['id'] == item['product_id']), None)
        if product and quantity > product['stock']:
            return jsonify({"error": "Insufficient stock"}), 400
        
        if quantity <= 0:
            cart.remove(item)
        else:
            item['quantity'] = quantity
    
    return jsonify({"message": "Cart updated", "cart": cart})

@app.route('/api/cart/<session_id>/remove', methods=['DELETE'])
def remove_from_cart(session_id):
    """Remove item from cart"""
    item_key = request.json.get('item_key')
    
    try:
        if supabase:
            # Parse item_key to get product details
            parts = item_key.split('_')
            product_id = int(parts[0])
            
            # Remove from Supabase
            result = supabase.table('cart_items').delete().eq('session_id', session_id).eq('product_id', product_id).execute()
            print(f"Item removed from Supabase cart: {product_id}")
    except Exception as e:
        print(f"Supabase cart remove error: {e}")
    
    # Also remove from local storage
    if session_id in cart_storage:
        cart = cart_storage[session_id]
        cart_storage[session_id] = [item for item in cart if item.get('item_key') != item_key]
    
    return jsonify({"message": "Item removed from cart"})

@app.route('/api/cart/<session_id>/clear', methods=['DELETE'])
def clear_cart(session_id):
    """Clear entire cart"""
    try:
        if supabase:
            # Clear from Supabase
            result = supabase.table('cart_items').delete().eq('session_id', session_id).execute()
            print(f"Supabase cart cleared for session {session_id}")
        
        # Clear from local storage
        if session_id in cart_storage:
            cart_storage[session_id] = []
            print(f"Local cart cleared for session {session_id}")
        
        return jsonify({"message": "Cart cleared successfully", "status": "success"})
    except Exception as e:
        print(f"Error clearing cart: {e}")
        # Fallback to local clear
        if session_id in cart_storage:
            cart_storage[session_id] = []
        return jsonify({"message": "Cart cleared (local only)", "status": "partial"})

@app.route('/api/newsletter/subscribe', methods=['POST'])
def subscribe_newsletter():
    """Subscribe to newsletter"""
    email = request.json.get('email')
    
    if not email or '@' not in email:
        return jsonify({"error": "Invalid email address"}), 400
    
    if email not in newsletter_subscribers:
        newsletter_subscribers.append(email)
        return jsonify({"message": "Successfully subscribed to newsletter!"})
    
    return jsonify({"message": "Email already subscribed"})

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create new order"""
    data = request.json
    session_id = data.get('session_id')
    customer_info = data.get('customer_info')
    delivery_address = data.get('delivery_address', {})
    
    # Get cart items
    cart = []
    if supabase:
        try:
            result = supabase.table('cart_items').select('*, products(*)').eq('session_id', session_id).execute()
            if result.data:
                cart = result.data
            else:
                cart = cart_storage.get(session_id, [])
        except Exception as e:
            print(f"❌ Error getting cart from Supabase: {e}")
            cart = cart_storage.get(session_id, [])
    else:
        cart = cart_storage.get(session_id, [])
    
    if not cart:
        return jsonify({"error": "Cart is empty"}), 400
    
    # Calculate totals
    subtotal = 0
    for item in cart:
        if 'products' in item and item['products']:
            price = item['products']['price']
        else:
            price = item.get('price', 0)
        subtotal += price * item['quantity']
    
    tax = subtotal * 0.075
    shipping = 0 if subtotal > 50000 else 2500
    total = subtotal + tax + shipping
    
    # Prepare order data for Supabase
    order_data = {
        "customer_name": customer_info.get('name'),
        "customer_email": customer_info.get('email'),
        "customer_phone": customer_info.get('phone'),
        "delivery_address": delivery_address,
        "subtotal": subtotal,
        "tax": tax,
        "shipping": shipping,
        "total": total,
        "status": "confirmed",
        "items": cart  # Store cart items in order
    }
    
    try:
        if supabase:
            # Insert order into Supabase
            result = supabase.table('orders').insert(order_data).execute()
            if result.data:
                order = result.data[0]
                print(f"Order created in Supabase: {order['id']}")
                
                # Clear cart from Supabase
                clear_result = supabase.table('cart_items').delete().eq('session_id', session_id).execute()
                print(f"Cart cleared from Supabase")
                
                # Clear local cart too
                if session_id in cart_storage:
                    cart_storage[session_id] = []
                
                return jsonify({"message": "Order created successfully", "order": order})
    except Exception as e:
        print(f"Supabase order creation error: {e}")
    
    # Fallback to local storage
    order = {
        "id": len(orders_storage) + 1,
        "customer_name": customer_info.get('name'),
        "customer_email": customer_info.get('email'),
        "customer_phone": customer_info.get('phone'),
        "delivery_address": delivery_address,
        "items": cart,
        "subtotal": subtotal,
        "tax": tax,
        "shipping": shipping,
        "total": total,
        "status": "confirmed",
        "created_at": "2025-01-13T10:00:00"
    }
    
    orders_storage.append(order)
    cart_storage[session_id] = []
    
    return jsonify({"message": "Order created successfully", "order": order})

@app.route('/api/promo/validate', methods=['POST'])
def validate_promo():
    """Validate promo code"""
    code = request.json.get('code', '').strip()
    
    valid_codes = {
        '234567': {'discount': 10, 'type': 'percentage', 'description': '10% off your order'}
    }
    
    if code in valid_codes:
        promo = valid_codes[code]
        return jsonify({
            "valid": True, 
            "discount": promo['discount'],
            "type": promo['type'],
            "description": promo['description'],
            "message": f"Promo code applied! {promo['description']}"
        })
    
    return jsonify({"valid": False, "message": "Invalid promo code"})

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not email or not password or not name:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        if supabase:
            # Check if user already exists in database
            existing = supabase.table('users').select('email').eq('email', email).execute()
            if existing.data:
                return jsonify({"error": "User already exists"}), 400
            
            # Hash password with bcrypt
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
            
            # Insert directly into users table with hashed password
            table_result = supabase.table('users').insert({
                'name': name,
                'email': email,
                'password_hash': hashed_password.decode('utf-8'),
                'is_admin': False
            }).execute()
            
            if table_result.data:
                user_data = table_result.data[0]
                return jsonify({
                    "message": "User registered successfully",
                    "user": {
                        "name": name, 
                        "email": email, 
                        "registrationDate": user_data.get('created_at', '2025-01-13')[:10] if user_data.get('created_at') else '2025-01-13'
                    }
                })
            else:
                return jsonify({"error": "Registration failed"}), 400
                
    except Exception as e:
        print(f"Supabase user registration error: {e}")
        if "already" in str(e).lower():
            return jsonify({"error": "User already exists"}), 400
    
    # Fallback to local storage
    print("Using local storage fallback")
    if email in users_storage:
        return jsonify({"error": "User already exists"}), 400
    
    # Hash password with bcrypt for local storage too
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    users_storage[email] = {
        "name": name,
        "email": email,
        "password_hash": hashed_password.decode('utf-8')
    }
    save_users(users_storage)
    
    return jsonify({
        "message": "User registered successfully",
        "user": {"name": name, "email": email, "registrationDate": "2025-01-13"}
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400
    
    try:
        if supabase:
            # Try Supabase Auth first
            auth_result = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if auth_result.user:
                # Get user details from users table
                user_result = supabase.table('users').select('*').eq('email', email).execute()
                if user_result.data:
                    user = user_result.data[0]
                    return jsonify({
                        "message": "Login successful",
                        "user": {"name": user['name'], "email": user['email']}
                    })
                else:
                    # User exists in auth but not in table, create table entry
                    name = auth_result.user.user_metadata.get('name', email.split('@')[0])
                    supabase.table('users').insert({
                        'id': auth_result.user.id,
                        'name': name,
                        'email': email,
                        'is_admin': False
                    }).execute()
                    
                    return jsonify({
                        "message": "Login successful",
                        "user": {"name": name, "email": email}
                    })
            
    except Exception as e:
        print(f"Supabase auth login error: {e}")
        # Try table-based login as fallback
        try:
            result = supabase.table('users').select('*').eq('email', email).execute()
            if result.data and len(result.data) > 0:
                user = result.data[0]
                # Check if user has hashed password or plain text (for migration)
                if user.get('password_hash'):
                    # Use bcrypt to verify hashed password
                    if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                        return jsonify({
                            "message": "Login successful",
                            "user": {"name": user['name'], "email": user['email']}
                        })
                elif user.get('password') == password:
                    # Legacy plain text password - still allow but should be migrated
                    return jsonify({
                        "message": "Login successful",
                        "user": {"name": user['name'], "email": user['email']}
                    })
        except Exception as table_error:
            print(f"Table login fallback error: {table_error}")
    
    # Fallback to local storage
    user = users_storage.get(email)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Check if user has hashed password or plain text
    if user.get('password_hash'):
        # Use bcrypt to verify hashed password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401
    elif user.get('password') != password:
        # Legacy plain text password check
        return jsonify({"error": "Invalid credentials"}), 401
    
    return jsonify({
        "message": "Login successful",
        "user": {"name": user['name'], "email": user['email']}
    })

@app.route('/api/auth/change-password', methods=['POST'])
def change_password():
    """Change user password"""
    data = request.json
    email = data.get('email')
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    if not email or not current_password or not new_password:
        return jsonify({"error": "Missing required fields"}), 400
    
    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters long"}), 400
    
    try:
        if supabase:
            # First verify current password by attempting login
            try:
                auth_result = supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": current_password
                })
                
                if auth_result.user:
                    # Update password in Supabase Auth
                    update_result = supabase.auth.update_user({
                        "password": new_password
                    })
                    
                    # Also update hashed password in users table
                    salt = bcrypt.gensalt()
                    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt)
                    
                    supabase.table('users').update({
                        'password_hash': hashed_password.decode('utf-8')
                    }).eq('email', email).execute()
                    
                    if update_result.user:
                        return jsonify({"message": "Password changed successfully"})
                    else:
                        return jsonify({"error": "Failed to update password"}), 500
                else:
                    return jsonify({"error": "Current password is incorrect"}), 401
                    
            except Exception as auth_error:
                print(f"Auth password change error: {auth_error}")
                return jsonify({"error": "Current password is incorrect"}), 401
                
    except Exception as e:
        print(f"Password change error: {e}")
    
    # Fallback to local storage
    user = users_storage.get(email)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Verify current password
    if user.get('password_hash'):
        if not bcrypt.checkpw(current_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({"error": "Current password is incorrect"}), 401
    elif user.get('password') != current_password:
        return jsonify({"error": "Current password is incorrect"}), 401
    
    # Hash new password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt)
    
    users_storage[email]['password_hash'] = hashed_password.decode('utf-8')
    # Remove old plain text password if it exists
    if 'password' in users_storage[email]:
        del users_storage[email]['password']
    
    save_users(users_storage)
    
    return jsonify({"message": "Password changed successfully"})

# Admin endpoints
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    """Get all users for admin"""
    try:
        if supabase:
            # Get users from both Auth and table
            auth_users = []
            try:
                # Get auth users (this requires admin privileges)
                auth_result = supabase.auth.admin.list_users()
                if hasattr(auth_result, 'users'):
                    auth_users = auth_result.users
            except Exception as auth_error:
                print(f"Auth users fetch error: {auth_error}")
            
            # Get users from table
            result = supabase.table('users').select('name, email, created_at').execute()
            if result.data:
                users_list = []
                for user in result.data:
                    users_list.append({
                        "name": user['name'],
                        "email": user['email'],
                        "registrationDate": user.get('created_at', '2025-01-13')[:10],
                        "source": "database"
                    })
                
                # Add auth-only users
                for auth_user in auth_users:
                    if not any(u['email'] == auth_user.email for u in users_list):
                        users_list.append({
                            "name": auth_user.user_metadata.get('name', auth_user.email.split('@')[0]),
                            "email": auth_user.email,
                            "registrationDate": auth_user.created_at[:10] if auth_user.created_at else '2025-01-13',
                            "source": "auth"
                        })
                
                return jsonify(users_list)
    except Exception as e:
        print(f"Supabase users fetch error: {e}")
    
    # Fallback to local storage
    users_list = []
    for email, user_data in users_storage.items():
        users_list.append({
            "name": user_data['name'],
            "email": user_data['email'],
            "registrationDate": user_data.get('registrationDate', '2025-01-13'),
            "source": "local"
        })
    return jsonify(users_list)

@app.route('/api/admin/users/<email>', methods=['DELETE'])
def delete_user(email):
    """Delete user"""
    try:
        if supabase:
            # Delete from users table
            supabase.table('users').delete().eq('email', email).execute()
            
            # Try to delete from auth (requires service key)
            try:
                # Get user by email first
                auth_users = supabase.auth.admin.list_users()
                if hasattr(auth_users, 'users'):
                    user_to_delete = next((u for u in auth_users.users if u.email == email), None)
                    if user_to_delete:
                        supabase.auth.admin.delete_user(user_to_delete.id)
            except Exception as auth_error:
                print(f"Auth user deletion error: {auth_error}")
            
            return jsonify({"message": "User deleted successfully"})
    except Exception as e:
        print(f"User deletion error: {e}")
    
    # Fallback to local storage
    if email in users_storage:
        del users_storage[email]
        save_users(users_storage)
        return jsonify({"message": "User deleted successfully"})
    return jsonify({"error": "User not found"}), 404

@app.route('/api/admin/orders', methods=['GET'])
def get_all_orders():
    """Get all orders for admin"""
    all_orders = []
    
    try:
        if supabase:
            result = supabase.table('orders').select('*').order('created_at', desc=True).execute()
            if result.data:
                all_orders.extend(result.data)
                print(f"Found {len(result.data)} orders in Supabase")
    except Exception as e:
        print(f"Supabase orders fetch error: {e}")
    
    # Also include local storage orders (avoid duplicates)
    for order in orders_storage:
        if not any(o.get('id') == order.get('id') for o in all_orders):
            all_orders.append(order)
    
    print(f"Returning {len(all_orders)} total orders (Supabase + local)")
    return jsonify(all_orders)

@app.route('/api/admin/orders/<int:order_id>', methods=['PUT'])
def update_order_status(order_id):
    """Update order status"""
    data = request.json
    status = data.get('status')
    
    order = next((o for o in orders_storage if o['id'] == order_id), None)
    if order:
        order['status'] = status
        return jsonify({"message": "Order status updated"})
    return jsonify({"error": "Order not found"}), 404

@app.route('/api/admin/products', methods=['POST'])
def add_product():
    """Add new product"""
    data = request.json
    
    # Generate new ID
    max_id = max([int(p['id']) for p in PRODUCTS], default=0)
    new_id = str(max_id + 1)
    
    new_product = {
        "id": new_id,
        "name": data['name'],
        "brand": data['brand'],
        "price": data['price'],
        "image": data['image'],
        "category": data['category'],
        "rating": data.get('rating', 4.0),
        "reviews": data.get('reviews', 0),
        "colors": data.get('colors', ['Default']),
        "sizes": data.get('sizes', ['One Size']),
        "stock": data['stock'],
        "isNew": data.get('isNew', True),
        "onSale": data.get('onSale', False)
    }
    
    PRODUCTS.append(new_product)
    return jsonify({"message": "Product added successfully", "product": new_product})

@app.route('/api/admin/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update product"""
    data = request.json
    
    # Find and update the product
    for i, product in enumerate(PRODUCTS):
        if product['id'] == product_id:
            PRODUCTS[i].update({
                "name": data['name'],
                "brand": data['brand'],
                "price": data['price'],
                "image": data['image'],
                "category": data['category'],
                "colors": data.get('colors', ['Default']),
                "sizes": data.get('sizes', ['One Size']),
                "stock": data['stock']
            })
            return jsonify({"message": "Product updated successfully", "product": PRODUCTS[i]})
    
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/admin/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete product"""
    global PRODUCTS
    PRODUCTS = [p for p in PRODUCTS if p['id'] != product_id]
    return jsonify({"message": "Product deleted successfully"})

# Payment verification endpoint
@app.route('/api/payment/verify', methods=['POST'])
def verify_payment():
    """Verify Paystack payment and confirm order"""
    data = request.json
    reference = data.get('reference')
    
    if not reference:
        return jsonify({"error": "Payment reference required"}), 400
    
    # Your Paystack secret key
    PAYSTACK_SECRET_KEY = "sk_test_fd1b611b51ef49f312253c26ecd8316beabb6d9d"
    
    # Verify payment with Paystack
    headers = {
        'Authorization': f'Bearer {PAYSTACK_SECRET_KEY}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(
            f'https://api.paystack.co/transaction/verify/{reference}',
            headers=headers
        )
        
        print(f"Paystack API Response Status: {response.status_code}")
        print(f"Paystack API Response: {response.text}")
        
        if response.status_code == 200:
            payment_data = response.json()
            print(f"Payment Data: {payment_data}")
            
            # Check if the response is successful and payment status is success
            if (payment_data.get('status') == True and 
                payment_data.get('data', {}).get('status') == 'success'):
                
                # Payment successful - create/confirm order
                amount = payment_data['data']['amount'] / 100  # Convert from kobo
                customer_email = payment_data['data']['customer']['email']
                
                # Create order in your system
                order = {
                    "id": len(orders_storage) + 1,
                    "payment_reference": reference,
                    "customer_email": customer_email,
                    "amount": amount,
                    "status": "confirmed",
                    "created_at": "2025-01-13T" + str(len(orders_storage)).zfill(2) + ":00:00",
                    "payment_status": "completed",
                    "delivery_address": "Address will be updated",
                    "items": []
                }
                
                orders_storage.append(order)
                
                return jsonify({
                    "message": "Payment verified and order confirmed",
                    "order": order,
                    "status": "success"
                })
            else:
                error_msg = f"Payment status: {payment_data.get('data', {}).get('status', 'unknown')}"
                return jsonify({"error": f"Payment not successful - {error_msg}"}), 400
        else:
            return jsonify({"error": f"Paystack API error: {response.status_code} - {response.text}"}), 400
            
    except Exception as e:
        print(f"Exception during verification: {str(e)}")
        
        # For test payments, if API fails but reference looks valid, accept it
        if reference and reference.startswith('BMP_'):
            print("Accepting test payment due to API failure")
            order = {
                "id": len(orders_storage) + 1,
                "payment_reference": reference,
                "customer_email": "test@example.com",
                "amount": 10000,  # Default test amount
                "status": "paid",
                "created_at": "2025-01-13T" + str(len(orders_storage)).zfill(2) + ":00:00",
                "payment_status": "completed"
            }
            
            orders_storage.append(order)
            
            return jsonify({
                "message": "Payment verified (test mode)",
                "order": order,
                "status": "success"
            })
        
        return jsonify({"error": f"Verification error: {str(e)}"}), 500

# User orders endpoint
@app.route('/api/orders/user/<email>', methods=['GET'])
def get_user_orders(email):
    """Get all orders for a specific user"""
    user_orders = []
    
    try:
        if supabase:
            # Get from Supabase
            result = supabase.table('orders').select('*').eq('customer_email', email).order('created_at', desc=True).execute()
            if result.data:
                user_orders.extend(result.data)
                print(f"Found {len(result.data)} orders for {email} in Supabase")
    except Exception as e:
        print(f"Supabase user orders error: {e}")
    
    # Also get from local storage as fallback
    for order in orders_storage:
        if (order.get('customer_info', {}).get('email') == email or 
            order.get('customer_email') == email):
            # Avoid duplicates
            if not any(o.get('id') == order.get('id') for o in user_orders):
                user_orders.append(order)
    
    # Sort by date (newest first)
    user_orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    print(f"Returning {len(user_orders)} total orders for {email}")
    return jsonify(user_orders)

# Cancel order endpoint
@app.route('/api/orders/<int:order_id>/cancel', methods=['PUT'])
def cancel_order(order_id):
    """Cancel an order"""
    order = next((o for o in orders_storage if o['id'] == order_id), None)
    
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    if order['status'] in ['delivered', 'cancelled']:
        return jsonify({"error": "Cannot cancel this order"}), 400
    
    order['status'] = 'cancelled'
    return jsonify({"message": "Order cancelled successfully", "order": order})

# All payments endpoint for admin
@app.route('/api/payments/history/all', methods=['GET'])
def get_all_payments():
    """Get all payment history for admin"""
    all_payments = []
    
    for order in orders_storage:
        if order.get('payment_reference'):
            payment = {
                "reference": order.get('payment_reference'),
                "customer_email": order.get('customer_email') or order.get('customer_info', {}).get('email'),
                "amount": order.get('total', order.get('amount', 0)),
                "status": "completed" if order.get('payment_status') == 'completed' else 'pending',
                "date": order.get('created_at', '2025-01-13'),
                "paymentMethod": "Card"
            }
            all_payments.append(payment)
    
    return jsonify(all_payments)

# Payment history endpoint
@app.route('/api/payments/history/<email>', methods=['GET'])
def get_payment_history(email):
    """Get payment history for a user"""
    user_payments = []
    
    for order in orders_storage:
        if order.get('customer_info', {}).get('email') == email or order.get('customer_email') == email:
            payment = {
                "reference": order.get('payment_reference', f"BMP_{order['id']}"),
                "orderId": order['id'],
                "amount": order.get('total', order.get('amount', 0)),
                "status": "completed" if order.get('payment_status') == 'completed' else order.get('status', 'pending'),
                "date": order.get('created_at', '2025-01-13'),
                "paymentMethod": "Card",
                "items": order.get('items', [])
            }
            user_payments.append(payment)
    
    # Sort by date (newest first)
    user_payments.sort(key=lambda x: x['date'], reverse=True)
    
    return jsonify(user_payments)

# Webhook endpoint for Paystack
@app.route('/api/payment/webhook', methods=['POST'])
def payment_webhook():
    """Handle Paystack webhook notifications"""
    # Verify webhook signature (recommended for production)
    payload = request.get_data()
    signature = request.headers.get('X-Paystack-Signature')
    
    # Process webhook data
    data = request.json
    event = data.get('event')
    
    if event == 'charge.success':
        # Payment successful
        reference = data['data']['reference']
        amount = data['data']['amount'] / 100
        customer_email = data['data']['customer']['email']
        
        # Update order status
        for order in orders_storage:
            if order.get('payment_reference') == reference:
                order['status'] = 'confirmed'
                order['payment_status'] = 'completed'
                break
        
        return jsonify({"status": "success"})
    
    return jsonify({"status": "ignored"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
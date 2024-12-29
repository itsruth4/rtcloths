// Product data
const products = {
    tshirts: [
        {
            id: 't1',
            name: 'Classic White T-Shirt',
            price: 599,
            image: 'images/tshirts/t1.jpg',
            colors: ['white', 'gray']

        },
        {
            id: 't2',
            name: 'Premium Black Graphic T-Shirt',
            price: 799,
            image: 'images/tshirts/t2.PNG',
            colors: ['black']
        }
        ,
        {
            id: 't3',
            name: 'Premium Black Meme Tshirt',
            price: 799,
            image: 'images/tshirts/t3.jpg',
            colors: ['black']
        }
    ],
    hoodies: [
        {
            id: 'h1',
            name: 'Premium Black Hoodie',
            price: 1299,
            image: 'images/hoodies/h1.jpg',
            colors: ['black', 'gray']
        }
    ]
};

// Make sure DOM is loaded before displaying products
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    updateCartCount();
});

// Display products
function displayProducts() {
    displayProductType('tshirt', products.tshirts);
    displayProductType('hoodie', products.hoodies);
}

// Display specific product type
function displayProductType(type, items) {
    const grid = document.getElementById(`${type}Grid`);
    if (!grid) return;

    grid.innerHTML = items.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" onclick="openImageModal('${product.image}', '${product.name}')">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">Rs. ${product.price.toLocaleString('en-NP')}</p>
                <div class="color-options">
                    ${product.colors.map(color => `
                        <div class="color-option${product.colors.length === 1 ? ' selected' : ''}" 
                             style="background-color: ${color};"
                             data-color="${color}"
                             onclick="selectColor(this)">
                        </div>
                    `).join('')}
                </div>
                <button class="add-to-cart-btn" onclick="handleAddToCart('${product.id}', this)">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Select color
function selectColor(element) {
    const colorOptions = element.parentElement.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('selected'));
    element.classList.add('selected');
}

// Handle add to cart
function handleAddToCart(productId, button) {
    const productCard = button.closest('.product-card');
    const selectedColor = productCard.querySelector('.color-option.selected');
    
    if (!selectedColor) {
        alert('Please select a color');
        return;
    }
    
    addToCart(productId, selectedColor.dataset.color);
}

// Initialize cart
let cart = [];

// Load cart from localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Add to cart
function addToCart(productId, color) {
    const product = products.tshirts.find(p => p.id === productId) || products.hoodies.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId && item.color === color);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                color: color,
                quantity: 1
            });
        }
        saveCartToLocalStorage();
        updateCartCount();
        showCartNotification();
    }
}

// Update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Show cart notification
function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = 'Item added to cart!';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }, 100);
}

// Display cart items on cart page
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartSubtotal.textContent = 'Rs. 0';
        cartTotal.textContent = 'Rs. 0';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Color: <span style="display: inline-block; width: 12px; height: 12px; background-color: ${item.color}; border: 1px solid #ddd; border-radius: 50%;"></span></p>
                <p>Price: Rs. ${item.price.toLocaleString('en-NP')}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', '${item.color}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', '${item.color}', 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}', '${item.color}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    const subtotal = calculateSubtotal();
    const shipping = 100; // Fixed shipping cost
    const total = subtotal + shipping;

    cartSubtotal.textContent = `Rs. ${subtotal.toLocaleString('en-NP')}`;
    cartTotal.textContent = `Rs. ${total.toLocaleString('en-NP')}`;
}

// Initialize cart page
function initCartPage() {
    displayCartItems();

    const proceedToCheckout = document.getElementById('proceedToCheckout');
    proceedToCheckout.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
}

// Check if on cart page
if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', initCartPage);
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartSubtotal.textContent = 'Rs. 0';
        cartTotal.textContent = 'Rs. 0';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Color: <span style="display: inline-block; width: 12px; height: 12px; background-color: ${item.color}; border: 1px solid #ddd; border-radius: 50%;"></span></p>
                <p>Price: Rs. ${item.price.toLocaleString('en-NP')}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', '${item.color}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', '${item.color}', 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}', '${item.color}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    const subtotal = calculateSubtotal();
    const shipping = 100; // Fixed shipping cost
    const total = subtotal + shipping;

    cartSubtotal.textContent = `Rs. ${subtotal.toLocaleString('en-NP')}`;
    cartTotal.textContent = `Rs. ${total.toLocaleString('en-NP')}`;
}

// Calculate subtotal
function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Update quantity
function updateQuantity(productId, color, change) {
    const item = cart.find(item => item.id === productId && item.color === color);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0) {
            item.quantity = newQuantity;
        } else {
            removeFromCart(productId, color);
            return;
        }
        saveCartToLocalStorage();
        updateCartDisplay();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(productId, color) {
    cart = cart.filter(item => !(item.id === productId && item.color === color));
    saveCartToLocalStorage();
    updateCartDisplay();
    updateCartCount();
    
    if (cart.length === 0) {
        document.getElementById('cartModal').classList.remove('active');
    }
}

// Setup cart and checkout functionality
function setupCartAndCheckout() {
    const cartLink = document.querySelector('.cart-menu-item');
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const proceedToCheckout = document.getElementById('proceedToCheckout');
    const shippingForm = document.getElementById('shippingForm');
    const backToShipping = document.getElementById('backToShipping');
    const placeOrder = document.getElementById('placeOrder');
    const continueShopping = document.getElementById('continueShopping');

    // Cart modal
    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        cartModal.classList.add('active');
        updateCartDisplay();
    });

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            cartModal.classList.remove('active');
            checkoutModal.classList.remove('active');
        });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
    });

    // Proceed to checkout
    proceedToCheckout.addEventListener('click', () => {
        cartModal.classList.remove('active');
        checkoutModal.classList.add('active');
        document.getElementById('paymentSection').style.display = 'none';
        document.getElementById('orderConfirmation').style.display = 'none';
        document.getElementById('shippingForm').style.display = 'block';
    });

    // Handle shipping form
    shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        shippingForm.style.display = 'none';
        document.getElementById('paymentSection').style.display = 'block';
    });

    // Handle payment method selection
    const paymentMethods = document.getElementsByName('payment');
    paymentMethods.forEach(method => {
        method.addEventListener('change', () => {
            document.querySelectorAll('.payment-detail-section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(`${method.value}Details`).style.display = 'block';
        });
    });

    // Back to shipping
    backToShipping.addEventListener('click', () => {
        document.getElementById('paymentSection').style.display = 'none';
        shippingForm.style.display = 'block';
    });

    // Place order
    placeOrder.addEventListener('click', () => {
        const orderId = 'ORD' + Date.now().toString(36).toUpperCase();
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);

        document.getElementById('orderId').textContent = orderId;
        document.getElementById('deliveryDate').textContent = deliveryDate.toLocaleDateString();

        document.getElementById('paymentSection').style.display = 'none';
        document.getElementById('orderConfirmation').style.display = 'block';

        // Save order
        const order = {
            id: orderId,
            items: [...cart],
            shipping: {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value
            },
            payment: document.querySelector('input[name="payment"]:checked').value,
            total: calculateSubtotal() + 100,
            status: 'pending',
            orderDate: new Date().toISOString(),
            deliveryDate: deliveryDate.toISOString()
        };

        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart
        cart = [];
        saveCartToLocalStorage();
        updateCartCount();
    });

    // Continue shopping
    continueShopping.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
        shippingForm.reset();
        document.getElementById('orderConfirmation').style.display = 'none';
        shippingForm.style.display = 'block';
    });
}

// Setup cart navigation
document.addEventListener('DOMContentLoaded', () => {
    const cartLink = document.querySelector('.cart-menu-item');
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'cart.html';
        });
    }
    
    loadCartFromLocalStorage();
    updateCartDisplay();
});

// Image Modal Functions
function openImageModal(imageSrc, productName) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('modalCaption');
    const closeBtn = document.querySelector('.close-modal');
    
    // Load image
    modalImg.src = imageSrc;
    modalImg.onload = function() {
        // Show modal after image is loaded
        modal.style.display = "block";
        captionText.innerHTML = productName;
        document.body.style.overflow = 'hidden';
    };

    // Close modal when clicking close button
    closeBtn.onclick = closeImageModal;

    // Close when clicking outside the image
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    };

    // Prevent image click from closing modal
    modalImg.onclick = function(e) {
        e.stopPropagation();
    };
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = "none";
    document.body.style.overflow = 'auto';
}

// Close modal with escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

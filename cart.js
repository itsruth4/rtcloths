// Initialize cart if not already initialized by script.js
if (typeof cart === 'undefined') {
    let cart = [];
}

// Load cart from localStorage if not already loaded
function initializeCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart && (!cart || cart.length === 0)) {
        cart = JSON.parse(savedCart);
    }
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    updateCartCount();
    displayCartItems();
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartSummaryElement = document.querySelector('.cart-summary');

    if (!cart || cart.length === 0) {
        if (cartItemsContainer) cartItemsContainer.style.display = 'none';
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartSummaryElement) cartSummaryElement.style.display = 'none';
        return;
    }

    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartItemsContainer) {
        cartItemsContainer.style.display = 'block';
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-color">
                        Color: <span class="color-dot" style="background-color: ${item.color};"></span>
                    </p>
                    <p class="cart-item-price">Rs. ${item.price.toLocaleString('en-NP')}</p>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button onclick="updateQuantity('${item.id}', '${item.color}', -1)" class="quantity-btn">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', '${item.color}', 1)" class="quantity-btn">+</button>
                        </div>
                        <button onclick="removeFromCart('${item.id}', '${item.color}')" class="remove-btn">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    if (cartSummaryElement) cartSummaryElement.style.display = 'block';
    updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 100; // Fixed shipping cost
    const total = subtotal + shipping;

    const subtotalElement = document.getElementById('cartSubtotal');
    const totalElement = document.getElementById('cartTotal');

    if (subtotalElement) subtotalElement.textContent = `Rs. ${subtotal.toLocaleString('en-NP')}`;
    if (totalElement) totalElement.textContent = `Rs. ${total.toLocaleString('en-NP')}`;
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
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(productId, color) {
    cart = cart.filter(item => !(item.id === productId && item.color === color));
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
    
    if (cart.length === 0) {
        displayCartItems();
    }
}

// Proceed to checkout
const checkoutButton = document.getElementById('proceedToCheckout');
if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        if (!cart || cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        window.location.href = 'checkout.html';
    });
}

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
});

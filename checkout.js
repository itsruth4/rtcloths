// Checkout state management
let checkoutState = {
    currentStep: 'shipping',
    shippingInfo: null,
    shippingMethod: 'standard',
    paymentMethod: 'cod',
    promoCode: null,
    orderTotal: 0,
    orderId: null
};

// Promo codes
const promoCodes = {
    'WELCOME10': { type: 'percentage', value: 10, description: '10% off total' },
    'FREESHIP': { type: 'shipping', value: 'free', description: 'Free shipping' },
    'SAVE500': { type: 'fixed', value: 500, description: 'Rs. 500 off' }
};

// Shipping rates
const shippingRates = {
    standard: 100,
    express: 250,
    pickup: 0
};

// Initialize checkout
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateOrderSummary();
    setupEventListeners();
});

// Load cart and calculate initial totals
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        checkoutState.cart = JSON.parse(savedCart);
        updateCartCount();
    } else {
        window.location.href = 'cart.html';
    }
}

// Setup event listeners
function setupEventListeners() {
    setupFormListeners();
    setupOTPInputs();
    setupPromoCode();
    setupShippingMethod();
    setupTrackingModal();
}

// Form event listeners
function setupFormListeners() {
    // Shipping Form
    document.getElementById('shippingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        checkoutState.shippingInfo = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        };
        moveToStep('verification');
        simulateOTPSend();
    });

    // Verification Form
    document.getElementById('verificationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredOTP = Array.from(document.querySelectorAll('.otp-input'))
            .map(input => input.value)
            .join('');
        if (enteredOTP === '1234') { // Demo OTP
            moveToStep('payment');
        } else {
            alert('Invalid OTP. Please try again.');
        }
    });

    // Payment Form
    document.getElementById('paymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        processOrder();
    });

    // Back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => {
            const currentForm = button.closest('.checkout-form');
            const currentStep = currentForm.id.replace('Form', '');
            const previousStep = getPreviousStep(currentStep);
            moveToStep(previousStep);
        });
    });
}

// OTP input handling
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            } else if (e.key === 'Backspace') {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });

    document.querySelector('.resend-otp').addEventListener('click', () => {
        simulateOTPSend();
    });
}

// Promo code handling
function setupPromoCode() {
    document.querySelector('.apply-promo').addEventListener('click', () => {
        const promoInput = document.getElementById('promoCode');
        const promoCode = promoInput.value.toUpperCase();
        
        if (promoCodes[promoCode]) {
            checkoutState.promoCode = promoCode;
            alert(`Promo code "${promoCode}" applied: ${promoCodes[promoCode].description}`);
            updateOrderSummary();
        } else {
            alert('Invalid promo code');
        }
    });
}

// Shipping method handling
function setupShippingMethod() {
    document.querySelectorAll('input[name="shipping"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            checkoutState.shippingMethod = e.target.value;
            updateOrderSummary();
        });
    });
}

// Update order summary
function updateOrderSummary() {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const discount = calculateDiscount(subtotal);
    const total = subtotal + shipping - discount;

    document.getElementById('checkoutSubtotal').textContent = `Rs. ${subtotal.toLocaleString('en-NP')}`;
    document.getElementById('checkoutShipping').textContent = `Rs. ${shipping.toLocaleString('en-NP')}`;
    
    const discountElement = document.querySelector('.summary-row.discount');
    if (discount > 0) {
        document.getElementById('checkoutDiscount').textContent = `-Rs. ${discount.toLocaleString('en-NP')}`;
        discountElement.style.display = 'flex';
    } else {
        discountElement.style.display = 'none';
    }
    
    document.getElementById('checkoutTotal').textContent = `Rs. ${total.toLocaleString('en-NP')}`;
    checkoutState.orderTotal = total;
}

// Calculate subtotal
function calculateSubtotal() {
    return checkoutState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Calculate shipping cost
function calculateShipping() {
    if (checkoutState.promoCode === 'FREESHIP') return 0;
    return shippingRates[checkoutState.shippingMethod];
}

// Calculate discount
function calculateDiscount(subtotal) {
    if (!checkoutState.promoCode) return 0;
    
    const promo = promoCodes[checkoutState.promoCode];
    if (promo.type === 'percentage') {
        return Math.round(subtotal * (promo.value / 100));
    } else if (promo.type === 'fixed') {
        return promo.value;
    }
    return 0;
}

// Process order
function processOrder() {
    checkoutState.orderId = generateOrderId();
    checkoutState.orderDate = new Date();
    
    // Save order to localStorage
    const order = {
        ...checkoutState,
        status: 'placed',
        statusTimeline: [
            {
                status: 'placed',
                time: new Date().toISOString()
            }
        ]
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Show confirmation
    showOrderConfirmation(order);
}

// Generate order ID
function generateOrderId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `RT${timestamp}${randomStr}`.toUpperCase();
}

// Show order confirmation
function showOrderConfirmation(order) {
    document.getElementById('orderId').textContent = order.orderId;
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (order.shippingMethod === 'express' ? 2 : 5));
    document.getElementById('estimatedDelivery').textContent = deliveryDate.toLocaleDateString('en-NP');
    
    moveToStep('confirmation');
    simulateOrderEmail(order);
}

// Simulate OTP send
function simulateOTPSend() {
    alert('Demo OTP: 1234\nIn a real application, this would be sent to your phone.');
}

// Simulate order confirmation email
function simulateOrderEmail(order) {
    console.log(`Order confirmation email would be sent to ${order.shippingInfo.email}`);
}

// Setup tracking modal
function setupTrackingModal() {
    const modal = document.getElementById('trackingModal');
    const closeBtn = modal.querySelector('.close');
    const trackOrderBtns = document.querySelectorAll('.track-order-btn');
    
    trackOrderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    modal.querySelector('.track-btn').addEventListener('click', () => {
        const orderId = document.getElementById('trackingOrderId').value;
        trackOrder(orderId);
    });
}

// Track order
function trackOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        showTrackingStatus(order);
    } else {
        alert('Order not found');
    }
}

// Show tracking status
function showTrackingStatus(order) {
    const statusTimeline = document.querySelector('.tracking-status');
    statusTimeline.style.display = 'block';
    
    // Update status steps based on order status
    const steps = statusTimeline.querySelectorAll('.status-step');
    let currentStep = 0;
    
    switch (order.status) {
        case 'delivered':
            currentStep = 4;
            break;
        case 'shipped':
            currentStep = 3;
            break;
        case 'processing':
            currentStep = 2;
            break;
        case 'placed':
            currentStep = 1;
            break;
    }
    
    steps.forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('completed');
        } else {
            step.classList.remove('completed');
        }
    });
}

// Navigation helpers
function moveToStep(step) {
    // Update progress indicator
    document.querySelectorAll('.progress-step').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.step === step) {
            el.classList.add('active');
        }
    });
    
    // Show appropriate form
    document.querySelectorAll('.checkout-form').forEach(form => {
        form.classList.remove('active');
    });
    
    const targetForm = step === 'confirmation' 
        ? document.getElementById('confirmationSection')
        : document.getElementById(`${step}Form`);
    targetForm.classList.add('active');
    
    checkoutState.currentStep = step;
}

function getPreviousStep(currentStep) {
    const steps = ['shipping', 'verification', 'payment'];
    const currentIndex = steps.indexOf(currentStep);
    return steps[currentIndex - 1];
}

// Update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount && checkoutState.cart) {
        const totalItems = checkoutState.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ============================================================
// ====== APPLICATION STATE ======
// ============================================================
const AppState = {
    products: [],
    cart: [],        // [{ productId: 1, quantity: 2 }, ...]
    user: {
        name: "",
        email: "",
        phone: ""
    },
    cartOpen: false,
    summaryOpen: false
};

// ============================================================
// ====== PRODUCT DATA ======
// ============================================================
const PRODUCTS = [
    {
        id: 1,
        name: "Samsung TV",
        price: 3500,  // GH₵ 3,500 (reduced for Ghana market)
        image: "assets/images/samsung-tv.png",
        category: "Electronics",
        description: "55-inch 4K Smart TV with AI upscaling"
    },
    {
        id: 2,
        name: "MacBook Air",
        price: 12000, // GH₵ 12,000
        image: "assets/images/macbook-air.png",
        category: "Laptops",
        description: "Apple M1 chip, 8GB RAM, 256GB SSD"
    },
    {
        id: 3,
        name: "AirPods Pro",
        price: 2800,  // GH₵ 2,800
        image: "assets/images/airpods-pro.png",
        category: "Audio",
        description: "Active Noise Cancellation, Transparency mode"
    },
    {
        id: 4,
        name: "PS5",
        price: 9500,  // GH₵ 9,500
        image: "assets/images/ps5.png",
        category: "Gaming",
        description: "PlayStation 5 Console with DualSense controller"
    },
    {
        id: 5,
        name: "Apple Watch",
        price: 5500,  // GH₵ 5,500
        image: "assets/images/apple-watch-series-7.png",
        category: "Wearables",
        description: "Series 7 with GPS, always-on display"
    },
    {
        id: 6,
        name: "Pixel 4a",
        price: 3800,  // GH₵ 3,800
        image: "assets/images/pixel-4a.png",
        category: "Phones",
        description: "Google Pixel 4a 5G, Android 12"
    }
];

// ============================================================
// ====== DOM REFERENCES ======
// ============================================================
const DOM = {
    productGrid: document.getElementById('productGrid'),
    cartButton: document.getElementById('cartButton'),
    cartCount: document.getElementById('cartCount'),
    cartModal: document.getElementById('cartModal'),
    closeCartBtn: document.getElementById('closeCartBtn'),
    cartItems: document.getElementById('cartItems'),
    continueShoppingBtn: document.getElementById('continueShoppingBtn'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    totalAmount: document.getElementById('totalAmount'),
    
    // User form
    userName: document.getElementById('userName'),
    userEmail: document.getElementById('userEmail'),
    userPhone: document.getElementById('userPhone'),
    nameError: document.getElementById('nameError'),
    emailError: document.getElementById('emailError'),
    phoneError: document.getElementById('phoneError'),
    
    // Summary modal
    summaryModal: document.getElementById('summaryModal'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    orderSummary: document.getElementById('orderSummary'),
    okBtn: document.getElementById('okBtn'),
    successMessage: document.getElementById('successMessage')
};

// ============================================================
// ====== UTILITY FUNCTIONS (Updated for GHS) ======
// ============================================================

/**
 * Format price for display with Ghana Cedis
 * Shows: GH₵ 3,500.00
 */
function formatPrice(price) {
    return 'GH₵ ' + price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format price for Paystack (pesewas = GHS × 100)
 * Paystack requires amount in the smallest currency unit
 * For GHS: 1 GHS = 100 pesewas
 */
function formatPriceForPaystack(price) {
    return Math.round(price * 100);
}

/**
 * Generate unique transaction reference with GHS prefix
 */
function generateReference() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `EMS-GHS-${timestamp}-${random}`.toUpperCase();
}

/**
 * Find product by ID
 */
function findProduct(productId) {
    return AppState.products.find(p => p.id === productId);
}

/**
 * Find cart item by product ID
 */
function findCartItem(productId) {
    return AppState.cart.find(item => item.productId === productId);
}

/**
 * Check if product is in cart
 */
function isProductInCart(productId) {
    return AppState.cart.some(item => item.productId === productId);
}

// ============================================================
// ====== PERSISTENCE (localStorage) ======
// ============================================================

function saveState() {
    try {
        localStorage.setItem('ems_cart', JSON.stringify(AppState.cart));
        localStorage.setItem('ems_user', JSON.stringify(AppState.user));
    } catch (error) {
        console.warn('Could not save state to localStorage:', error);
    }
}

function loadState() {
    try {
        const savedCart = localStorage.getItem('ems_cart');
        const savedUser = localStorage.getItem('ems_user');
        
        if (savedCart) {
            AppState.cart = JSON.parse(savedCart);
        }
        if (savedUser) {
            AppState.user = JSON.parse(savedUser);
            // Populate form fields
            DOM.userName.value = AppState.user.name || '';
            DOM.userEmail.value = AppState.user.email || '';
            DOM.userPhone.value = AppState.user.phone || '';
        }
    } catch (error) {
        console.warn('Could not load state from localStorage:', error);
    }
}

// ============================================================
// ====== PRODUCT RENDERING ======
// ============================================================

/**
 * Creates a single product card HTML
 */
function createProductCard(product) {
    const inCart = isProductInCart(product.id);
    const buttonText = inCart ? 'Remove from Cart' : 'Add to Cart';
    const buttonClass = inCart ? 'add-to-cart-btn in-cart' : 'add-to-cart-btn';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <img 
                src="${product.image}" 
                alt="${product.name}" 
                class="product-image"
                loading="lazy"
            >
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-category">${product.category}</span>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-actions">
                    <button 
                        class="${buttonClass}" 
                        data-product-id="${product.id}"
                    >
                        ${buttonText}
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders all products to the grid
 */
function renderProducts() {
    if (!DOM.productGrid) return;
    
    if (AppState.products.length === 0) {
        DOM.productGrid.innerHTML = '<p>No products available.</p>';
        return;
    }
    
    DOM.productGrid.innerHTML = AppState.products
        .map(product => createProductCard(product))
        .join('');
}

/**
 * Updates all product buttons based on cart state
 */
function updateProductButtons() {
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(button => {
        const productId = parseInt(button.dataset.productId);
        const inCart = isProductInCart(productId);
        
        button.textContent = inCart ? 'Remove from Cart' : 'Add to Cart';
        button.classList.toggle('in-cart', inCart);
    });
}

// ============================================================
// ====== CART OPERATIONS ======
// ============================================================

/**
 * Adds a product to the cart
 */
function addToCart(productId) {
    const existingItem = findCartItem(productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        AppState.cart.push({
            productId: productId,
            quantity: 1
        });
    }
    
    saveState();
    updateUI();
}

/**
 * Removes a product from the cart
 */
function removeFromCart(productId) {
    const index = AppState.cart.findIndex(item => item.productId === productId);
    if (index !== -1) {
        AppState.cart.splice(index, 1);
        saveState();
        updateUI();
    }
}

/**
 * Updates quantity of a cart item
 */
function updateQuantity(productId, change) {
    const item = findCartItem(productId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
    } else {
        item.quantity = newQuantity;
        saveState();
        updateUI();
    }
}

/**
 * Gets total number of unique items in cart
 */
function getCartItemCount() {
    return AppState.cart.length;
}

/**
 * Calculates total price of all items in cart
 */
function calculateTotal() {
    let total = 0;
    AppState.cart.forEach(item => {
        const product = findProduct(item.productId);
        if (product) {
            total += product.price * item.quantity;
        }
    });
    return total;
}

// ============================================================
// ====== UI UPDATES ======
// ============================================================

/**
 * Updates the cart counter badge
 */
function updateCartCounter() {
    const count = getCartItemCount();
    DOM.cartCount.textContent = count;
    DOM.cartCount.classList.toggle('hidden', count === 0);
}

/**
 * Renders cart items in the modal
 */
function renderCartItems() {
    if (!DOM.cartItems) return;
    
    if (AppState.cart.length === 0) {
        DOM.cartItems.innerHTML = `
            <div class="empty-cart-message">
                🛒 Your cart is empty.<br>
                Start adding some gadgets!
            </div>
        `;
        DOM.checkoutBtn.disabled = true;
        return;
    }
    
    DOM.checkoutBtn.disabled = false;
    
    let html = '';
    AppState.cart.forEach(item => {
        const product = findProduct(item.productId);
        if (!product) return;
        
        html += `
            <div class="cart-item" data-cart-item="${item.productId}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">
                        ${formatPrice(product.price)} each
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button 
                        class="quantity-btn" 
                        data-action="decrease" 
                        data-product-id="${item.productId}"
                    >−</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button 
                        class="quantity-btn" 
                        data-action="increase" 
                        data-product-id="${item.productId}"
                    >+</button>
                    <button 
                        class="remove-item-btn" 
                        data-action="remove" 
                        data-product-id="${item.productId}"
                        aria-label="Remove item"
                    >✕</button>
                </div>
            </div>
        `;
    });
    
    DOM.cartItems.innerHTML = html;
}

/**
 * Updates the total amount display
 */
function updateTotalDisplay() {
    const total = calculateTotal();
    DOM.totalAmount.textContent = formatPrice(total);
}

/**
 * Updates all UI elements
 */
function updateUI() {
    updateCartCounter();
    updateProductButtons();
    renderCartItems();
    updateTotalDisplay();
}

// ============================================================
// ====== MODAL FUNCTIONS ======
// ============================================================

/**
 * Opens the cart modal
 */
function openCartModal() {
    AppState.cartOpen = true;
    DOM.cartModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    renderCartItems();
    updateTotalDisplay();
}

/**
 * Closes the cart modal
 */
function closeCartModal() {
    AppState.cartOpen = false;
    DOM.cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Opens the summary modal
 */
function showSummaryModal() {
    AppState.summaryOpen = true;
    DOM.summaryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set user name in success message
    DOM.userNameDisplay.textContent = AppState.user.name;
    
    // Render order summary
    let html = '';
    AppState.cart.forEach(item => {
        const product = findProduct(item.productId);
        if (product) {
            html += `
                <div class="summary-item">
                    <span class="summary-item-name">${product.name}</span>
                    <span class="summary-item-quantity">× ${item.quantity}</span>
                </div>
            `;
        }
    });
    DOM.orderSummary.innerHTML = html;
}

/**
 * Closes the summary modal
 */
function closeSummaryModal() {
    AppState.summaryOpen = false;
    DOM.summaryModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================================
// ====== FORM VALIDATION ======
// ============================================================

/**
 * Validates a single form field
 */
function validateField(fieldName) {
    let input, errorElement, value, isValid = true;
    
    switch(fieldName) {
        case 'userName':
            input = DOM.userName;
            errorElement = DOM.nameError;
            value = input.value.trim();
            
            if (!value) {
                errorElement.textContent = 'Name is required';
                input.classList.add('error');
                input.classList.remove('success');
                isValid = false;
            } else if (value.length < 2) {
                errorElement.textContent = 'Name must be at least 2 characters';
                input.classList.add('error');
                input.classList.remove('success');
                isValid = false;
            } else {
                errorElement.textContent = '';
                input.classList.remove('error');
                input.classList.add('success');
                AppState.user.name = value;
            }
            break;
            
        case 'userEmail':
            input = DOM.userEmail;
            errorElement = DOM.emailError;
            value = input.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!value) {
                errorElement.textContent = 'Email is required';
                input.classList.add('error');
                input.classList.remove('success');
                isValid = false;
            } else if (!emailRegex.test(value)) {
                errorElement.textContent = 'Please enter a valid email address';
                input.classList.add('error');
                input.classList.remove('success');
                isValid = false;
            } else {
                errorElement.textContent = '';
                input.classList.remove('error');
                input.classList.add('success');
                AppState.user.email = value;
            }
            break;
            
        case 'userPhone':
            input = DOM.userPhone;
            errorElement = DOM.phoneError;
            value = input.value.trim().replace(/[\s-]/g, '');
            // Local (0241234567) or international (+233241234567) Ghana format
            const phoneRegex = /^(0[0-9]{9}|\+233[0-9]{9})$/;
            
            if (!value) {
                errorElement.textContent = 'Phone number is required';
                input.classList.add('error');
                input.classList.remove('success');
                isValid = false;
            } else if (!phoneRegex.test(value)) {
                errorElement.textContent = 'Enter a valid Ghana number, e.g. 0241234567 or +233241234567';
                input.classList.add('error');
                input.classList.remove('success');
                isValid = false;
            } else {
                errorElement.textContent = '';
                input.classList.remove('error');
                input.classList.add('success');
                AppState.user.phone = value;
            }
            break;
    }
    
    return isValid;
}

/**
 * Validates all form fields
 */
function validateAllFields() {
    const isNameValid = validateField('userName');
    const isEmailValid = validateField('userEmail');
    const isPhoneValid = validateField('userPhone');
    
    return isNameValid && isEmailValid && isPhoneValid;
}

/**
 * Sets up form validation event listeners
 */
function setupValidation() {
    const fields = ['userName', 'userEmail', 'userPhone'];
    
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (!input) return;
        
        // Validate on blur
        input.addEventListener('blur', function() {
            validateField(field);
        });
        
        // Real-time feedback while typing
        input.addEventListener('input', function() {
            // Clear error state while typing
            this.classList.remove('error');
            this.classList.remove('success');
            const errorElement = {
                userName: DOM.nameError,
                userEmail: DOM.emailError,
                userPhone: DOM.phoneError
            }[field];
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    });
}

// ============================================================
// ====== PAYSTACK INTEGRATION (Updated for GHS) ======
// ============================================================

/**
 * Initiates Paystack payment with GHS currency
 */
function initiatePayment() {
    // Validate all fields
    if (!validateAllFields()) {
        const firstError = document.querySelector('.form-group input.error');
        if (firstError) {
            firstError.focus();
        }
        return;
    }
    
    // Check if cart has items
    if (AppState.cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }
    
    // Calculate total in GHS
    const totalGHS = calculateTotal();
    
    // Convert to pesewas (1 GHS = 100 pesewas)
    const totalPesewas = formatPriceForPaystack(totalGHS);
    
    // Generate unique reference
    const reference = generateReference();
    
    console.log('💰 Payment Details:');
    console.log('Total GHS:', totalGHS);
    console.log('Total Pesewas:', totalPesewas);
    console.log('Reference:', reference);
    
    // Paystack options with GHS
    const options = {
        key: 'pk_test_a07214fa1e807ba054b053610d17bf9a0b13ccc7', // Replace with your Paystack test key
        email: AppState.user.email,
        amount: totalPesewas,
        currency: 'GHS', // IMPORTANT: Set currency to GHS
        ref: reference,
        callback: handlePaymentSuccess,
        onClose: handlePaymentClose,
        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: AppState.user.name
                },
                {
                    display_name: "Phone Number",
                    variable_name: "customer_phone",
                    value: AppState.user.phone
                }
            ]
        }
    };
    
    // Close cart modal
    closeCartModal();
    
    // Open Paystack modal
    try {
        const handler = PaystackPop.setup(options);
        handler.openIframe();
    } catch (error) {
        console.error('Paystack initialization error:', error);
        alert('There was an error initializing payment. Please try again.');
    }
}

/**
 * Handles successful Paystack payment
 */
function handlePaymentSuccess(response) {
    console.log('Payment successful:', response);
    
    // Show summary modal
    showSummaryModal();
    
    // Clear cart (after a short delay to ensure summary is rendered)
    setTimeout(() => {
        AppState.cart = [];
        AppState.user = {
            name: "",
            email: "",
            phone: ""
        };
        saveState();
        updateUI();
        
        // Clear form fields
        DOM.userName.value = '';
        DOM.userEmail.value = '';
        DOM.userPhone.value = '';
        DOM.userName.classList.remove('success');
        DOM.userEmail.classList.remove('success');
        DOM.userPhone.classList.remove('success');
    }, 100);
}

/**
 * Handles Paystack payment closure
 */
function handlePaymentClose() {
    console.log('Payment modal closed');
    // Reopen cart modal if user didn't complete payment
    // Only reopen if cart still has items
    if (AppState.cart.length > 0) {
        setTimeout(() => {
            openCartModal();
        }, 300);
    }
}

// ============================================================
// ====== APPLICATION RESET ======
// ============================================================

/**
 * Resets the application after successful order
 */
function resetApplication() {
    // Close summary modal
    closeSummaryModal();
    
    // Clear all data
    AppState.cart = [];
    AppState.user = {
        name: "",
        email: "",
        phone: ""
    };
    
    // Clear localStorage
    localStorage.removeItem('ems_cart');
    localStorage.removeItem('ems_user');
    
    // Reset form
    DOM.userName.value = '';
    DOM.userEmail.value = '';
    DOM.userPhone.value = '';
    DOM.userName.classList.remove('success');
    DOM.userEmail.classList.remove('success');
    DOM.userPhone.classList.remove('success');
    DOM.nameError.textContent = '';
    DOM.emailError.textContent = '';
    DOM.phoneError.textContent = '';
    
    // Update UI
    updateUI();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Optional: Show success message
    console.log('Application reset successfully');
}

// ============================================================
// ====== EVENT LISTENERS ======
// ============================================================

function setupEventListeners() {
    // Cart button - open modal
    DOM.cartButton.addEventListener('click', openCartModal);
    
    // Close cart button
    DOM.closeCartBtn.addEventListener('click', closeCartModal);
    
    // Continue shopping - close modal
    DOM.continueShoppingBtn.addEventListener('click', closeCartModal);
    
    // Checkout button
    DOM.checkoutBtn.addEventListener('click', initiatePayment);
    
    // OK button on summary
    DOM.okBtn.addEventListener('click', resetApplication);
    
    // Close modal on overlay click
    DOM.cartModal.addEventListener('click', function(e) {
        if (e.target === this) closeCartModal();
    });
    
    DOM.summaryModal.addEventListener('click', function(e) {
        if (e.target === this) closeSummaryModal();
    });
    
    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (AppState.summaryOpen) {
                closeSummaryModal();
            } else if (AppState.cartOpen) {
                closeCartModal();
            }
        }
    });
    
    // Event delegation for product buttons
    DOM.productGrid.addEventListener('click', function(e) {
        const button = e.target.closest('.add-to-cart-btn');
        if (!button) return;
        
        const productId = parseInt(button.dataset.productId);
        if (isNaN(productId)) return;
        
        if (isProductInCart(productId)) {
            removeFromCart(productId);
        } else {
            addToCart(productId);
        }
    });
    
    // Event delegation for cart item controls
    DOM.cartItems.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (!button) return;
        
        const productId = parseInt(button.dataset.productId);
        if (isNaN(productId)) return;
        
        const action = button.dataset.action;
        
        switch(action) {
            case 'increase':
                updateQuantity(productId, 1);
                break;
            case 'decrease':
                updateQuantity(productId, -1);
                break;
            case 'remove':
                removeFromCart(productId);
                break;
        }
    });
    
    // Prevent form submission
    DOM.userForm = document.getElementById('userForm');
    if (DOM.userForm) {
        DOM.userForm.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }
}

// ============================================================
// ====== INITIALIZATION ======
// ============================================================

/**
 * Main initialization function
 */
function initApp() {
    console.log('🚀 E-Millennial Store Initializing...');
    
    // 1. Load product data
    AppState.products = PRODUCTS;
    
    // 2. Load saved state from localStorage
    loadState();
    
    // 3. Render products
    renderProducts();
    
    // 4. Setup event listeners
    setupEventListeners();
    
    // 5. Setup form validation
    setupValidation();
    
    // 6. Update UI
    updateUI();
    
    console.log('✅ Application Ready!');
    console.log('📦 Products:', AppState.products.length);
    console.log('🛒 Cart Items:', AppState.cart.length);
}

// ============================================================
// ====== START APPLICATION ======
// ============================================================

// Run once: wait for the DOM if it is still loading, otherwise start now
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
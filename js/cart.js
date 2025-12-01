/**
 * Cart page functionality
 */

(function() {
    // Display user name if logged in
    (function() {
        const loginLink = document.getElementById('loginLink');
        const userName = document.getElementById('userName');
        
        if (loginLink && userName) {
            const userData = userManager.getUser();
            
            if (userData && userData.name) {
                userName.textContent = userData.name.toUpperCase();
                userName.style.display = 'inline-block';
                loginLink.style.display = 'none';
            } else {
                userName.style.display = 'none';
                loginLink.style.display = 'inline-block';
            }
        }
    })();

    // Initialize cart badge
    if (typeof cartManager !== 'undefined') {
        cartManager.updateCartBadge();
    }

    // Render cart items
    function renderCart() {
        const cart = cartManager.getCart();
        const cartContainer = document.getElementById('cartContainer');
        const emptyCart = document.getElementById('emptyCart');
        const cartItemsList = document.getElementById('cartItemsList');

        if (cart.length === 0) {
            if (cartContainer) cartContainer.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        if (cartContainer) cartContainer.style.display = 'block';
        if (emptyCart) emptyCart.style.display = 'none';

        // Render cart items
        if (cartItemsList) {
            cartItemsList.innerHTML = cart.map((item, index) => {
                const itemTotal = (item.price || 0) * (item.quantity || 1);
                return `
                    <div class="cart-item" data-product-id="${item.id}">
                        <div class="item-checkbox">
                            <input type="checkbox" id="item-${index}" checked class="item-select">
                        </div>
                        <div class="item-image">
                            <img src="${item.image?.url || ''}" alt="${item.image?.alt || item.title}">
                        </div>
                        <div class="item-info">
                            <h4>${item.title}</h4>
                            <p class="item-category">${item.title.toLowerCase().split(' ')[0]}</p>
                        </div>
                        <div class="item-quantity">
                            <div class="quantity-controls">
                                <button class="quantity-btn decrease" data-product-id="${item.id}">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity || 1}" min="1" data-product-id="${item.id}" readonly>
                                <button class="quantity-btn increase" data-product-id="${item.id}">+</button>
                            </div>
                        </div>
                        <div class="item-price">
                            <span class="price-value">$ ${itemTotal.toFixed(2)}</span>
                            <button class="remove-btn" data-product-id="${item.id}" aria-label="Remove item">×</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Update order summary
        updateOrderSummary(cart);

        // Attach event listeners
        attachEventListeners();

        // Update select all state
        updateSelectAllState();
    }

    // Update single item display without re-rendering
    function updateItemDisplay(productId) {
        const cart = cartManager.getCart();
        const item = cart.find(i => i.id === productId);
        
        if (!item) return;

        // Update quantity input
        const quantityInput = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
        if (quantityInput) {
            quantityInput.value = item.quantity || 1;
        }

        // Update price display
        const cartItem = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
        if (cartItem) {
            const priceValue = cartItem.querySelector('.price-value');
            if (priceValue) {
                const itemTotal = (item.price || 0) * (item.quantity || 1);
                priceValue.textContent = `$ ${itemTotal.toFixed(2)}`;
            }
        }
    }

    // Update order summary
    function updateOrderSummary(cart) {
        let subtotal = 0; // SUBTOTAL = originalPrice 合计
        let totalDiscounted = 0; // 实际支付金额 = price 合计
        let discount = 0;

        // Get checked items only
        const checkedItems = [];
        document.querySelectorAll('.item-select').forEach((checkbox, index) => {
            if (checkbox.checked && cart[index]) {
                checkedItems.push(cart[index]);
            }
        });

        checkedItems.forEach(item => {
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            const originalPrice = item.originalPrice || price;
            
            subtotal += originalPrice * quantity; // SUBTOTAL 使用原价
            totalDiscounted += price * quantity; // 实际支付金额
        });

        discount = subtotal - totalDiscounted; // 折扣 = 原价合计 - 实际支付金额
        const shipping = 0;
        const grandTotal = totalDiscounted + shipping; // 总计 = 实际支付金额 + 运费

        // Update DOM
        const subtotalEl = document.getElementById('subtotal');
        const discountEl = document.getElementById('discount');
        const shippingEl = document.getElementById('shipping');
        const grandTotalEl = document.getElementById('grandTotal');

        if (subtotalEl) subtotalEl.textContent = `$ ${subtotal.toFixed(2)}`;
        if (discountEl) discountEl.textContent = `$ ${discount.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `$ ${shipping.toFixed(2)}`;
        if (grandTotalEl) grandTotalEl.textContent = `$ ${grandTotal.toFixed(2)}`;
    }

        // Attach event listeners
        function attachEventListeners() {
            // Select all checkbox
            const selectAllCheckbox = document.getElementById('selectAll');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    const isChecked = e.target.checked;
                    document.querySelectorAll('.item-select').forEach(checkbox => {
                        checkbox.checked = isChecked;
                    });
                    updateOrderSummary(cartManager.getCart());
                });
            }

            // Individual item checkboxes
            document.querySelectorAll('.item-select').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    updateSelectAllState();
                    updateOrderSummary(cartManager.getCart());
                });
            });

            // Quantity controls - decrease
            document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.productId;
                    const cart = cartManager.getCart();
                    const item = cart.find(i => i.id === productId);
                    
                    if (item && item.quantity > 1) {
                        cartManager.updateQuantity(productId, item.quantity - 1);
                        updateItemDisplay(productId);
                        updateOrderSummary(cartManager.getCart());
                    }
                });
            });

            // Quantity controls - increase
            document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.productId;
                    const cart = cartManager.getCart();
                    const item = cart.find(i => i.id === productId);
                    
                    if (item) {
                        cartManager.updateQuantity(productId, item.quantity + 1);
                        updateItemDisplay(productId);
                        updateOrderSummary(cartManager.getCart());
                    }
                });
            });

            // Remove item buttons
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.productId;
                    if (confirm('Are you sure you want to remove this item from your cart?')) {
                        cartManager.removeFromCart(productId);
                        renderCart();
                    }
                });
            });

            // Checkout button - now it's a link, so no need for click handler
        }

        // Update select all checkbox state
        function updateSelectAllState() {
            const selectAllCheckbox = document.getElementById('selectAll');
            const itemCheckboxes = document.querySelectorAll('.item-select');
            
            if (selectAllCheckbox && itemCheckboxes.length > 0) {
                const allChecked = Array.from(itemCheckboxes).every(cb => cb.checked);
                const someChecked = Array.from(itemCheckboxes).some(cb => cb.checked);
                
                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = someChecked && !allChecked;
            }
        }

    // Initial render
    renderCart();
})();


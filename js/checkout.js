/**
 * Checkout page functionality
 */

(function() {
    'use strict';

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

    // Load order items from cart
    function loadOrderItems() {
        const cart = cartManager.getCart();
        const orderItemsList = document.getElementById('orderItemsList');
        
        if (!orderItemsList) return;

        if (cart.length === 0) {
            orderItemsList.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">Your cart is empty. Please add items to cart first.</p>';
            updateOrderSummary([]);
            return;
        }

        // Only show the first item's image
        const firstItem = cart[0];
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const grandTotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

        orderItemsList.innerHTML = `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${firstItem.image?.url || ''}" alt="${firstItem.image?.alt || firstItem.title}">
                </div>
                <div class="order-item-info">
                    <h4>${firstItem.title}</h4>
                    <p>${firstItem.title.toLowerCase().split(' ')[0]}</p>
                    <div class="order-item-price">$ ${grandTotal.toFixed(2)}</div>
                </div>
            </div>
        `;

        updateOrderSummary(cart);
    }

    // Update order summary
    function updateOrderSummary(cart) {
        let subtotal = 0; // SUBTOTAL = originalPrice 合计
        let totalDiscounted = 0; // 实际支付金额 = price 合计
        let discount = 0;

        cart.forEach(item => {
            const quantity = item.quantity || 1;
            const price = item.price || 0;
            const originalPrice = item.originalPrice || price;
            
            subtotal += originalPrice * quantity;
            totalDiscounted += price * quantity;
        });

        discount = subtotal - totalDiscounted;
        const shipping = 0;
        const grandTotal = totalDiscounted + shipping;

        // Update DOM
        const subtotalEl = document.getElementById('orderSubtotal');
        const discountEl = document.getElementById('orderDiscount');
        const shippingEl = document.getElementById('orderShipping');
        const grandTotalEl = document.getElementById('orderGrandTotal');

        if (subtotalEl) subtotalEl.textContent = `$ ${subtotal.toFixed(2)}`;
        if (discountEl) discountEl.textContent = `$ ${discount.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `$ ${shipping.toFixed(2)}`;
        if (grandTotalEl) grandTotalEl.textContent = `$ ${grandTotal.toFixed(2)}`;
    }

    // Format card number input
    function formatCardNumber(input) {
        let value = input.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
        input.value = formattedValue;
    }

    // Format expiry date input
    function formatExpiryDate(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        input.value = value;
    }

    // Payment method change handler (currently only Credit Card is selectable)
    function handlePaymentMethodChange() {
        const creditCardForm = document.getElementById('creditCardForm');
        const cardNumber = document.getElementById('cardNumber');
        const cardName = document.getElementById('cardName');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');

        if (creditCardForm) {
            creditCardForm.style.display = 'block';
        }

        // Ensure credit card fields stay required
        if (cardNumber) cardNumber.setAttribute('required', 'required');
        if (cardName) cardName.setAttribute('required', 'required');
        if (expiryDate) expiryDate.setAttribute('required', 'required');
        if (cvv) cvv.setAttribute('required', 'required');
    }

    // Form validation
    function validateForm() {
        const cardNumber = document.getElementById('cardNumber');
        const cardName = document.getElementById('cardName');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');
        const phoneNumber = document.getElementById('phoneNumber');
        const streetAddress = document.getElementById('streetAddress');
        const region = document.getElementById('region');
        const city = document.getElementById('city');
        const postalCode = document.getElementById('postalCode');

        // Currently only Credit Card is a required payment method
        if (!cardNumber?.value || cardNumber.value.replace(/\s/g, '').length < 16) {
            alert('Please enter a valid card number.');
            return false;
        }
        if (!cardName?.value) {
            alert('Please enter the name on card.');
            return false;
        }
        if (!expiryDate?.value || !/^\d{2}\/\d{2}$/.test(expiryDate.value)) {
            alert('Please enter a valid expiry date (MM/YY).');
            return false;
        }
        if (!cvv?.value || cvv.value.length < 3) {
            alert('Please enter a valid CVV.');
            return false;
        }

        if (!phoneNumber?.value) {
            alert('Please enter your phone number.');
            return false;
        }
        if (!streetAddress?.value) {
            alert('Please enter your street address.');
            return false;
        }
        if (!region?.value) {
            alert('Please enter your region.');
            return false;
        }
        if (!city?.value) {
            alert('Please enter your city.');
            return false;
        }
        if (!postalCode?.value) {
            alert('Please enter your postal code.');
            return false;
        }

        return true;
    }

    // Initialize
    (function() {
        // Load order items
        loadOrderItems();

        // Card number formatting
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', () => formatCardNumber(cardNumberInput));
        }

        // Expiry date formatting
        const expiryDateInput = document.getElementById('expiryDate');
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', () => formatExpiryDate(expiryDateInput));
        }

        // CVV - only numbers
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }

        // Phone number - only digits
        const phoneNumberInput = document.getElementById('phoneNumber');
        if (phoneNumberInput) {
            phoneNumberInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }

        // Payment method change
        handlePaymentMethodChange();

        // Apply discount button
        const applyDiscountBtn = document.getElementById('applyDiscountBtn');
        if (applyDiscountBtn) {
            applyDiscountBtn.addEventListener('click', () => {
                const discountCode = document.getElementById('discountCode')?.value;
                if (discountCode) {
                    alert(`Discount code "${discountCode}" applied! (This is a demo)`);
                } else {
                    alert('Please enter a discount code.');
                }
            });
        }

        // Pay Now button
        const payNowBtn = document.getElementById('payNowBtn');
        if (payNowBtn) {
            payNowBtn.addEventListener('click', () => {
                const cart = cartManager.getCart();
                if (cart.length === 0) {
                    alert('Your cart is empty!');
                    return;
                }

                if (!validateForm()) {
                    return;
                }

                // Collect form data
                const formData = {
                    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value,
                    cardNumber: document.getElementById('cardNumber')?.value,
                    cardName: document.getElementById('cardName')?.value,
                    expiryDate: document.getElementById('expiryDate')?.value,
                    cvv: document.getElementById('cvv')?.value,
                    phoneNumber: document.getElementById('phoneNumber')?.value,
                    countryCode: document.getElementById('countryCode')?.value,
                    streetAddress: document.getElementById('streetAddress')?.value,
                    region: document.getElementById('region')?.value,
                    city: document.getElementById('city')?.value,
                    postalCode: document.getElementById('postalCode')?.value,
                    sameAsBilling: document.getElementById('sameAsBilling')?.checked,
                    rememberInfo: document.getElementById('rememberInfo')?.checked,
                };

                console.log('Checkout data:', formData);
                
                // Show success message
                payNowBtn.disabled = true;
                payNowBtn.textContent = 'PROCESSING...';
                
                setTimeout(() => {
                    // In a real application, you would:
                    // 1. Send order data to server
                    // 2. Handle errors/success
                    // 3. Redirect based on response
                    window.location.href = './payment.html';
                }, 1200);
            });
        }
    })();
})();


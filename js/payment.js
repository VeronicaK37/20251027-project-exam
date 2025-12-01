/**
 * Payment success page
 */

(function() {
    'use strict';

    // Display user name if logged in
    (function() {
        const loginLink = document.getElementById('loginLink');
        const userName = document.getElementById('userName');
        
        if (loginLink && userName && typeof userManager !== 'undefined') {
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

    // Clear cart and update badge on success page
    if (typeof cartManager !== 'undefined') {
        cartManager.clearCart();
        cartManager.updateCartBadge();
    }
})();



/**
 * Product Detail page functionality
 */

(function() {
    'use strict';

    // Get product ID from URL
    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // Handle login/logout display and functionality
    (function() {
        const loginLink = document.getElementById('loginLink');
        const logoutLink = document.getElementById('logoutLink');
        
        if (loginLink && logoutLink) {
            const userData = userManager.getUser();
            
            if (userData && userData.name) {
                // User is logged in, show logout and hide login
                loginLink.style.display = 'none';
                logoutLink.style.display = 'flex';
            } else {
                // User is not logged in, show login and hide logout
                loginLink.style.display = 'flex';
                logoutLink.style.display = 'none';
            }
            
            // Add logout functionality
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Clear user data
                userManager.removeUser();
                
                // Redirect to home page
                window.location.href = './index.html';
            });
        }
    })();

    // Initialize cart badge
    if (typeof cartManager !== 'undefined') {
        cartManager.updateCartBadge();
    }

    // Load product detail
    let currentProduct = null;
    
    (async function() {
        const productId = getProductIdFromUrl();
        
        if (!productId) {
            document.querySelector('.product-detail-section').innerHTML = 
                '<p style="text-align: center; padding: 2rem; color: #d32f2f;">Product ID is required.</p>';
            return;
        }

        try {
            const response = await shopAPI.getProductById(productId);
            const product = response.data || response;

            if (!product) {
                throw new Error('Product not found');
            }

            // Store product for cart
            currentProduct = product;

            // Render product image
            const productImage = document.getElementById('productImage');
            if (productImage && product.image) {
                productImage.src = product.image.url;
                productImage.alt = product.image.alt || product.title;
            }

            // Render product tag (use first tag if available)
            const productTag = document.getElementById('productTag');
            if (productTag) {
                if (product.tags && product.tags.length > 0) {
                    productTag.textContent = product.tags[0];
                    productTag.style.display = 'inline-flex';
                } else {
                    productTag.style.display = 'none';
                }
            }

            // Render product title
            const productTitle = document.getElementById('productTitle');
            if (productTitle) {
                productTitle.textContent = product.title.toUpperCase();
            }

            // Render product description
            const productDescription = document.getElementById('productDescription');
            if (productDescription) {
                productDescription.textContent = product.description || '';
            }

            // Render price
            const currentPrice = document.getElementById('currentPrice');
            const originalPrice = document.getElementById('originalPrice');
            const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
            
            if (currentPrice) {
                currentPrice.textContent = `$ ${hasDiscount ? product.discountedPrice.toFixed(2) : product.price.toFixed(2)}`;
            }

            if (originalPrice) {
                if (hasDiscount) {
                    originalPrice.textContent = `ORIGINAL: ${product.price.toFixed(2)}`;
                    originalPrice.style.display = 'inline';
                } else {
                    originalPrice.style.display = 'none';
                }
            }

            // Render rating
            const ratingStars = document.getElementById('ratingStars');
            const ratingValue = document.getElementById('ratingValue');
            
            if (ratingStars) {
                // Calculate average rating from reviews
                let avgRating = 0;
                if (product.reviews && product.reviews.length > 0) {
                    const sum = product.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
                    avgRating = sum / product.reviews.length;
                }
                
                const fullStars = Math.floor(avgRating);
                const hasHalfStar = avgRating % 1 >= 0.5;
                
                let starsHTML = '';
                for (let i = 0; i < 5; i++) {
                    if (i < fullStars) {
                        starsHTML += '★';
                    } else if (i === fullStars && hasHalfStar) {
                        starsHTML += '☆';
                    } else {
                        starsHTML += '☆';
                    }
                }
                ratingStars.innerHTML = starsHTML;
            }

            if (ratingValue) {
                const avgRating = product.reviews && product.reviews.length > 0
                    ? (product.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / product.reviews.length).toFixed(1)
                    : '0';
                ratingValue.textContent = avgRating;
            }

            // Render reviews
            const reviewsList = document.getElementById('reviewsList');
            if (reviewsList && product.reviews && product.reviews.length > 0) {
                reviewsList.innerHTML = product.reviews.map(review => {
                    const stars = '★'.repeat(review.rating || 0) + '☆'.repeat(5 - (review.rating || 0));
                    return `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="review-username">${review.username || 'Anonymous'}</span>
                                <span class="review-rating">${stars}</span>
                            </div>
                            <p class="review-description">${review.description || ''}</p>
                        </div>
                    `;
                }).join('');
            } else if (reviewsList) {
                reviewsList.innerHTML = '<p style="color: #666;">No reviews yet.</p>';
            }

            // Store product for cart functionality
            currentProduct = product;

        } catch (error) {
            console.error('Error loading product:', error);
            document.querySelector('.product-detail-section').innerHTML = 
                '<p style="text-align: center; padding: 2rem; color: #d32f2f;">Failed to load product. Please try again later.</p>';
        }
    })();

    // Quantity controls
    (function() {
        const decreaseBtn = document.getElementById('decreaseBtn');
        const increaseBtn = document.getElementById('increaseBtn');
        const quantityInput = document.getElementById('quantityInput');

        if (decreaseBtn && increaseBtn && quantityInput) {
            decreaseBtn.addEventListener('click', () => {
                const current = parseInt(quantityInput.value) || 1;
                if (current > 1) {
                    quantityInput.value = current - 1;
                }
            });

            increaseBtn.addEventListener('click', () => {
                const current = parseInt(quantityInput.value) || 1;
                quantityInput.value = current + 1;
            });
        }
    })();

    // Collapsible sections
    (function() {
        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        
        collapsibleHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.dataset.target;
                const content = document.getElementById(targetId);
                const arrow = header.querySelector('.arrow');

                if (content) {
                    const isActive = content.classList.contains('active');
                    
                    // Toggle active state
                    content.classList.toggle('active');
                    header.classList.toggle('active');
                    
                    // Update arrow
                    if (arrow) {
                        arrow.textContent = isActive ? '▼' : '▲';
                    }
                }
            });
        });
    })();

    // Add to cart functionality
    (function() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                if (!currentProduct) {
                    alert('Product not loaded yet. Please wait.');
                    return;
                }
                
                const quantity = parseInt(document.getElementById('quantityInput')?.value || 1);
                
                cartManager.addToCart(currentProduct, quantity);
                
                // Show feedback
                const originalText = addToCartBtn.textContent;
                addToCartBtn.textContent = 'ADDED TO CART!';
                addToCartBtn.style.opacity = '0.7';
                setTimeout(() => {
                    addToCartBtn.textContent = originalText;
                    addToCartBtn.style.opacity = '1';
                }, 1500);
            });
        }
    })();

    // Share button functionality
    (function() {
        const shareButton = document.getElementById('shareButton');
        if (!shareButton) return;

        shareButton.addEventListener('click', async () => {
            const url = window.location.href;
            const title = currentProduct?.title || 'NOROFF Product';
            const text = currentProduct?.description || 'Check out this product on NOROFF.';

            if (navigator.share) {
                try {
                    await navigator.share({ title, text, url });
                } catch (error) {
                    // user cancelled; ignore
                }
            } else if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(url);
                    alert('Product link copied to clipboard.');
                } catch (error) {
                    alert('Unable to copy link.');
                }
            } else {
                alert('Sharing is not supported in this browser.');
            }
        });
    })();

    // Search functionality
    (function() {
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const searchTerm = prompt('Enter search term:');
                if (searchTerm && searchTerm.trim()) {
                    // Redirect to home page with search
                    window.location.href = `./index.html?search=${encodeURIComponent(searchTerm)}`;
                }
            });
        }
    })();
})();


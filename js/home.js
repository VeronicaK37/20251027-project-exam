(function () {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-pagination span'));
    const prevBtn = document.querySelector('.hero-nav.prev');
    const nextBtn = document.querySelector('.hero-nav.next');

    if (!slides.length) {
        return;
    }

    let current = 0;
    let autoplayId = null;

    const setActive = (index) => {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        current = index;
    };

    const goTo = (index) => {
        const total = slides.length;
        const target = (index + total) % total;
        setActive(target);
        restartAutoplay();
    };

    const restartAutoplay = () => {
        if (autoplayId) {
            clearInterval(autoplayId);
        }
        autoplayId = setInterval(() => {
            goTo(current + 1);
        }, 7000);
    };

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => goTo(idx));
    });

    setActive(0);
    restartAutoplay();

    // Display user name if logged in
    (function() {
        const loginLink = document.getElementById('loginLink');
        const userName = document.getElementById('userName');
        
        if (loginLink && userName) {
            const userData = userManager.getUser();
            
            if (userData && userData.name) {
                // User is logged in, show username and hide login link
                userName.textContent = userData.name.toUpperCase();
                userName.style.display = 'inline-block';
                loginLink.style.display = 'none';
            } else {
                // User is not logged in, show login link and hide username
                userName.style.display = 'none';
                loginLink.style.display = 'inline-block';
            }
        }
    })();

    // Initialize cart badge
    if (typeof cartManager !== 'undefined') {
        cartManager.updateCartBadge();
    }

    // Load products from API with pagination
    (function() {
        const productGrid = document.getElementById('productGrid');
        const productPagination = document.getElementById('productPagination');
        const reviewsGrid = document.querySelector('.review-grid');
        const reviewsPagination = document.querySelector('.review-pagination');
        let currentPage = 1;
        const limit = 12;
        let currentProducts = []; // Store current page products for cart
        let allReviews = [];
        let currentReviewsPage = 1;
        const REVIEWS_PER_PAGE = 3;

        async function loadProducts(page) {
            if (!productGrid) {
                return;
            }

            // Show loading state
            productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem;">Loading products...</p>';
            if (productPagination) {
                productPagination.innerHTML = '';
            }

            try {
                const response = await shopAPI.getProducts(page, limit);
                const products = response.data || [];
                const meta = response.meta || {};
                
                currentPage = meta.currentPage || page;
                currentProducts = products; // Store products for cart

                if (Array.isArray(products) && products.length > 0) {
                    productGrid.innerHTML = products.map(product => {
                        const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
                        const displayPrice = hasDiscount ? product.discountedPrice : product.price;
                        const originalPrice = hasDiscount ? product.price : null;
                        
                        return `
                            <article class="product-card">
                                <button class="wishlist" aria-label="Save product">♡</button>
                                <a href="./product-detail.html?id=${product.id || ''}" style="display: block;">
                                    <img src="${product.image.url}" alt="${product.image.alt || product.title}">
                                </a>
                                <div class="info">
                                    <a href="./product-detail.html?id=${product.id || ''}" style="text-decoration: none; color: inherit;">
                                        <h3>${product.title}</h3>
                                    </a>
                                    <p class="price">
                                        $${displayPrice.toFixed(2)}
                                        ${originalPrice ? `<span class="original">$${originalPrice.toFixed(2)}</span>` : ''}
                                    </p>
                                    <button class="add-btn" data-product-id="${product.id || ''}" data-product-title="${product.title || ''}" data-product-price="${displayPrice}" data-product-image="${product.image?.url || ''}">Add to cart</button>
                                </div>
                            </article>
                        `;
                    }).join('');

                    // Add event listeners to "Add to cart" buttons
                    productGrid.querySelectorAll('.add-btn').forEach((btn, index) => {
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Get product data from the stored products array
                            const product = currentProducts[index];
                            if (product) {
                                cartManager.addToCart(product, 1);
                                
                                // Show feedback
                                const originalText = btn.textContent;
                                btn.textContent = 'Added!';
                                btn.style.opacity = '0.7';
                                setTimeout(() => {
                                    btn.textContent = originalText;
                                    btn.style.opacity = '1';
                                }, 1000);
                            }
                        });
                    });

                    // Render pagination
                    if (productPagination && meta.pageCount > 1) {
                        renderPagination(meta);
                    }

                    // Collect and render reviews
                    allReviews = collectReviews(products);
                    currentReviewsPage = 1;
                    renderReviews();
                } else {
                    productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No products available.</p>';
                    allReviews = [];
                    renderReviews();
                }
            } catch (error) {
                console.error('Error loading products:', error);
                productGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #d32f2f;">Failed to load products. Please try again later.</p>';
                allReviews = [];
                renderReviews();
            }
        }

        function renderPagination(meta) {
            if (!productPagination) {
                return;
            }

            const pageCount = meta.pageCount || 1;
            const current = meta.currentPage || 1;

            if (pageCount <= 1) {
                productPagination.innerHTML = '';
                productPagination.style.display = 'none';
                return;
            }

            productPagination.style.display = 'flex';
            productPagination.innerHTML = '';

            for (let i = 1; i <= pageCount; i++) {
                const dot = document.createElement('span');
                dot.dataset.page = i.toString();
                dot.classList.toggle('active', i === current);
                productPagination.appendChild(dot);
            }

            productPagination.querySelectorAll('span').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const target = e.target;
                    if (!(target instanceof HTMLElement)) {
                        return;
                    }
                    const page = parseInt(target.dataset.page || '0', 10);
                    if (page && page !== current) {
                        loadProducts(page);
                        document.querySelector('.products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
        }

        // Initial load
        loadProducts(1);

        function collectReviews(products = []) {
            return products.flatMap(product => {
                if (!Array.isArray(product.reviews) || !product.reviews.length) {
                    return [];
                }
                return product.reviews.map(review => ({
                    ...review,
                    productTitle: product.title,
                }));
            });
        }

        function renderReviews() {
            if (!reviewsGrid) {
                return;
            }

            if (!allReviews.length) {
                reviewsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No reviews yet.</p>';
                if (reviewsPagination) {
                    reviewsPagination.innerHTML = '';
                    reviewsPagination.style.display = 'none';
                }
                return;
            }

            const start = (currentReviewsPage - 1) * REVIEWS_PER_PAGE;
            const pageReviews = allReviews.slice(start, start + REVIEWS_PER_PAGE);

            reviewsGrid.innerHTML = pageReviews.map(review => {
                const rating = Number(review.rating) || 0;
                const stars = Array.from({ length: 5 }, (_, idx) => idx < rating ? '★' : '☆').join('');
                return `
                    <article class="review-card">
                        <div class="rating">Rating: ${rating}/5 <span class="stars">${stars}</span></div>
                        <p>${review.description || ''}</p>
                        <div class="author">
                            <div>
                                <strong>${review.username || 'Anonymous'}</strong>
                                <small>${review.productTitle || ''}</small>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');

            renderReviewPagination();
        }

        function renderReviewPagination() {
            if (!reviewsPagination) {
                return;
            }

            const pageCount = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
            if (pageCount <= 1) {
                reviewsPagination.innerHTML = '';
                reviewsPagination.style.display = 'none';
                return;
            }

            reviewsPagination.style.display = 'flex';
            reviewsPagination.innerHTML = Array.from({ length: pageCount }, (_, idx) => {
                const page = idx + 1;
                return `<span data-page="${page}" class="${page === currentReviewsPage ? 'active' : ''}"></span>`;
            }).join('');

            reviewsPagination.querySelectorAll('span').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const target = e.target;
                    if (!(target instanceof HTMLElement)) {
                        return;
                    }
                    const page = parseInt(target.dataset.page || '0', 10);
                    if (page && page !== currentReviewsPage) {
                        currentReviewsPage = page;
                        renderReviews();
                    }
                });
            });
        }
    })();
})();

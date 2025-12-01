/**
 * NOROFF API Configuration and Utilities
 */

const API_BASE_URL = 'https://v2.api.noroff.dev';

/**
 * API Client for making requests
 */
class ApiClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Get token from localStorage or use hardcoded fallback
        const token = localStorage.getItem('accessToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibGlhbzEyMyIsImVtYWlsIjoibGlhbzEyM0BzdHVkLm5vcm9mZi5ubyIsImlhdCI6MTc2NDMxODUyM30.cmIrQg8AULgFkJCmFUt2VMMGpqc-4NHpNFIjhdMIiYo';
        const apiKey = 'a9281376-cc3b-44de-b3a7-86462c2e5abc';
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Noroff-API-Key': apiKey,
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(
                    data.errors?.[0]?.message || data.message || 'An error occurred',
                    response.status,
                    data.errors || []
                );
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('Network error. Please check your connection.', 0);
        }
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options,
        });
    }

}

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(message, status = 0, errors = []) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

/**
 * Auth API functions
 */
const authAPI = {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userData.name - Username (required, no punctuation except _)
     * @param {string} userData.email - Email (required, must be stud.noroff.no)
     * @param {string} userData.password - Password (required, min 8 characters)
     * @param {string} [userData.bio] - Bio (optional, max 160 characters)
     * @param {Object} [userData.avatar] - Avatar object (optional)
     * @param {Object} [userData.banner] - Banner object (optional)
     * @param {boolean} [userData.venueManager] - Venue manager flag (optional)
     * @returns {Promise<Object>} User data
     */
    async register(userData) {
        const client = new ApiClient();
        return client.post('/auth/register', userData);
    },

    /**
     * Login a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data with accessToken
     */
    async login(email, password) {
        const client = new ApiClient();
        return client.post('/auth/login', { email, password });
    },

    /**
     * Create an API Key
     * @param {string} [name] - Optional API Key name (max 32 characters)
     * @returns {Promise<Object>} API Key data
     */
    async createApiKey(name) {
        const client = new ApiClient();
        const body = name ? { name } : {};
        return client.post('/auth/create-api-key', body);
    },
};

/**
 * Online Shop API functions
 */
const shopAPI = {
    /**
     * Get products with pagination
     * @param {number} [page=1] - Page number
     * @param {number} [limit=12] - Number of products per page
     * @returns {Promise<Object>} Response object with data and meta
     * @returns {Promise<Array>} response.data - Array of products
     * @returns {Promise<Object>} response.meta - Pagination metadata
     */
    async getProducts(page = 1, limit = 12) {
        const client = new ApiClient();
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        return client.request(`/online-shop?${params.toString()}`);
    },

    /**
     * Get product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Object>} Product data
     */
    async getProductById(id) {
        const client = new ApiClient();
        return client.request(`/online-shop/${id}`);
    },
};

/**
 * Token management utilities
 */
const tokenManager = {
    /**
     * Save access token to localStorage
     * @param {string} token - Access token
     */
    saveToken(token) {
        localStorage.setItem('accessToken', token);
    },

    /**
     * Get access token from localStorage
     * @returns {string|null} Access token or null
     */
    getToken() {
        return localStorage.getItem('accessToken');
    },

    /**
     * Remove access token from localStorage
     */
    removeToken() {
        localStorage.removeItem('accessToken');
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if token exists
     */
    isAuthenticated() {
        return !!this.getToken();
    },
};

/**
 * User data management utilities
 */
const userManager = {
    /**
     * Save user data to localStorage
     * @param {Object} userData - User data object
     */
    saveUser(userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
    },

    /**
     * Get user data from localStorage
     * @returns {Object|null} User data or null
     */
    getUser() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    },

    /**
     * Remove user data from localStorage
     */
    removeUser() {
        localStorage.removeItem('userData');
    },
};

/**
 * Shopping Cart management utilities
 */
const cartManager = {
    /**
     * Get cart items from localStorage
     * @returns {Array} Array of cart items
     */
    getCart() {
        const data = localStorage.getItem('cart');
        return data ? JSON.parse(data) : [];
    },

    /**
     * Save cart items to localStorage
     * @param {Array} items - Array of cart items
     */
    saveCart(items) {
        localStorage.setItem('cart', JSON.stringify(items));
        this.updateCartBadge();
    },

    /**
     * Add item to cart
     * @param {Object} product - Product object
     * @param {number} quantity - Quantity to add
     */
    addToCart(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.discountedPrice || product.price,
                originalPrice: product.price,
                image: product.image,
                quantity: quantity,
            });
        }

        this.saveCart(cart);
        return cart;
    },

    /**
     * Remove item from cart
     * @param {string} productId - Product ID
     */
    removeFromCart(productId) {
        const cart = this.getCart().filter(item => item.id !== productId);
        this.saveCart(cart);
        return cart;
    },

    /**
     * Update item quantity in cart
     * @param {string} productId - Product ID
     * @param {number} quantity - New quantity
     */
    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            }
            item.quantity = quantity;
            this.saveCart(cart);
        }
        return cart;
    },

    /**
     * Get total number of items in cart
     * @returns {number} Total quantity
     */
    getTotalQuantity() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.quantity || 0), 0);
    },

    /**
     * Get total price of items in cart
     * @returns {number} Total price
     */
    getTotalPrice() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
    },

    /**
     * Clear cart
     */
    clearCart() {
        localStorage.removeItem('cart');
        this.updateCartBadge();
    },

    /**
     * Update cart badge in header
     */
    updateCartBadge() {
        const total = this.getTotalQuantity();
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (badge.closest('.cart-icon')) {
                badge.textContent = total > 0 ? total : '';
                badge.style.display = total > 0 ? 'flex' : 'none';
            }
        });
    },
};


// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient, ApiError, authAPI, tokenManager, userManager, apiKeyManager };
}


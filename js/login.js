/**
 * Login page functionality
 */

(function() {

    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = form?.querySelector('button[type="submit"]');

    if (!form || !emailInput || !passwordInput) {
        return;
    }

    // Create error message container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.display = 'none';
    form.insertBefore(errorContainer, form.firstChild);

    /**
     * Show error message
     */
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.style.color = '#d32f2f';
        errorContainer.style.backgroundColor = '#ffebee';
        errorContainer.style.padding = '0.875rem';
        errorContainer.style.borderRadius = '4px';
        errorContainer.style.marginBottom = '1rem';
        errorContainer.style.fontSize = '0.9rem';
    }

    /**
     * Hide error message
     */
    function hideError() {
        errorContainer.style.display = 'none';
    }

    /**
     * Set loading state
     */
    function setLoading(loading) {
        if (submitButton) {
            submitButton.disabled = loading;
            submitButton.textContent = loading ? 'LOGGING IN...' : 'GET STARTED';
        }
    }

    /**
     * Validate email format
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Handle form submission
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Client-side validation
        if (!email) {
            showError('Please enter your email address.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        if (!password) {
            showError('Please enter your password.');
            return;
        }

        if (password.length < 8) {
            showError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.login(email, password);
            
            if (response.data) {
                // Save token and user data
                if (response.data.accessToken) {
                    tokenManager.saveToken(response.data.accessToken);
                }
                userManager.saveUser(response.data);

                // Show success message
                errorContainer.style.color = '#2e7d32';
                errorContainer.style.backgroundColor = '#e8f5e9';
                errorContainer.textContent = 'Login successful! Redirecting...';
                errorContainer.style.display = 'block';
                
                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = './index.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    errorMessage = 'Invalid email or password. Please check your credentials.';
                } else if (error.status === 429) {
                    errorMessage = 'Too many requests. Please try again later.';
                } else if (error.message) {
                    errorMessage = error.message;
                }
            }
            
            showError(errorMessage);
            setLoading(false);
        }
    });

    // Clear error on input
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            if (errorContainer.style.display === 'block') {
                hideError();
            }
        });
    });
})();


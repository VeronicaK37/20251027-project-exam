/**
 * Register page functionality
 */

(function() {

    const form = document.querySelector('form');
    const nameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = form?.querySelector('button[type="submit"]');

    if (!form || !nameInput || !emailInput || !passwordInput) {
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
            submitButton.textContent = loading ? 'CREATING ACCOUNT...' : 'CREATE AN ACCOUNT';
        }
    }

    /**
     * Validate name (no punctuation except underscore)
     */
    function validateName(name) {
        const nameRegex = /^[a-zA-Z0-9_]+$/;
        return nameRegex.test(name);
    }

    /**
     * Validate email format and domain
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@stud\.noroff\.no$/;
        return emailRegex.test(email);
    }

    /**
     * Handle form submission
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Client-side validation
        if (!name) {
            showError('Please enter your name.');
            return;
        }

        if (!validateName(name)) {
            showError('Name can only contain letters, numbers, and underscores. No punctuation allowed.');
            return;
        }

        if (!email) {
            showError('Please enter your email address.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Email must be a valid @stud.noroff.no address.');
            return;
        }

        if (!password) {
            showError('Please enter a password.');
            return;
        }

        if (password.length < 8) {
            showError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);

        try {
            const userData = {
                name: name,
                email: email,
                password: password,
            };

            const response = await authAPI.register(userData);
            
            if (response.data) {
                // Show success message
                errorContainer.style.color = '#2e7d32';
                errorContainer.style.backgroundColor = '#e8f5e9';
                errorContainer.textContent = 'Registration successful! Redirecting to login...';
                errorContainer.style.display = 'block';

                // Redirect to login page after a short delay
                // setTimeout(() => {
                //     window.location.href = './login.html';
                // }, 1500);
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error instanceof ApiError) {
                if (error.status === 409) {
                    errorMessage = 'This email or username is already registered.';
                } else if (error.status === 400) {
                    errorMessage = error.message || 'Invalid input. Please check your information.';
                } else if (error.status === 429) {
                    errorMessage = 'Too many requests. Please try again later.';
                } else if (error.message) {
                    errorMessage = error.message;
                }

                // Show field-specific errors if available
                if (error.errors && error.errors.length > 0) {
                    const fieldErrors = error.errors.map(err => err.message).join(', ');
                    errorMessage = fieldErrors;
                }
            }
            
            showError(errorMessage);
            setLoading(false);
        }
    });

    // Clear error on input
    [nameInput, emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            if (errorContainer.style.display === 'block') {
                hideError();
            }
        });
    });

    // Update email placeholder to show required format
    emailInput.placeholder = 'first.last@stud.noroff.no';
})();


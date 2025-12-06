// Mobile menu functionality
(function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    
    const closeMenu = () => {
        navLinks?.classList.remove('active');
        mobileMenuOverlay?.classList.remove('active');
    };
    
    const openMenu = () => {
        navLinks?.classList.add('active');
        mobileMenuOverlay?.classList.add('active');
    };
    
    if (mobileMenuBtn && navLinks && mobileMenuOverlay) {
        // Toggle menu
        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navLinks.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
        });
        
        // Close menu with close button
        closeMenuBtn?.addEventListener('click', closeMenu);
        
        // Close menu when clicking overlay
        mobileMenuOverlay.addEventListener('click', closeMenu);
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
})();

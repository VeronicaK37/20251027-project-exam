/**
 * Footer collapse functionality for mobile devices
 * Handles the expand/collapse behavior of footer columns on mobile view
 */

(function() {
    'use strict';

    // Mobile footer collapse functionality
    function initFooterCollapse() {
        const collapsibles = document.querySelectorAll('.footer-column.collapsible');
        const isMobile = window.innerWidth <= 768;
        
        collapsibles.forEach(column => {
            const h4 = column.querySelector('h4');
            if (h4) {
                // Remove existing event listeners by cloning
                const newH4 = h4.cloneNode(true);
                h4.parentNode.replaceChild(newH4, h4);
                
                if (isMobile) {
                    // Default to collapsed on mobile
                    column.classList.add('collapsed');
                    
                    // Add click event
                    newH4.addEventListener('click', function(e) {
                        e.preventDefault();
                        column.classList.toggle('collapsed');
                    });
                } else {
                    // Always expanded on desktop
                    column.classList.remove('collapsed');
                }
            }
        });
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initFooterCollapse);

    // Handle window resize with debounce
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            initFooterCollapse();
        }, 100);
    });
})();


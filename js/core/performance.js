// Performance Optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function for performance
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Optimize scroll events
    const optimizedScroll = throttle(() => {
        // Your scroll handling code
        updateActiveNav();
        handleParallax();
    }, 50);

    window.addEventListener('scroll', optimizedScroll);

    // Optimize resize events
    const optimizedResize = debounce(() => {
        // Your resize handling code
        updateLayout();
    }, 250);

    window.addEventListener('resize', optimizedResize);

    // Preload critical resources
    function preloadCriticalResources() {
        const resources = [
            '/css/core/style.css',
            '/css/effects/glassmorphism.css',
            '/js/core/script.js'
        ];

        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    // Defer non-critical resources
    function deferNonCriticalResources() {
        const nonCriticalStyles = document.querySelectorAll('link[data-defer]');
        nonCriticalStyles.forEach(style => {
            style.media = 'print';
            style.onload = () => {
                style.media = 'all';
            };
        });
    }

    // Initialize performance optimizations
    preloadCriticalResources();
    deferNonCriticalResources();
});

// Export utility functions
export const performanceUtils = {
    debounce,
    throttle
}; 
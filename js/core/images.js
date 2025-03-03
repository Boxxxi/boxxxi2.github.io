// Image loading and optimization
document.addEventListener('DOMContentLoaded', () => {
    // Configure image loading
    const imageConfig = {
        loadingAttribute: 'lazy',
        errorFallback: '/assets/images/placeholder.jpg',
        thumbnailSize: '300x300',
        fullSize: '1200x1200',
        debounceTime: 100 // Debounce time in ms
    };

    // Debounce function to prevent multiple rapid calls
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Handle image loading
    function handleImageLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        // First, remove lazy loading attribute and add loaded class to all images
        images.forEach(img => {
            // Remove lazy loading attribute
            img.removeAttribute('loading');
            
            // Add loaded class to ensure opacity is 1
            if (!img.classList.contains('loaded')) {
                img.classList.add('loaded');
            }
            
            // Set src from data-src if it exists
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
        
        // Mark all existing images as loaded
        markLoadedImages();
    }

    // Handle gallery image clicks with debouncing
    function handleGalleryClicks() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const mainImage = document.getElementById('photography-featured');
        let isTransitioning = false;

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                if (isTransitioning || !mainImage) return;
                
                const img = item.querySelector('img');
                if (img) {
                    isTransitioning = true;
                    
                    // Preload image before showing
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        mainImage.classList.remove('active');
                        
                        // Short delay before changing source
                        setTimeout(() => {
                            mainImage.src = img.src;
                            
                            // Wait for the new image to be processed
                            setTimeout(() => {
                                mainImage.classList.add('active');
                                isTransitioning = false;
                            }, 50);
                        }, 300);
                    };
                    
                    tempImg.onerror = () => {
                        isTransitioning = false;
                    };
                    
                    tempImg.src = img.src;
                }
            });
        });
    }

    // Mark all images as loaded to ensure they're visible
    function markLoadedImages() {
        const allImages = document.querySelectorAll('img');
        
        allImages.forEach(img => {
            // Skip images that are already marked as loaded
            if (!img.classList.contains('loaded')) {
                img.classList.add('loaded');
            }
            
            // Remove any loading classes
            if (img.classList.contains('loading')) {
                img.classList.remove('loading');
            }
            
            // Force opacity to 1 via inline style as a fallback
            img.style.opacity = '1';
        });
    }

    // Initialize image handlers
    handleImageLoading();
    handleGalleryClicks();

    // Add loading animation styles
    const style = document.createElement('style');
    style.textContent = `
        img {
            opacity: 1;
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        img.loading {
            opacity: 0.5;
        }
        
        img.loaded {
            opacity: 1;
        }
        
        img.error {
            opacity: 0.7;
            filter: grayscale(100%);
        }
        
        .gallery-item {
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .gallery-item:hover {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}); 
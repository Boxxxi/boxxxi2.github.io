// Image loading and optimization
document.addEventListener('DOMContentLoaded', () => {
    // Configure image loading
    const imageConfig = {
        loadingAttribute: 'lazy',
        errorFallback: '/assets/images/placeholder.jpg',
        thumbnailSize: '300x300',
        fullSize: '1200x1200'
    };

    // Handle image loading
    function handleImageLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Set src from data-src if it exists
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    
                    // Add loading animation
                    img.classList.add('loading');
                    
                    // Handle successful load
                    img.onload = () => {
                        img.classList.remove('loading');
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    };
                    
                    // Handle load error
                    img.onerror = () => {
                        console.warn(`Failed to load image: ${img.src}`);
                        img.src = imageConfig.errorFallback;
                        img.classList.remove('loading');
                        img.classList.add('error');
                    };
                }
            });
        }, {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Handle gallery image clicks
    function handleGalleryClicks() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const mainImage = document.getElementById('photography-featured');

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img && mainImage) {
                    mainImage.classList.add('loading');
                    mainImage.src = img.src;
                    mainImage.onload = () => {
                        mainImage.classList.remove('loading');
                    };
                }
            });
        });
    }

    // Initialize image handlers
    handleImageLoading();
    handleGalleryClicks();

    // Add loading animation styles
    const style = document.createElement('style');
    style.textContent = `
        img.loading {
            opacity: 0.5;
            transition: opacity 0.3s ease;
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
class Gallery {
    constructor(container) {
        this.container = container;
        this.mainImage = container.querySelector('.gallery-main img');
        this.track = container.querySelector('.gallery-track');
        this.items = Array.from(container.querySelectorAll('.gallery-item'));
        this.currentIndex = 0;
        this.loading = false;
        this.preloadImages();
        
        this.init();
    }

    init() {
        // Add navigation buttons
        this.addNavigation();
        
        // Set up click handlers for thumbnail items
        this.items.forEach((item, index) => {
            item.addEventListener('click', () => this.switchImage(index));
        });

        // Initialize first image
        if (this.items.length > 0) {
            this.switchImage(0);
        }

        // Add touch scrolling for the track
        this.setupTouchScroll();
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }

    addNavigation() {
        // Create navigation buttons
        const prevBtn = document.createElement('button');
        const nextBtn = document.createElement('button');
        
        prevBtn.className = 'gallery-nav prev glass';
        nextBtn.className = 'gallery-nav next glass';
        
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        prevBtn.addEventListener('click', () => this.prev());
        nextBtn.addEventListener('click', () => this.next());
        
        this.container.querySelector('.gallery-main').appendChild(prevBtn);
        this.container.querySelector('.gallery-main').appendChild(nextBtn);
    }

    setupTouchScroll() {
        let isDown = false;
        let startX;
        let scrollLeft;

        this.track.addEventListener('mousedown', (e) => {
            isDown = true;
            this.track.style.cursor = 'grabbing';
            startX = e.pageX - this.track.offsetLeft;
            scrollLeft = this.track.scrollLeft;
        });

        this.track.addEventListener('mouseleave', () => {
            isDown = false;
            this.track.style.cursor = 'grab';
        });

        this.track.addEventListener('mouseup', () => {
            isDown = false;
            this.track.style.cursor = 'grab';
        });

        this.track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - this.track.offsetLeft;
            const walk = (x - startX) * 2;
            this.track.scrollLeft = scrollLeft - walk;
        });
    }

    async switchImage(index) {
        if (this.loading || index === this.currentIndex) return;
        
        this.loading = true;
        const newItem = this.items[index];
        const newSrc = newItem.querySelector('img').src;
        const newAlt = newItem.querySelector('img').alt || 'Gallery image';

        // Update active states
        this.items[this.currentIndex].classList.remove('active');
        newItem.classList.add('active');

        // Scroll thumbnail into view if needed
        this.scrollThumbnailIntoView(newItem);

        try {
            // Create new image and preload it
            const img = new Image();
            
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Still resolve on error
                img.src = newSrc;
            });

            // Update the main image
            this.mainImage.classList.remove('active');
            
            // Wait for fade out
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Update source and alt text
            this.mainImage.src = newSrc;
            this.mainImage.alt = newAlt;
            
            // Force browser to process the new image
            setTimeout(() => {
                this.mainImage.classList.add('active');
                this.currentIndex = index;
                
                // Reset loading state after transition completes
                setTimeout(() => {
                    this.loading = false;
                }, 500);
            }, 50);

        } catch (error) {
            console.error('Failed to load image:', error);
            this.loading = false;
        }
    }

    scrollThumbnailIntoView(item) {
        const itemRect = item.getBoundingClientRect();
        const trackRect = this.track.getBoundingClientRect();
        
        if (itemRect.left < trackRect.left) {
            this.track.scrollLeft += itemRect.left - trackRect.left - 20;
        } else if (itemRect.right > trackRect.right) {
            this.track.scrollLeft += itemRect.right - trackRect.right + 20;
        }
    }

    prev() {
        const newIndex = this.currentIndex === 0 ? this.items.length - 1 : this.currentIndex - 1;
        this.switchImage(newIndex);
    }

    next() {
        const newIndex = this.currentIndex === this.items.length - 1 ? 0 : this.currentIndex + 1;
        this.switchImage(newIndex);
    }

    preloadImages() {
        this.items.forEach(item => {
            const img = new Image();
            img.src = item.querySelector('img').src;
        });
    }
}

// Initialize galleries when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const galleries = document.querySelectorAll('.gallery-container');
    galleries.forEach(gallery => new Gallery(gallery));
}); 
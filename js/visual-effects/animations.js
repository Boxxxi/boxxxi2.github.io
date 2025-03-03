document.addEventListener('DOMContentLoaded', () => {
    // Fade-in animation on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => observer.observe(element));

    // Timeline rocket animation setup
    const setupTimelineAnimation = () => {
        const timelineEnd = document.createElement('div');
        timelineEnd.className = 'timeline-end';
        
        const rocket = document.createElement('div');
        rocket.className = 'rocket';
        
        const timeline = document.querySelector('.timeline');
        if (timeline) {
            timeline.appendChild(timelineEnd);
            timeline.appendChild(rocket);

            // Set rocket emoji as background
            rocket.style.backgroundImage = "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><text y=\"20\">🚀</text></svg>')";

            timelineEnd.addEventListener('click', () => {
                // Prevent multiple clicks during animation
                if (rocket.classList.contains('launching')) return;
                
                // Start rocket animation
                rocket.classList.add('launching');
                
                // Smooth scroll to top of timeline
                setTimeout(() => {
                    timeline.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 500);

                // Remove launching class after animation
                setTimeout(() => {
                    rocket.classList.remove('launching');
                }, 2000);
            });
        }
    };

    // Project cards stagger animation
    const projectCards = document.querySelectorAll('.project-card');
    const projectObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    // Optional: remove observer after animation
                    projectObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '50px'
        }
    );

    projectCards.forEach(card => projectObserver.observe(card));

    const setupGalleryAnimations = () => {
        const galleryMain = document.querySelector('.gallery-main img');
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        // Observe gallery items for scroll animation
        const galleryObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        // Add staggered animation delay
                        setTimeout(() => {
                            entry.target.classList.add('fade-in');
                            galleryObserver.unobserve(entry.target);
                        }, index * 100); // 100ms delay between each item
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        galleryItems.forEach(item => galleryObserver.observe(item));

        // Main image update function
        window.updateMainImage = (element) => {
            const thumbnail = element.querySelector('img');
            const caption = element.querySelector('.image-caption');
            
            if (galleryMain) {
                galleryMain.style.opacity = '0';
                
                setTimeout(() => {
                    galleryMain.src = thumbnail.src;
                    galleryMain.alt = thumbnail.alt;
                    const mainCaption = galleryMain.nextElementSibling;
                    if (mainCaption) {
                        mainCaption.textContent = caption.textContent;
                    }
                    galleryMain.style.opacity = '1';
                }, 300);
            }
        };

        // Arrow key navigation
        document.addEventListener('keydown', (e) => {
            const track = document.querySelector('.gallery-track');
            if (track) {
                if (e.key === 'ArrowLeft') {
                    track.scrollBy({ left: -280, behavior: 'smooth' });
                } else if (e.key === 'ArrowRight') {
                    track.scrollBy({ left: 280, behavior: 'smooth' });
                }
            }
        });
    };

    // Initialize all animations
    const initAnimations = () => {
        setupTimelineAnimation();
        setupGalleryAnimations();
    };

    // Call initialization
    initAnimations();
});

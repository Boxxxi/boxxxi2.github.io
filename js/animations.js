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

    // Initialize all animations
    const initAnimations = () => {
        setupTimelineAnimation();
    };

    // Call initialization
    initAnimations();
});

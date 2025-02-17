document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => observer.observe(element));
});

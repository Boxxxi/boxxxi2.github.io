// particles.js - Creates floating particle effects in the background
document.addEventListener('DOMContentLoaded', () => {
    // Create canvas element for particles
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-2';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    // Get primary color from CSS variables for particles
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();
    
    // Convert color to rgba format with reduced opacity
    const particleColor = primaryColor.startsWith('#')
        ? hexToRGBA(primaryColor, 0.15)
        : convertToRGBA(primaryColor, 0.15);

    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50;
    
    // Resize handler
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Initialize particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.1,
                direction: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            // Move particle
            particle.x += Math.cos(particle.direction) * particle.speed;
            particle.y += Math.sin(particle.direction) * particle.speed;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particleColor.replace(')', `, ${particle.opacity})`);
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    // Helper function to convert hex to rgba
    function hexToRGBA(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Helper function to convert any color format to rgba
    function convertToRGBA(color, alpha) {
        // For simplicity, assume it's already in a format we can use
        return color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    }
    
    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    animate();
}); 
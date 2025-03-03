document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'spiral-canvas';
    document.getElementById('particles-js').appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const phi = (1 + Math.sqrt(5)) / 2;
    let angle = 0;
    let opacity = 0;
    
    function drawSpiral() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for(let i = 0; i < 200; i++) {
            const radius = i * 0.5;
            const x = centerX + radius * Math.cos(angle + i / phi);
            const y = centerY + radius * Math.sin(angle + i / phi);
            
            if(i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.strokeStyle = `rgba(0, 127, 255, ${0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        angle += 0.002;
        requestAnimationFrame(drawSpiral);
    }
    
    drawSpiral();
});

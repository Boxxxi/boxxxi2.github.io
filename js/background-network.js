// background-network.js
document.addEventListener('DOMContentLoaded', () => {
    // Get primary color from CSS root variables
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();

    // Convert primary color to rgba format for nodes and lines
    const nodeColor = primaryColor.startsWith('#') 
        ? hexToRGBA(primaryColor, 0.5)  // If hex color
        : convertToRGBA(primaryColor, 0.5); // If already RGB/RGBA

    const lineColor = primaryColor.startsWith('#')
        ? hexToRGBA(primaryColor, 0.2)
        : convertToRGBA(primaryColor, 0.2);

    const canvas = document.createElement('canvas');
    canvas.id = 'network-canvas';
    document.getElementById('particles-js').appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Canvas sizing
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Node configuration
    const config = {
        nodeCount: 200,
        nodeColor: nodeColor,
        lineColor: lineColor,
        nodeRadius: 2,
        nodeVelocity: 0.5,
        connectionDistance: 200,
        connectionWidth: 1
    };

    // Helper functions for color conversion
    function hexToRGBA(hex, alpha = 1) {
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function convertToRGBA(color, alpha) {
        // Handle rgb() format
        if (color.startsWith('rgb(')) {
            const rgb = color.match(/\d+/g);
            return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
        }
        // Handle rgba() format
        if (color.startsWith('rgba(')) {
            const rgba = color.match(/\d+/g);
            return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${alpha})`;
        }
        return color;
    }

    // Rest of your existing Node class and animation code...
    class Node {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * config.nodeVelocity;
            this.vy = (Math.random() - 0.5) * config.nodeVelocity;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, config.nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = config.nodeColor;
            ctx.fill();
        }
    }

    const nodes = Array.from({ length: config.nodeCount }, () => new Node());

    function drawConnections() {
        nodes.forEach((nodeA, i) => {
            nodes.slice(i + 1).forEach(nodeB => {
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.connectionDistance) {
                    const opacity = 1 - (distance / config.connectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(nodeB.x, nodeB.y);
                    ctx.strokeStyle = convertToRGBA(config.lineColor, opacity * 0.2);
                    ctx.lineWidth = config.connectionWidth;
                    ctx.stroke();
                }
            });
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        nodes.forEach(node => {
            node.update();
            node.draw();
        });

        drawConnections();
        
        requestAnimationFrame(animate);
    }

    animate();
});

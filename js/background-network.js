// js/background-network.js
document.addEventListener('DOMContentLoaded', () => {
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
        nodeColor: 'rgba(0, 41, 153, 0.5)',
        lineColor: 'rgba(0, 77, 153, 0.2)',
        nodeRadius: 2,
        nodeVelocity: 0.5,
        connectionDistance: 200,
        connectionWidth: 1
    };

    // Node class
    class Node {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * config.nodeVelocity;
            this.vy = (Math.random() - 0.5) * config.nodeVelocity;
        }

        update() {
            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
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

    // Create nodes
    const nodes = Array.from({ length: config.nodeCount }, () => new Node());

    // Draw connections between nodes
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
                    ctx.strokeStyle = `rgba(0, 77, 153, ${opacity * 0.2})`;
                    ctx.lineWidth = config.connectionWidth;
                    ctx.stroke();
                }
            });
        });
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw nodes
        nodes.forEach(node => {
            node.update();
            node.draw();
        });

        // Draw connections
        drawConnections();
        
        requestAnimationFrame(animate);
    }

    animate();
});

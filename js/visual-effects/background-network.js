// background-network.js
document.addEventListener('DOMContentLoaded', () => {
    // Get primary and accent colors from CSS variables
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();

    const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim();

    // Convert colors to rgba format with reduced opacity
    const nodeColor = primaryColor.startsWith('#')
        ? hexToRGBA(primaryColor, 0.12)
        : convertToRGBA(primaryColor, 0.12);

    const lineColor = accentColor.startsWith('#')
        ? hexToRGBA(accentColor, 0.06)
        : convertToRGBA(accentColor, 0.06);

    // Create and setup canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'network-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-5';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

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
        minNodes: 40,
        maxNodes: 120,
        baseDensity: 15000,
        nodeSize: { min: 1, max: 3 },
        nodeSpeed: { min: 0.2, max: 0.8 },
        connectionDistance: 150,
        lineWidth: 0.5
    };

    // Helper functions for color conversion
    function hexToRGBA(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function convertToRGBA(color, alpha) {
        return color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    }

    // Calculate number of nodes based on screen size
    function calculateNodeCount(width, height) {
        const area = width * height;
        const density = config.baseDensity;
        const count = Math.floor(area / density);
        return Math.max(config.minNodes, Math.min(config.maxNodes, count));
    }

    // Node class
    class Node {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * (config.nodeSize.max - config.nodeSize.min) + config.nodeSize.min;
            this.speed = Math.random() * (config.nodeSpeed.max - config.nodeSpeed.min) + config.nodeSpeed.min;
            this.directionX = Math.random() * 2 - 1;
            this.directionY = Math.random() * 2 - 1;
        }

        update(width, height, mouse) {
            // Move node
            this.x += this.directionX * this.speed;
            this.y += this.directionY * this.speed;

            // Bounce off edges
            if (this.x < 0 || this.x > width) {
                this.directionX = -this.directionX;
            }
            if (this.y < 0 || this.y > height) {
                this.directionY = -this.directionY;
            }

            // Mouse interaction
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    // Repel from mouse
                    this.x -= dx * 0.02;
                    this.y -= dy * 0.02;
                }
            }
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = nodeColor;
            ctx.fill();
        }
    }

    // Network class
    class Network {
        constructor() {
            this.canvas = canvas;
            this.ctx = ctx;
            this.nodes = [];
            this.mouse = { x: null, y: null };
            this.lastTime = 0;
            this.fps = 60;
            this.fpsInterval = 1000 / this.fps;
            this.trailOpacity = 0.85; // Increased from 0.4 to make trails disappear much faster
            this.quadTree = null;
            this.lastDrawTime = 0;
            this.frameCount = 0;

            this.init();
            this.animate(0);

            // Event listeners
            window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            window.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            window.addEventListener('resize', () => this.handleResize());
        }

        init() {
            this.createNodes();
        }

        createNodes() {
            const nodeCount = calculateNodeCount(this.canvas.width, this.canvas.height);
            this.nodes = [];

            for (let i = 0; i < nodeCount; i++) {
                this.nodes.push(new Node(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height
                ));
            }
        }

        handleMouseMove(e) {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        }

        handleTouchMove(e) {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        }

        handleResize() {
            resizeCanvas();
            this.createNodes();
        }

        drawConnections() {
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const dx = this.nodes[i].x - this.nodes[j].x;
                    const dy = this.nodes[i].y - this.nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        // Calculate opacity based on distance
                        const opacity = 1 - (distance / config.connectionDistance);
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                        this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                        this.ctx.strokeStyle = lineColor.replace('rgba', 'rgba').replace(/[\d\.]+\)$/, `${opacity * 0.5})`);
                        this.ctx.lineWidth = config.lineWidth;
                        this.ctx.stroke();
                    }
                }
            }
        }

        draw() {
            // Clear canvas with trail effect - using a much higher opacity value to make trails disappear in less than a second
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.trailOpacity})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw connections
            this.drawConnections();

            // Draw nodes
            this.nodes.forEach(node => {
                node.update(this.canvas.width, this.canvas.height, this.mouse);
                node.draw(this.ctx);
            });
        }

        animate(currentTime) {
            requestAnimationFrame((time) => this.animate(time));

            // Throttle to target FPS
            if (currentTime - this.lastTime < this.fpsInterval) return;
            this.lastTime = currentTime;

            this.draw();
        }
    }

    // Initialize network
    new Network();
});

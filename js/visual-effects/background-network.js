// background-network.js
document.addEventListener('DOMContentLoaded', () => {
    // Get primary color from CSS variables
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary')
        .trim();

    // Convert primary color to rgba format for nodes and lines with reduced opacity
    const nodeColor = primaryColor.startsWith('#') 
        ? hexToRGBA(primaryColor, 0.2) // Reduced opacity from 0.5 to 0.2
        : convertToRGBA(primaryColor, 0.2);

    const lineColor = primaryColor.startsWith('#')
        ? hexToRGBA(primaryColor, 0.1) // Reduced opacity from 0.2 to 0.1
        : convertToRGBA(primaryColor, 0.1);

    // Create and setup canvas
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'network-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-5'; // Lower z-index to ensure it's behind all content
    particlesContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Canvas sizing
    function resizeCanvas() {
        const rect = particlesContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Node configuration
    const config = {
        minNodes: 30,  // Reduced from 50 to 30
        maxNodes: 100,  // Reduced from 250 to 100
        baseDensity: 20000,  // Increased from 12000 to 20000 (higher = fewer nodes)
        mobileBreakpoint: 768,
        tabletBreakpoint: 1024,
        performanceMode: false,
        nodeColor: nodeColor,
        lineColor: lineColor,
        nodeRadius: 1.5, // Reduced from 2 to 1.5
        nodeVelocity: 0.2,  // Reduced from 0.3 to 0.2
        connectionDistance: Math.min(150, window.innerWidth / 6), // Reduced from 200 to 150
        connectionWidth: 0.5 // Reduced from 1 to 0.5
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

    class Node {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.baseRadius = Math.random() * 1.5 + 0.5;
            this.radius = this.baseRadius;
            this.targetRadius = this.radius;
            this.originalX = x;
            this.originalY = y;
            this.distortionFactor = 0;
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = (Math.random() - 0.5) * 0.02;
        }

        update(width, height, mouse) {
            // Update angle for circular motion
            this.angle += this.angleSpeed;

            // Mouse interaction
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150; // Increased interaction radius

                if (distance < maxDistance) {
                    // Calculate distortion factor based on distance
                    this.distortionFactor = (maxDistance - distance) / maxDistance;
                    
                    // Create hollow effect by pushing nodes away from exact mouse position
                    const minDistance = 30; // Minimum distance from mouse
                    if (distance < minDistance) {
                        // Push away from mouse
                        const pushFactor = (minDistance - distance) / minDistance;
                        this.x -= (dx / distance) * pushFactor * 5;
                        this.y -= (dy / distance) * pushFactor * 5;
                    } else {
                        // Attract towards mouse in a circular pattern
                        const attractFactor = this.distortionFactor * 0.2;
                        const tangentialFactor = this.distortionFactor * 0.4;
                        
                        // Tangential movement
                        const perpX = -dy / distance;
                        const perpY = dx / distance;
                        
                        this.vx += (dx / distance) * attractFactor + perpX * tangentialFactor;
                        this.vy += (dy / distance) * attractFactor + perpY * tangentialFactor;
                        
                        // Increase radius based on distance
                        this.targetRadius = this.baseRadius + (this.distortionFactor * 2);
                    }
                } else {
                    this.distortionFactor *= 0.95; // Gradually reduce distortion
                    this.targetRadius = this.baseRadius;
                }
            }

            // Smooth radius transition
            this.radius += (this.targetRadius - this.radius) * 0.1;

            // Add circular motion to base movement
            const circularMotion = 0.5;
            this.vx += Math.cos(this.angle) * circularMotion * 0.01;
            this.vy += Math.sin(this.angle) * circularMotion * 0.01;

            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Apply friction
            this.vx *= 0.97;
            this.vy *= 0.97;

            // Bounce off edges with some randomness
            if (this.x < 0 || this.x > width) {
                this.vx *= -1;
                this.vx += (Math.random() - 0.5) * 0.5;
            }
            if (this.y < 0 || this.y > height) {
                this.vy *= -1;
                this.vy += (Math.random() - 0.5) * 0.5;
            }
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            
            // Create a trippy color effect based on distortion
            const alpha = 0.5 + this.distortionFactor * 0.5;
            const green = Math.floor(255 * (0.6 + this.distortionFactor * 0.4));
            ctx.fillStyle = `rgba(0, ${green}, 157, ${alpha})`;
            
            ctx.fill();
        }
    }

    // Performance detection
    function detectPerformance() {
        const fps = 60;
        let frames = 0;
        let startTime = performance.now();

        return new Promise(resolve => {
            function checkFrame() {
                frames++;
                const currentTime = performance.now();
                
                if (currentTime - startTime >= 1000) {
                    const actualFps = frames * 1000 / (currentTime - startTime);
                    resolve(actualFps >= 45); // Consider high performance if can maintain 45+ FPS
                } else {
                    requestAnimationFrame(checkFrame);
                }
            }
            requestAnimationFrame(checkFrame);
        });
    }

    // Calculate optimal number of nodes based on screen size and performance
    function calculateNodeCount(width, height) {
        const area = width * height;
        const baseCount = Math.floor(area / config.baseDensity);
        
        // Adjust density based on screen size
        let densityMultiplier = 1;
        if (width <= config.mobileBreakpoint) {
            densityMultiplier = 1.2; // Slightly more dense on mobile for better effect
        } else if (width <= config.tabletBreakpoint) {
            densityMultiplier = 1.5; // Even more dense on tablet
        } else {
            densityMultiplier = 2; // Most dense on desktop
        }

        // Apply performance mode adjustments
        if (config.performanceMode) {
            densityMultiplier *= 1.5; // 50% more nodes for high-performance devices
        }

        // Ensure count stays within bounds
        return Math.min(
            Math.max(
                Math.floor(baseCount * densityMultiplier),
                config.minNodes
            ),
            config.maxNodes
        );
    }

    class NetworkBackground {
        constructor() {
            this.canvas = document.getElementById('network-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.nodes = [];
            this.mouse = { x: null, y: null };
            this.lastTime = 0;
            this.fps = 60;
            this.fpsInterval = 1000 / this.fps;
            this.trailOpacity = 0.1;
            this.quadTree = null;
            this.lastDrawTime = 0;
            this.frameCount = 0;

            // Initialize with performance detection
            detectPerformance().then(isHighPerformance => {
                config.performanceMode = isHighPerformance;
                this.init();
                this.bindEvents();
                this.animate();
            });
        }

        init() {
            this.resize();
            this.createNodes();
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            window.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            window.addEventListener('touchend', () => this.handleTouchEnd());
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
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
            if (e.touches[0]) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        }

        handleTouchEnd() {
            this.mouse.x = null;
            this.mouse.y = null;
        }

        drawConnections() {
            this.ctx.beginPath();
            
            // Batch similar colors for better performance
            const connections = [];
            
            for (let i = 0; i < this.nodes.length; i++) {
                const nodeA = this.nodes[i];
                
                // Only check nearby nodes for connections
                const nearbyNodes = this.nodes.filter(nodeB => {
                    if (nodeB === nodeA) return false;
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    return dx * dx + dy * dy < 10000; // 100 * 100 for performance
                });
                
                for (const nodeB of nearbyNodes) {
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        const opacity = (1 - distance / 100) * 0.15;
                        const distortionFactor = Math.max(nodeA.distortionFactor, nodeB.distortionFactor);
                        const green = Math.floor(255 * (0.6 + distortionFactor * 0.4));
                        
                        connections.push({
                            startX: nodeA.x,
                            startY: nodeA.y,
                            endX: nodeB.x,
                            endY: nodeB.y,
                            style: `rgba(0, ${green}, 157, ${opacity})`
                        });
                    }
                }
            }
            
            // Batch render connections grouped by color
            const groupedConnections = connections.reduce((acc, conn) => {
                if (!acc[conn.style]) acc[conn.style] = [];
                acc[conn.style].push(conn);
                return acc;
            }, {});
            
            Object.entries(groupedConnections).forEach(([style, conns]) => {
                this.ctx.strokeStyle = style;
                this.ctx.beginPath();
                conns.forEach(conn => {
                    this.ctx.moveTo(conn.startX, conn.startY);
                    this.ctx.lineTo(conn.endX, conn.endY);
                });
                this.ctx.stroke();
            });
        }

        draw() {
            // Clear canvas with trail effect
            this.ctx.fillStyle = `rgba(10, 10, 10, ${this.trailOpacity})`;
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

    // Initialize when DOM is loaded
    new NetworkBackground();
});

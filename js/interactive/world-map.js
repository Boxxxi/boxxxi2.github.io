/**
 * World Map Interactive Visualization
 * Displays visited countries with different colors based on frequency of visits
 * Uses D3.js for better map rendering
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('World map script loaded and executing');
    // Check if the map container exists (only proceed if we're on the right tab)
    const mapContainer = document.getElementById('world-map');
    if (!mapContainer) {
        console.log('Map container not found in DOM');
        return;
    }

    // Check if D3 is available
    if (typeof d3 === 'undefined') {
        console.error('D3.js is required for the world map to work');
        mapContainer.innerHTML = '<text x="50%" y="50%" text-anchor="middle">Map libraries not loaded. Please refresh the page.</text>';
        return;
    }
    
    console.log('Loading SVG map from assets/maps/world-map-detailed.svg');
    // Load the world map data using D3
    d3.xml('assets/maps/world-map-detailed.svg')
        .then(data => {
            // Clear any existing content
            mapContainer.innerHTML = '';
            
            // Append the SVG document to the container
            const importedNode = document.importNode(data.documentElement, true);
            mapContainer.appendChild(importedNode);
            
            // Initialize the map functionality
            initializeMap();
            console.log('Map initialized successfully');
        })
        .catch(error => {
            console.error('Error loading the world map:', error);
            mapContainer.innerHTML = '<text x="50%" y="50%" text-anchor="middle">Map loading failed. Please try again later.</text>';
        });

    // Also listen for the sectionsLoaded event
    document.addEventListener('sectionsLoaded', function() {
        console.log('Sections loaded event received in world-map.js');
        setTimeout(() => {
            const mapContainer = document.getElementById('world-map');
            if (mapContainer) {
                console.log('Map container found after sections loaded');
                // If the map hasn't been initialized yet, try again
                if (mapContainer.children.length === 0 || !mapContainer.querySelector('svg')) {
                    console.log('Reinitializing map after sections loaded');
                    d3.xml('assets/maps/world-map-detailed.svg')
                        .then(data => {
                            mapContainer.innerHTML = '';
                            const importedNode = document.importNode(data.documentElement, true);
                            mapContainer.appendChild(importedNode);
                            initializeMap();
                            console.log('Map reinitialized successfully');
                        })
                        .catch(error => {
                            console.error('Error loading the world map after sections loaded:', error);
                        });
                }
            } else {
                console.log('Map container still not found after sections loaded');
            }
        }, 500);
    });

    // Listen for tab clicks to initialize the map when the travel tab is clicked
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('tab-btn') && event.target.getAttribute('data-tab') === 'travel') {
            console.log('Travel tab clicked');
            setTimeout(() => {
                const mapContainer = document.getElementById('world-map');
                if (mapContainer) {
                    console.log('Map container found after travel tab click');
                    // If the map hasn't been initialized yet, try again
                    if (mapContainer.children.length === 0 || !mapContainer.querySelector('svg')) {
                        console.log('Initializing map after travel tab click');
                        d3.xml('assets/maps/world-map-detailed.svg')
                            .then(data => {
                                mapContainer.innerHTML = '';
                                const importedNode = document.importNode(data.documentElement, true);
                                mapContainer.appendChild(importedNode);
                                initializeMap();
                                console.log('Map initialized successfully after tab click');
                            })
                            .catch(error => {
                                console.error('Error loading the world map after tab click:', error);
                            });
                    } else {
                        console.log('Map already initialized, triggering resize');
                        window.dispatchEvent(new Event('resize'));
                    }
                } else {
                    console.log('Map container not found after travel tab click');
                }
            }, 300);
        }
    });

    // Listen for the custom initializeMap event
    document.addEventListener('initializeMap', function() {
        console.log('Custom initializeMap event received');
        const mapContainer = document.getElementById('world-map');
        if (mapContainer) {
            console.log('Map container found after initializeMap event');
            // Initialize the map
            d3.xml('assets/maps/world-map-detailed.svg')
                .then(data => {
                    mapContainer.innerHTML = '';
                    const importedNode = document.importNode(data.documentElement, true);
                    mapContainer.appendChild(importedNode);
                    initializeMap();
                    console.log('Map initialized successfully after initializeMap event');
                })
                .catch(error => {
                    console.error('Error loading the world map after initializeMap event:', error);
                });
        } else {
            console.log('Map container not found after initializeMap event');
        }
    });

    function initializeMap() {
        // Countries data - customize with your own travel history
        // Format: country code -> { visits: number, notes: string }
        const visitedCountries = {
            // Frequently visited (3+ times)
            'US': { visits: 5, notes: 'Multiple visits to New York, California, and Texas' },
            'IN': { visits: 10, notes: 'Home country with visits to Delhi, Mumbai, and Bangalore' },
            
            // Multiple visits (2 times)
            'GB': { visits: 2, notes: 'London and Edinburgh' },
            'SG': { visits: 2, notes: 'Singapore for work and leisure' },
            'AE': { visits: 2, notes: 'Dubai and Abu Dhabi' },
            
            // Visited once
            'FR': { visits: 1, notes: 'Paris' },
            'IT': { visits: 1, notes: 'Rome and Venice' },
            'JP': { visits: 1, notes: 'Tokyo and Kyoto' },
            'TH': { visits: 1, notes: 'Bangkok and Phuket' },
            'DE': { visits: 1, notes: 'Berlin' },
            'ES': { visits: 1, notes: 'Barcelona' },
            'CA': { visits: 1, notes: 'Toronto' }
        };

        // Add event listeners and color the countries
        setTimeout(() => {
            const countries = document.querySelectorAll('#world-map path');
            
            countries.forEach(country => {
                const countryCode = country.id || country.getAttribute('data-id');
                
                if (visitedCountries[countryCode]) {
                    const visits = visitedCountries[countryCode].visits;
                    
                    // Apply color based on number of visits
                    if (visits >= 3) {
                        country.classList.add('visited-many');
                    } else if (visits === 2) {
                        country.classList.add('visited-some');
                    } else {
                        country.classList.add('visited-once');
                    }
                    
                    // Add tooltip functionality
                    country.addEventListener('mouseenter', (e) => showTooltip(e, countryCode, visitedCountries[countryCode]));
                    country.addEventListener('mouseleave', hideTooltip);
                }
            });
            
            // Setup zoom and pan functionality
            setupMapInteraction();
        }, 500); // Small delay to ensure SVG is fully loaded
    }

    // Tooltip functions
    function showTooltip(event, countryCode, data) {
        const tooltip = document.getElementById('map-tooltip');
        const countryName = getCountryName(countryCode);
        
        tooltip.innerHTML = `
            <strong>${countryName}</strong><br>
            Visits: ${data.visits}<br>
            ${data.notes}
        `;
        
        // Position the tooltip near the mouse
        const mapRect = document.querySelector('.world-map').getBoundingClientRect();
        tooltip.style.left = (event.clientX - mapRect.left + 10) + 'px';
        tooltip.style.top = (event.clientY - mapRect.top + 10) + 'px';
        tooltip.style.display = 'block';
    }

    function hideTooltip() {
        const tooltip = document.getElementById('map-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    // Map zoom and pan functionality
    function setupMapInteraction() {
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let startX, startY;
        
        // Reset map button
        const resetButton = document.getElementById('reset-map');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                scale = 1;
                translateX = 0;
                translateY = 0;
                updateMapTransform();
            });
        }
        
        // Map container for mouse events
        const mapContainer = document.querySelector('.world-map');
        if (!mapContainer) return;
        
        // Mouse wheel zoom
        mapContainer.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newScale = Math.max(0.5, Math.min(5, scale + delta));
            
            // Zoom centered on mouse position
            const rect = mapContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Adjust translation to zoom toward mouse position
            if (newScale !== scale) {
                const scaleRatio = newScale / scale;
                translateX = mouseX - (mouseX - translateX) * scaleRatio;
                translateY = mouseY - (mouseY - translateY) * scaleRatio;
                scale = newScale;
                updateMapTransform();
            }
        });
        
        // Mouse drag for panning
        mapContainer.addEventListener('mousedown', function(e) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            mapContainer.style.cursor = 'grabbing';
        });
        
        window.addEventListener('mousemove', function(e) {
            if (isDragging) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                updateMapTransform();
            }
        });
        
        window.addEventListener('mouseup', function() {
            isDragging = false;
            mapContainer.style.cursor = 'grab';
        });
        
        // Touch events for mobile
        mapContainer.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
            }
        });
        
        mapContainer.addEventListener('touchmove', function(e) {
            if (isDragging && e.touches.length === 1) {
                translateX = e.touches[0].clientX - startX;
                translateY = e.touches[0].clientY - startY;
                updateMapTransform();
            }
        });
        
        mapContainer.addEventListener('touchend', function() {
            isDragging = false;
        });
        
        // Update SVG transform
        function updateMapTransform() {
            const svg = document.querySelector('#world-map > svg');
            if (svg) {
                svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
                svg.style.transformOrigin = '0 0';
            }
        }
        
        // Initialize cursor style
        mapContainer.style.cursor = 'grab';
    }

    // Helper function to get country name from code
    function getCountryName(countryCode) {
        const countryNames = {
            'US': 'United States',
            'IN': 'India',
            'GB': 'United Kingdom',
            'SG': 'Singapore',
            'AE': 'United Arab Emirates',
            'FR': 'France',
            'IT': 'Italy',
            'JP': 'Japan',
            'TH': 'Thailand',
            'DE': 'Germany',
            'ES': 'Spain',
            'CA': 'Canada'
            // Add more as needed
        };
        
        return countryNames[countryCode] || countryCode;
    }
}); 
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('world-map');
    let mapInitialized = false;

    // Define visited cities with their coordinates and frequency
    const visitedCities = {
        // 'New York': { 
        //     lat: 40.7128, 
        //     lng: -74.0060, 
        //     frequency: 2,
        //     country: 'United States'
        // },
        // 'London': { 
        //     lat: 51.5074, 
        //     lng: -0.1278, 
        //     frequency: 1,
        //     country: 'United Kingdom'
        // },
        // 'Tokyo': { 
        //     lat: 35.6762, 
        //     lng: 139.6503, 
        //     frequency: 2,
        //     country: 'Japan'
        // },
        'Mumbai': { 
            lat: 19.0760, 
            lng: 72.8777, 
            frequency: 3,
            country: 'India'
        }
    };

    // Function to initialize map
    function initializeMap() {
        if (mapInitialized) return;
        
        fetch('assets/maps/world-map-detailed.svg')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(svgContent => {
                console.log('SVG content loaded'); // Debug log
                mapContainer.innerHTML = svgContent;
                addCityMarkers();
                attachMapEvents();
                mapInitialized = true;
            })
            .catch(error => {
                console.error('Error loading map:', error);
                mapContainer.innerHTML = '<div class="map-error">Error loading map</div>';
            });
    }

    function addCityMarkers() {
        const svg = document.querySelector('#world-map');
        if (!svg) {
            console.error('SVG element not found');
            return;
        }

        const svgNS = "http://www.w3.org/2000/svg";
        
        // Get SVG viewport dimensions
        const viewBox = svg.viewBox.baseVal;
        const svgWidth = viewBox.width;
        const svgHeight = viewBox.height;

        // Create a group for city markers
        const markerGroup = document.createElementNS(svgNS, "g");
        markerGroup.setAttribute("class", "city-markers");
        svg.appendChild(markerGroup);

        // Add markers for each city
        Object.entries(visitedCities).forEach(([cityName, data]) => {
            // Convert lat/lng to SVG coordinates
            const x = ((data.lng + 180) * (svgWidth / 360)) * (1652.47 / 360); // Adjust for Mercator width

            const latRad = data.lat * Math.PI / 180;
            const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
            const y = (1 - (mercN / Math.PI)) * (1220.64 / 2); // Adjust for Mercator height


            // Create marker group
            const cityGroup = document.createElementNS(svgNS, "g");
            cityGroup.setAttribute("class", "city-marker");
            cityGroup.setAttribute("transform", `translate(${x}, ${y})`);

            // Create pulse animation
            const pulse = document.createElementNS(svgNS, "circle");
            pulse.setAttribute("class", `city-pulse frequency-${data.frequency}`);
            pulse.setAttribute("r", "5");

            // Create city dot
            const dot = document.createElementNS(svgNS, "circle");
            dot.setAttribute("class", `city-dot frequency-${data.frequency}`);
            dot.setAttribute("r", "3");

            // Add tooltip functionality
            cityGroup.addEventListener('mouseover', (e) => {
                const tooltip = document.getElementById('map-tooltip');
                if (tooltip) {
                    tooltip.style.display = 'block';
                    tooltip.innerHTML = `${cityName}<br>${data.country}`;
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY + 10}px`;
                }
            });

            cityGroup.addEventListener('mouseleave', () => {
                const tooltip = document.getElementById('map-tooltip');
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
            });

            cityGroup.appendChild(pulse);
            cityGroup.appendChild(dot);
            markerGroup.appendChild(cityGroup);
        });
    }

    function attachMapEvents() {
        // Initialize zoom and pan variables
        let currentScale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let startX, startY;

        // Zoom Controls
        document.getElementById('zoom-in')?.addEventListener('click', () => adjustZoom(1.2));
        document.getElementById('zoom-out')?.addEventListener('click', () => adjustZoom(0.8));
        document.getElementById('reset-map')?.addEventListener('click', resetMap);

        function adjustZoom(factor) {
            currentScale *= factor;
            currentScale = Math.min(Math.max(currentScale, 0.5), 4);
            updateMapTransform();
        }

        function updateMapTransform() {
            if (mapContainer) {
                mapContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
            }
        }

        function resetMap() {
            currentScale = 1;
            translateX = 0;
            translateY = 0;
            updateMapTransform();
        }

        // Add mouse wheel zoom support
        mapContainer?.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.1 : 0.9;
            adjustZoom(factor);
        });

        // Pan functionality
        mapContainer?.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            if (mapContainer) mapContainer.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateMapTransform();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (mapContainer) mapContainer.style.cursor = 'grab';
        });
    }

    // Initialize map when travel tab is clicked
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (button.getAttribute('data-tab') === 'travel') {
                setTimeout(() => {
                    initializeMap();
                    window.dispatchEvent(new Event('resize'));
                }, 100);
            }
        });
    });

    // If travel tab is active by default, initialize map
    if (document.querySelector('#travel')?.classList.contains('active')) {
        initializeMap();
    }
});

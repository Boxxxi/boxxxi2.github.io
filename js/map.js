document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('world-map');

    // Define visited cities with their coordinates and frequency
    const visitedCities = {
        'New York': { 
            lat: 40.7128, 
            lng: -74.0060, 
            frequency: 2,
            country: 'United States'
        },
        'London': { 
            lat: 51.5074, 
            lng: -0.1278, 
            frequency: 1,
            country: 'United Kingdom'
        },
        'Tokyo': { 
            lat: 35.6762, 
            lng: 139.6503, 
            frequency: 2,
            country: 'Japan'
        },
        'Mumbai': { 
            lat: 19.0760, 
            lng: 72.8777, 
            frequency: 3,
            country: 'India'
        },
        // Add more cities as needed
    };

    fetch('assets/world-map-detailed.svg')
        .then(response => response.text())
        .then(svgContent => {
            mapContainer.innerHTML = svgContent;
            addCityMarkers();
            attachMapEvents();
        })
        .catch(error => console.error('Error loading map:', error));

    function addCityMarkers() {
        const svg = document.querySelector('#world-map');
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
            // Adjusted latitude calculation to fix the positioning
            const x = (data.lng + 180) * (svgWidth / 360);
            const y = svgHeight - ((data.lat + 25) * (svgHeight / 180));

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
                tooltip.style.display = 'block';
                tooltip.innerHTML = `${cityName}<br>${data.country}`;
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
            });

            cityGroup.addEventListener('mouseleave', () => {
                document.getElementById('map-tooltip').style.display = 'none';
            });

            cityGroup.appendChild(pulse);
            cityGroup.appendChild(dot);
            markerGroup.appendChild(cityGroup);
        });
    }
});

// Zoom Controls
let currentScale = 1;
let translateX = 0;
let translateY = 0;

document.getElementById('zoom-in')?.addEventListener('click', () => adjustZoom(1.2));
document.getElementById('zoom-out')?.addEventListener('click', () => adjustZoom(0.8));

function adjustZoom(factor) {
    const map = document.getElementById('world-map');
    currentScale *= factor;
    // Limit zoom levels
    currentScale = Math.min(Math.max(currentScale, 0.5), 4);
    updateMapTransform();
}

function updateMapTransform() {
    const map = document.getElementById('world-map');
    map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
}

// Add mouse wheel zoom support
document.getElementById('world-map')?.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    adjustZoom(factor);
});

// Pan functionality
let isDragging = false;
let startX, startY;

document.getElementById('world-map')?.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    e.target.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateMapTransform();
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    const map = document.getElementById('world-map');
    if (map) map.style.cursor = 'grab';
});

// Reset map position and zoom
document.getElementById('reset-map')?.addEventListener('click', () => {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    updateMapTransform();
});

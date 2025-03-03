/**
 * World Map Interactive Visualization
 * Displays visited countries with different colors based on frequency of visits
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load the SVG map
    fetch('assets/maps/world-map-detailed.svg')
        .then(response => response.text())
        .then(svgData => {
            document.getElementById('world-map').innerHTML = svgData;
            initializeMap();
        })
        .catch(error => {
            console.error('Error loading the world map:', error);
            document.getElementById('world-map').innerHTML = '<text x="50%" y="50%" text-anchor="middle">Map loading failed. Please try again later.</text>';
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
        document.getElementById('map-tooltip').style.display = 'none';
    }

    // Map zoom and pan functionality
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    
    // Reset map button
    document.getElementById('reset-map').addEventListener('click', function() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateMapTransform();
    });

    // Update map transform
    function updateMapTransform() {
        const mapSvg = document.getElementById('world-map');
        mapSvg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    // Helper function to get country name from country code
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
/**
 * Initialize Tabs Functionality
 * This script is loaded after all sections are loaded to ensure tabs work properly
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for sections to be loaded
    const checkTabsExist = setInterval(() => {
        const tabButtons = document.querySelectorAll('.tab-btn');
        if (tabButtons.length > 0) {
            clearInterval(checkTabsExist);
            initTabsFunctionality();
        }
    }, 100);

    // Listen for the sectionsLoaded event
    document.addEventListener('sectionsLoaded', () => {
        console.log('Sections loaded event received');
        setTimeout(() => {
            initTabsFunctionality();
            initExperienceDial();
        }, 200);
    });

    function initTabsFunctionality() {
        console.log('Initializing tabs functionality');
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        const tabButtonsContainer = document.querySelector('.tab-buttons');
        
        // If tabs are already initialized, don't do it again
        if (tabButtons.length === 0 || tabButtons[0].hasAttribute('data-initialized')) {
            return;
        }
        
        // Mark tabs as initialized
        tabButtons.forEach(btn => btn.setAttribute('data-initialized', 'true'));
        
        // Initialize the tab indicator
        function updateTabIndicator(activeButton) {
            if (!tabButtonsContainer) return;
            
            const indicator = tabButtonsContainer.querySelector('.tab-indicator');
            
            if (!indicator) {
                // Create the indicator if it doesn't exist
                const newIndicator = document.createElement('span');
                newIndicator.classList.add('tab-indicator');
                tabButtonsContainer.appendChild(newIndicator);
            }
            
            if (activeButton) {
                const buttonRect = activeButton.getBoundingClientRect();
                const containerRect = tabButtonsContainer.getBoundingClientRect();
                
                const indicatorWidth = buttonRect.width;
                const indicatorLeft = buttonRect.left - containerRect.left;
                
                // Apply the position and width to the ::after pseudo-element
                tabButtonsContainer.style.setProperty('--indicator-width', `${indicatorWidth}px`);
                tabButtonsContainer.style.setProperty('--indicator-left', `${indicatorLeft}px`);
            }
        }

        function switchTab(tabId) {
            console.log(`Switching to tab: ${tabId}`);
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
            const activePane = document.getElementById(tabId);
            
            activeButton?.classList.add('active');
            activePane?.classList.add('active');
            
            // Update the tab indicator
            updateTabIndicator(activeButton);

            // Handle specific tab content
            if (tabId === 'travel') {
                console.log('Travel tab activated in init-tabs.js');
                // Trigger resize event for map
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                    
                    // Check if the map needs initialization
                    const mapContainer = document.getElementById('world-map');
                    if (mapContainer && (mapContainer.children.length === 0 || !mapContainer.querySelector('svg > path'))) {
                        console.log('Map needs initialization from init-tabs.js');
                        // Create and dispatch a custom event to trigger map initialization
                        document.dispatchEvent(new CustomEvent('initializeMap'));
                    }
                }, 100);
            } else if (tabId === 'concerts') {
                // Animate timeline items
                animateTimelineItems();
            }
        }
        
        // Function to animate timeline items
        function animateTimelineItems() {
            const timelineItems = document.querySelectorAll('.timeline2-item');
            
            timelineItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('visible');
                }, 150 * index); // Stagger the animations
            });
        }

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = button.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
        
        // Initialize the first tab
        const initialTabId = tabButtons[0]?.getAttribute('data-tab');
        if (initialTabId) {
            switchTab(initialTabId);
        }
        
        // Add CSS for the indicator
        const style = document.createElement('style');
        style.textContent = `
            .tab-buttons::after {
                width: var(--indicator-width, 0);
                left: var(--indicator-left, 0);
            }
        `;
        document.head.appendChild(style);
        
        // Handle gallery navigation
        setupGalleryNavigation();
    }

    // Function to update main image in galleries
    window.updateMainImage = function(element, featuredId) {
        const featuredImage = document.getElementById(featuredId);
        if (!featuredImage) return;
        
        const newSrc = element.querySelector('img')?.src;
        
        if (featuredImage && newSrc) {
            // Add exit animation class
            featuredImage.classList.add('exiting');
            
            // After animation completes, update the image and add entrance animation
            setTimeout(() => {
                featuredImage.src = newSrc;
                featuredImage.classList.remove('exiting');
                featuredImage.classList.add('entering');
                
                // Remove the entrance animation class after it completes
                setTimeout(() => {
                    featuredImage.classList.remove('entering');
                }, 500);
            }, 300);
            
            // Update active state on gallery items
            const galleryItems = document.querySelectorAll('.gallery-item');
            galleryItems.forEach(item => item.classList.remove('active'));
            element.classList.add('active');
        }
    }

    // Function to set up gallery navigation
    function setupGalleryNavigation() {
        const galleryContainers = document.querySelectorAll('.gallery-container');
        
        galleryContainers.forEach(container => {
            const track = container.querySelector('.gallery-track');
            if (!track) return;
            
            // Add navigation buttons if they don't exist
            if (!container.querySelector('.gallery-nav')) {
                const prevButton = document.createElement('button');
                prevButton.classList.add('gallery-nav', 'prev');
                prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
                
                const nextButton = document.createElement('button');
                nextButton.classList.add('gallery-nav', 'next');
                nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
                
                container.querySelector('.gallery-main').appendChild(prevButton);
                container.querySelector('.gallery-main').appendChild(nextButton);
                
                // Add event listeners
                prevButton.addEventListener('click', () => {
                    track.scrollBy({ left: -300, behavior: 'smooth' });
                });
                
                nextButton.addEventListener('click', () => {
                    track.scrollBy({ left: 300, behavior: 'smooth' });
                });
            }
        });
    }

    // Initialize the experience dial
    function initExperienceDial() {
        console.log('Initializing experience dial');
        // Check if the experience section exists
        const experienceSection = document.getElementById('experience');
        if (!experienceSection) return;

        // Check if ExperienceDial is already defined
        if (typeof ExperienceDial === 'undefined') {
            // Load the experience-dial.js script
            const script = document.createElement('script');
            script.src = 'js/interactive/experience-dial.js';
            script.onload = () => {
                console.log('Experience dial script loaded');
                // Initialize the experience dial after the script is loaded
                setTimeout(() => {
                    if (typeof ExperienceDial !== 'undefined') {
                        new ExperienceDial();
                    }
                }, 100);
            };
            document.body.appendChild(script);
        } else {
            // ExperienceDial is already defined, initialize it
            new ExperienceDial();
        }
    }
}); 
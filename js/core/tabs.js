document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const tabButtonsContainer = document.querySelector('.tab-buttons');
   
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
            // Trigger resize event for map
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
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
        button.addEventListener('click', () => {
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
});

// Function to update main image in galleries
function updateMainImage(element, featuredId) {
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

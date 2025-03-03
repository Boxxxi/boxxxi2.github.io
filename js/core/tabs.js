document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function switchTab(tabId) {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Add active class to clicked button and corresponding pane
        const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
        const activePane = document.getElementById(tabId);
        
        activeButton?.classList.add('active');
        activePane?.classList.add('active');

        // Trigger resize event when switching to travel tab
        if (tabId === 'travel') {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
});

// Function to update main image in galleries
function updateMainImage(element, featuredId) {
    const featuredImage = document.getElementById(featuredId);
    const newSrc = element.querySelector('img').src;
    const newCaption = element.querySelector('.image-caption').textContent;
    
    featuredImage.src = newSrc;
    featuredImage.nextElementSibling.textContent = newCaption;
}

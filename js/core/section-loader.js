/**
 * Section Loader
 * Dynamically loads section content from separate HTML files
 */

document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content-container');
    
    // Sections to load in order
    const sections = [
        'home',
        'about',
        'experience',
        'projects',
        'extras',
        'contact'
    ];
    
    // Load each section
    const loadSections = async () => {
        for (const section of sections) {
            try {
                const response = await fetch(`sections/${section}.html`);
                if (!response.ok) {
                    console.error(`Failed to load section: ${section}`);
                    continue;
                }
                
                const html = await response.text();
                
                // Create a temporary container to hold the section content
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = html;
                
                // Extract only the section element from the HTML file
                // This ignores DOCTYPE, html, head, and body tags
                const sectionElement = tempContainer.querySelector('section');
                
                if (!sectionElement) {
                    console.error(`No section element found in ${section}.html`);
                    continue;
                }
                
                // Extract scripts before appending to DOM
                const scripts = Array.from(sectionElement.querySelectorAll('script'));
                
                // Remove scripts from the sectionElement to prevent them from being appended directly
                scripts.forEach(script => {
                    script.parentNode.removeChild(script);
                });
                
                // Append the section content to the content container
                contentContainer.appendChild(sectionElement);
                
                console.log(`Loaded section: ${section}`);
                
                // Execute scripts after the content is in the DOM
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    
                    // Copy all attributes from the original script
                    Array.from(script.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                    
                    if (script.src) {
                        // For external scripts
                        newScript.src = script.src;
                        newScript.onload = () => {
                            console.log(`Loaded script: ${script.src}`);
                        };
                    } else {
                        // For inline scripts
                        newScript.textContent = script.textContent;
                    }
                    
                    // Append the new script to the document
                    document.body.appendChild(newScript);
                });
                
            } catch (error) {
                console.error(`Error loading section ${section}:`, error);
            }
        }
        
        // After all sections are loaded, initialize the intersection observer for animations
        initIntersectionObserver();
        
        // Dispatch an event to notify that all sections are loaded
        document.dispatchEvent(new CustomEvent('sectionsLoaded'));
        console.log('All sections loaded');
    };
    
    // Initialize intersection observer for scroll animations
    const initIntersectionObserver = () => {
        const sections = document.querySelectorAll('.section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    };
    
    // Initialize tabs functionality
    const initTabsFunctionality = () => {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked button and corresponding pane
                button.classList.add('active');
                document.getElementById(tabId)?.classList.add('active');
            });
        });
        
        // Activate the first tab by default
        if (tabButtons.length > 0) {
            const firstTabId = tabButtons[0].getAttribute('data-tab');
            document.getElementById(firstTabId)?.classList.add('active');
            tabButtons[0].classList.add('active');
        }
    };
    
    // Start loading sections
    loadSections();
}); 
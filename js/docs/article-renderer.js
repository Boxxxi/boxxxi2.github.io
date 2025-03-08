/**
 * Article Renderer
 * Renders Markdown articles with syntax highlighting
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on an article page
    const articlePath = getArticlePathFromUrl();
    if (articlePath) {
        loadAndRenderArticle(articlePath);
    }
    
    // Setup TOC toggle functionality
    setupTocToggle();
});

/**
 * Extract article path from URL query parameter
 */
function getArticlePathFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('article');
}

/**
 * Setup table of contents toggle functionality
 */
function setupTocToggle() {
    const tocContainer = document.querySelector('.toc-container');
    if (!tocContainer) return;
    
    const tocHeading = tocContainer.querySelector('h3');
    if (!tocHeading) return;
    
    // Check if TOC should be collapsed by default on mobile
    if (window.innerWidth <= 768) {
        tocContainer.classList.add('collapsed');
    }
    
    // Toggle TOC visibility when heading is clicked
    tocHeading.addEventListener('click', () => {
        tocContainer.classList.toggle('collapsed');
    });
}

/**
 * Load and render the article
 */
async function loadAndRenderArticle(articlePath) {
    try {
        // Fetch the article content
        const response = await fetch(articlePath);
        if (!response.ok) {
            throw new Error(`Failed to load article: ${articlePath}`);
        }
        
        const markdown = await response.text();
        
        // Get the article container
        const articleContainer = document.getElementById('article-container');
        if (!articleContainer) {
            throw new Error('Article container not found');
        }
        
        // Configure marked options for better rendering
        marked.setOptions({
            gfm: true, // GitHub Flavored Markdown
            breaks: true, // Convert line breaks to <br>
            headerIds: true, // Add IDs to headers
            mangle: false, // Don't escape HTML
            tables: true, // Enable tables
            smartLists: true, // Use smarter list behavior
            highlight: function(code, lang) {
                // Use Prism for syntax highlighting if available
                if (Prism && Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            }
        });
        
        // Render the markdown content
        articleContainer.innerHTML = marked.parse(markdown);
        
        // Apply syntax highlighting to code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            Prism.highlightElement(block);
        });
        
        // Set the page title based on the first h1 heading
        const heading = articleContainer.querySelector('h1');
        if (heading) {
            document.title = heading.textContent + ' - Abhishek Bakshi';
            
            // Also update the document description meta tag
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.content = `${heading.textContent} - Abhishek Bakshi's Technical Article`;
            }
        }
        
        // Add classes to elements for styling
        styleArticleElements();
        
        // Make tables responsive
        makeTablesResponsive();
        
        // Initialize intersection observer for animations
        initIntersectionObserver();
        
        // Remove loading spinner
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.remove();
        }
        
        // Generate table of contents after content is loaded
        setTimeout(generateTableOfContents, 300);
        
    } catch (error) {
        console.error('Error rendering article:', error);
        document.getElementById('article-container').innerHTML = `
            <div class="error-message glass">
                <h2>Error Loading Article</h2>
                <p>${error.message}</p>
                <a href="index.html" class="btn btn-primary">Return to Home</a>
            </div>
        `;
    }
}

/**
 * Generate table of contents from headings
 */
function generateTableOfContents() {
    const headings = document.querySelectorAll('#article-container h2, #article-container h3');
    const toc = document.getElementById('toc');
    
    if (headings.length === 0 || !toc) return;
    
    const tocList = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        // Create an ID for the heading if it doesn't have one
        if (!heading.id) {
            heading.id = 'heading-' + index;
        }
        
        const listItem = document.createElement('li');
        listItem.className = heading.tagName.toLowerCase();
        
        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        
        // Close TOC when a link is clicked on mobile
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.querySelector('.toc-container')?.classList.add('collapsed');
            }
        });
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    
    toc.appendChild(tocList);
}

/**
 * Apply styling classes to article elements
 */
function styleArticleElements() {
    // Add glass effect to code blocks
    document.querySelectorAll('pre').forEach(pre => {
        pre.classList.add('glass');
    });
    
    // Add glass effect to blockquotes
    document.querySelectorAll('blockquote').forEach(quote => {
        quote.classList.add('glass');
    });
    
    // Add glass effect to tables
    document.querySelectorAll('table').forEach(table => {
        table.classList.add('glass');
        table.classList.add('styled-table');
    });
    
    // Add animation to headings
    document.querySelectorAll('h2, h3, h4').forEach(heading => {
        heading.classList.add('animate-on-scroll');
    });
}

/**
 * Make tables responsive
 */
function makeTablesResponsive() {
    document.querySelectorAll('table').forEach(table => {
        // Wrap table in a container for horizontal scrolling if needed
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}

/**
 * Initialize intersection observer for animations
 */
function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
} 
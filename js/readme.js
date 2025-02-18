document.addEventListener('DOMContentLoaded', () => {
    const username = 'Boxxxi'; // Your GitHub username
    const readmeContainer = document.getElementById('readme-content');

    async function fetchReadme() {
        try {
            console.log('Fetching README for:', username);
            
            // Use the correct case for both username and repository name
            const response = await fetch(`https://api.github.com/repos/Boxxxi/Boxxxi/readme`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`Failed to fetch README: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error in fetchReadme:', error);
            throw error;
        }
    }

    async function convertMarkdownToHtml(markdown) {
        try {
            if (window.marked) {
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    headerIds: true,
                    sanitize: false,
                    mangle: false,
                    headerPrefix: 'github-',
                    renderer: new marked.Renderer()
                });
                return marked(markdown);
            }
            return markdown;
        } catch (error) {
            console.error('Error converting markdown:', error);
            throw error;
        }
    }

    async function displayReadme() {
        try {
            // Show loading state
            readmeContainer.innerHTML = `
                <div class="readme-loading">
                    <div class="loader"></div>
                    <p>Loading README...</p>
                </div>`;

            // Fetch README data
            const data = await fetchReadme();
            
            // Decode content from base64
            const content = atob(data.content);
            console.log('README content fetched successfully');

            // Convert to HTML
            const html = await convertMarkdownToHtml(content);
            
            // Update container
            readmeContainer.innerHTML = `
                <div class="readme-content">
                    ${html}
                </div>`;

            // Initialize syntax highlighting
            if (window.Prism) {
                Prism.highlightAllUnder(readmeContainer);
            }

        } catch (error) {
            console.error('Failed to load README:', error);
            readmeContainer.innerHTML = `
                <div class="readme-error glass">
                    <h3>README Not Found</h3>
                    <p>I haven't created a profile README yet. Meanwhile, you can visit my 
                    <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer">GitHub profile</a> directly.</p>
                </div>`;
        }
    }

    // Add some CSS for the loading state
    const style = document.createElement('style');
    style.textContent = `
        .readme-loading {
            text-align: center;
            padding: 2rem;
        }
        .loader {
            border: 3px solid rgba(255,255,255,0.1);
            border-radius: 50%;
            border-top: 3px solid var(--primary);
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .readme-error {
            text-align: center;
            padding: 2rem;
            border-radius: 10px;
        }
        .readme-error h3 {
            color: var(--primary);
            margin-bottom: 1rem;
        }
    `;
    document.head.appendChild(style);

    // Start the process
    displayReadme();
});

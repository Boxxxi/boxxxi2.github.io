document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navContent = document.querySelector('.nav-links');
    const externalLinks = document.querySelectorAll("a:not(.nav-links a)");

    // Navigation highlighting based on scroll position
    function updateActiveNav() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight/3)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === currentSection) {
                link.classList.add('active');
            }
        });
    }

    // Smooth scroll to section when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navContent.classList.toggle('show');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-content') && 
            navContent.classList.contains('show')) {
            navContent.classList.remove('show');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // Scroll event listener for navigation highlighting
    window.addEventListener('scroll', updateActiveNav);

    // Initialize active nav on page load
    updateActiveNav();

    externalLinks.forEach(link => {
        if (link.href && !link.href.startsWith("#")) {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
        }
    });

    // Check if we need to add mobile menu
    if (window.innerWidth <= 600) {
        setupMobileMenu();
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 600 && !document.querySelector('.mobile-menu')) {
            setupMobileMenu();
        }
    });
    
    // Setup mobile menu
    function setupMobileMenu() {
        // Only add if it doesn't exist yet
        if (document.querySelector('.mobile-menu')) return;
        
        // Create mobile menu button
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        
        // Create mobile menu
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // Get navigation links
        const navLinks = document.querySelector('nav .nav-links');
        if (!navLinks) return;
        
        // Clone navigation links for mobile menu
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            const newLink = link.cloneNode(true);
            mobileMenu.appendChild(newLink);
        });
        
        // Add mobile menu button to navigation
        const nav = document.querySelector('nav');
        if (nav) {
            nav.appendChild(mobileMenuBtn);
            document.body.appendChild(mobileMenu);
            
            // Toggle mobile menu
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('active');
                if (mobileMenu.classList.contains('active')) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
            
            // Close mobile menu when clicking a link
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
        }
    }
});

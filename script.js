// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Prevent body scroll when mobile menu is open
function toggleBodyScroll(disable) {
    if (disable) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Update mobile menu to handle body scroll
hamburger.addEventListener('click', () => {
    const isActive = hamburger.classList.contains('active');
    toggleBodyScroll(isActive);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Experience Dial Functionality
class ExperienceDial {
    constructor() {
        this.currentYear = 2024;
        this.startYear = 2016;
        this.endYear = 2025;
        this.isDragging = false;
        this.startAngle = 0;
        this.currentAngle = 0;
        this.init();
    }

    init() {
        this.createDialStructure();
        this.setupEventListeners();
        this.updateDial(this.currentYear);
    }

    createDialStructure() {
        const timeline = document.querySelector('.experience-timeline');
        if (!timeline) return;

        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'experience-content-wrapper';

        // Create dial container
        const dialContainer = document.createElement('div');
        dialContainer.className = 'dial-container glass';

        // Create dial
        const dial = document.createElement('div');
        dial.className = 'dial';
        dialContainer.appendChild(dial);

        // Create year markers
        const yearMarkers = document.createElement('div');
        yearMarkers.className = 'year-markers';

        // Calculate positions for year markers
        const totalYears = this.endYear - this.startYear;
        const yearsWithContent = [];
        for (let i = 0; i <= totalYears; i++) {
            const year = this.startYear + i;
            const content = this.getExperienceData(year);
            if (content.title !== "Experience") {
                yearsWithContent.push(year);
            }
        }

        const angleIncrement = 360 / yearsWithContent.length;
        const adjustedRadius = 170; // Slightly increased radius to prevent overlap

        yearsWithContent.forEach((year, index) => {
            const marker = document.createElement('div');
            marker.className = 'year-marker';
            marker.textContent = year;

            // Calculate position (starting from top, moving clockwise)
            const angle = (index * angleIncrement) - 90; // Start from top (-90 degrees)
            const radian = angle * (Math.PI / 180);

            // Calculate x and y positions from the center
            const x = Math.cos(radian) * adjustedRadius;
            const y = Math.sin(radian) * adjustedRadius;

            // Position the marker
            marker.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
            marker.dataset.year = year;
            marker.dataset.angle = angle + 90; // Store the angle for rotation calculations
            yearMarkers.appendChild(marker);
        });

        dialContainer.appendChild(yearMarkers);

        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'experience-content glass';

        // Add containers to wrapper
        contentWrapper.appendChild(dialContainer);
        contentWrapper.appendChild(contentContainer);

        // Add wrapper to timeline
        timeline.appendChild(contentWrapper);

        // Store references
        this.dial = dial;
        this.yearMarkers = yearMarkers;
        this.contentContainer = contentContainer;
    }

    setupEventListeners() {
        if (!this.dial) return;

        // Mouse events for dial
        this.dial.addEventListener('mousedown', this.startDragging.bind(this));
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.stopDragging.bind(this));

        // Touch events for dial
        this.dial.addEventListener('touchstart', this.startDragging.bind(this));
        document.addEventListener('touchmove', this.handleDrag.bind(this));
        document.addEventListener('touchend', this.stopDragging.bind(this));

        // Click events for year markers
        const markers = document.querySelectorAll('.year-marker');
        markers.forEach(marker => {
            marker.addEventListener('click', () => {
                const year = parseInt(marker.dataset.year);
                this.updateDial(year);
            });
            
            // Add touch events for mobile
            marker.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const year = parseInt(marker.dataset.year);
                this.updateDial(year);
            });
        });
    }

    startDragging(e) {
        this.isDragging = true;
        const rect = this.dial.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
    
        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    
        this.startAngle = Math.atan2(clientY - centerY, clientX - centerX);
        this.currentAngle = this.dial.style.transform ? 
            parseFloat(this.dial.style.transform.match(/rotate\(([-\d.]+)deg\)/)[1]) || 0 : 0;
    }

    handleDrag(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const rect = this.dial.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
    
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    
        const angle = Math.atan2(clientY - centerY, clientX - centerX);
        let rotation = (angle - this.startAngle) * (180 / Math.PI);
    
        rotation = (this.currentAngle + rotation) % 360;
        if (rotation < 0) rotation += 360;

        this.dial.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    
        // Calculate year based on rotation
        const yearProgress = rotation / 360;
        const yearRange = this.endYear - this.startYear;
        const year = Math.round(this.startYear + (yearRange * yearProgress));
    
        this.updateContent(year);
    }

    stopDragging() {
        this.isDragging = false;
    }

    updateDial(year) {
        const yearRange = this.endYear - this.startYear;
        const yearProgress = (year - this.startYear) / yearRange;
        const rotation = yearProgress * 360;

        this.dial.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        this.updateContent(year);

        // Update active marker
        document.querySelectorAll('.year-marker').forEach(marker => {
            marker.classList.toggle('active', parseInt(marker.dataset.year) === year);
        });
    }

    updateContent(year) {
        // Security: Validate year input
        if (typeof year !== 'number' || year < 1900 || year > 2100) {
            console.error('Invalid year provided:', year);
            return;
        }
        
        const experiences = this.getExperienceData(year);
    
        // Clear previous content
        this.contentContainer.innerHTML = '';
    
        // If we have multiple experiences for this year, display all of them
        if (Array.isArray(experiences)) {
            experiences.forEach(content => {
                const experienceElement = document.createElement('div');
                experienceElement.className = 'experience-item';
                
                // Security: Sanitize content before insertion
                const sanitizedTitle = this.sanitizeHtml(content.title || '');
                const sanitizedCompany = this.sanitizeHtml(content.company || '');
                const sanitizedPeriod = this.sanitizeHtml(content.period || '');
                const sanitizedDescription = this.sanitizeHtml(content.description || '');
                
                experienceElement.innerHTML = `
                    <h3>${sanitizedTitle}</h3>
                    <div class="company">${sanitizedCompany}</div>
                    <div class="period">${sanitizedPeriod}</div>
                    <div class="description">${sanitizedDescription}</div>
                `;
                this.contentContainer.appendChild(experienceElement);
            
                // Add a separator between experiences except for the last one
                if (content !== experiences[experiences.length - 1]) {
                    const separator = document.createElement('div');
                    separator.className = 'experience-separator';
                    this.contentContainer.appendChild(separator);
                }
            });
        } else {
            // Single experience
            // Security: Sanitize content before insertion
            const sanitizedTitle = this.sanitizeHtml(experiences.title || '');
            const sanitizedCompany = this.sanitizeHtml(experiences.company || '');
            const sanitizedPeriod = this.sanitizeHtml(experiences.period || '');
            const sanitizedDescription = this.sanitizeHtml(experiences.description || '');
            
            this.contentContainer.innerHTML = `
                <h3>${sanitizedTitle}</h3>
                <div class="company">${sanitizedCompany}</div>
                <div class="period">${sanitizedPeriod}</div>
                <div class="description">${sanitizedDescription}</div>
            `;
        }
    }
    
    // Security: HTML sanitization helper
    sanitizeHtml(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                  .replace(/javascript:/gi, '')
                  .replace(/on\w+\s*=/gi, '');
    }

    getExperienceData(year) {
        const experiences = {
            2025: {
                title: "MS in Data Science",
                company: "New York University (NYU)",
                period: "August 2025 - Present",
                description: `<ul><li>Pursuing Master of Science in Data Science with Industry concentration</li><li>Focusing on advanced machine learning, statistical modeling, and data engineering</li><li>Engaging in cutting-edge research and industry collaborations</li></ul>`
            },
            2024: {
                title: "Senior Data Scientist",
                company: "FinBox.in",
                period: "August 2024 - July 2025",
                description: `<ul><li>Built an AI-driven automated data extraction system, replacing manual processes and reducing workload while upskilling teams for strategic roles.</li><li>Developed a regex automation pipeline enhanced with generative AI, boosting data extraction accuracy from 71% to 93% and cutting manual effort by 70%.</li><li>Designed high-accuracy LSTM-based hierarchical classifiers, improving categorization accuracy by 34% with reinforcement learning for continuous enhancements.</li><li>Established SOPs and best practices, ensuring consistent, scalable, and high-quality data solutions across teams.</li></ul>`
            },
            2021: {
                title: "Data Scientist",
                company: "FinBox.in",
                period: "August 2021 - August 2024",
                description: `<ul><li>Led the redevelopment of DeviceConnect V2, improving predictor accuracy, configurability, and interpretability, while reducing maintenance costs by 40%.</li><li>Integrated 1,500+ alternative data features (BNPL, UPI, tax, investments, spending patterns) to refine credit behavior analysis, improving model performance by 4%.</li><li>Designed ML-based credit scoring models with an AUC of 74%, delivering the best-performing score across multiple lending portfolios for 2.5 years.</li><li>Optimized scoring API for 20+ models, cutting deployment time by 67% and reducing data product latency by 30%.</li><li>Developed early warning risk scores for FinBox CollectX, increasing successful client collections from 5% to 15%.</li><li>Automated workflows with Risk-Airflow & GitHub Actions, reducing product runtime by 30%.</li></ul>`
            },
            2020: {
                title: "Quant Analyst Intern",
                company: "J.P. Morgan Services Pvt Ltd, Mumbai",
                period: "May 2020 - July 2022",
                description: `<ul><li>Analyzed trades responsible for outlier risks, designing a ranking metric that reduced portfolio risk by 2%.</li><li>Validated & fixed discrepancies in automated risk reports, improving accuracy by 43%.</li></ul>`
            },
            2019: [
                {
                    title: "Data Science Intern",
                    company: "Octro.inc",
                    period: "May 2019 - June 2019",
                    description: `<ul><li>Built a probabilistic collusion detection algorithm for online card games, correctly identifying 83% of colluding players.</li><li>Implemented TrueSkill ranking to detect match-fixing across different win-rate groups.</li></ul>`
                },
                {
                    title: "Master of Statistics",
                    company: "Indian Statistical Institute, Kolkata",
                    period: "Aug 2019 - Jun 2021",
                    description: `<ul><li>Compared deep learning models vs. traditional time series models across multiple datasets.</li><li>Modelled the success probability of trekking groups on the three primary routes of Mt. Rainier using a Zero-N inflated Binomial model and logistic regression.</li></ul>`
                }
            ],
            2018: {
                title: "Subject Matter Expert (Mathematics, Statistics)",
                company: "Chegg.com, AssignmentExperts.com",
                period: "May 2018 - May 2020",
                description: "Solved 500+ advanced statistical problems and assisted in 100+ machine learning assignments globally."
            },
            2016: {
                title: "Bachelor of Statistics",
                company: "Indian Statistical Institute, Kolkata",
                period: "August 2016 - May 2019",
                description: `<ul><li>Developed a beat detection algorithm for audio processing, achieving 82% accuracy.</li><li>Awarded merit scholarships for ranking 3rd and 4th (2017, 2018) in the Madhava Mathematics Competition.</li></ul>`
            }
        };

        return experiences[year] || {
            title: "Experience",
            company: "Loading...",
            period: "",
            description: "Select a year to view experience details."
        };
    }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(238, 229, 218, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(238, 229, 218, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Initialize experience dial
    new ExperienceDial();
    
    // Add animation classes to elements
            const animateElements = document.querySelectorAll('.section-header, .tech-item, .extra-card, .experience-item, .project-card, .achievement-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Stagger animation for tech items
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Tech stack hover pause (desktop only)
const techSlider = document.querySelector('.tech-track');
if (techSlider) {
    // Only add hover pause on desktop
    if (window.innerWidth > 768) {
        techSlider.addEventListener('mouseenter', () => {
            techSlider.style.animationPlayState = 'paused';
        });
        
        techSlider.addEventListener('mouseleave', () => {
            techSlider.style.animationPlayState = 'running';
        });
    }
    
    // Pause animation on mobile
    if (window.innerWidth <= 768) {
        techSlider.style.animationPlayState = 'paused';
    }
}

// Handle window resize for tech stack
window.addEventListener('resize', () => {
    if (techSlider) {
        if (window.innerWidth <= 768) {
            techSlider.style.animationPlayState = 'paused';
        } else {
            techSlider.style.animationPlayState = 'running';
        }
    }
});

// Button click effects
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect styles
const style = document.createElement('style');
style.textContent = `
    .btn-primary, .btn-secondary {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Form validation (for future contact form)
function validateForm(form) {
    // Security: Validate form parameter
    if (!form || !(form instanceof HTMLFormElement)) {
        console.error('Invalid form element provided');
        return false;
    }
    
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        // Security: Basic input sanitization
        const value = input.value.trim();
        if (!value) {
            input.classList.add('error');
            isValid = false;
        } else {
            // Security: Remove potentially dangerous content
            const sanitizedValue = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                       .replace(/javascript:/gi, '')
                                       .replace(/on\w+\s*=/gi, '');
            input.value = sanitizedValue;
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Lazy loading for images (for future implementation)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Gallery Lightbox Functionality
class GalleryLightbox {
    constructor() {
        this.lightbox = null;
        this.currentImage = null;
        this.images = [];
        this.currentIndex = 0;
        
        this.init();
    }
    
    init() {
        this.createLightbox();
        this.setupGalleryEvents();
    }
    
    createLightbox() {
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'lightbox';
        this.lightbox.innerHTML = `
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <button class="lightbox-prev">&lt;</button>
                <button class="lightbox-next">&gt;</button>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-caption"></div>
            </div>
        `;
        
        document.body.appendChild(this.lightbox);
        
        // Add event listeners
        this.lightbox.querySelector('.lightbox-overlay').addEventListener('click', () => this.close());
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.close());
        this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
        this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.next());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.prev();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
            }
        });
    }
    
    setupGalleryEvents() {
        const galleryItems = document.querySelectorAll('.gallery-item img');
        
        galleryItems.forEach((img, index) => {
            img.addEventListener('click', () => {
                this.open(img, index);
            });
        });
    }
    
    open(img, index) {
        this.currentIndex = index;
        this.currentImage = img;
        this.images = Array.from(document.querySelectorAll('.gallery-item img'));
        
        this.updateImage();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }
    
    updateImage() {
        // Security: Validate currentIndex
        if (this.currentIndex < 0 || this.currentIndex >= this.images.length) {
            console.error('Invalid image index:', this.currentIndex);
            return;
        }
        
        const img = this.images[this.currentIndex];
        const lightboxImg = this.lightbox.querySelector('.lightbox-image');
        const caption = this.lightbox.querySelector('.lightbox-caption');
        
        // Security: Validate image source
        if (img && img.src && img.src.startsWith('images/')) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || '';
            caption.textContent = img.alt || '';
        } else {
            console.error('Invalid image source:', img?.src);
        }
    }
}

// Initialize gallery lightbox when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GalleryLightbox();
    
    // Setup gallery linking from extras section
    setupGalleryLinking();
    
    // Initialize hangman game
    const hangmanGame = new HangmanGameUI();
    
    // Connect AI Games card to hangman game
    const aiGamesCard = document.getElementById('ai-games-card');
    if (aiGamesCard) {
        aiGamesCard.addEventListener('click', (e) => {
            e.preventDefault();
            hangmanGame.openModal();
        });
        aiGamesCard.style.cursor = 'pointer';
    }
});

// Gallery linking functionality
function setupGalleryLinking() {
    const galleryLinks = document.querySelectorAll('.gallery-link');
    
    galleryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const gallerySection = link.getAttribute('data-gallery-section');
            const targetSection = document.getElementById(`${gallerySection}-gallery`);
            
            if (targetSection) {
                // Smooth scroll to the gallery section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Add highlight animation after scroll
                setTimeout(() => {
                    targetSection.classList.add('highlight');
                    
                    // Remove highlight class after animation
                    setTimeout(() => {
                        targetSection.classList.remove('highlight');
                    }, 2000);
                }, 500);
            }
        });
    });
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Scroll-based animations and effects
}, 16); // ~60fps

window.addEventListener('scroll', debouncedScrollHandler);

// Hangman Game Implementation
class HangmanGame {
    // Maximum number of wrong guesses allowed
    static MAX_WRONG_GUESSES = 6;
    
    /**
     * Creates a new Hangman game with a random word.
     */
    constructor(word = null) {
        // Use provided word or get a random one
        this.word = (word || HangmanGame.getRandomWord()).toUpperCase();
        this.guessedLetters = new Set();
        this.wrongGuesses = 0;
        this.gameOver = false;
        this.playerWon = false;
    }
    
    /**
     * Makes a guess of the specified letter.
     * @param letter The letter to guess (case insensitive)
     * @return true if the letter is in the word, false otherwise
     */
    guess(letter) {
        if (this.gameOver) {
            return false;
        }
        
        // Convert to uppercase
        letter = letter.toUpperCase();
        
        // Check if the letter has already been guessed
        if (this.guessedLetters.has(letter)) {
            return false;
        }
        
        // Add the letter to the set of guessed letters
        this.guessedLetters.add(letter);
        
        // Check if the letter is in the word
        const correctGuess = this.word.indexOf(letter) >= 0;
        
        // If the guess is wrong, increment the wrong guess counter
        if (!correctGuess) {
            this.wrongGuesses++;
            
            // Check if the player has reached the maximum number of wrong guesses
            if (this.wrongGuesses >= HangmanGame.MAX_WRONG_GUESSES) {
                this.gameOver = true;
                this.playerWon = false;
            }
        } else {
            // Check if the player has won
            if (this.isWordGuessed()) {
                this.gameOver = true;
                this.playerWon = true;
            }
        }
        
        return correctGuess;
    }
    
    /**
     * Returns the current state of the word, with unguessed letters replaced by underscores.
     * @return The current state of the word
     */
    getWordState() {
        let result = '';
        
        for (let i = 0; i < this.word.length; i++) {
            const c = this.word.charAt(i);
            
            if (this.guessedLetters.has(c)) {
                result += c;
            } else {
                result += '_';
            }
            
            result += ' ';
        }
        
        return result.trim();
    }
    
    /**
     * Returns an array of all letters that have been guessed, in alphabetical order.
     * @return An array of guessed letters
     */
    getGuessedLettersList() {
        return Array.from(this.guessedLetters).sort();
    }
    
    /**
     * Returns the number of wrong guesses so far.
     * @return The number of wrong guesses
     */
    getWrongGuesses() {
        return this.wrongGuesses;
    }
    
    /**
     * Returns whether the game is over.
     * @return true if the game is over, false otherwise
     */
    isGameOver() {
        return this.gameOver;
    }
    
    /**
     * Returns whether the player has won.
     * @return true if the player has won, false otherwise
     */
    hasPlayerWon() {
        return this.playerWon;
    }
    
    /**
     * Returns the word to guess.
     * @return The word to guess
     */
    getWord() {
        return this.word;
    }
    
    /**
     * Checks if the word has been fully guessed.
     * @return true if the word has been guessed, false otherwise
     */
    isWordGuessed() {
        for (let i = 0; i < this.word.length; i++) {
            if (!this.guessedLetters.has(this.word.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns a random word from the list.
     * All words are uppercase.
     */
    static getRandomWord() {
        return HangmanGame.WORDS[Math.floor(Math.random() * HangmanGame.WORDS.length)];
    }

    // Word list for the game
    static WORDS = [
        "ABSTRACT", "ADVANCED", "AIRPLANE", "ALPHABET", "ANALYSIS", 
        "APPROACH", "ARGUMENT", "ARTISTIC", "AUDIENCE", "BASEBALL",
        "BATHROOM", "BEAUTIFUL", "BIRTHDAY", "BRILLIANT", "BUSINESS",
        "CAMPAIGN", "CAPACITY", "CATEGORY", "CHAMPION", "CHEMICAL",
        "CHILDREN", "CIRCUIT", "CLASSIC", "CLIMATE", "COMPUTER",
        "CONCRETE", "CONDUCTOR", "CONSIDER", "CREATIVE", "CRITICAL",
        "CULTURAL", "CUSTOMER", "DATABASE", "DECISION", "DEDICATED",
        "DELIVERY", "DEMOCRACY", "DESIGNER", "DETAILED", "DETECTIVE",
        "DIABETES", "DIALOGUE", "DIFFICULT", "DINOSAUR", "DIRECTOR",
        "DISCOVERY", "DOCUMENT", "DOMESTIC", "DRAMATIC", "ECONOMIC",
        "EDUCATED", "EGYPTIAN", "ELECTION", "ELEPHANT", "ENGINEER",
        "ENORMOUS", "ENTRANCE", "ENVIRONMENT", "ESTIMATE", "EXCHANGE",
        "EXCITING", "EXERCISE", "EXPLICIT", "EXTERNAL", "FACILITY",
        "FAMILIAR", "FAVORITE", "FESTIVAL", "FINANCIAL", "FLAGSHIP",
        "FOOTBALL", "FORECAST", "FRAGMENT", "FUNCTION", "FURNITURE",
        "GAMBLING", "GENEROUS", "GRADUATE", "GRAPHICS", "GRATITUDE",
        "GUARDIAN", "GUIDANCE", "HAMBURGER", "HARDWARE", "HEADLINE",
        "HERITAGE", "HIGHLAND", "HISTORIC", "HUMANITY", "IDENTICAL",
        "IMPERIAL", "INCIDENT", "INDUSTRY", "INFERIOR", "INNOCENT",
        "INSTANCE", "INSULTING", "INTEGRAL", "INVASION", "INVESTOR",
        "JEALOUSY", "JUDGMENT", "KEYBOARD", "KNOWLEDGE", "LANGUAGE",
        "LAUGHTER", "LEARNING", "LEVERAGE", "LIFESTYLE", "LIGHTNING",
        "LITERARY", "LOCATION", "MAGAZINE", "MAGNETIC", "MAJORITY",
        "MARATHON", "MARKETING", "MATERIAL", "MEDICINE", "MEMORIAL",
        "MIDNIGHT", "MILITARY", "MINORITY", "MOMENTUM", "MOUNTAIN",
        "NATIONAL", "NEGATIVE", "NEIGHBOR", "NEWSPAPER", "OBJECTIVE",
        "OBSTACLE", "OFFERING", "OFFICIAL", "OPERATOR", "OPTIMISM",
        "ORIGINAL", "OVERSIGHT", "PAINTING", "PARALLEL", "PARENTAL",
        "PASSWORD", "PATIENCE", "PERIODIC", "PERSONAL", "PHYSICAL",
        "PLANNING", "PLATFORM", "PLEASURE", "POLITICS", "PORTABLE",
        "PORTRAIT", "POSITION", "POSITIVE", "POSSIBLE", "POTENTIAL",
        "PRACTICE", "PRECIOUS", "PREGNANT", "PRESENCE", "PRESSURE",
        "PREVIOUS", "PRINCESS", "PRIORITY", "PROGRESS", "PROPERTY",
        "PROPOSAL", "PROTOCOL", "PROVINCE", "PSYCHIC", "PURCHASE",
        "QUANTITY", "QUESTION", "RATIONAL", "REACTION", "RECEIVER",
        "RECOVERY", "REGIONAL", "REGISTER", "RELATION", "RELATIVE",
        "REMEMBER", "REPUBLIC", "RESEARCH", "RESOURCE", "RESPONSE",
        "SANDWICH", "SCHEDULE", "SCIENTIST", "SEASONAL", "SECURITY",
        "SENTENCE", "SEPARATE", "SEQUENCE", "SERGEANT", "SHIPPING",
        "SHORTAGE", "SHOULDER", "SIMPLICITY", "SOLUTION", "SOMEWHAT",
        "SOUTHERN", "SPECIALIST", "SPIRITUAL", "SPOKESMAN", "STANDARD",
        "STRATEGY", "STRENGTH", "STRICTLY", "STRUCTURE", "STUDENT",
        "SUBJECTIVE", "SUBMARINE", "SUBSTANCE", "SUBSTITUTE", "SUBURBAN",
        "SUFFERING", "SUGGESTION", "SURROUND", "SURVIVAL", "SWIMMING",
        "SYMPATHY", "SYNDROME", "TACTICAL", "TEACHING", "TECHNICAL",
        "TEENAGER", "TELEPHONE", "TELESCOPE", "TERRIBLE", "TERRITORY",
        "THINKING", "THOUSAND", "TOMORROW", "TRAINING", "TRIANGLE",
        "TROPICAL", "ULTIMATE", "UMBRELLA", "UNIVERSE", "VACATION",
        "VARIABLE", "VERTICAL", "VICTORIA", "VIOLENCE", "VOLATILE",
        "WALLPAPER", "WAREHOUSE", "WARRANTY", "WEAKNESS", "WEATHER",
        "WEDDING", "WEEKEND", "WILDLIFE", "WIRELESS", "WITHDRAW",
        "WOODLAND", "WORKSHOP", "YOURSELF", "ZEPPELIN"
    ];
}

// Hangman Game UI Manager
class HangmanGameUI {
    constructor() {
        this.game = null;
        this.modal = null;
        this.wordDisplay = null;
        this.keyboardContainer = null;
        this.messageDisplay = null;
        this.newGameBtn = null;
        this.closeBtn = null;
        this.init();
    }
    
    init() {
        this.modal = document.getElementById('hangman-modal');
        this.wordDisplay = document.getElementById('hangman-word');
        this.keyboardContainer = document.getElementById('hangman-keyboard');
        this.messageDisplay = document.getElementById('hangman-message');
        this.newGameBtn = document.getElementById('hangman-new-game');
        this.closeBtn = document.getElementById('hangman-close');
        
        if (!this.modal) {
            console.error('Hangman modal not found');
            return;
        }
        
        this.setupEventListeners();
        this.createKeyboard();
    }
    
    setupEventListeners() {
        // New game button
        if (this.newGameBtn) {
            this.newGameBtn.addEventListener('click', () => this.startNewGame());
        }
        
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (this.modal.classList.contains('active') && this.game && !this.game.isGameOver()) {
                const key = e.key.toUpperCase();
                if (/^[A-Z]$/.test(key)) {
                    this.processGuess(key);
                }
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    createKeyboard() {
        if (!this.keyboardContainer) return;
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const keyboard = document.createElement('div');
        keyboard.classList.add('hangman-keyboard-layout');
        
        for (let letter of letters) {
            const key = document.createElement('button');
            key.classList.add('hangman-key');
            key.textContent = letter;
            key.dataset.letter = letter;
            key.addEventListener('click', () => this.processGuess(letter));
            keyboard.appendChild(key);
        }
        
        this.keyboardContainer.appendChild(keyboard);
    }
    
    openModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.startNewGame();
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    startNewGame() {
        this.game = new HangmanGame();
        this.updateWordDisplay();
        this.resetKeyboard();
        this.resetHangmanFigure();
        this.messageDisplay.textContent = 'Guess a letter to start!';
        this.messageDisplay.classList.remove('hangman-message-win', 'hangman-message-lose');
    }
    
    processGuess(letter) {
        if (!this.game || this.game.isGameOver()) return;
        
        const correct = this.game.guess(letter);
        this.updateWordDisplay();
        this.updateKeyboard(letter, correct);
        this.updateHangmanFigure();
        
        // Check if the game is over
        if (this.game.isGameOver()) {
            if (this.game.hasPlayerWon()) {
                this.messageDisplay.textContent = 'Congratulations! You won! 🎉';
                this.messageDisplay.classList.add('hangman-message-win');
            } else {
                this.messageDisplay.textContent = `Game over! The word was "${this.game.getWord()}" 😔`;
                this.messageDisplay.classList.add('hangman-message-lose');
            }
        }
    }
    
    updateWordDisplay() {
        if (this.wordDisplay && this.game) {
            this.wordDisplay.textContent = this.game.getWordState();
        }
    }
    
    updateKeyboard(letter, correct) {
        const key = this.keyboardContainer.querySelector(`button[data-letter="${letter}"]`);
        if (key) {
            key.disabled = true;
            if (correct) {
                key.classList.add('hangman-key-correct');
            } else {
                key.classList.add('hangman-key-wrong');
            }
        }
    }
    
    resetKeyboard() {
        const keys = this.keyboardContainer.querySelectorAll('.hangman-key');
        keys.forEach(key => {
            key.disabled = false;
            key.classList.remove('hangman-key-correct', 'hangman-key-wrong');
        });
    }
    
    updateHangmanFigure() {
        if (!this.game) return;
        
        const wrongGuesses = this.game.getWrongGuesses();
        const parts = [
            document.getElementById('hangman-head'),
            document.getElementById('hangman-body'),
            document.getElementById('hangman-arm-left'),
            document.getElementById('hangman-arm-right'),
            document.getElementById('hangman-leg-left'),
            document.getElementById('hangman-leg-right')
        ];
        
        // Show the parts corresponding to the number of wrong guesses
        for (let i = 0; i < parts.length; i++) {
            if (parts[i]) {
                if (i < wrongGuesses) {
                    parts[i].classList.remove('hidden');
                } else {
                    parts[i].classList.add('hidden');
                }
            }
        }
    }
    
    resetHangmanFigure() {
        const parts = document.querySelectorAll('#hangman-modal .hidden');
        parts.forEach(part => {
            part.classList.add('hidden');
        });
    }
}

// Achievements Card Flip Functionality
document.addEventListener('DOMContentLoaded', function() {
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    achievementCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
        
        // Touch events for mobile
        card.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.toggle('flipped');
        });
        
        // Keyboard accessibility
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('flipped');
            }
        });
        
        // Set tabindex for keyboard navigation
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Click to flip achievement card');
    });
    
    // Add entrance animations for achievement cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const achievementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    achievementCards.forEach(card => {
        achievementObserver.observe(card);
    });
    
    // Pause achievements animation on mobile
    const achievementsTrack = document.querySelector('.achievements-track');
    if (achievementsTrack && window.innerWidth <= 768) {
        achievementsTrack.style.animationPlayState = 'paused';
    }
});



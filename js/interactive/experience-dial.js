class ExperienceDial {
    constructor() {
        this.currentYear = 2024;
        this.startYear = 2016;
        this.endYear = 2024;
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
        const experiences = this.getExperienceData(year);
    
        // Clear previous content
        this.contentContainer.innerHTML = '';
    
        // If we have multiple experiences for this year, display all of them
        if (Array.isArray(experiences)) {
            experiences.forEach(content => {
                const experienceElement = document.createElement('div');
                experienceElement.className = 'experience-item';
                experienceElement.innerHTML = `
                    <h3>${content.title}</h3>
                    <div class="company">${content.company}</div>
                    <div class="period">${content.period}</div>
                    <div class="description">${content.description}</div>
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
            this.contentContainer.innerHTML = `
                <h3>${experiences.title}</h3>
                <div class="company">${experiences.company}</div>
                <div class="period">${experiences.period}</div>
                <div class="description">${experiences.description}</div>
            `;
        }
    }

    getExperienceData(year) {
        const experiences = {
            2024: {
                title: "Senior Data Scientist",
                company: "FinBox.in",
                period: "August 2024 - Present",
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

// Initialize the experience dial when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExperienceDial();
}); 
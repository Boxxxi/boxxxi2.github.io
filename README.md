# Portfolio Website

A modern, responsive portfolio website inspired by Relume's design aesthetic, built with HTML, CSS, and JavaScript.

## 🎨 Design Features

- **Color Scheme**: Light almond (#EEE5DA) and deep charcoal (#262424)
- **Modern UI**: Clean, minimalist design with smooth animations
- **Responsive**: Fully responsive across all devices
- **Interactive Elements**: Dynamic experience dial, animated tech stack, and smooth scrolling

## 📁 File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🚀 Sections Overview

### 1. Hero Section
- **Location**: Top of the page
- **Features**: 
  - Large title with gradient text effect
  - Placeholder for your photo
  - Call-to-action buttons
  - Responsive layout

### 2. Tech Stack Section
- **Location**: Second section
- **Features**:
  - Continuously scrolling tech icons from left to right
  - Hover effects on each technology
  - Pause on hover functionality
  - Includes popular tech stack icons (React, Node.js, Python, etc.)

### 3. Experience Section
- **Location**: Third section
- **Features**:
  - Interactive dial that rotates to show different years
  - Dynamic content that changes based on selected year
  - Auto-rotation every 3 seconds
  - Click to manually select years
  - Smooth transitions between years

### 4. Projects Section
- **Location**: Fourth section
- **Features**:
  - Project cards with images, descriptions, and metadata
  - Category badges (Web Development, Mobile App, AI/ML)
  - Technology tags for each project
  - Multiple links (Live Demo, Source Code, Read Article)
  - Responsive grid layout
  - Hover animations and effects

### 5. Extras Section
- **Location**: Fifth section
- **Features**:
  - Three cards for different interests:
    - AI Games
    - Wildlife Photography
    - Origami
  - Placeholder areas for content and images
  - Hover animations

## 🛠️ Customization Guide

### Adding Your Content

#### Hero Section
1. Replace the placeholder text in the hero description
2. Add your photo by replacing the placeholder div with an `<img>` tag
3. Update the call-to-action button links

```html
<!-- Replace this placeholder -->
<div class="image-placeholder">
    <i class="fas fa-user"></i>
    <p>Your Photo Here</p>
</div>

<!-- With your actual image -->
<img src="path/to/your/photo.jpg" alt="Your Name" class="hero-photo">
```

#### Tech Stack
1. Add or remove tech items in the `tech-track` div
2. Update icons using Font Awesome classes
3. Modify the animation speed in CSS if needed

```html
<div class="tech-item">
    <i class="fab fa-your-tech-icon"></i>
    <span>Technology Name</span>
</div>
```

#### Experience Section
1. Update the years array in `script.js`
2. Modify the experience items in the HTML
3. Add your actual experience content

```javascript
// In script.js, update the years array
this.years = ['2020', '2021', '2022', '2023', '2024', '2025'];
```

#### Projects Section
1. Replace placeholder content with your actual project information
2. Add project screenshots by replacing the placeholder divs with `<img>` tags
3. Update project metadata (dates, read times, categories)
4. Modify technology tags to match your project stack
5. Update links to point to your actual demos, repositories, and articles

```html
<!-- Replace placeholder with actual project image -->
<div class="project-image">
    <img src="path/to/project-screenshot.jpg" alt="Project Name">
    <div class="project-category">
        <span>Web Development</span>
    </div>
</div>

<!-- Update project content -->
<div class="project-content">
    <div class="project-meta">
        <span class="project-date">December 2024</span>
        <span class="project-read-time">5 min read</span>
    </div>
    <h3 class="project-title">Your Actual Project Title</h3>
    <p class="project-excerpt">Your project description...</p>
    <div class="project-tags">
        <span class="tag">React</span>
        <span class="tag">Node.js</span>
    </div>
    <div class="project-links">
        <a href="your-demo-link" class="project-link">Live Demo</a>
        <a href="your-repo-link" class="project-link">Source Code</a>
        <a href="your-article-link" class="project-link primary">Read Article</a>
    </div>
</div>
```

#### Extras Section
1. Replace placeholder text with your actual content
2. Add images to the placeholder areas
3. Update the icons to match your interests

### Styling Customization

#### Colors
The main colors are defined as CSS variables in `styles.css`:

```css
:root {
    --light-almond: #EEE5DA;
    --deep-charcoal: #262424;
    /* ... other variables */
}
```

#### Fonts
The website uses Inter font family. To change fonts:

1. Update the Google Fonts link in `index.html`
2. Modify the font-family in the CSS

#### Animations
- Tech stack scroll speed: Modify the `animation` property in `.tech-track`
- Experience dial rotation speed: Change the interval in `startAutoRotation()`
- Page animations: Adjust the `transition` properties

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- **768px**: Tablet layout
- **480px**: Mobile layout

Key responsive features:
- Mobile hamburger menu
- Stacked layouts on smaller screens
- Adjusted font sizes and spacing
- Touch-friendly interactions

## ⚡ Performance Features

- **Lazy Loading**: Images load only when needed
- **Debounced Scroll Events**: Optimized scroll performance
- **CSS Animations**: Hardware-accelerated animations
- **Minimal JavaScript**: Efficient event handling

## 🔧 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🚀 Getting Started

1. **Clone or download** the files to your local machine
2. **Open `index.html`** in your web browser
3. **Customize** the content as needed
4. **Deploy** to your preferred hosting service

## 📝 Content Guidelines

### Hero Section
- Keep the description concise but compelling
- Use action-oriented language
- Include a professional photo (recommended size: 300x300px)

### Tech Stack
- Include only technologies you're proficient with
- Use official Font Awesome icons when possible
- Keep the list manageable (10-15 technologies recommended)

### Experience
- Focus on significant achievements and milestones
- Use specific metrics when possible
- Keep descriptions concise but informative

### Projects
- Write compelling project titles that highlight the main feature or problem solved
- Include brief but engaging descriptions that explain the project's purpose
- Use specific technology tags that accurately represent your tech stack
- Provide clear links to live demos, source code, and detailed articles
- Include high-quality screenshots or mockups for visual appeal
- Mention key challenges overcome and lessons learned

### Extras
- Showcase unique skills and interests
- Include high-quality images
- Provide brief but engaging descriptions

## 🎯 SEO Optimization

The website includes basic SEO elements:
- Semantic HTML structure
- Meta tags for viewport
- Alt text placeholders for images
- Clean URL structure

## 🔮 Future Enhancements

Potential additions:
- Contact form integration
- Blog section
- Project portfolio gallery
- Dark mode toggle
- Multi-language support
- Analytics integration

## 📄 License

This template is free to use and modify for personal and commercial projects.

## 🤝 Support

For questions or customization help, refer to the code comments or create an issue in the repository.

---

**Happy coding! 🚀**

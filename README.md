# Personal Portfolio Website

A modern, responsive portfolio website showcasing my professional experience, projects, and creative pursuits. Built with a focus on clean design, smooth animations, and modular architecture.

## Project Architecture

The project follows a modular architecture with clear separation of concerns:

### JavaScript Structure (`js/`)

#### 1. Core (`js/core/`)
- `script.js` - Core functionality including:
  - Navigation and smooth scrolling
  - Mobile menu handling
  - Event listeners and DOM manipulation
- `tabs.js` - Tab system for content organization in the Extras section

#### 2. Visual Effects (`js/visual-effects/`)
- `animations.js` - Scroll-based animations and transitions
- `background-network.js` - Interactive network visualization background
- `background-spiral.js` - Alternative spiral animation effect

#### 3. Interactive Features (`js/interactive/`)
- `map.js` - Interactive world map for travel visualization
- `theme-toggle.js` - Dark/light mode theme management

#### 4. Documentation (`js/docs/`)
- `readme.js` - Documentation and markdown rendering

### CSS Structure (`css/`)

#### 1. Core (`css/core/`)
- `style.css` - Main stylesheet containing:
  - Layout and grid systems
  - Typography
  - Component styles
  - Responsive design rules

#### 2. Effects (`css/effects/`)
- `glassmorphism.css` - Modern glass-like UI effects:
  - Transparent backgrounds
  - Blur effects
  - Card designs

## Features

### Core Features
- Responsive navigation with smooth scrolling
- Mobile-first design approach
- Dynamic content loading
- Modular component architecture

### Visual Elements
- Glass-morphism design language
- Dynamic network background animation
- Scroll-based reveal animations
- Interactive hover states

### Interactive Components
- Tab-based content switching
- Interactive world map
- Image galleries with masonry layout
- Timeline visualization

### Performance Optimizations
- Lazy loading for images
- Optimized animations
- Modular JavaScript loading
- Efficient CSS organization

## Technical Stack

- **Frontend**
  - HTML5
  - CSS3 (with modern features)
  - Vanilla JavaScript (ES6+)
  
- **Libraries & CDNs**
  - Font Awesome (icons)
  - Google Fonts (Inter, Roboto Mono)
  - Marked.js (markdown parsing)
  - Prism.js (code highlighting)

## Color Scheme

- Primary: #004d99 (Dark Blue)
- Secondary: #6600cc
- Background: #0a0a0a
- Surface: rgba(255, 255, 255, 0.07)
- Text: #e6e6e6
- Muted Text: #a6a6a6

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/portfolio.git
```

2. Open `index.html` in your browser
3. For development:
   - Modify core styles in `css/core/style.css`
   - Add new effects in `css/effects/`
   - Update functionality in respective JS directories

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Best Practices

### Code Organization
- Modular file structure
- Clear separation of concerns
- Component-based architecture
- Progressive enhancement

### Performance
- Optimized asset loading
- Efficient DOM manipulation
- Minimal dependencies
- Mobile-first approach

### Maintainability
- Clear file naming conventions
- Consistent coding style
- Documented components
- Logical directory structure

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

# Portfolio Website Structure

This repository contains the code for my portfolio website. The codebase is organized into logical sections for better maintainability and understanding.

## Directory Structure

### JavaScript (`js/`)
The JavaScript code is organized into the following categories:

#### 1. Core (`js/core/`)
- `script.js` - Main website functionality and navigation
- `tabs.js` - Tab system for content organization

#### 2. Visual Effects (`js/visual-effects/`)
- `animations.js` - Scroll-based animations and effects
- `background-network.js` - Interactive network visualization
- `background-spiral.js` - Spiral animation effects

#### 3. Interactive Features (`js/interactive/`)
- `map.js` - Map integration and location features
- `theme-toggle.js` - Dark/light mode functionality

#### 4. Documentation (`js/docs/`)
- `readme.js` - Documentation display and formatting

### CSS (`css/`)
The CSS styles are organized into:

#### 1. Core (`css/core/`)
- `style.css` - Main stylesheet with core styling

#### 2. Effects (`css/effects/`)
- `glassmorphism.css` - Modern glass-like UI effects

## File Purposes

### Core Files
- `script.js`: Handles core website functionality including navigation, smooth scrolling, and mobile menu
- `style.css`: Contains the primary styling for layout, typography, and responsive design
- `tabs.js`: Manages content organization through a tab system

### Visual Effects
- `animations.js`: Manages scroll-based animations and visual transitions
- `background-network.js`: Creates an interactive network visualization
- `background-spiral.js`: Generates spiral animation effects

### Interactive Features
- `map.js`: Handles map-related functionality and location features
- `theme-toggle.js`: Manages website theme preferences (dark/light mode)

### Documentation
- `readme.js`: Handles the display and formatting of documentation

### Special Effects
- `glassmorphism.css`: Provides modern glass-like effects for UI elements

## Getting Started
1. The main entry point is `index.html`
2. Core styling is in `css/core/style.css`
3. Main functionality is in `js/core/script.js`

## Best Practices
- Core functionality is separated from visual enhancements
- Each file has a single responsibility
- Modular organization for easy maintenance
- Progressive enhancement approach
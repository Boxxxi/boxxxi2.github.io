# Sections Directory

This directory contains modular HTML sections that are dynamically loaded into the main index.html page using the section-loader.js script.

## Structure

Each section is contained in its own HTML file:

- `home.html` - Hero section with name, title, and call-to-action buttons
- `about.html` - About me section with skills and expertise
- `experience.html` - Work experience timeline
- `projects.html` - Featured projects showcase
- `extras.html` - Personal interests including photography, origami, art, concerts, and travel
- `contact.html` - Contact information and links

## How It Works

The `js/core/section-loader.js` script dynamically loads these sections in order when the page loads. This modular approach offers several benefits:

1. **Improved Maintainability**: Each section can be edited independently
2. **Better Organization**: Cleaner codebase with separation of concerns
3. **Faster Development**: Easier to focus on one section at a time
4. **Reduced Merge Conflicts**: Multiple developers can work on different sections simultaneously

## Adding a New Section

To add a new section:

1. Create a new HTML file in this directory (e.g., `new-section.html`)
2. Add the section name to the `sections` array in `js/core/section-loader.js`
3. The section will automatically be loaded in the specified order

## Scripts in Sections

If a section contains `<script>` tags, they will be properly executed after the section is loaded. This allows for section-specific JavaScript functionality.

## Animation

All sections use the `animate-on-scroll` class which triggers a fade-in animation when the section comes into view. This is handled by the intersection observer in the section-loader.js script. 
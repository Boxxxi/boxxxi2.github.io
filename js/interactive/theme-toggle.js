const darkTheme = {
    primary: '#00ff9d',
    secondary: '#80ffcb',
    accent: '#00cc7a',
    background: '#121212',
    surface: 'rgba(30, 30, 30, 0.8)',
    text: 'rgba(255, 255, 255, 0.87)'
};
  
const lightTheme = {
    primary: '#00cc7a',
    secondary: '#00ff9d',
    accent: '#009e5f',
    background: '#f5f5f5',
    surface: 'rgba(0, 0, 0, 0.05)',
    text: 'rgba(0, 0, 0, 0.87)'
};
  
function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.style.getPropertyValue('--background') === darkTheme.background;
    
    const theme = isDark ? lightTheme : darkTheme;
    
    Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
    });
}
  
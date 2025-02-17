const darkTheme = {
    primary: '#00fff2',
    secondary: '#8A2BE2',
    background: '#0a0a0a',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: '#ffffff'
  };
  
  const lightTheme = {
    primary: '#0066ff',
    secondary: '#6600cc',
    background: '#ffffff',
    surface: 'rgba(0, 0, 0, 0.05)',
    text: '#000000'
  };
  
  function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.style.getPropertyValue('--background') === darkTheme.background;
    
    const theme = isDark ? lightTheme : darkTheme;
    
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }
  
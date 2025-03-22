/**
 * Application Theme Configuration
 * Implements a colorblind-friendly palette with consistent styling properties
 */

const theme = {
  colors: {
    primary: '#4A90E2', // Blue
    secondary: '#50E3C2', // Teal
    error: '#D0021B',
    text: {
      primary: '#2D2D2D',
      secondary: '#6B6B6B',
      light: '#FFFFFF'
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F7FA',
      tertiary: '#E8F0FE'
    },
    // Colorblind-safe alternatives
    cbBlue: '#0173B2',
    cbOrange: '#DE8F05',
    cbGreen: '#029F73'
  },
  
  // Spacing follows 8px grid
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  // Typography
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8
    }
  },
  
  // Borders and shadows
  borders: {
    radius: {
      sm: '4px',
      md: '8px',
      lg: '16px',
      pill: '999px'
    },
    width: {
      thin: '1px',
      thick: '2px'
    }
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)'
  },
  
  // Transitions
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  }
};

export default theme;

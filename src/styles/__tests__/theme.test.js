import theme from '../theme';

describe('Theme Configuration', () => {
  test('has complete color palette', () => {
    // Basic colors
    expect(theme.colors).toHaveProperty('primary', '#4A90E2');
    expect(theme.colors).toHaveProperty('secondary', '#50E3C2');
    expect(theme.colors).toHaveProperty('error', '#D0021B');
    expect(theme.colors).toHaveProperty('text', '#2D2D2D');
    expect(theme.colors).toHaveProperty('background', '#FFFFFF');
    
    // Colorblind-safe alternatives
    expect(theme.colors).toHaveProperty('cbBlue', '#0173B2');
    expect(theme.colors).toHaveProperty('cbOrange', '#DE8F05');
    expect(theme.colors).toHaveProperty('cbGreen', '#029F73');
  });
  
  test('has consistent spacing scale', () => {
    expect(theme.spacing).toHaveProperty('xs', '4px');
    expect(theme.spacing).toHaveProperty('sm', '8px');
    expect(theme.spacing).toHaveProperty('md', '16px');
    expect(theme.spacing).toHaveProperty('lg', '24px');
    expect(theme.spacing).toHaveProperty('xl', '32px');
    expect(theme.spacing).toHaveProperty('xxl', '48px');
    
    // Verify spacing follows 8px grid (except xs)
    const spacingValues = Object.values(theme.spacing);
    spacingValues.slice(1).forEach(value => {
      const numericValue = parseInt(value);
      expect(numericValue % 8).toBe(0);
    });
  });
  
  test('has complete typography settings', () => {
    expect(theme.typography).toHaveProperty('fontFamily');
    expect(theme.typography).toHaveProperty('fontSize');
    expect(theme.typography).toHaveProperty('fontWeight');
    expect(theme.typography).toHaveProperty('lineHeight');
    
    // Font sizes should be in px
    Object.values(theme.typography.fontSize).forEach(size => {
      expect(size).toMatch(/^\d+px$/);
    });
  });
  
  test('has border radius settings', () => {
    expect(theme.borders.radius).toHaveProperty('sm');
    expect(theme.borders.radius).toHaveProperty('md');
    expect(theme.borders.radius).toHaveProperty('lg');
    expect(theme.borders.radius).toHaveProperty('pill');
  });
  
  test('has shadow definitions', () => {
    expect(theme.shadows).toHaveProperty('sm');
    expect(theme.shadows).toHaveProperty('md');
    expect(theme.shadows).toHaveProperty('lg');
  });
  
  test('has responsive breakpoints', () => {
    expect(theme.breakpoints).toHaveProperty('xs');
    expect(theme.breakpoints).toHaveProperty('sm');
    expect(theme.breakpoints).toHaveProperty('md');
    expect(theme.breakpoints).toHaveProperty('lg');
    expect(theme.breakpoints).toHaveProperty('xl');
    
    // Breakpoints should be in ascending order
    const breakpointValues = Object.values(theme.breakpoints).map(bp => parseInt(bp));
    for (let i = 1; i < breakpointValues.length; i++) {
      expect(breakpointValues[i]).toBeGreaterThan(breakpointValues[i-1]);
    }
  });
  
  test('has z-index scale', () => {
    expect(theme.zIndex).toBeDefined();
    
    // Z-indices should be in ascending order
    const zIndices = Object.values(theme.zIndex);
    for (let i = 1; i < zIndices.length; i++) {
      expect(zIndices[i]).toBeGreaterThan(zIndices[i-1]);
    }
  });
  
  test('has transition definitions', () => {
    expect(theme.transitions).toHaveProperty('duration');
    expect(theme.transitions).toHaveProperty('timing');
  });
});
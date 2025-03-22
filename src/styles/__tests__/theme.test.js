import theme from '../theme';

describe('Theme Configuration', () => {
  test('has complete color palette', () => {
    // Check main colors
    expect(theme.colors).toHaveProperty('primary', '#4A90E2');
    expect(theme.colors).toHaveProperty('secondary', '#50E3C2');
    expect(theme.colors).toHaveProperty('error', '#D0021B');
    
    // Check text colors (nested object)
    expect(theme.colors).toHaveProperty('text');
    expect(theme.colors.text).toHaveProperty('primary', '#2D2D2D');
    expect(theme.colors.text).toHaveProperty('secondary', '#6B6B6B');
    expect(theme.colors.text).toHaveProperty('light', '#FFFFFF');
    
    // Check background colors (nested object)
    expect(theme.colors).toHaveProperty('background');
    expect(theme.colors.background).toHaveProperty('primary', '#FFFFFF');
    expect(theme.colors.background).toHaveProperty('secondary', '#F5F7FA');
    expect(theme.colors.background).toHaveProperty('tertiary', '#E8F0FE');
    
    // Colorblind-safe alternatives
    expect(theme.colors).toHaveProperty('cbBlue', '#0173B2');
    expect(theme.colors).toHaveProperty('cbOrange', '#DE8F05');
    expect(theme.colors).toHaveProperty('cbGreen', '#029F73');
  });
  
  test('has consistent spacing scale', () => {
    expect(theme.spacing).toBeDefined();
    expect(theme.spacing).toHaveProperty('xs', '4px');
    expect(theme.spacing).toHaveProperty('sm', '8px');
    expect(theme.spacing).toHaveProperty('md', '16px');
    expect(theme.spacing).toHaveProperty('lg', '24px');
    expect(theme.spacing).toHaveProperty('xl', '32px');
    expect(theme.spacing).toHaveProperty('xxl', '48px');
  });
  
  test('has complete typography settings', () => {
    expect(theme.typography).toBeDefined();
    expect(theme.typography).toHaveProperty('fontFamily');
    
    // Font sizes
    expect(theme.typography).toHaveProperty('fontSize');
    expect(theme.typography.fontSize).toHaveProperty('xs', '12px');
    expect(theme.typography.fontSize).toHaveProperty('sm', '14px');
    expect(theme.typography.fontSize).toHaveProperty('md', '16px');
    expect(theme.typography.fontSize).toHaveProperty('lg', '18px');
    expect(theme.typography.fontSize).toHaveProperty('xl', '24px');
    expect(theme.typography.fontSize).toHaveProperty('xxl', '32px');
    
    // Font weights
    expect(theme.typography).toHaveProperty('fontWeight');
    expect(theme.typography.fontWeight).toHaveProperty('regular', 400);
    expect(theme.typography.fontWeight).toHaveProperty('medium', 500);
    expect(theme.typography.fontWeight).toHaveProperty('bold', 700);
    
    // Line heights
    expect(theme.typography).toHaveProperty('lineHeight');
    expect(theme.typography.lineHeight).toHaveProperty('tight', 1.2);
    expect(theme.typography.lineHeight).toHaveProperty('normal', 1.5);
    expect(theme.typography.lineHeight).toHaveProperty('loose', 1.8);
  });
  
  test('has complete borders and shadows', () => {
    // Borders
    expect(theme.borders).toBeDefined();
    expect(theme.borders).toHaveProperty('radius');
    expect(theme.borders.radius).toHaveProperty('sm', '4px');
    expect(theme.borders.radius).toHaveProperty('md', '8px');
    expect(theme.borders.radius).toHaveProperty('lg', '16px');
    expect(theme.borders.radius).toHaveProperty('pill', '999px');
    
    expect(theme.borders).toHaveProperty('width');
    expect(theme.borders.width).toHaveProperty('thin', '1px');
    expect(theme.borders.width).toHaveProperty('thick', '2px');
    
    // Shadows
    expect(theme.shadows).toBeDefined();
    expect(theme.shadows).toHaveProperty('sm');
    expect(theme.shadows).toHaveProperty('md');
    expect(theme.shadows).toHaveProperty('lg');
  });
  
  test('has complete breakpoints', () => {
    expect(theme.breakpoints).toBeDefined();
    expect(theme.breakpoints).toHaveProperty('xs', '320px');
    expect(theme.breakpoints).toHaveProperty('sm', '576px');
    expect(theme.breakpoints).toHaveProperty('md', '768px');
    expect(theme.breakpoints).toHaveProperty('lg', '992px');
    expect(theme.breakpoints).toHaveProperty('xl', '1200px');
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

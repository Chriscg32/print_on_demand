import theme from '../../../src/styles/theme';

describe('Theme Structure', () => {
  test('should have consistent color structure', () => {
    // Check main color categories
    expect(theme.colors).toBeDefined();
    expect(theme.colors.primary).toBeDefined();
    expect(theme.colors.secondary).toBeDefined();
    expect(theme.colors.error).toBeDefined();
    
    // Check text colors structure
    expect(theme.colors.text).toBeDefined();
    expect(theme.colors.text.primary).toBeDefined();
    expect(theme.colors.text.secondary).toBeDefined();
    expect(theme.colors.text.light).toBeDefined();
    
    // Check background colors structure
    expect(theme.colors.background).toBeDefined();
    expect(theme.colors.background.primary).toBeDefined();
    expect(theme.colors.background.secondary).toBeDefined();
    expect(theme.colors.background.tertiary).toBeDefined();
    
    // Check colorblind-safe colors
    expect(theme.colors.cbBlue).toBeDefined();
    expect(theme.colors.cbOrange).toBeDefined();
    expect(theme.colors.cbGreen).toBeDefined();
  });

  test('should have consistent spacing scale', () => {
    // Check spacing values
    expect(theme.spacing).toBeDefined();
    expect(theme.spacing.xs).toBeDefined();
    expect(theme.spacing.sm).toBeDefined();
    expect(theme.spacing.md).toBeDefined();
    expect(theme.spacing.lg).toBeDefined();
    expect(theme.spacing.xl).toBeDefined();
    expect(theme.spacing.xxl).toBeDefined();
    
    // Verify spacing follows 8px grid (except xs)
    expect(theme.spacing.sm).toBe('8px');
    expect(theme.spacing.md).toBe('16px');
    expect(theme.spacing.lg).toBe('24px');
    expect(theme.spacing.xl).toBe('32px');
    expect(theme.spacing.xxl).toBe('48px');
  });

  test('should have consistent typography structure', () => {
    // Check typography structure
    expect(theme.typography).toBeDefined();
    expect(theme.typography.fontFamily).toBeDefined();
    
    // Check font size scale
    expect(theme.typography.fontSize).toBeDefined();
    expect(theme.typography.fontSize.xs).toBeDefined();
    expect(theme.typography.fontSize.sm).toBeDefined();
    expect(theme.typography.fontSize.md).toBeDefined();
    expect(theme.typography.fontSize.lg).toBeDefined();
    expect(theme.typography.fontSize.xl).toBeDefined();
    expect(theme.typography.fontSize.xxl).toBeDefined();
    
    // Check font weights
    expect(theme.typography.fontWeight).toBeDefined();
    expect(theme.typography.fontWeight.regular).toBeDefined();
    expect(theme.typography.fontWeight.medium).toBeDefined();
    expect(theme.typography.fontWeight.bold).toBeDefined();
    
    // Check line heights
    expect(theme.typography.lineHeight).toBeDefined();
    expect(theme.typography.lineHeight.tight).toBeDefined();
    expect(theme.typography.lineHeight.normal).toBeDefined();
    expect(theme.typography.lineHeight.loose).toBeDefined();
  });

  test('should have consistent borders and shadows', () => {
    // Check borders structure
    expect(theme.borders).toBeDefined();
    expect(theme.borders.radius).toBeDefined();
    expect(theme.borders.radius.sm).toBeDefined();
    expect(theme.borders.radius.md).toBeDefined();
    expect(theme.borders.radius.lg).toBeDefined();
    expect(theme.borders.radius.pill).toBeDefined();
    
    expect(theme.borders.width).toBeDefined();
    expect(theme.borders.width.thin).toBeDefined();
    expect(theme.borders.width.thick).toBeDefined();
    
    // Check shadows
    expect(theme.shadows).toBeDefined();
    expect(theme.shadows.sm).toBeDefined();
    expect(theme.shadows.md).toBeDefined();
    expect(theme.shadows.lg).toBeDefined();
  });

  test('should have consistent breakpoints', () => {
    // Check breakpoints
    expect(theme.breakpoints).toBeDefined();
    expect(theme.breakpoints.xs).toBeDefined();
    expect(theme.breakpoints.sm).toBeDefined();
    expect(theme.breakpoints.md).toBeDefined();
    expect(theme.breakpoints.lg).toBeDefined();
    expect(theme.breakpoints.xl).toBeDefined();
    
    // Verify breakpoints are in ascending order
    const breakpointValues = Object.values(theme.breakpoints).map(bp => parseInt(bp));
    const sortedValues = [...breakpointValues].sort((a, b) => a - b);
    expect(breakpointValues).toEqual(sortedValues);
  });

  test('should have consistent transitions', () => {
    // Check transitions
    expect(theme.transitions).toBeDefined();
    expect(theme.transitions.duration).toBeDefined();
    expect(theme.transitions.duration.fast).toBeDefined();
    expect(theme.transitions.duration.normal).toBeDefined();
    expect(theme.transitions.duration.slow).toBeDefined();
    
    expect(theme.transitions.timing).toBeDefined();
  });

  test('should have consistent z-index scale', () => {
    // Check z-index scale
    expect(theme.zIndex).toBeDefined();
    expect(theme.zIndex.dropdown).toBeDefined();
    expect(theme.zIndex.sticky).toBeDefined();
    expect(theme.zIndex.fixed).toBeDefined();
    expect(theme.zIndex.modal).toBeDefined();
    expect(theme.zIndex.popover).toBeDefined();
    expect(theme.zIndex.tooltip).toBeDefined();
    
    // Verify z-indices are in ascending order
    const zIndices = Object.values(theme.zIndex);
    for (let i = 0; i < zIndices.length - 1; i++) {
      expect(zIndices[i]).toBeLessThan(zIndices[i + 1]);
    }
  });

  test('should have all color values in valid format', () => {
    // Helper to check if a string is a valid color
    const isValidColor = (color) => {
      // Check hex format
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) return true;
      
      // Check rgb/rgba format
      if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)) return true;
      if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color)) return true;
      
      return false;
    };
    
    // Check all direct color values
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        expect(isValidColor(value)).toBe(true);
      }
    });
    
    // Check nested text colors
    Object.values(theme.colors.text).forEach(color => {
      expect(isValidColor(color)).toBe(true);
    });
    
    // Check nested background colors
    Object.values(theme.colors.background).forEach(color => {
      expect(isValidColor(color)).toBe(true);
    });
  });
});
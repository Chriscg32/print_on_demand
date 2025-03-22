import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ThemeProvider } from 'styled-components';
import Button from '../Button';
import theme from '../../styles/theme';

// Wrapper component to provide theme
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  test('renders correctly', () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  test('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('applies different variants', () => {
    const { rerender } = renderWithTheme(<Button variant="primary">Primary</Button>);
    const primaryButton = screen.getByText('Primary');
    
    // Check primary styling
    expect(primaryButton).toHaveStyle(`background-color: ${theme.colors.primary}`);
    
    // Rerender with secondary variant
    rerender(
      <ThemeProvider theme={theme}>
        <Button variant="secondary">Secondary</Button>
      </ThemeProvider>
    );
    
    const secondaryButton = screen.getByText('Secondary');
    expect(secondaryButton).toHaveStyle(`background-color: ${theme.colors.secondary}`);
  });
  
  test('applies different sizes', () => {
    const { rerender } = renderWithTheme(<Button size="small">Small</Button>);
    
    // Rerender with large size
    rerender(
      <ThemeProvider theme={theme}>
        <Button size="large">Large</Button>
      </ThemeProvider>
    );
    
    const largeButton = screen.getByText('Large');
    expect(largeButton).toHaveStyle(`font-size: ${theme.typography.fontSize.lg}`);
  });
  
  test('disables the button when disabled prop is true', () => {
    renderWithTheme(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
  
  test('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <>
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button disabled>Disabled</Button>
      </>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
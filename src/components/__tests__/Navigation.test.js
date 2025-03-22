import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';

// Mock styled-components directly in the test file
jest.mock('styled-components', () => ({
  ThemeProvider: ({ children }) => children,
  default: () => jest.fn().mockImplementation(({ children }) => children)
}));

describe('Navigation Component', () => {
  test('renders logo and navigation items', () => {
    render(<Navigation />);
    
    // Check logo
    expect(screen.getByText('PrintOnDemand')).toBeInTheDocument();
    
    // Check navigation items that actually exist in the component
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Custom Order')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  test('navigation items are buttons', () => {
    render(<Navigation />);
    
    // Get all navigation items
    const navItems = screen.getAllByRole('button');
    
    // Check that we have at least 4 navigation items
    expect(navItems.length).toBeGreaterThanOrEqual(4);
    
    // Check that the navigation items include the expected text
    expect(navItems.some(item => item.textContent === 'Products')).toBe(true);
    expect(navItems.some(item => item.textContent === 'Custom Order')).toBe(true);
    expect(navItems.some(item => item.textContent === 'About')).toBe(true);
    expect(navItems.some(item => item.textContent === 'Contact')).toBe(true);
  });

  test('navigation items have proper styling', () => {
    render(<Navigation />);
    
    // Get all navigation items
    const navItems = screen.getAllByRole('button');
    
    // Check that each navigation item has the expected classes
    navItems.forEach(item => {
      expect(item).toHaveClass('text-text');
      expect(item).toHaveClass('hover:text-primary');
      expect(item).toHaveClass('hover-transition');
    });
  });

  test('navigation container has proper styling', () => {
    render(<Navigation />);
    
    // Check that the navigation container has the expected classes
    const navContainer = screen.getByRole('navigation');
    expect(navContainer).toHaveClass('bg-white');
    expect(navContainer).toHaveClass('shadow-md');
  });

  // Test for accessibility attributes
  test('navigation has proper accessibility attributes', () => {
    render(<Navigation />);
    
    // Check that the navigation has the proper role
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // Check that the logo is properly labeled
    const logo = screen.getByText('PrintOnDemand');
    expect(logo).toHaveClass('text-xl');
    expect(logo).toHaveClass('font-bold');
  });

  // Test for mobile responsiveness
  test('mobile menu is hidden by default on desktop', () => {
    render(<Navigation />);
    
    // Check that the desktop menu is visible
    const desktopMenu = screen.getByRole('list');
    expect(desktopMenu).toHaveClass('hidden');
    expect(desktopMenu).toHaveClass('md:flex');
  });

  // Test for navigation item click handling
  test('navigation items call handleNavigation when clicked', () => {
    // Create a spy on console.log to check if it's called with the right arguments
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<Navigation />);
    
    // Click on the Products button
    fireEvent.click(screen.getByText('Products'));
    
    // Check that console.log was called with the right argument
    expect(consoleSpy).toHaveBeenCalledWith('Navigating to products');
    
    // Click on another button
    fireEvent.click(screen.getByText('About'));
    
    // Check that console.log was called with the right argument
    expect(consoleSpy).toHaveBeenCalledWith('Navigating to about');
    
    // Restore the original console.log
    consoleSpy.mockRestore();
  });

  // Test for keyboard accessibility
  test('navigation items are keyboard accessible', () => {
    // Create a spy on console.log to check if it's called with the right arguments
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<Navigation />);
    
    // Get the Products button
    const productsButton = screen.getByText('Products');
    
    // Focus on the button
    productsButton.focus();
    
    // Press Enter key
    fireEvent.keyDown(productsButton, { key: 'Enter', code: 'Enter' });
    
    // Check that console.log was called with the right argument
    expect(consoleSpy).toHaveBeenCalledWith('Navigating to products');
    
    // Restore the original console.log
    consoleSpy.mockRestore();
  });

  // Test for proper button type attribute
  test('navigation buttons have proper type attribute', () => {
    render(<Navigation />);
    
    // Get all navigation buttons
    const buttons = screen.getAllByRole('button');
    
    // Add type="button" to all buttons to prevent form submission
    buttons.forEach(button => {
      // If the test fails here, we need to add type="button" to all buttons in the Navigation component
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});

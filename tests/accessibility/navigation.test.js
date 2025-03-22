import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navigation from '../../src/components/Navigation';

// Add jest-axe custom matcher
expect.extend(toHaveNoViolations);

// Sample navigation items for testing
const navItems = [
  { label: 'Home', path: '/', current: true },
  { label: 'Products', path: '/products' },
  { 
    label: 'Categories', 
    children: [
      { label: 'Electronics', path: '/categories/electronics' },
      { label: 'Clothing', path: '/categories/clothing' }
    ]
  },
  { label: 'About', path: '/about' }
];

describe('Navigation Component Accessibility', () => {
  test('should have no accessibility violations', async () => {
    const { container } = render(
      <Navigation logoText="Test Logo" items={navItems} />
    );
    
    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('buttons should have type attribute', () => {
    render(<Navigation logoText="Test Logo" items={navItems} />);
    
    // Check mobile menu button
    const mobileMenuButton = screen.getByLabelText(/open menu/i);
    expect(mobileMenuButton).toHaveAttribute('type', 'button');
    
    // Check dropdown triggers
    const dropdownTrigger = screen.getByText('Categories');
    expect(dropdownTrigger).toHaveAttribute('type', 'button');
  });

  test('dropdown should be keyboard accessible', () => {
    render(<Navigation logoText="Test Logo" items={navItems} />);
    
    // Find dropdown trigger
    const dropdownTrigger = screen.getByText('Categories');
    
    // Dropdown should be closed initially
    expect(screen.queryByText('Electronics')).not.toBeVisible();
    
    // Open with Enter key
    fireEvent.keyDown(dropdownTrigger, { key: 'Enter' });
    expect(screen.getByText('Electronics')).toBeVisible();
    
    // Close with Escape key
    fireEvent.keyDown(dropdownTrigger, { key: 'Escape' });
    expect(screen.queryByText('Electronics')).not.toBeVisible();
    
    // Open with Space key
    fireEvent.keyDown(dropdownTrigger, { key: ' ' });
    expect(screen.getByText('Electronics')).toBeVisible();
  });

  test('navigation links should have proper ARIA attributes', () => {
    render(<Navigation logoText="Test Logo" items={navItems} />);
    
    // Current page should have aria-current="page"
    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
    
    // Dropdown should have aria-expanded and aria-haspopup
    const dropdownTrigger = screen.getByText('Categories');
    expect(dropdownTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(dropdownTrigger).toHaveAttribute('aria-haspopup', 'true');
    
    // Open dropdown
    fireEvent.click(dropdownTrigger);
    expect(dropdownTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('mobile menu should be accessible', () => {
    // Mock mobile viewport
    window.innerWidth = 600;
    
    render(<Navigation logoText="Test Logo" items={navItems} />);
    
    // Mobile menu button should have proper attributes
    const menuButton = screen.getByLabelText(/open menu/i);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveAttribute('aria-controls', 'nav-menu');
    
    // Open mobile menu
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(menuButton).toHaveAccessibleName(/close menu/i);
    
    // Nav list should be visible
    const navList = screen.getByRole('list');
    expect(navList).toBeVisible();
  });
});
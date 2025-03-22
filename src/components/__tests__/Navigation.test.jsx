import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';

// Mock the theme to avoid import issues in tests
jest.mock('../../styles/theme', () => ({
  theme: {
    colors: {
      primary: '#3b82f6',
      text: '#1f2937'
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem'
    }
  }
}));

describe('Navigation Component', () => {
  // Sample navigation items for testing
  const navItems = [
    { label: 'Home', path: '/', current: true },
    { label: 'Products', path: '/products' },
    { label: 'Custom Order', path: '/custom-order' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  // Mock window.location.href
  const originalLocation = window.location;
  
  beforeAll(() => {
    delete window.location;
    window.location = { href: '' };
  });
  
  afterAll(() => {
    window.location = originalLocation;
  });
  
  beforeEach(() => {
    window.location.href = '';
  });

  test('renders logo and navigation items', () => {
    render(<Navigation items={navItems} />);
    
    // Check logo
    expect(screen.getByText('PrintOnDemand')).toBeInTheDocument();
    
    // Check navigation items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Custom Order')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  test('renders custom logo text when provided', () => {
    render(<Navigation items={navItems} logoText="Custom Logo" />);
    
    expect(screen.getByText('Custom Logo')).toBeInTheDocument();
  });

  test('marks current page with aria-current attribute', () => {
    render(<Navigation items={navItems} />);
    
    // Home should be marked as current
    const homeButton = screen.getByText('Home');
    expect(homeButton).toHaveAttribute('aria-current', 'page');
    
    // Other items should not be marked as current
    const productsButton = screen.getByText('Products');
    expect(productsButton).not.toHaveAttribute('aria-current', 'page');
  });

  test('navigates when menu item is clicked', () => {
    render(<Navigation items={navItems} />);
    
    // Click on Products button
    fireEvent.click(screen.getByText('Products'));
    
    // Check that window.location.href was updated
    expect(window.location.href).toBe('/products');
  });

  test('toggles mobile menu when button is clicked', () => {
    render(<Navigation items={navItems} />);
    
    // Mobile menu should be hidden initially
    const mobileMenuButton = screen.getByTestId('mobile-menu-button');
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
    
    // Mobile menu should not be visible
    expect(screen.getByRole('menu', { hidden: true })).not.toBeVisible();
    
    // Click mobile menu button
    fireEvent.click(mobileMenuButton);
    
    // Mobile menu should now be expanded
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Mobile menu should be visible
    expect(screen.getByRole('menu')).toBeVisible();
    
    // Click again to close
    fireEvent.click(mobileMenuButton);
    
    // Mobile menu should be collapsed again
    expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('supports keyboard navigation', () => {
    render(<Navigation items={navItems} />);
    
    // Get the Products button
    const productsButton = screen.getByText('Products');
    
    // Simulate pressing Enter key
    fireEvent.keyDown(productsButton, { key: 'Enter' });
    
    // Check that navigation occurred
    expect(window.location.href).toBe('/products');
    
    // Reset location
    window.location.href = '';
    
    // Simulate pressing Space key
    fireEvent.keyDown(productsButton, { key: ' ' });
    
    // Check that navigation occurred
    expect(window.location.href).toBe('/products');
  });

  test('has proper accessibility attributes', () => {
    render(<Navigation items={navItems} />);
    
    // Check that the nav element has proper aria-label
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    
    // Check that the desktop menu has proper role and aria-label
    const desktopMenu = screen.getByRole('menubar');
    expect(desktopMenu).toHaveAttribute('aria-label', 'Main menu');
    
    // Check that the mobile menu button has proper aria attributes
    const mobileMenuButton = screen.getByTestId('mobile-menu-button');
    expect(mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    expect(mobileMenuButton).toHaveAttribute('aria-label', 'Open menu');
    
    // Check that all menu items have role="menuitem"
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBe(navItems.length);
  });

  test('all buttons have type attribute for form safety', () => {
    render(<Navigation items={navItems} />);
    
    // Get all buttons
    const buttons = screen.getAllByRole('button');
    
    // Check that each button has type="button"
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  // Test for responsive behavior (this is limited in JSDOM)
  test('mobile menu is hidden on desktop', () => {
    // Mock window.innerWidth to simulate desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024 // Desktop width
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    render(<Navigation items={navItems} />);
    
    // Mobile menu should be hidden
    const mobileMenu = document.getElementById('mobile-menu');
    expect(mobileMenu).toHaveClass('hidden');
    
    // Desktop menu should be visible
    const desktopMenu = screen.getByRole('menubar');
    expect(desktopMenu).toHaveClass('md:flex');
  });
});
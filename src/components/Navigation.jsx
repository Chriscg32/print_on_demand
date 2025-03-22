import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { theme } from '../styles/theme';

/**
 * Navigation component that displays a responsive navigation bar
 * with mobile and desktop views.
 */
const Navigation = ({ items, logoText }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path) => {
    // Using window.location.href for navigation
    window.location.href = path;
  };

  const handleKeyDown = (event, path) => {
    // Handle keyboard navigation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigation(path);
    }
  };

  return (
    <nav aria-label="Main navigation" className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span 
              className="text-xl font-bold" 
              style={{ color: theme.colors.primary }}
              role="banner"
            >
              {logoText}
            </span>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              type="button"
              onClick={toggleMobileMenu}
              style={{
                color: theme.colors.text,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              data-testid="mobile-menu-button"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div 
            className="hidden md:flex" 
            style={{ gap: theme.spacing.medium }}
            role="menubar"
            aria-label="Main menu"
          >
            {items.map((item, index) => (
              <button 
                key={`desktop-${item.label}-${index}`}
                type="button"
                onClick={() => handleNavigation(item.path)}
                onKeyDown={(e) => handleKeyDown(e, item.path)}
                style={{
                  color: theme.colors.text,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: theme.spacing.small,
                  borderRadius: '4px',
                  transition: 'color 0.2s, background-color 0.2s'
                }}
                className="hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                role="menuitem"
                tabIndex={0}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div 
          className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          id="mobile-menu"
          role="menu"
          aria-label="Mobile menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {items.map((item, index) => (
                <button 
                  key={`mobile-${item.label}-${index}`}
                  type="button"
                  onClick={() => handleNavigation(item.path)}
                  onKeyDown={(e) => handleKeyDown(e, item.path)}
                  style={{
                    display: 'block',
                    color: theme.colors.text,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: `${theme.spacing.small} 0`,
                    width: '100%',
                    textAlign: 'left',
                    transition: 'color 0.2s, background-color 0.2s'
                  }}
                  className="hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
                  role="menuitem"
                  tabIndex={0}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
      </div>
    </nav>
  );
};

// Prop validation
Navigation.propTypes = {
  /**
   * Array of navigation items
   */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * Label text for the navigation item
       */
      label: PropTypes.string.isRequired,
      /**
       * URL path for the navigation item
       */
      path: PropTypes.string.isRequired,
      /**
       * Whether this item represents the current page
       */
      current: PropTypes.bool
    })
  ).isRequired,
  /**
   * Text to display as the logo
   */
  logoText: PropTypes.string
};

// Default props
Navigation.defaultProps = {
  logoText: 'PrintOnDemand'
};

export default Navigation;

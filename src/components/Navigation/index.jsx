import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from '../../styles/theme';

// Main navigation container
const NavContainer = styled.nav`
  background-color: ${theme.colors.background.primary};
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.a`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:focus {
    outline: 2px solid ${theme.colors.cb.orange};
    outline-offset: 2px;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: ${theme.colors.background.primary};
    box-shadow: ${theme.shadows.md};
    padding: ${theme.spacing.md};
  }
`;

const NavItem = styled.li`
  position: relative;
  margin: 0 ${theme.spacing.sm};
  
  @media (max-width: ${theme.breakpoints.md}) {
    margin: ${theme.spacing.xs} 0;
    width: 100%;
  }
`;

const NavLink = styled.a`
  color: ${theme.colors.text.primary};
  text-decoration: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borders.radius.sm};
  transition: background-color ${theme.transitions.duration.fast} ${theme.transitions.timing};
  display: block;
  
  &:hover {
    background-color: ${theme.colors.background.tertiary};
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.cb.orange};
    outline-offset: 2px;
  }
  
  &[aria-current="page"] {
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.primary};
  }
`;

const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background-color: ${theme.colors.background.primary};
  box-shadow: ${theme.shadows.md};
  border-radius: ${theme.borders.radius.md};
  padding: ${theme.spacing.sm} 0;
  margin: ${theme.spacing.xs} 0 0;
  list-style: none;
  z-index: 10;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: 
    opacity ${theme.transitions.duration.fast} ${theme.transitions.timing},
    transform ${theme.transitions.duration.fast} ${theme.transitions.timing},
    visibility ${theme.transitions.duration.fast} ${theme.transitions.timing};
  
  @media (max-width: ${theme.breakpoints.md}) {
    position: static;
    box-shadow: none;
    padding-left: ${theme.spacing.lg};
    margin: 0;
    opacity: 1;
    visibility: visible;
    transform: none;
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const DropdownItem = styled.li`
  margin: 0;
`;

const DropdownLink = styled.a`
  color: ${theme.colors.text.primary};
  text-decoration: none;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  display: block;
  transition: background-color ${theme.transitions.duration.fast} ${theme.transitions.timing};
  
  &:hover {
    background-color: ${theme.colors.background.tertiary};
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.cb.orange};
    outline-offset: -2px;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: ${theme.spacing.sm};
  cursor: pointer;
  color: ${theme.colors.text.primary};
  
  &:focus {
    outline: 2px solid ${theme.colors.cb.orange};
    outline-offset: 2px;
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: block;
  }
`;

// Dropdown trigger with chevron
const DropdownTrigger = styled.button`
  background: none;
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${theme.colors.text.primary};
  font-size: inherit;
  font-family: inherit;
  border-radius: ${theme.borders.radius.sm};
  transition: background-color ${theme.transitions.duration.fast} ${theme.transitions.timing};
  
  &:hover {
    background-color: ${theme.colors.background.tertiary};
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.cb.orange};
    outline-offset: 2px;
  }
  
  &::after {
    content: '';
    display: inline-block;
    margin-left: ${theme.spacing.xs};
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid currentColor;
    transition: transform ${theme.transitions.duration.fast} ${theme.transitions.timing};
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

// Helper functions extracted to reduce nesting
const getItemKey = (item, index) => {
  return `nav-item-${item.id || item.label.replace(/\s+/g, '-').toLowerCase() || index}`;
};

const getDropdownItemKey = (item, index) => {
  return `dropdown-item-${item.id || item.label.replace(/\s+/g, '-').toLowerCase() || index}`;
};

// Dropdown item component to reduce nesting
const DropdownItemComponent = ({ item, index, isOpen, tabIndex }) => (
  <DropdownItem key={getDropdownItemKey(item, index)} role="none">
    <DropdownLink 
      href={item.path} 
      role="menuitem"
      tabIndex={tabIndex}
    >
      {item.label}
    </DropdownLink>
  </DropdownItem>
);

DropdownItemComponent.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    id: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  tabIndex: PropTypes.number.isRequired
};

// Navigation component with dropdown support
const Navigation = ({ logoText, items }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const dropdownRefs = useRef({});

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          setOpenDropdowns(prev => ({
            ...prev,
            [key]: false
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, key) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown(key);
    } else if (e.key === 'Escape') {
      setOpenDropdowns(prev => ({
        ...prev,
        [key]: false
      }));
    }
  };
  
  // Handle mouse events for desktop navigation
  const handleMouseEnter = (index) => {
    setOpenDropdowns(prev => ({ ...prev, [index]: true }));
  };
  
  const handleMouseLeave = (index) => {
    setOpenDropdowns(prev => ({ ...prev, [index]: false }));
  };

  return (
    <NavContainer aria-label="Main navigation">
      <NavInner>
        <Logo href="/" aria-label="Home">
          {logoText}
        </Logo>
        
        <MobileMenuButton 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="nav-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </MobileMenuButton>
        
        <NavList id="nav-menu" isOpen={mobileMenuOpen}>
          {items.map((item, index) => (
            <NavItem key={getItemKey(item, index)}>
              {item.children ? (
                <div 
                  ref={el => dropdownRefs.current[index] = el}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-haspopup="true"
                  aria-expanded={openDropdowns[index] || false}
                >
                  <DropdownTrigger
                    onClick={() => toggleDropdown(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-expanded={openDropdowns[index] || false}
                    aria-haspopup="true"
                    isOpen={openDropdowns[index] || false}
                  >
                    {item.label}
                  </DropdownTrigger>
                  
                  <DropdownMenu 
                    isOpen={openDropdowns[index] || false}
                    aria-label={`${item.label} submenu`}
                    role="menu"
                  >
                    {item.children.map((child, childIndex) => (
                      <DropdownItemComponent
                        key={getDropdownItemKey(child, childIndex)}
                        item={child}
                        index={childIndex}
                        isOpen={openDropdowns[index] || false}
                        tabIndex={openDropdowns[index] ? 0 : -1}
                      />
                    ))}
                  </DropdownMenu>
                </div>
              ) : (
                <NavLink 
                  href={item.path}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.label}
                </NavLink>
              )}
            </NavItem>
          ))}
        </NavList>
      </NavInner>
    </NavContainer>
  );
};

Navigation.propTypes = {
  logoText: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      current: PropTypes.bool,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          label: PropTypes.string.isRequired,
          path: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired
};

export default Navigation;

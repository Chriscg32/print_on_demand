import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Navigation from '../Navigation';
import theme from '../../styles/theme';

// Main content container
const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
  min-height: calc(100vh - 200px); /* Account for header and footer */
`;

// Footer component
const Footer = styled.footer`
  background-color: ${theme.colors.background.secondary};
  padding: ${theme.spacing.lg};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

// Skip to content link for accessibility
const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  z-index: 100;
  transition: top 0.3s;
  
  &:focus {
    top: 0;
  }
`;

// Navigation items configuration
const navigationItems = [
  {
    label: 'Home',
    path: '/',
    current: true
  },
  {
    label: 'Products',
    children: [
      {
        label: 'T-Shirts',
        path: '/products/t-shirts'
      },
      {
        label: 'Mugs',
        path: '/products/mugs'
      },
      {
        label: 'Posters',
        path: '/products/posters'
      }
    ]
  },
  {
    label: 'Designer',
    path: '/designer'
  },
  {
    label: 'Orders',
    path: '/orders'
  },
  {
    label: 'Account',
    children: [
      {
        label: 'Profile',
        path: '/account/profile'
      },
      {
        label: 'Settings',
        path: '/account/settings'
      },
      {
        label: 'Logout',
        path: '/logout'
      }
    ]
  }
];

// Breadcrumb navigation
const Breadcrumbs = styled.nav`
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const BreadcrumbList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  
  &:not(:last-child)::after {
    content: '/';
    margin: 0 ${theme.spacing.sm};
    color: ${theme.colors.text.disabled};
  }
`;

const BreadcrumbLink = styled.a`
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  
  &:hover {
    color: ${theme.colors.primary};
    text-decoration: underline;
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.cb.orange};
    outline-offset: 2px;
  }
`;

const CurrentBreadcrumb = styled.span`
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

// Layout component that wraps all pages
const Layout = ({ children, breadcrumbs = [] }) => {
  return (
    <>
      <SkipLink href="#main-content">Skip to content</SkipLink>
      <Navigation logoText="PrintOnDemand" items={navigationItems} />
      
      <Main id="main-content">
        {breadcrumbs.length > 0 && (
          <Breadcrumbs aria-label="Breadcrumb">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem key={crumb.path || `breadcrumb-${crumb.label || index}`}>
                  {index === breadcrumbs.length - 1 ? (
                    <CurrentBreadcrumb aria-current="page">
                      {crumb.label}
                    </CurrentBreadcrumb>
                  ) : (
                    <BreadcrumbLink href={crumb.path}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumbs>
        )}
        
        {children}
      </Main>
      
      <Footer>
        <p>&copy; {new Date().getFullYear()} Print On Demand. All rights reserved.</p>
      </Footer>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  )
};

export default Layout;

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

// Mock styled-components
const styled = {};

// Add all the HTML elements as properties
const htmlElements = [
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'big', 'blockquote', 'body',
  'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details',
  'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
  'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav',
  'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp',
  'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub',
  'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u',
  'ul', 'var', 'video', 'wbr'
];

// Create a template tag function that returns a component
// Fix S3800: Ensure consistent return type (always return a function)
const templateTagFunction = (strings, ...expressions) => {
  return (props) => {
    // Mock component that returns props
    return props;
  };
};

// Define prop types for styled components
const StyledComponentPropTypes = {
  className: PropTypes.string,
  'data-testid': PropTypes.string,
  id: PropTypes.string
};

// Helper to create the styled component factory
const createStyled = (element) => {
  const componentFactory = (...args) => {
    // Handle tagged template literals
    if (Array.isArray(args[0]) && args[0].raw) {
      return templateTagFunction(args[0], ...args.slice(1));
    }
    
    // Create a forwarded ref component
    const StyledComponent = React.forwardRef((props, ref) => {
      // Use the element directly, whether it's a string or component
      return React.createElement(element, { 
        ...props, 
        ref,
        className: props.className || '',
        'data-testid': props['data-testid'] || props.id || undefined
      });
    });
    
    // Add prop types to the component
    StyledComponent.propTypes = StyledComponentPropTypes;
    
    return StyledComponent;
  };
  
  // Add attrs method to support styled.div.attrs({...})
  componentFactory.attrs = (attrs) => {
    return createStyled(element);
  };
  
  // Add withConfig method
  componentFactory.withConfig = (config) => {
    return createStyled(element);
  };
  
  return componentFactory;
};

// Add all HTML elements to the styled object
htmlElements.forEach(element => {
  styled[element] = createStyled(element);
});

// Support for styled(Component) syntax
const styledFunction = (Component) => {
  return createStyled(Component);
};

// Set up the default export properly
styled.default = styledFunction;
Object.setPrototypeOf(styled, styledFunction);

// Mock ThemeProvider with actual theme support
const ThemeContext = React.createContext({});

// ThemeProvider with proper validation and memoized theme
const ThemeProvider = ({ theme, children }) => {
  // Use useMemo to prevent value from changing on every render
  const themeValue = useMemo(() => theme || {}, [theme]);
  
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  theme: PropTypes.object,
  children: PropTypes.node
};

ThemeProvider.defaultProps = {
  theme: {}
};

// Mock useTheme hook
const useTheme = () => React.useContext(ThemeContext);

// Mock css function that returns an array (to be compatible with className concatenation)
const css = (...args) => {
  // Return an empty array that stringifies to an empty string
  const cssArray = [];
  cssArray.toString = () => '';
  return cssArray;
};

// Mock keyframes that returns a string
const keyframes = () => 'animation-name';

// Mock createGlobalStyle
const createGlobalStyle = () => {
  const GlobalStyle = () => null;
  GlobalStyle.globalStyle = true;
  return GlobalStyle;
};

// Mock isStyledComponent
const isStyledComponent = (component) => {
  if (!component) {
    return false;
  }
  
  if (component.styledComponentId) {
    return true;
  }
  
  if (component.target) {
    return isStyledComponent(component.target);
  }
  
  return false;
};

// Export all the necessary parts of the API
export { 
  css, 
  keyframes, 
  createGlobalStyle, 
  ThemeProvider,
  ThemeContext,
  useTheme,
  isStyledComponent
};

export default styled;

# Navigation Component

A responsive navigation bar component that adapts to both desktop and mobile views.

## Features

- Responsive design with mobile hamburger menu
- Keyboard accessible navigation
- Screen reader friendly with ARIA attributes
- Current page indication
- Customizable logo text

## Usage

```jsx
import Navigation from './components/Navigation';

// Define your navigation items
const navItems = [
  { label: 'Home', path: '/', current: true },
  { label: 'Products', path: '/products' },
  { label: 'Custom Order', path: '/custom-order' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' }
];

// Use the component
function App() {
  return (
    <div className="app">
      <Navigation items={navItems} logoText="My Brand" />
      {/* Rest of your app */}
    </div>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | Array | Yes | - | Array of navigation items |
| `logoText` | String | No | 'PrintOnDemand' | Text to display as the logo |

### Navigation Item Structure

Each item in the `items` array should have the following structure:

```js
{
  label: 'Home',     // Text to display for the navigation item
  path: '/',         // URL path for navigation
  current: true      // (Optional) Whether this item represents the current page
}
```

## Accessibility

The Navigation component includes several accessibility features:

- Proper ARIA roles and labels for navigation elements
- Keyboard navigation support (Enter and Space keys)
- Current page indication with `aria-current="page"`
- Mobile menu toggle with `aria-expanded` and `aria-controls`
- Focus styles for keyboard users

## Styling

The component uses a combination of Tailwind CSS classes and inline styles from the theme. You can customize the appearance by modifying the theme values in `src/styles/theme.js`.

## Example with React Router

For applications using React Router, you can modify the component to use `Link` components instead of direct navigation:

```jsx
import { Link } from 'react-router-dom';

// In the Navigation component:
{items.map((item, index) => (
  <Link
    key={index}
    to={item.path}
    className="text-gray-800 hover:bg-gray-100 px-3 py-2 rounded"
    aria-current={item.current ? 'page' : undefined}
  >
    {item.label}
  </Link>
))}
```

## Browser Support

The Navigation component is compatible with all modern browsers:

- Chrome
- Firefox
- Safari
- Edge

## Performance Considerations

The component is lightweight and uses minimal state, resulting in good performance. The mobile menu toggle is the only interactive element that triggers re-renders.

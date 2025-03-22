import React from 'react';
import { theme } from '../styles/theme';

const Navigation = ({ items }) => (
  <nav aria-label="Main navigation">
    <ul style={{
      display: 'flex',
      listStyle: 'none',
      gap: theme.spacing.medium,
      padding: 0
    }}>
      {items.map((item, index) => (
        <li key={index}>
          <a
            href={item.path}
            style={{
              color: theme.colors.text,
              padding: theme.spacing.small,
              borderRadius: '4px',
              '&:focus': {
                outline: `2px solid ${theme.colors.cbOrange}`
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.target.click()}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export default Navigation;
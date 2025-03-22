import React from 'react';

interface NavProps {
  items: Array<{
    id: string;
    label: string;
    href: string;
  }>;
}

export const Navigation: React.FC<NavProps> = ({ items }) => {
  return (
    <nav aria-label="Main navigation" role="navigation">
      <ul role="menubar">
        {items.map((item) => (
          <li key={item.id} role="none">
            <a
              href={item.href}
              role="menuitem"
              aria-label={item.label}
              tabIndex={0}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

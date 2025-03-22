# Corrective Build Brief

## 1. Database Migration System Implementation

### Action Items:
- Implement Knex.js for SQLite migrations
- Create initial schema migration
- Add version tracking table
- Implement rollback capability

### Code Example:
```javascript
// migrations/20230401_initial_schema.js
exports.up = function(knex) {
  return knex.schema.createTable('products', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
```

## 2. Environment Configuration Validation

### Action Items:
- Implement dotenv-safe for validation
- Create .env.example with required variables
- Add environment validation on startup
- Document all environment variables

### Code Example:
```javascript
// src/config/env.js
const dotenvSafe = require('dotenv-safe');
const path = require('path');

dotenvSafe.config({
  allowEmptyValues: false,
  example: path.resolve(__dirname, '../../.env.example')
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  SQLCIPHER_KEY: process.env.SQLCIPHER_KEY,
  SQLITE_PATH: process.env.SQLITE_PATH
};
```

## 3. Accessibility Implementation

### Action Items:
- Add axe-core for automated accessibility testing
- Implement focus management for keyboard navigation
- Create colorblind simulation tests
- Add ARIA attributes to all interactive elements

### Code Example:
```javascript
// tests/accessibility/color.test.js
const { toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);

describe('Color Contrast Tests', () => {
  it('should pass WCAG AA contrast requirements', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## 4. SQLCipher Cross-Platform Integration

### Action Items:
- Create platform-specific installation scripts
- Implement Docker-based development environment
- Add better error handling for encryption failures
- Create database connection pooling

### Code Example:
```javascript
// src/db/pool.js
const { createPool } = require('generic-pool');
const configureDB = require('./config');

const dbPool = createPool({
  create: async () => {
    const db = await configureDB();
    await db.exec('PRAGMA busy_timeout = 5000;');
    return db;
  },
  destroy: async (db) => {
    await db.close();
  }
}, {
  max: 10,
  min: 2
});

module.exports = dbPool;
```

## 5. Navigation System Enhancement

### Action Items:
- Implement hover-activated dropdown menus
- Add breadcrumb navigation component
- Create mobile-responsive navigation
- Implement keyboard accessibility for menus

### Code Example:
```javascript
// src/components/Navigation/HoverMenu.jsx
import React, { useState } from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuTrigger = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  color: ${props => props.theme.colors.text};
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.cbOrange};
  }
`;

const MenuContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-radius: 4px;
  min-width: 200px;
  z-index: 100;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const HoverMenu = ({ label, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <MenuContainer 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <MenuTrigger 
        aria-haspopup="true"
        aria-expanded={isOpen}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {label}
      </MenuTrigger>
      <MenuContent isOpen={isOpen} role="menu">
        {children}
      </MenuContent>
    </MenuContainer>
  );
};

export default HoverMenu;
```
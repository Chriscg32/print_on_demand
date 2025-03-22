import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button Component', () => {
  test('renders correctly with default props', () => {
    render(<Button>Click Me</Button>);
    
    const button = screen.getByText(/click me/i);
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button.className).toContain('bg-blue-500'); // primary variant
  });

  test('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText(/primary/i).className).toContain('bg-blue-500');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText(/secondary/i).className).toContain('bg-green-500');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText(/outline/i).className).toContain('border-blue-500');
  });

  test('renders with different sizes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByText(/small/i).className).toContain('text-sm');
    
    rerender(<Button size="medium">Medium</Button>);
    expect(screen.getByText(/medium/i).className).toContain('px-4');
    
    rerender(<Button size="large">Large</Button>);
    expect(screen.getByText(/large/i).className).toContain('text-lg');
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByText(/click me/i);
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByText(/disabled button/i);
    expect(button).toBeDisabled();
    expect(button.className).toContain('cursor-not-allowed');
  });
});

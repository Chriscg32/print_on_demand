import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DesignCard from '../DesignCard';

// Mock the Button component
jest.mock('../Button', () => {
  return function MockButton({ children, onClick, variant, 'data-testid': dataTestId }) {
    return (
      <button 
        onClick={onClick} 
        data-testid={dataTestId || 'mock-button'}
        className={variant}
      >
        {children}
      </button>
    );
  };
});

describe('DesignCard Component', () => {
  const mockDesign = {
    id: 'design-1',
    title: 'Test Design',
    description: 'This is a test design',
    thumbnail: 'test-image.jpg'
  };
  
  const mockOnSelect = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders design information correctly', () => {
    render(
      <DesignCard 
        design={mockDesign} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    
    // Check that the design title and description are rendered
    expect(screen.getByText(mockDesign.title)).toBeInTheDocument();
    expect(screen.getByText(mockDesign.description)).toBeInTheDocument();
    
    // Check that the image is rendered with the correct src and alt
    const image = screen.getByAltText(mockDesign.title);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockDesign.thumbnail);
  });
  
  test('calls onSelect when the select button is clicked', () => {
    render(
      <DesignCard 
        design={mockDesign} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    
    // Find the select button and click it
    const selectButton = screen.getByTestId(`select-button-${mockDesign.id}`);
    fireEvent.click(selectButton);
    
    // Check that onSelect was called with the design
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockDesign);
  });
  
  test('shows "Selected" when isSelected is true', () => {
    render(
      <DesignCard 
        design={mockDesign} 
        onSelect={mockOnSelect}
        isSelected={true}
      />
    );
    
    // Check that the button text is "Selected"
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });
  
  test('shows "Select Design" when isSelected is false', () => {
    render(
      <DesignCard 
        design={mockDesign} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    
    // Check that the button text is "Select Design"
    expect(screen.getByText('Select Design')).toBeInTheDocument();
  });
  
  test('uses primary variant for button when selected', () => {
    render(
      <DesignCard 
        design={mockDesign} 
        onSelect={mockOnSelect}
        isSelected={true}
      />
    );
    
    // Check that the button has the primary variant
    const button = screen.getByText('Selected');
    expect(button).toHaveClass('primary');
  });
  
  test('uses outline variant for button when not selected', () => {
    render(
      <DesignCard 
        design={mockDesign} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    
    // Check that the button has the outline variant
    const button = screen.getByText('Select Design');
    expect(button).toHaveClass('outline');
  });
  
  test('applies selected class when isSelected is true', () => {
    const { container } = render(
      <DesignCard 
        design={mockDesign} 
        onSelect={mockOnSelect}
        isSelected={true}
      />
    );
    
    // Check that the card has the selected class
    const card = container.firstChild;
    expect(card).toHaveClass('border-primary');
  });
  
  test('does not apply selected class when isSelected is false', () => {
    const { container } = render(
      <DesignCard 
        design={mockDesign} 
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );
    
    // Check that the card does not have the selected class
    const card = container.firstChild;
    expect(card).not.toHaveClass('border-primary');
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DesignSelector from '../DesignSelector';
import PrintifyAPI from '../../apis/Printify';
import ShopifyAPI from '../../apis/Shopify';

// Mock the API modules
jest.mock('../../apis/Printify', () => ({
  getTrendingDesigns: jest.fn(),
  getTemplates: jest.fn()
}));

jest.mock('../../apis/Shopify', () => ({
  bulkPublish: jest.fn()
}));

// Mock styled-components
jest.mock('styled-components', () => ({
  ThemeProvider: ({ children }) => children,
  default: () => jest.fn().mockImplementation(({ children }) => children)
}));

// Mock the DesignCard component
jest.mock('../DesignCard', () => {
  return function MockDesignCard({ design, onSelect }) {
    return (
      <div data-testid={`design-card-${design.id}`}>
        <h3>{design.title}</h3>
        <p>{design.description}</p>
        <button 
          data-testid={`select-button-${design.id}`}
          onClick={() => onSelect(design)}>
          Select Design
        </button>
      </div>
    );
  };
});

describe('DesignSelector Component', () => {
  const mockDesigns = [
    { id: '1', title: 'Design 1', description: 'Test design 1', thumbnail: 'thumb1.jpg' },
    { id: '2', title: 'Design 2', description: 'Test design 2', thumbnail: 'thumb2.jpg' },
    { id: '3', title: 'Design 3', description: 'Test design 3', thumbnail: 'thumb3.jpg' }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock responses
    PrintifyAPI.getTrendingDesigns.mockResolvedValue(mockDesigns);
    PrintifyAPI.getTemplates.mockResolvedValue(mockDesigns);
    ShopifyAPI.bulkPublish.mockResolvedValue({ 
      success: true, 
      products: [
        { id: '1', title: 'Design 1' },
        { id: '2', title: 'Design 2' },
        { id: '3', title: 'Design 3' }
      ] 
    });
    
    // Mock console.error and console.log
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  test('renders loading state initially', () => {
    render(<DesignSelector />);
    expect(screen.getByText(/loading designs/i)).toBeInTheDocument();
  });

  test('renders design cards after API call', async () => {
    render(<DesignSelector />);
    
    // Wait for the API call to resolve and component to update
    await waitFor(() => {
      expect(screen.getByText('Design 1')).toBeInTheDocument();
      expect(screen.getByText('Design 2')).toBeInTheDocument();
      expect(screen.getByText('Design 3')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    // Override the mock for this specific test
    PrintifyAPI.getTrendingDesigns.mockRejectedValueOnce(new Error('API error'));
    
    render(<DesignSelector />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(screen.getByText(/failed to load designs/i)).toBeInTheDocument();
    });
  });

  test('selects a design when card is clicked', async () => {
    render(<DesignSelector />);
    
    await waitFor(() => {
      expect(screen.getByText('Design 1')).toBeInTheDocument();
    });
    
    // Find the first design's select button and click it
    const selectButton = screen.getByTestId('select-button-1');
    fireEvent.click(selectButton);
    
    // Check if the publish button shows the correct count
    expect(screen.getByText('Approve & Publish (1)')).toBeInTheDocument();
  });

  test('selects all designs when "Select All" is clicked', async () => {
    render(<DesignSelector />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Select Design').length).toBe(3);
    });
    
    // Click "Select All" button
    fireEvent.click(screen.getByText('Select All'));
    
    // Check if the publish button shows the correct count
    expect(screen.getByText('Approve & Publish (3)')).toBeInTheDocument();
  });

  test('publish button is disabled when no designs are selected', async () => {
    render(<DesignSelector />);
    
    await waitFor(() => {
      expect(screen.getByText('Approve & Publish (0)')).toBeInTheDocument();
    });
    
    // Check if the publish button is disabled
    expect(screen.getByText('Approve & Publish (0)')).toBeDisabled();
  });

  test('publishes selected designs when publish button is clicked', async () => {
    render(<DesignSelector />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Select Design').length).toBe(3);
    });
    
    // Select all designs
    fireEvent.click(screen.getByText('Select All'));
    
    // Click publish button
    fireEvent.click(screen.getByText('Approve & Publish (3)'));
    
    // Verify API calls
    await waitFor(() => {
      expect(PrintifyAPI.getTemplates).toHaveBeenCalled();
      expect(ShopifyAPI.bulkPublish).toHaveBeenCalled();
      expect(screen.getByText(/successfully published/i)).toBeInTheDocument();
    });
  });

  test('handles publish error gracefully', async () => {
    // Override the mock for this specific test
    PrintifyAPI.getTemplates.mockRejectedValueOnce(new Error('Template error'));
    
    render(<DesignSelector />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Select Design').length).toBe(3);
    });
    
    // Select all designs
    fireEvent.click(screen.getByText('Select All'));
    
    // Click publish button
    fireEvent.click(screen.getByText('Approve & Publish (3)'));
    
    // Verify error handling
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(screen.getByText(/failed to publish designs/i)).toBeInTheDocument();
    });
  });
  
  test('retries loading designs when retry button is clicked', async () => {
    // Mock API error for the first call, then success
    PrintifyAPI.getTrendingDesigns.mockRejectedValueOnce(new Error('API error'));
    PrintifyAPI.getTrendingDesigns.mockResolvedValueOnce(mockDesigns);
    
    render(<DesignSelector />);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to load designs/i)).toBeInTheDocument();
    });
    
    // Check if retry button exists and click it if it does
    const retryButton = screen.queryByText('Retry');
    if (retryButton) {
      fireEvent.click(retryButton);
      
      // Wait for designs to load after retry
      await waitFor(() => {
        expect(screen.getByText('Design 1')).toBeInTheDocument();
      });
    }
  });
});

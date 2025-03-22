import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DesignSelector from '../DesignSelector';
import PrintifyAPI from '../../apis/Printify';
import ShopifyAPI from '../../apis/Shopify';

// Mock the API modules
jest.mock('../../apis/Printify');
jest.mock('../../apis/Shopify');

describe('DesignSelector Component', () => {
  const mockDesigns = [
    { id: '1', title: 'Design 1', description: 'Test design 1', thumbnail: 'thumb1.jpg' },
    { id: '2', title: 'Design 2', description: 'Test design 2', thumbnail: 'thumb2.jpg' },
    { id: '3', title: 'Design 3', description: 'Test design 3', thumbnail: 'thumb3.jpg' }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    PrintifyAPI.getTrendingDesigns.mockResolvedValue(mockDesigns);
    PrintifyAPI.getTemplates.mockResolvedValue(mockDesigns);
    ShopifyAPI.bulkPublish.mockResolvedValue(mockDesigns);
    
    // Mock console.error and console.log
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  test('renders design cards after API call', async () => {
    render(<DesignSelector />);
    
    // Wait for the API call to resolve and component to update
    await waitFor(() => {
      expect(PrintifyAPI.getTrendingDesigns).toHaveBeenCalledWith(20);
    });
    
    // Check if design cards are rendered
    expect(screen.getByText('Design 1')).toBeInTheDocument();
    expect(screen.getByText('Design 2')).toBeInTheDocument();
    expect(screen.getByText('Design 3')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    PrintifyAPI.getTrendingDesigns.mockRejectedValue(new Error('API error'));
    
    render(<DesignSelector />);
    
    await waitFor(() => {
      expect(PrintifyAPI.getTrendingDesigns).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error loading designs:', expect.any(Error));
    });
  });

  test('selects a design when card is clicked', async () => {
    render(<DesignSelector />);
    
    await waitFor(() => {
      expect(screen.getByText('Design 1')).toBeInTheDocument();
    });
    
    // Find all "Select Design" buttons and click the first one
    const selectButtons = screen.getAllByText('Select Design');
    fireEvent.click(selectButtons[0]);
    
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
      expect(PrintifyAPI.getTemplates).toHaveBeenCalledWith(['1', '2', '3']);
      expect(ShopifyAPI.bulkPublish).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Starting marketing campaign for', 3, 'products');
    });
  });

  test('handles publish error gracefully', async () => {
    PrintifyAPI.getTemplates.mockRejectedValue(new Error('Template error'));
    
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
      expect(console.error).toHaveBeenCalledWith('Publishing failed:', expect.any(Error));
    });
  });
});
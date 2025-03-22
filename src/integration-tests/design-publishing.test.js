import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DesignSelector from '../components/DesignSelector';
import PrintifyAPI from '../apis/Printify';
import ShopifyAPI from '../apis/Shopify';

// Mock the API modules
jest.mock('../apis/Printify');
jest.mock('../apis/Shopify');

describe('Design Publishing Flow Integration Test', () => {
  // Mock data
  const mockDesigns = [
    { id: '1', title: 'Design 1', description: 'Description 1', thumbnail: 'img1.jpg' },
    { id: '2', title: 'Design 2', description: 'Description 2', thumbnail: 'img2.jpg' },
    { id: '3', title: 'Design 3', description: 'Description 3', thumbnail: 'img3.jpg' }
  ];
  
  const mockTemplates = [
    { 
      id: '1', 
      title: 'Design 1', 
      description: 'Description 1',
      productType: 'T-Shirt',
      variants: [{ id: 'v1', price: 19.99 }],
      images: [{ url: 'img1.jpg', alt: 'Design 1' }]
    },
    { 
      id: '2', 
      title: 'Design 2', 
      description: 'Description 2',
      productType: 'T-Shirt',
      variants: [{ id: 'v2', price: 24.99 }],
      images: [{ url: 'img2.jpg', alt: 'Design 2' }]
    }
  ];
  
  const mockPublishedProducts = [
    { id: 'p1', title: 'Design 1' },
    { id: 'p2', title: 'Design 2' }
  ];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock responses
    PrintifyAPI.getDesigns.mockResolvedValue(mockDesigns);
    PrintifyAPI.getTemplates.mockResolvedValue(mockTemplates);
    ShopifyAPI.publishDesigns.mockResolvedValue({ products: mockPublishedProducts });
  });
  
  test('Complete design publishing flow', async () => {
    // Render the component
    render(<DesignSelector />);
    
    // Wait for designs to load
    await waitFor(() => {
      expect(screen.getByTestId('design-grid')).toBeInTheDocument();
    });
    
    // Verify API was called to get designs
    expect(PrintifyAPI.getDesigns).toHaveBeenCalled();
    
    // Verify designs are displayed
    expect(screen.getByText('Design 1')).toBeInTheDocument();
    expect(screen.getByText('Design 2')).toBeInTheDocument();
    expect(screen.getByText('Design 3')).toBeInTheDocument();
    
    // Select the first two designs
    fireEvent.click(screen.getByTestId('select-button-1'));
    fireEvent.click(screen.getByTestId('select-button-2'));
    
    // Verify publish button shows correct count
    expect(screen.getByTestId('publish-button')).toHaveTextContent('Approve & Publish (2)');
    
    // Click publish button
    fireEvent.click(screen.getByTestId('publish-button'));
    
    // Verify confirmation modal appears
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });
    
    // Confirm publication
    fireEvent.click(screen.getByTestId('confirm-button'));
    
    // Verify loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
    
    // Verify API calls
    await waitFor(() => {
      expect(PrintifyAPI.getTemplates).toHaveBeenCalledWith(['1', '2']);
      expect(ShopifyAPI.publishDesigns).toHaveBeenCalledWith(mockTemplates);
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/successfully published/i)).toBeInTheDocument();
    });
    
    // Verify selected designs are cleared
    expect(screen.getByTestId('publish-button')).toHaveTextContent('Approve & Publish (0)');
    expect(screen.getByTestId('publish-button')).toBeDisabled();
  });
  
  test('Handles API errors gracefully', async () => {
    // Mock API error
    ShopifyAPI.publishDesigns.mockRejectedValue(new Error('Failed to publish designs'));
    
    // Render the component
    render(<DesignSelector />);
    
    // Wait for designs to load
    await waitFor(() => {
      expect(screen.getByTestId('design-grid')).toBeInTheDocument();
    });
    
    // Select all designs
    fireEvent.click(screen.getByTestId('select-all-button'));
    
    // Click publish button
    fireEvent.click(screen.getByTestId('publish-button'));
    
    // Confirm publication
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('confirm-button'));
    
    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/failed to publish designs/i)).toBeInTheDocument();
    });
  });
  
  test('Handles empty design selection', async () => {
    // Render the component
    render(<DesignSelector />);
    
    // Wait for designs to load
    await waitFor(() => {
      expect(screen.getByTestId('design-grid')).toBeInTheDocument();
    });
    
    // Verify publish button is disabled
    expect(screen.getByTestId('publish-button')).toBeDisabled();
    
    // Select and then deselect a design
    fireEvent.click(screen.getByTestId('select-button-1'));
    expect(screen.getByTestId('publish-button')).not.toBeDisabled();
    
    fireEvent.click(screen.getByTestId('select-button-1'));
    expect(screen.getByTestId('publish-button')).toBeDisabled();
  });
  
  test('Handles design loading errors', async () => {
    // Mock API error
    PrintifyAPI.getDesigns.mockRejectedValue(new Error('Failed to load designs'));
    
    // Render the component
    render(<DesignSelector />);
    
    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/failed to load designs/i)).toBeInTheDocument();
    });
    
    // Verify retry button is present
    expect(screen.getByText('Retry')).toBeInTheDocument();
    
    // Mock successful response for retry
    PrintifyAPI.getDesigns.mockResolvedValue(mockDesigns);
    
    // Click retry button
    fireEvent.click(screen.getByText('Retry'));
    
    // Verify loading indicator appears
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Verify designs load after retry
    await waitFor(() => {
      expect(screen.getByText('Design 1')).toBeInTheDocument();
    });
  });
});
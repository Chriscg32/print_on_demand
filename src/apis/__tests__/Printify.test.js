import axios from 'axios';
import PrintifyAPI from '../Printify';

// Mock axios
jest.mock('axios');

describe('Printify API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDesigns', () => {
    const mockDesigns = [
      { id: '1', title: 'Design 1', description: 'Description 1', thumbnail: 'img1.jpg' },
      { id: '2', title: 'Design 2', description: 'Description 2', thumbnail: 'img2.jpg' },
      { id: '3', title: 'Design 3', description: 'Description 3', thumbnail: 'img3.jpg' }
    ];

    test('fetches designs successfully', async () => {
      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: { designs: mockDesigns } });
      
      // Call the API
      const result = await PrintifyAPI.getDesigns();
      
      // Check that axios was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/designs'),
        expect.any(Object)
      );
      
      // Check the result
      expect(result).toEqual(mockDesigns);
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(PrintifyAPI.getDesigns()).rejects.toThrow();
      
      // Restore console.error
      console.error.mockRestore();
    });

    test('applies limit parameter correctly', async () => {
      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: { designs: mockDesigns.slice(0, 2) } });
      
      // Call the API with limit
      await PrintifyAPI.getDesigns(2);
      
      // Check that axios was called with the correct URL and params
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({ limit: 2 })
        })
      );
    });
  });

  describe('getTemplates', () => {
    const mockDesignIds = ['1', '2'];
    const mockTemplates = [
      { id: '1', title: 'Template 1', variants: [{ id: 'v1', price: 19.99 }] },
      { id: '2', title: 'Template 2', variants: [{ id: 'v2', price: 24.99 }] }
    ];

    test('fetches templates for given design IDs', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce({ data: { templates: mockTemplates } });
      
      // Call the API
      const result = await PrintifyAPI.getTemplates(mockDesignIds);
      
      // Check that axios was called with the correct URL and data
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/templates'),
        { designIds: mockDesignIds },
        expect.any(Object)
      );
      
      // Check the result
      expect(result).toEqual(mockTemplates);
    });

    test('handles empty design IDs array', async () => {
      // Call the API with empty array
      const result = await PrintifyAPI.getTemplates([]);
      
      // Check that axios was not called
      expect(axios.post).not.toHaveBeenCalled();
      
      // Check the result is an empty array
      expect(result).toEqual([]);
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'Bad Request';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(PrintifyAPI.getTemplates(mockDesignIds)).rejects.toThrow();
      
      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('getTrendingDesigns', () => {
    const mockTrendingDesigns = [
      { id: '1', title: 'Trending 1', popularity: 95, thumbnail: 'img1.jpg' },
      { id: '2', title: 'Trending 2', popularity: 90, thumbnail: 'img2.jpg' },
      { id: '3', title: 'Trending 3', popularity: 85, thumbnail: 'img3.jpg' }
    ];

    test('fetches trending designs successfully', async () => {
      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: { designs: mockTrendingDesigns } });
      
      // Call the API
      const result = await PrintifyAPI.getTrendingDesigns();
      
      // Check that axios was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/trending'),
        expect.any(Object)
      );
      
      // Check the result
      expect(result).toEqual(mockTrendingDesigns);
    });

    test('applies limit parameter correctly', async () => {
      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: { designs: mockTrendingDesigns.slice(0, 2) } });
      
      // Call the API with limit
      await PrintifyAPI.getTrendingDesigns(2);
      
      // Check that axios was called with the correct URL and params
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({ limit: 2 })
        })
      );
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'Service Unavailable';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(PrintifyAPI.getTrendingDesigns()).rejects.toThrow();
      
      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('createDesign', () => {
    const mockDesignData = {
      title: 'New Design',
      description: 'A new test design',
      imageUrl: 'https://example.com/image.jpg'
    };

    const mockCreatedDesign = {
      id: 'new-1',
      title: 'New Design',
      description: 'A new test design',
      thumbnail: 'https://example.com/image.jpg',
      createdAt: '2023-01-01T00:00:00Z'
    };

    test('creates a new design successfully', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce({ data: { design: mockCreatedDesign } });
      
      // Call the API
      const result = await PrintifyAPI.createDesign(mockDesignData);
      
      // Check that axios was called with the correct URL and data
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/designs'),
        mockDesignData,
        expect.any(Object)
      );
      
      // Check the result
      expect(result).toEqual(mockCreatedDesign);
    });

    test('validates required fields', async () => {
      // Call the API with missing required fields
      await expect(PrintifyAPI.createDesign({ description: 'Missing title and image' }))
        .rejects.toThrow('Title and imageUrl are required');
      
      // Check that axios was not called
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'Invalid image format';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(PrintifyAPI.createDesign(mockDesignData)).rejects.toThrow();
      
      // Restore console.error
      console.error.mockRestore();
    });
  });
});
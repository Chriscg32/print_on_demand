import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import PrintifyAPI from '../apis/Printify';
import ShopifyAPI from '../apis/Shopify';
import Button from './Button';
import DesignCard from './DesignCard';

// Styles object for component
const styles = {
  container: 'max-w-7xl mx-auto px-4 py-8',
  header: 'flex justify-between items-center mb-6',
  title: 'text-2xl font-bold text-gray-900',
  buttonGroup: 'flex space-x-4',
  gridLayout: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  loadingText: 'text-center py-12 text-gray-500',
  errorText: 'text-center py-12 text-red-500',
  successText: 'text-center py-4 text-green-500',
  publishButton: 'mt-6 w-full',
  modalOverlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
  modal: 'bg-white rounded-lg max-w-md w-full',
  modalHeader: 'flex justify-between items-center border-b p-4',
  modalBody: 'p-4',
  modalFooter: 'border-t p-4 flex justify-end space-x-2',
  cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded',
  confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'
};

const DesignSelector = ({ onSelectDesign, maxDesignsToShow = 20 }) => {
  // Initialize designs as an empty array to avoid undefined errors
  const [designs, setDesigns] = useState([]);
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishStatus, setPublishStatus] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Call the API to get trending designs
      const trendingDesigns = await PrintifyAPI.getTrendingDesigns(maxDesignsToShow);
      
      // Set the designs state with the API response
      setDesigns(trendingDesigns || []);
    } catch (err) {
      console.error('Error loading designs:', err);
      setError('Failed to load designs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDesign = (design) => {
    if (selectedDesigns.some(d => d.id === design.id)) {
      setSelectedDesigns(selectedDesigns.filter(d => d.id !== design.id));
    } else {
      setSelectedDesigns([...selectedDesigns, design]);
    }
    
    if (onSelectDesign) {
      onSelectDesign(design);
    }
  };

  const handleSelectAll = () => {
    if (selectedDesigns.length === designs.length) {
      setSelectedDesigns([]);
    } else {
      setSelectedDesigns([...designs]);
    }
  };

  const handleConfirmPublish = () => {
    setShowConfirmation(true);
  };

  const handlePublish = useCallback(async () => {
    if (selectedDesigns.length === 0) return;
    
    try {
      setIsLoading(true);
      setPublishStatus(null);
      setShowConfirmation(false);
      
      // Get full template details for selected designs
      const designIds = selectedDesigns.map(design => design.id);
      const templates = await PrintifyAPI.getTemplates(designIds);
      
      // Publish to Shopify
      const result = await ShopifyAPI.bulkPublish(templates);
      
      if (result.success) {
        setPublishStatus('Successfully published designs to your store!');
        setSelectedDesigns([]);
      } else {
        throw new Error('Publish operation failed');
      }
    } catch (err) {
      console.error('Publishing failed:', err);
      setPublishStatus('Failed to publish designs. Please try again.');
      setError('Failed to publish designs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDesigns]);

  const isDesignSelected = (designId) => {
    return selectedDesigns.some(d => d.id === designId);
  };

  return (
    <div className={styles.container} data-testid="design-selector">
      <div className={styles.header}>
        <h1 className={styles.title}>Select Designs to Publish</h1>
        <div className={styles.buttonGroup}>
          <Button 
            variant="outline" 
            onClick={handleSelectAll}
            disabled={isLoading || designs.length === 0}
            data-testid="select-all-button"
          >
            {selectedDesigns.length === designs.length && designs.length > 0 ? 'Deselect All' : 'Select All'}
          </Button>
          <Button 
            onClick={loadDesigns}
            disabled={isLoading}
            data-testid="refresh-button"
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {isLoading && (
        <div className={styles.loadingText} data-testid="loading-indicator">Loading designs...</div>
      )}
      
      {error && (
        <div className={styles.errorText} data-testid="error-message">{error}</div>
      )}
      
      {!isLoading && designs.length > 0 && (
        <div className={styles.gridLayout} data-testid="designs-grid">
          {designs.map(design => (
            <DesignCard
              key={design.id}
              design={design}
              isSelected={isDesignSelected(design.id)}
              onSelect={() => handleSelectDesign(design)}
              data-testid={`design-card-${design.id}`}
            />
          ))}
        </div>
      )}
      
      {!isLoading && designs.length === 0 && !error && (
        <div className={styles.loadingText} data-testid="no-designs-message">No designs found. Try refreshing.</div>
      )}
      
      {publishStatus && (
        <div className={styles.successText} data-testid="publish-status">{publishStatus}</div>
      )}
      
      <Button 
        className={styles.publishButton}
        disabled={selectedDesigns.length === 0 || isLoading}
        onClick={handleConfirmPublish}
        data-testid="publish-button"
      >
        Approve & Publish ({selectedDesigns.length})
      </Button>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className={styles.modalOverlay} data-testid="confirmation-modal">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Publication</h3>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="text-xl font-bold"
                data-testid="close-modal-button"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                Are you sure you want to publish {selectedDesigns.length} design{selectedDesigns.length !== 1 ? 's' : ''} to Shopify?
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowConfirmation(false)}
                className={styles.cancelButton}
                data-testid="cancel-button"
              >
                Cancel
              </button>
              <button 
                onClick={handlePublish}
                className={styles.confirmButton}
                data-testid="confirm-publish-button"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DesignSelector.propTypes = {
  onSelectDesign: PropTypes.func,
  maxDesignsToShow: PropTypes.number
};

export default DesignSelector;

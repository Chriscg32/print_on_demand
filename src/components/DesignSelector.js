import React, { useEffect, useState, useCallback } from 'react';
import PrintifyAPI from '../apis/Printify';
import ShopifyAPI from '../apis/Shopify';
import DesignCard from './DesignCard';
import styles from '../styles/DesignSelector.module.css';

const DesignSelector = ({ maxDesignsToShow = 20 }) => {
  const [designs, setDesigns] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState(null);

  const loadDesigns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PrintifyAPI.getTrendingDesigns(maxDesignsToShow);
      setDesigns(data);
    } catch (error) {
      console.error('Error loading designs:', error);
      setError('Failed to load designs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  const toggleDesignSelection = (designId) => {
    setSelected(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(designId)) {
        newSelected.delete(designId);
      } else {
        newSelected.add(designId);
      }
      return newSelected;
    });
  };

  const handleConfirmPublish = () => {
    setShowConfirmation(true);
  };

  const handlePublish = useCallback(async () => {
    setIsLoading(true);
    setPublishError(null);
    setPublishSuccess(false);
    setShowConfirmation(false);
    
    try {
      const templates = await PrintifyAPI.getTemplates([...selected]);
      const publishedProducts = await ShopifyAPI.bulkPublish(templates);
      startMarketingCampaign(publishedProducts);
      
      setPublishSuccess(true);
      setSelected(new Set());
      console.log(`Successfully published ${publishedProducts.length} products`);
    } catch (error) {
      console.error('Publishing failed:', error);
      setPublishError('Failed to publish designs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [selected]);

  const startMarketingCampaign = (products) => {
    // Implementation for starting marketing campaigns
    console.log('Starting marketing campaign for', products.length, 'products');
  };

  const handleRetry = () => {
    loadDesigns();
  };

  const dismissSuccess = () => {
    setPublishSuccess(false);
  };

  return (
    <div className={styles.container}>
      <h2>Select Designs to Publish</h2>
      
      {/* Error Alert */}
      {error && (
        <div className={styles.alert}>
          <h4>Error</h4>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>Retry</button>
        </div>
      )}
      
      {/* Publish Success Alert */}
      {publishSuccess && (
        <div className={styles.successAlert}>
          <h4>Success!</h4>
          <p>Your designs have been successfully published to Shopify.</p>
          <button onClick={dismissSuccess} className={styles.closeButton}>×</button>
        </div>
      )}
      
      {/* Publish Error Alert */}
      {publishError && (
        <div className={styles.alert}>
          <h4>Publishing Error</h4>
          <p>{publishError}</p>
        </div>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading designs...</p>
        </div>
      )}
      
      {!isLoading && designs.length > 0 && (
        <div className={styles.gridLayout}>
          {designs.map(design => (
            <DesignCard
              key={design.id}
              design={design}
              isSelected={selected.has(design.id)}
              onSelect={() => toggleDesignSelection(design.id)}
            />
          ))}
        </div>
      )}
      
      {!isLoading && !error && designs.length === 0 && (
        <div className={styles.noDesigns}>
          No designs available. Please check back later.
        </div>
      )}
      
      <div className={styles.controls}>
        <div>
          <button 
            onClick={() => setSelected(new Set(designs.map(d => d.id)))}
            className={styles.selectAllButton}
            disabled={isLoading || designs.length === 0}
          >
            Select All
          </button>
          <button 
            onClick={() => setSelected(new Set())}
            className={styles.deselectAllButton}
            disabled={isLoading || selected.size === 0}
          >
            Deselect All
          </button>
        </div>
        <button
          onClick={handleConfirmPublish}
          className={styles.approveButton}
          disabled={selected.size === 0 || isLoading}
        >
          Approve & Publish ({selected.size})
        </button>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Publication</h3>
              <button 
                onClick={() => setShowConfirmation(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                Are you sure you want to publish {selected.size} design{selected.size !== 1 ? 's' : ''} to Shopify?
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                onClick={() => setShowConfirmation(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={handlePublish}
                className={styles.confirmButton}
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

export default DesignSelector;

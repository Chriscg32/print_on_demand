import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import PrintifyAPI from '../apis/Printify';
import ShopifyAPI from '../apis/Shopify';

// Lazy load DesignCard to reduce initial bundle size
const DesignCard = lazy(() => import('./DesignCard'));
import styles from '../styles/DesignSelector.module.css';

const DesignSelector = ({ maxDesignsToShow = 20 }) => {
  // Initialize designs as an empty array to avoid undefined errors
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadDesigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PrintifyAPI.getTrendingDesigns(maxDesignsToShow);
      setDesigns(data || []); // Ensure we always set an array even if API returns null/undefined
      setFilteredDesigns(data || []);
    } catch (error) {
      console.error('Error loading designs:', error);
      setError('Failed to load designs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [maxDesignsToShow]);

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  // Filter designs based on search term
  useEffect(() => {
    if (!designs || designs.length === 0) {
      setFilteredDesigns([]);
      return;
    }

    if (searchTerm.trim() === '') {
      setFilteredDesigns(designs);
    } else {
      const filtered = designs.filter(design => 
        design.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (design.description && design.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDesigns(filtered);
    }
  }, [searchTerm, designs]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleDesignSelection = useCallback((designId) => {
    setSelected(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(designId)) {
        newSelected.delete(designId);
      } else {
        newSelected.add(designId);
      }
      return newSelected;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!filteredDesigns || filteredDesigns.length === 0) return;
    setSelected(new Set(filteredDesigns.map(d => d.id)));
  }, [filteredDesigns]);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const handleConfirmPublish = () => {
    setShowConfirmation(true);
  };

  const handlePublish = useCallback(async () => {
    if (selected.size === 0) return;
    
    setIsLoading(true);
    setPublishError(null);
    setPublishSuccess(false);
    setShowConfirmation(false);
    
    try {
      const selectedArray = [...selected];
      const templates = await PrintifyAPI.getTemplates(selectedArray);
      
      if (!templates || templates.length === 0) {
        throw new Error('No templates returned from API');
      }
      
      const publishedProducts = await ShopifyAPI.bulkPublish(templates);
      
      if (publishedProducts && publishedProducts.length > 0) {
        startMarketingCampaign(publishedProducts);
        setPublishSuccess(true);
        setSelected(new Set());
        console.log(`Successfully published ${publishedProducts.length} products`);
      } else {
        throw new Error('No products were published');
      }
    } catch (error) {
      console.error('Publishing failed:', error);
      setPublishError(`Failed to publish designs: ${error.message || 'Please try again later.'}`);
    } finally {
      setIsLoading(false);
    }
  }, [selected]);

  const startMarketingCampaign = useCallback((products) => {
    // Implementation for starting marketing campaigns
    if (!products || products.length === 0) return;
    console.log('Starting marketing campaign for', products.length, 'products');
    // In a real implementation, we would call the Marketing API here
  }, []);

  const handleRetry = () => {
    loadDesigns();
  };

  const dismissSuccess = () => {
    setPublishSuccess(false);
  };

  const dismissError = () => {
    setPublishError(null);
  };

  // Fallback component for lazy-loaded DesignCard
  const CardFallback = () => (
    <div className={styles.cardFallback}>
      <div className={styles.cardLoading}></div>
    </div>
  );

  return (
    <div className={styles.container} data-testid="design-selector">
      <h2>Select Designs to Publish</h2>
      
      {/* Error Alert */}
      {error && (
        <div className={styles.alert} role="alert">
          <h4>Error</h4>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>Retry</button>
        </div>
      )}
      
      {/* Publish Success Alert */}
      {publishSuccess && (
        <div className={styles.successAlert} role="alert">
          <h4>Success!</h4>
          <p>Your designs have been successfully published to Shopify.</p>
          <button onClick={dismissSuccess} className={styles.closeButton} aria-label="Close">×</button>
        </div>
      )}
      
      {/* Publish Error Alert */}
      {publishError && (
        <div className={styles.alert} role="alert">
          <h4>Publishing Error</h4>
          <p>{publishError}</p>
          <button onClick={dismissError} className={styles.closeButton} aria-label="Close">×</button>
        </div>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className={styles.loadingContainer} data-testid="loading-indicator">
          <div className={styles.spinner}></div>
          <p>Loading designs...</p>
        </div>
      )}
      
      {/* Search Input */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search designs..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
          data-testid="search-input"
          disabled={isLoading || (designs && designs.length === 0)}
        />
      </div>
      
      {!isLoading && filteredDesigns && filteredDesigns.length > 0 && (
        <div className={styles.gridLayout} data-testid="design-grid">
          {filteredDesigns.map(design => (
            <Suspense key={design.id} fallback={<CardFallback />}>
              <DesignCard
                design={design}
                isSelected={selected.has(design.id)}
                onSelect={() => toggleDesignSelection(design.id)}
              />
            </Suspense>
          ))}
        </div>
      )}
      
      {!isLoading && !error && (!filteredDesigns || filteredDesigns.length === 0) && (
        <div className={styles.noDesigns} data-testid="no-designs">
          {searchTerm ? 'No designs match your search.' : 'No designs available. Please check back later.'}
        </div>
      )}
      
      <div className={styles.controls}>
        <div>
          <button 
            onClick={selectAll}
            className={styles.selectAllButton}
            disabled={isLoading || !designs || designs.length === 0}
            data-testid="select-all-button"
          >
            Select All
          </button>
          <button 
            onClick={deselectAll}
            className={styles.deselectAllButton}
            disabled={isLoading || selected.size === 0}
            data-testid="deselect-all-button"
          >
            Deselect All
          </button>
        </div>
        <button
          onClick={handleConfirmPublish}
          className={styles.approveButton}
          disabled={selected.size === 0 || isLoading}
          data-testid="publish-button"
        >
          Approve & Publish ({selected.size})
        </button>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className={styles.modalOverlay} data-testid="confirmation-modal">
          <div className={styles.modal} role="dialog" aria-labelledby="confirmation-title">
            <div className={styles.modalHeader}>
              <h3 id="confirmation-title">Confirm Publication</h3>
              <button 
                onClick={() => setShowConfirmation(false)}
                className={styles.closeButton}
                aria-label="Close modal"
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
                data-testid="cancel-button"
              >
                Cancel
              </button>
              <button 
                onClick={handlePublish}
                className={styles.confirmButton}
                data-testid="confirm-button"
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
  maxDesignsToShow: PropTypes.number
};

export default DesignSelector;

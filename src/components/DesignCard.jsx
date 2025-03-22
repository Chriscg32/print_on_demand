import React, { memo } from 'react';
import PropTypes from 'prop-types';

const styles = {
  card: 'bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
  imageContainer: 'relative pt-[100%]', // 1:1 aspect ratio
  image: 'absolute top-0 left-0 w-full h-full object-cover',
  selectedOverlay: 'absolute inset-0 bg-primary bg-opacity-20 flex items-center justify-center',
  checkmark: 'bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold',
  content: 'p-4',
  title: 'text-lg font-semibold mb-2 text-gray-900',
  description: 'text-sm text-gray-600 mb-3',
  details: 'flex justify-between items-center mb-2',
  category: 'text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600',
  rating: 'flex items-center',
  stars: 'text-yellow-400 mr-1 text-sm',
  ratingValue: 'text-xs text-gray-600',
  price: 'text-primary font-semibold',
  selected: 'border-2 border-primary'
};

/**
 * DesignCard Component
 * 
 * Displays a single design with thumbnail, title, and selection state.
 * Used by the DesignSelector component.
 */
const DesignCard = ({ design, onSelect, isSelected }) => {
  if (!design) return null;

  const {
    id,
    title,
    description,
    thumbnail,
    price,
    category,
    rating
  } = design;

  // Handle missing thumbnail
  const imageUrl = thumbnail || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <button 
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(design)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(design);
        }
      }}
      aria-pressed={isSelected}
      data-testid={`design-card-${id}`}
      type="button"
    >
      <div className={styles.imageContainer}>
        <img 
          src={imageUrl} 
          alt={title} 
          className={styles.image}
          loading="lazy"
        />
        {isSelected && (
          <div className={styles.selectedOverlay}>
            <span className={styles.checkmark}>✓</span>
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
        
        <div className={styles.details}>
          {category && <span className={styles.category}>{category}</span>}
          
          {rating && (
            <div className={styles.rating}>
              <span className={styles.stars}>{'★'.repeat(Math.round(rating))}</span>
              <span className={styles.ratingValue}>{rating}</span>
            </div>
          )}
        </div>
        
        {price && <div className={styles.price}>${typeof price === 'number' ? price.toFixed(2) : price}</div>}
      </div>
    </button>
  );
};

DesignCard.propTypes = {
  design: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    category: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool
};

DesignCard.defaultProps = {
  isSelected: false
};

// Use memo to prevent unnecessary re-renders
export default memo(DesignCard);

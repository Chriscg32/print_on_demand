import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/DesignCard.module.css';

const DesignCard = ({ design, isSelected, onSelect }) => {
  // Handle the selection of a design
  const handleSelect = () => {
    onSelect(design);
  };

  // CSS classes with conditional styling based on selection state
  const cardClassName = `${styles.card} ${isSelected ? styles.selected : ''}`;
  const buttonClassName = `${styles.selectButton} ${isSelected ? styles.selectedButton : ''}`;

  return (
    <div className={cardClassName} data-testid="design-card">
      <img 
        src={design.thumbnail} 
        alt={design.title} 
        className={styles.thumbnail}
      />
      <div className={styles.content}>
        <h3 className={styles.title}>{design.title}</h3>
        {design.description && (
          <p className={styles.description}>{design.description}</p>
        )}
      </div>
      <button 
        className={buttonClassName}
        onClick={handleSelect}
        data-testid={`select-button-${design.id}`}
      >
        {isSelected ? 'Selected' : 'Select Design'}
      </button>
    </div>
  );
};

DesignCard.propTypes = {
  design: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    description: PropTypes.string
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool
};

// Using default parameter value instead of defaultProps

export default DesignCard;

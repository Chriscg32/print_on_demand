import React from 'react';
import styles from '../styles/DesignCard.module.css';

const DesignCard = ({ design, onSelect }) => (
  <div className={styles.card}>
    <img src={design.thumbnail} alt={design.title} />
    <h3>{design.title}</h3>
    <p>{design.description}</p>
    <button onClick={onSelect} className={styles.selectButton}>
      Select Design
    </button>
  </div>
);

export default DesignCard;
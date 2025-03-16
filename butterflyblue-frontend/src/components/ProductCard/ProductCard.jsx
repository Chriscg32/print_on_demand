import PropTypes from 'prop-types';

// Add after component definition
ProductCard.propTypes = {
  product: PropTypes.shape({
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    // Add other product properties here
  }).isRequired
};
import React from 'react';
import PropTypes from 'prop-types';

const statusColors = {
  'active': { bg: 'bg-green-100', text: 'text-green-800' },
  'in-development': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'needs-review': { bg: 'bg-red-100', text: 'text-red-800' },
  'verified': { bg: 'bg-green-100', text: 'text-green-800' },
  'pending': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'draft': { bg: 'bg-gray-100', text: 'text-gray-800' },
};

const StatusBadge = ({ status, customColors }) => {
  const colors = customColors || statusColors[status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors.bg} ${colors.text}`}>
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  customColors: PropTypes.shape({
    bg: PropTypes.string,
    text: PropTypes.string
  })
};

export default StatusBadge;
import React from 'react';
import PropTypes from 'prop-types';

// CSS classes for different variants and sizes
const variantClasses = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white border-none',
  secondary: 'bg-green-500 hover:bg-green-600 text-white border-none',
  outline: 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50'
};

const sizeClasses = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-5 py-2.5 text-lg'
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all duration-200';
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  const disabledClass = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  
  const buttonClasses = `${baseClasses} ${variantClass} ${sizeClass} ${disabledClass} ${className}`;
  
  return (
    <button
      type={type}
      disabled={disabled}
      className={buttonClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Button;

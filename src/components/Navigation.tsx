import React from 'react'

const Navigation: React.FC = () => {
  const handleNavigation = (route: string) => {
    // Navigation logic here
    console.log(`Navigating to ${route}`);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">PrintOnDemand</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <button 
              onClick={() => handleNavigation('products')} 
              className="text-text hover:text-primary hover-transition bg-transparent border-none cursor-pointer"
            >
              Products
            </button>
            <button 
              onClick={() => handleNavigation('custom-order')} 
              className="text-text hover:text-primary hover-transition bg-transparent border-none cursor-pointer"
            >
              Custom Order
            </button>
            <button 
              onClick={() => handleNavigation('about')} 
              className="text-text hover:text-primary hover-transition bg-transparent border-none cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => handleNavigation('contact')} 
              className="text-text hover:text-primary hover-transition bg-transparent border-none cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

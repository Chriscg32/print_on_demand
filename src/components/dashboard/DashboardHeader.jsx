import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Sword, Bell, User, ChevronDown } from 'lucide-react';

const DashboardHeader = ({ notifications, setNotifications }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  return (
    <header className="bg-indigo-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sword size={24} />
          <h1 className="text-xl font-bold">ButterflyBlue Creations</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="relative"
            aria-label={`${notifications} notifications`}
            onClick={() => setNotifications(0)}
          >
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-2"
              onClick={toggleUserMenu}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="hidden md:inline">Admin</span>
              <ChevronDown size={16} />
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Your Profile
                </a>
                <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <a href="#logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

DashboardHeader.propTypes = {
  notifications: PropTypes.array.isRequired,
  setNotifications: PropTypes.func.isRequired
};

export default DashboardHeader;

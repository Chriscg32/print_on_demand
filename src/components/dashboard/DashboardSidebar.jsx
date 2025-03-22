import React from 'react';
import PropTypes from 'prop-types';
import { Home, Sword, BookOpen, Layers, DollarSign, Settings } from 'lucide-react';

const DashboardSidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'designs', label: 'Design Tracking', icon: Sword },
    { id: 'scriptures', label: 'Scripture Verification', icon: BookOpen },
    { id: 'collections', label: 'Collection Management', icon: Layers },
    { id: 'operations', label: 'Business Operations', icon: DollarSign },
  ];

  return (
    <aside className="w-64 bg-white rounded-lg shadow-md p-4 mr-6 hidden md:block h-[calc(100vh-120px)] sticky top-6">
      <nav className="space-y-1" aria-label="Main Navigation">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
              activeTab === item.id 
                ? 'bg-indigo-100 text-indigo-900' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
};

// Define PropTypes
DashboardSidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired
};

export default DashboardSidebar;

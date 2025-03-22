import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import DashboardFooter from './DashboardFooter';
import HomeTab from '../tabs/HomeTab';
import DesignTab from '../tabs/DesignTab';
import ScriptureTab from '../tabs/ScriptureTab';
import CollectionTab from '../tabs/CollectionTab';
import OperationsTab from '../tabs/OperationsTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      try {
        // In a real app, you would fetch data here
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const renderTabContent = () => {
    switch(activeTab) {
      case 'home':
        return <HomeTab searchTerm={searchTerm} />;
      case 'designs':
        return <DesignTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case 'scriptures':
        return <ScriptureTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case 'collections':
        return <CollectionTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case 'operations':
        return <OperationsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      default:
        return <HomeTab searchTerm={searchTerm} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <DashboardHeader 
        notifications={notifications} 
        setNotifications={setNotifications} 
      />
      
      <div className="container mx-auto px-4 py-6 flex">
        {/* Sidebar for desktop */}
        <DashboardSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        {/* Mobile Navigation */}
        <div className="md:hidden w-full mb-6">
          <select
            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="home">Dashboard</option>
            <option value="designs">Design Tracking</option>
            <option value="scriptures">Scripture Verification</option>
            <option value="collections">Collection Management</option>
            <option value="operations">Business Operations</option>
          </select>
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-900"></div>
            </div>
          ) : (
            renderTabContent()
          )}
        </main>
      </div>
      
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
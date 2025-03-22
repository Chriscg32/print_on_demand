import React from 'react';
import PropTypes from 'prop-types';
import { Sword, BookOpen, DollarSign, Check, AlertTriangle, Layers } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { financialData, collectionData } from '../../data/sampleData';

// Helper function to get status style
const getStatusStyle = (status) => {
  if (status === 'active') {
    return 'bg-green-100 text-green-800';
  } else if (status === 'in-development') {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-red-100 text-red-800';
  }
};

// Reusable stat card component
const StatCard = ({ icon: Icon, title, stats }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <div className="flex items-center mb-4">
      <Icon className="text-indigo-900 mr-2" size={20} />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={`stat-${stat.label}-${index}`} className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className={`${stat.isSmall ? 'text-sm' : 'text-2xl'} font-bold text-indigo-900`}>{stat.value}</p>
        </div>
      ))}
    </div>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      isSmall: PropTypes.bool
    })
  ).isRequired
};

// Activity item component
const ActivityItem = ({ icon: Icon, iconBgColor, iconColor, title, timestamp }) => (
  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
    <div className={`${iconBgColor} p-2 rounded-full mr-3`}>
      <Icon size={16} className={iconColor} />
    </div>
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-500">{timestamp}</p>
    </div>
  </div>
);

ActivityItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconBgColor: PropTypes.string.isRequired,
  iconColor: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired
};

const HomeTab = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <h2 className="text-2xl font-bold mb-4">Welcome to ButterflyBlue Creations Dashboard</h2>
        <p className="text-gray-600 mb-6">Your faith-based warrior/samurai-themed print-on-demand business management system</p>
      </div>
      
      {/* Design Stats */}
      <StatCard 
        icon={Sword}
        title="Design Stats"
        stats={[
          { label: "Active Designs", value: "4" },
          { label: "In Development", value: "1" },
          { label: "Needs Review", value: "1" },
          { label: "Avg. Uniqueness", value: "81%" }
        ]}
      />
      
      {/* Scripture Stats */}
      <StatCard 
        icon={BookOpen}
        title="Scripture Stats"
        stats={[
          { label: "Total Scriptures", value: "5" },
          { label: "Verified", value: "4" },
          { label: "Needs Review", value: "1" },
          { label: "Most Used", value: "Proverbs 28:1", isSmall: true }
        ]}
      />
      
      {/* Business Stats */}
      <StatCard 
        icon={DollarSign}
        title="Business Stats"
        stats={[
          { label: "Monthly Revenue", value: "$2,200" },
          { label: "Monthly Profit", value: "$1,250" },
          { label: "Avg. Margin", value: "48%" },
          { label: "Top Product", value: "Lion Heart Mug", isSmall: true }
        ]}
      />
      
      {/* Recent Activity */}
      <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <button className="text-indigo-600 text-sm hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          <ActivityItem 
            icon={Check}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            title='New design "Shield of Faith" added to Armor of God collection'
            timestamp="Today, 10:30 AM"
          />
          <ActivityItem 
            icon={AlertTriangle}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
            title='Scripture "Proverbs 28:1" needs contextual review'
            timestamp="Yesterday, 3:45 PM"
          />
          <ActivityItem 
            icon={DollarSign}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            title='15 new sales for "Warrior Spirit T-Shirt"'
            timestamp="Nov 10, 2023"
          />
          <ActivityItem 
            icon={Layers}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            title='New collection "Courage" created'
            timestamp="Nov 8, 2023"
          />
        </div>
      </div>
      
      {/* Revenue Chart */}
      <div className="col-span-1 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={financialData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#718096" />
            <YAxis stroke="#718096" />
            <Line type="monotone" dataKey="revenue" stroke="#191970" strokeWidth={2} />
            <Line type="monotone" dataKey="profit" stroke="#DC143C" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Upcoming Launches */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Collection Launches</h3>
          <button className="text-indigo-600 text-sm hover:underline">View Calendar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Theme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Launch Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collectionData.map((collection) => (
                <tr key={collection.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{collection.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.theme}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.designCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection.launchDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(collection.status)}`}>
                      {collection.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;

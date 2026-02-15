import React, { useState } from 'react';
import ActivityItem from './ActivityItem';

const RecentActivity = ({ items, onItemClick }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter activities based on selected filter
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Search filter
  const searchedItems = filteredItems.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Activity type options for filter
  const filterOptions = [
    { value: 'all', label: 'All Activity', icon: '📊', color: '#66b032' },
    { value: 'lost', label: 'Lost Items', icon: '🔍', color: '#ef4444' },
    { value: 'found', label: 'Found Items', icon: '✅', color: '#66b032' },
    { value: 'complaint', label: 'Complaints', icon: '📋', color: '#0057a8' },
    { value: 'volunteer', label: 'Volunteers', icon: '🤝', color: '#f59e0b' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-gradient-to-b from-[#66b032] to-[#0057a8] rounded-full"></div>
          <h5 className="text-xl font-bold text-gray-800">
            Recent Activity
            {searchedItems.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({searchedItems.length} items)
              </span>
            )}
          </h5>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                     focus:ring-2 focus:ring-[#66b032] focus:border-transparent 
                     outline-none transition-all bg-gray-50"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills - Modern Design */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              flex items-center gap-2
              ${filter === option.value 
                ? 'text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
            style={{
              backgroundColor: filter === option.value ? option.color : 'transparent',
              border: filter === option.value ? 'none' : '1px solid #e5e7eb'
            }}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
            {filter === option.value && (
              <span className="ml-1 text-xs bg-white bg-opacity-20 px-1.5 rounded-full">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Activity List with Custom Scrollbar */}
      <div 
        className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#66b032 #f1f1f1'
        }}
      >
        {searchedItems.length > 0 ? (
          searchedItems.map((item, index) => (
            <div
              key={item.id || index}
              className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md rounded-xl"
              style={{
                animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              <ActivityItem 
                activity={item}
                onClick={onItemClick ? () => onItemClick(item) : null}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4 animate-bounce">
              {searchTerm ? '🔍' : '📭'}
            </div>
            <h6 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm 
                ? 'No matching activities found' 
                : 'No activities yet'}
            </h6>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm 
                ? 'Try adjusting your search or filter to find what you\'re looking for' 
                : 'Activities will appear here when users interact with the platform'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-[#66b032] text-white rounded-lg 
                         hover:bg-[#66b032]/90 transition-colors text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* View All Link with Animation */}
      {items.length > 5 && (
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
          <button 
            className="group inline-flex items-center gap-2 text-[#0057a8] 
                     hover:text-[#66b032] transition-colors font-medium"
            onClick={() => {/* Handle view all */}}
          >
            <span>View All Activity</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #66b032;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0057a8;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

RecentActivity.defaultProps = {
  items: [],
  onItemClick: null
};

export default RecentActivity;
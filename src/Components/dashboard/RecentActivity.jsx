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
    { value: 'all', label: 'All Activity', icon: '📊' },
    { value: 'lost', label: 'Lost Items', icon: '🔍' },
    { value: 'found', label: 'Found Items', icon: '✅' },
    { value: 'complaint', label: 'Complaints', icon: '📋' },
    { value: 'volunteer', label: 'Volunteers', icon: '🤝' }
  ];

  return (
    <div className="recent-activity">
      {/* Header with Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0" style={{ color: '#0057a8' }}>
          Recent Activity
          {searchedItems.length > 0 && (
            <span className="ms-2 small text-muted">({searchedItems.length})</span>
          )}
        </h5>
        
        {/* Search Bar */}
        <div className="d-flex gap-2">
          <div className="input-group input-group-sm" style={{ width: '200px' }}>
            <span className="input-group-text bg-light border-0">
              🔍
            </span>
            <input 
              type="text" 
              className="form-control form-control-sm bg-light border-0" 
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {filterOptions.map(option => (
          <button
            key={option.value}
            className={`btn btn-sm rounded-pill ${
              filter === option.value 
                ? 'text-white' 
                : 'btn-outline-secondary'
            }`}
            style={{
              backgroundColor: filter === option.value ? '#66b032' : 'transparent',
              borderColor: filter === option.value ? '#66b032' : '#dee2e6',
              color: filter === option.value ? 'white' : '#6c757d'
            }}
            onClick={() => setFilter(option.value)}
          >
            <span className="me-1">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="activity-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {searchedItems.length > 0 ? (
          searchedItems.map((item, index) => (
            <ActivityItem 
              key={item.id || index} 
              activity={item}
              onClick={onItemClick ? () => onItemClick(item) : null}
            />
          ))
        ) : (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {searchTerm ? '🔍' : '📭'}
            </div>
            <h6 className="text-muted">
              {searchTerm 
                ? 'No matching activities found' 
                : 'No activities yet'}
            </h6>
            <p className="small text-muted">
              {searchTerm 
                ? 'Try adjusting your search or filter' 
                : 'Activities will appear here when users interact'}
            </p>
          </div>
        )}
      </div>

      {/* View All Link */}
      {items.length > 5 && (
        <div className="text-center mt-3">
          <button className="btn btn-link text-decoration-none" style={{ color: '#0057a8' }}>
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
};

RecentActivity.defaultProps = {
  items: [],
  onItemClick: null
};

export default RecentActivity;
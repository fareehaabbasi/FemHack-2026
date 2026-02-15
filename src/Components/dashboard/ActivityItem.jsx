import React from 'react';
import StatusBadge from '../common/StatusBadge';

const ActivityItem = ({ activity, onClick }) => {
  // Activity type ke hisaab se icon aur color set karna
  const getActivityIcon = (type) => {
    switch(type) {
      case 'lost':
        return { icon: '🔍', bg: '#66b03220', color: '#66b032' };
      case 'found':
        return { icon: '✅', bg: '#28a74520', color: '#28a745' };
      case 'complaint':
        return { icon: '📋', bg: '#0057a820', color: '#0057a8' };
      case 'volunteer':
        return { icon: '🤝', bg: '#ffc10720', color: '#ffc107' };
      default:
        return { icon: '📌', bg: '#6c757d20', color: '#6c757d' };
    }
  };

  // Time format karna (e.g., "2 hours ago")
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityTime) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const iconConfig = getActivityIcon(activity.type);
  const timeAgo = getTimeAgo(activity.created_at);

  return (
    <div 
      className="activity-item d-flex align-items-start p-3 mb-2 rounded-3 border-start"
      style={{
        borderLeft: `4px solid ${iconConfig.color}`,
        backgroundColor: '#ffffff',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(5px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
      }}
    >
      {/* Icon Section */}
      <div 
        className="activity-icon me-3 d-flex align-items-center justify-content-center"
        style={{
          width: '45px',
          height: '45px',
          borderRadius: '12px',
          backgroundColor: iconConfig.bg,
          fontSize: '1.3rem'
        }}
      >
        {iconConfig.icon}
      </div>

      {/* Content Section */}
      <div className="activity-content flex-grow-1">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h6 className="mb-0 fw-semibold" style={{ color: '#2c3e50' }}>
            {activity.title || activity.type}
          </h6>
          <StatusBadge status={activity.status || 'pending'} />
        </div>

        <p className="text-muted small mb-2" style={{ fontSize: '0.85rem' }}>
          {activity.description?.substring(0, 80)}
          {activity.description?.length > 80 ? '...' : ''}
        </p>

        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            {/* User Info */}
            <div className="d-flex align-items-center text-muted small">
              <span className="me-1">👤</span>
              <span>{activity.user_email?.split('@')[0] || 'Anonymous'}</span>
            </div>

            {/* Category/Tag */}
            {activity.category && (
              <div className="d-flex align-items-center text-muted small">
                <span className="me-1">🏷️</span>
                <span>{activity.category}</span>
              </div>
            )}

            {/* Location if available */}
            {activity.location && (
              <div className="d-flex align-items-center text-muted small">
                <span className="me-1">📍</span>
                <span>{activity.location}</span>
              </div>
            )}
          </div>

          {/* Time */}
          <div className="d-flex align-items-center">
            <span className="small text-muted me-2">🕒</span>
            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
              {timeAgo}
            </small>
          </div>
        </div>
      </div>

      {/* Action Button (if onClick provided) */}
      {onClick && (
        <div className="ms-3 d-flex align-items-center">
          <span style={{ color: '#66b032', fontSize: '1.2rem' }}>→</span>
        </div>
      )}
    </div>
  );
};

// PropTypes-like validation
ActivityItem.defaultProps = {
  activity: {
    type: 'default',
    title: 'Untitled Activity',
    description: 'No description provided',
    status: 'pending',
    created_at: new Date().toISOString(),
    user_email: 'user@example.com'
  },
  onClick: null
};

export default ActivityItem;
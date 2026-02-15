import React from 'react';

const StatsCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="card border-0 shadow-sm hover-card" style={{ transition: 'all 0.3s' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            {icon}
          </div>
          {trend && (
            <span className="badge bg-light text-success">
              {trend}
            </span>
          )}
        </div>
        <h6 className="text-muted mb-2">{title}</h6>
        <h3 className="mb-0" style={{ color: color, fontWeight: 'bold' }}>{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
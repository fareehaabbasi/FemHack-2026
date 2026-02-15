import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      'in-progress': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Progress' },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' },
      found: { bg: 'bg-green-100', text: 'text-green-800', label: 'Found' },
      lost: { bg: 'bg-red-100', text: 'text-red-800', label: 'Lost' }
    };

    const config = configs[status?.toLowerCase()] || configs.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return getStatusConfig(status);
};

export default StatusBadge;
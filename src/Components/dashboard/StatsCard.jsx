import React from 'react';

const StatsCard = ({ title, value, icon, color, trend, trendUp = true }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-1
            ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold" style={{ color: color }}>
          {value}
        </span>
        <span className="text-xs text-gray-400">Total count</span>
      </div>

      {/* Mini progress bar */}
      <div className="mt-4 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
          style={{ 
            width: `${Math.min(100, (value / 100) * 100)}%`,
            backgroundColor: color 
          }}
        ></div>
      </div>
    </div>
  );
};

export default StatsCard;
import React from 'react';
import './StatisticsCard.css';

const StatisticsCard = ({ title, value, icon, color, trend, trendValue }) => {
  return (
    <div className={`statistics-card ${color}`}>
      <div className="card-header">
        <div className="card-icon">
          {icon}
        </div>
        <div className="card-title">
          {title}
        </div>
      </div>
      <div className="card-value">
        {value}
      </div>
      {trend && (
        <div className={`card-trend ${trend}`}>
          <span className="trend-arrow">
            {trend === 'up' ? '↗️' : '↘️'}
          </span>
          <span className="trend-value">
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatisticsCard;

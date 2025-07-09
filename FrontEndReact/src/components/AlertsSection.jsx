import React from 'react';
import './AlertsSection.css';

const AlertsSection = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alerts-section">
        <h3>🔔 Alertes et notifications</h3>
        <div className="no-alerts">
          <p>Aucune alerte pour le moment</p>
        </div>
      </div>
    );
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'retard':
        return '⏰';
      case 'absence':
        return '❌';
      case 'planning':
        return '📅';
      case 'validation':
        return '⚠️';
      case 'system':
        return '🔧';
      default:
        return '📢';
    }
  };

  const getAlertClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'alert-high';
      case 'medium':
        return 'alert-medium';
      case 'low':
        return 'alert-low';
      default:
        return 'alert-info';
    }
  };

  return (
    <div className="alerts-section">
      <h3>🔔 Alertes et notifications</h3>
      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div key={index} className={`alert-item ${getAlertClass(alert.priority)}`}>
            <div className="alert-icon">
              {getAlertIcon(alert.type)}
            </div>
            <div className="alert-content">
              <div className="alert-header">
                <h4>{alert.title}</h4>
                <span className="alert-time">
                  {alert.time}
                </span>
              </div>
              <p className="alert-message">
                {alert.message}
              </p>
              {alert.action && (
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    if (alert.action.url) {
                      window.location.href = alert.action.url;
                    }
                  }}
                >
                  {alert.action.label}
                </button>
              )}
            </div>
            <div className="alert-actions">
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  // Marquer comme lu
                  console.log('Marquer alerte comme lue:', alert.id);
                }}
              >
                ✅
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsSection;

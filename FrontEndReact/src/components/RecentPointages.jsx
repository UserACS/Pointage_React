import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './RecentPointages.css';

const RecentPointages = ({ pointages, userRole }) => {
  const navigate = useNavigate();
  
  if (!pointages || pointages.length === 0) {
    return (
      <div className="recent-pointages">
        <h3>🕒 Pointages récents</h3>
        <div className="no-data">
          <p>Aucun pointage récent</p>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'entree':
      case 'entrée':
        return 'green';
      case 'sortie':
        return 'blue';
      case 'pause':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'entree':
      case 'entrée':
        return '🟢';
      case 'sortie':
        return '🔴';
      case 'pause':
        return '⏸️';
      default:
        return '⚪';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'entree':
        return 'Entrée';
      case 'entrée':
        return 'Entrée';
      case 'sortie':
        return 'Sortie';
      case 'pause':
        return 'Pause';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="recent-pointages">
      <h3>🕒 Pointages récents</h3>
      <div className="pointages-list">
        {pointages.map((pointage) => (
          <div key={pointage._id} className="pointage-item">
            <div className="pointage-status">
              <span className={`status-icon ${getStatusColor(pointage.type)}`}>
                {getStatusIcon(pointage.type)}
              </span>
            </div>
            <div className="pointage-info">
              <div className="pointage-header">
                {(userRole === 'admin' || userRole === 'manager') && pointage.employe && (
                  <span className="employee-name">
                    {pointage.employe.nom} {pointage.employe.prenom}
                  </span>
                )}
                <span className={`pointage-type ${pointage.type}`}>
                  {getTypeLabel(pointage.type)}
                </span>
              </div>
              <div className="pointage-details">
                <span className="pointage-time">
                  {formatDateTime(pointage.timestamp)}
                </span>
                {pointage.methode && (
                  <span className="pointage-method">
                    via {pointage.methode}
                  </span>
                )}
              </div>
              {pointage.commentaire && (
                <div className="pointage-comment">
                  💬 {pointage.commentaire}
                </div>
              )}
            </div>
            <div className="pointage-actions">
              {pointage.valide === false && (userRole === 'admin' || userRole === 'manager') && (
                <span className="validation-needed">
                  ⚠️ À valider
                </span>
              )}
              {pointage.valide === true && (
                <span className="validated">
                  ✅ Validé
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="section-footer">
        <button 
          className="btn btn-link"
          onClick={() => {
            if (userRole === 'employe') {
              navigate('/pointage/historique');
            } else {
              navigate('/pointage/tous');
            }
          }}
        >
          Voir tous les pointages →
        </button>
      </div>
    </div>
  );
};

export default RecentPointages;

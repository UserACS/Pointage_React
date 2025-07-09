import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './UpcomingPlannings.css';

const UpcomingPlannings = ({ plannings, userRole }) => {
  if (!plannings || plannings.length === 0) {
    return (
      <div className="upcoming-plannings">
        <h3>📅 Plannings à venir</h3>
        <div className="no-data">
          <p>Aucun planning à venir</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="upcoming-plannings">
      <h3>📅 Plannings à venir</h3>
      <div className="plannings-list">
        {plannings.map((planning) => (
          <div key={planning._id} className="planning-item">
            <div className="planning-header">
              <h4>{planning.nom}</h4>
              <span className={`status ${planning.statut}`}>
                {planning.statut}
              </span>
            </div>
            <div className="planning-info">
              <p>
                <strong>Période:</strong> {formatDate(planning.dateDebut)} - {formatDate(planning.dateFin)}
              </p>
              {planning.equipe && (
                <p>
                  <strong>Équipe:</strong> {planning.equipe.nom}
                </p>
              )}
              <p>
                <strong>Jours:</strong> {planning.jours?.length || 0} jour(s) planifié(s)
              </p>
            </div>
            <div className="planning-actions">
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => window.location.href = `/plannings/${planning._id}`}
              >
                Voir détails
              </button>
              {(userRole === 'admin' || userRole === 'manager') && (
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => window.location.href = `/plannings/${planning._id}/modifier`}
                >
                  Modifier
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="section-footer">
        <button 
          className="btn btn-link"
          onClick={() => window.location.href = '/plannings'}
        >
          Voir tous les plannings →
        </button>
      </div>
    </div>
  );
};

export default UpcomingPlannings;

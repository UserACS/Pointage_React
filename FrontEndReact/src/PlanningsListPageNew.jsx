import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import GenericTable from './components/GenericTable';
import ConfirmModal from './components/ConfirmModal';
import PlanningCalendar from './components/PlanningCalendar';
import { useTestDataStore, isTestMode } from './utils/testUtils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './styles/PlanningsListPage.css';

const PlanningsListPage = () => {
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'calendar'
  const [deleteModal, setDeleteModal] = useState({ open: false, planning: null });
  
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const testStore = useTestDataStore();

  useEffect(() => {
    fetchPlannings();
  }, []);

  const fetchPlannings = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (isTestMode(token)) {
        console.log('🔄 Mode test activé pour liste plannings (new)');
        const mockPlannings = testStore.getPlannings();
        setPlannings(mockPlannings);
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5001/api/plannings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des plannings');
      }

      const data = await response.json();
      setPlannings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlanning = async () => {
    if (!deleteModal.planning) return;

    try {
      if (isTestMode(token)) {
        console.log('🔄 Mode test - Simulation suppression planning (new)');
        // Utiliser le store pour supprimer
        const deleted = testStore.deletePlanning(deleteModal.planning._id);
        if (deleted) {
          setPlannings(testStore.getPlannings());
        }
        setDeleteModal({ open: false, planning: null });
        return;
      }

      const response = await fetch(`http://localhost:5001/api/plannings/${deleteModal.planning._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchPlannings();
      setDeleteModal({ open: false, planning: null });
    } catch (err) {
      console.error('❌ Erreur suppression planning:', err);
      setError(err.message);
      // Fallback vers le store de test
      const deleted = testStore.deletePlanning(deleteModal.planning._id);
      if (deleted) {
        setPlannings(testStore.getPlannings());
      }
      setDeleteModal({ open: false, planning: null });
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (statut) => {
    const statusClasses = {
      'actif': 'status-active',
      'brouillon': 'status-draft',
      'termine': 'status-completed'
    };
    
    return (
      <span className={`status-badge ${statusClasses[statut] || 'status-default'}`}>
        {statut}
      </span>
    );
  };

  // Configuration des colonnes pour le tableau
  const tableColumns = [
    {
      key: 'nom',
      label: 'Nom du planning',
      sortable: true,
      render: (value, row) => (
        <div className="planning-name">
          <strong>{value}</strong>
          {row.description && (
            <div className="planning-description">{row.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'dateDebut',
      label: 'Date de début',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'dateFin',
      label: 'Date de fin',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'equipe',
      label: 'Équipe',
      render: (value) => value?.nom || 'Non assignée'
    },
    {
      key: 'jours',
      label: 'Jours planifiés',
      render: (value) => value?.length || 0
    }
  ];

  const filteredPlannings = plannings.filter(planning =>
    planning.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planning.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planning.equipe?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (planning) => {
    navigate(`/plannings/${planning._id}`);
  };

  const handleEdit = (planning) => {
    navigate(`/plannings/${planning._id}/modifier`);
  };

  const handleDelete = (planning) => {
    setDeleteModal({ open: true, planning });
  };

  const handleCalendarDateClick = (date) => {
    // Naviguer vers la création d'un planning pour cette date
    navigate('/plannings/ajouter', { state: { selectedDate: date } });
  };

  const handleCalendarEventClick = (planning) => {
    navigate(`/plannings/${planning._id}`);
  };

  return (
    <div className="plannings-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📅 Gestion des Plannings</h1>
          <p>Gérez les plannings de travail et l'affectation des équipes</p>
        </div>
        <div className="header-actions">
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/plannings/ajouter')}
            >
              + Nouveau planning
            </button>
          )}
        </div>
      </div>

      <div className="page-controls">
        <div className="search-section">
          <div className="search-input">
            <input
              type="text"
              placeholder="Rechercher un planning..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📋 Tableau
          </button>
          <button
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendrier
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchPlannings} className="btn btn-outline">
            Réessayer
          </button>
        </div>
      )}

      <div className="content-area">
        {viewMode === 'table' ? (
          <GenericTable
            data={filteredPlannings}
            columns={tableColumns}
            onRowClick={handleRowClick}
            onEdit={(user?.role === 'admin' || user?.role === 'manager') ? handleEdit : null}
            onDelete={(user?.role === 'admin' || user?.role === 'manager') ? handleDelete : null}
            loading={loading}
            emptyMessage="Aucun planning trouvé"
            userRole={user?.role}
          />
        ) : (
          <PlanningCalendar
            plannings={filteredPlannings}
            onDateClick={handleCalendarDateClick}
            onEventClick={handleCalendarEventClick}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, planning: null })}
        onConfirm={handleDeletePlanning}
        title="Supprimer le planning"
        message={`Êtes-vous sûr de vouloir supprimer le planning "${deleteModal.planning?.nom}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};

export default PlanningsListPage;

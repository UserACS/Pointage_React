import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from './context/AuthContext';
import GenericTable from './components/GenericTable';
import ConfirmModal from './components/ConfirmModal';
import PlanningCalendar from './components/PlanningCalendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTestDataStore, isTestMode } from './utils/testUtils';
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
      
      // TOUJOURS utiliser le backend réel maintenant
      console.log('🌐 Récupération des plannings depuis le backend...');
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
      console.log('✅ Plannings récupérés:', data);
      setPlannings(data);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des plannings:', err);
      setError('Erreur lors du chargement des plannings. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (isTestMode(token)) {
        console.log('🔄 Mode test - Simulation suppression planning');
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
      console.error('❌ Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression du planning');
    }
  };

  const filteredPlannings = plannings.filter(planning =>
    planning.intitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planning.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon fontSize="large" />
          Liste des Plannings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/plannings/ajouter')}
          size="large"
        >
          Ajouter un Planning
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistiques rapides */}
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Résumé des Plannings
            </Typography>
            <Box display="flex" gap={3}>
              <Box>
                <Typography variant="h4" color="primary">
                  {plannings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total plannings
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="success.main">
                  {plannings.filter(p => p.jours && p.jours.length > 0).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Plannings configurés
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Barre de recherche */}
      <Box display="flex" alignItems="center" mb={3}>
        <TextField
          placeholder="Rechercher un planning par nom ou description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1, mr: 2 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Tableau des plannings */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Intitulé</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Jours configurés</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPlannings.map((planning) => (
              <TableRow 
                key={planning._id}
                hover
                sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {planning.intitule}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {planning.description || 'Aucune description'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`${planning.jours?.length || 0} jour(s)`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={planning.jours && planning.jours.length > 0 ? 'Configuré' : 'En attente'} 
                    size="small" 
                    color={planning.jours && planning.jours.length > 0 ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Voir les détails">
                    <IconButton
                      color="info"
                      onClick={() => navigate(`/plannings/${planning._id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/plannings/${planning._id}/modifier`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton
                      color="error"
                      onClick={() => setDeleteModal({ open: true, planning })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredPlannings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchTerm ? 'Aucun planning trouvé' : 'Aucun planning créé'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm 
                      ? 'Essayez de modifier votre recherche'
                      : 'Commencez par créer votre premier planning'
                    }
                  </Typography>
                  {!searchTerm && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/plannings/ajouter')}
                      sx={{ mt: 2 }}
                    >
                      Créer un planning
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de suppression */}
      <Dialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, planning: null })}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le planning "{deleteModal.planning?.intitule}" ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Cette action est irréversible et supprimera tous les horaires associés.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModal({ open: false, planning: null })}>
            Annuler
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlanningsListPage;

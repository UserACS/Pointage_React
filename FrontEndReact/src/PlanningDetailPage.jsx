import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { AuthContext } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { useTestDataStore, isTestMode } from './utils/testUtils';

const PlanningDetailPage = () => {
  const [planning, setPlanning] = useState(null);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const testStore = useTestDataStore();

  useEffect(() => {
    fetchPlanningDetails();
    fetchEmployesAssignes();
  }, [id]);

  const fetchPlanningDetails = async () => {
    try {
      setLoading(true);
      
      if (isTestMode(token)) {
        console.log('🔄 Mode test activé pour planning - ID:', id);
        // Chercher le planning dans le store ou créer un mock
        let planningData = testStore.getPlanningById(id);
        
        if (!planningData) {
          // Données de test pour un planning
          planningData = {
            _id: id,
            nom: id === 'nouveau' ? 'Nouveau Planning' : `Planning ${id}`,
            description: 'Planning de test généré automatiquement',
            dateDebut: '2025-01-15',
            dateFin: '2025-01-30',
            heureDebut: '08:00',
            heureFin: '17:00',
            statut: 'actif',
            equipes: ['Équipe A', 'Équipe B'],
            employes: 4
          };
        }
        setPlanning(planningData);
        return;
      }

      const response = await fetch(`http://localhost:5001/api/plannings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Planning non trouvé');
      }

      const data = await response.json();
      setPlanning(data);
    } catch (err) {
      console.error('❌ Erreur API planning:', err);
      setError(err.message);
      
      // En cas d'erreur, utiliser des données de fallback
      const fallbackPlanning = testStore.getPlanningById(id) || {
        _id: id,
        nom: `Planning ${id}`,
        description: 'Planning de fallback',
        dateDebut: '2025-01-15',
        dateFin: '2025-01-30',
        statut: 'actif'
      };
      setPlanning(fallbackPlanning);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployesAssignes = async () => {
    try {
      if (isTestMode(token)) {
        console.log('🔄 Mode test activé pour employés assignés - Planning ID:', id);
        // Données de test pour les employés assignés
        const mockEmployes = testStore.getEmployes().slice(0, 2);
        setEmployes(mockEmployes);
        return;
      }

      // Rechercher les employés ayant ce planning assigné
      const response = await fetch(`http://localhost:5001/api/employes?planning=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployes(data);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des employés:', err);
      // En cas d'erreur, utiliser des données de fallback
      const fallbackEmployes = testStore.getEmployes().slice(0, 2);
      setEmployes(fallbackEmployes);
    }
  };

  const handleDelete = async () => {
    try {
      if (isTestMode(token)) {
        console.log('🔄 Mode test activé pour suppression planning - ID:', id);
        // Simuler suppression
        testStore.deletePlanning(id);
        navigate('/plannings');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/plannings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      navigate('/plannings');
    } catch (err) {
      console.error('❌ Erreur suppression planning:', err);
      setError(err.message);
      // En cas d'erreur, rediriger quand même
      setTimeout(() => navigate('/plannings'), 2000);
    }
  };

  const formatTime = (time) => {
    return time || '--:--';
  };

  const calculateDailyHours = (jour) => {
    if (!jour.h_entrée1 || !jour.h_sortie1) return 0;
    
    const morning = calculateTimeDiff(jour.h_entrée1, jour.h_sortie1);
    const afternoon = jour.h_entrée2 && jour.h_sortie2 
      ? calculateTimeDiff(jour.h_entrée2, jour.h_sortie2) 
      : 0;
    
    return morning + afternoon;
  };

  const calculateTimeDiff = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    
    return (endTotalMin - startTotalMin) / 60;
  };

  const getTotalWeeklyHours = () => {
    if (!planning?.jours) return 0;
    return planning.jours.reduce((total, jour) => total + calculateDailyHours(jour), 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/plannings')}
          sx={{ mt: 2 }}
        >
          Retour aux plannings
        </Button>
      </Box>
    );
  }

  if (!planning) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Planning non trouvé</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/plannings')}
          sx={{ mt: 2 }}
        >
          Retour aux plannings
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/plannings')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon fontSize="large" />
            {planning.intitule}
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ mr: 1 }}
          >
            Imprimer
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/plannings/${id}/modifier`)}
            sx={{ mr: 1 }}
          >
            Modifier
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
          >
            Supprimer
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informations générales */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon />
                Informations générales
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Intitulé
                </Typography>
                <Typography variant="body1">
                  {planning.intitule}
                </Typography>
              </Box>

              {planning.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {planning.description}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre de jours configurés
                </Typography>
                <Chip 
                  label={`${planning.jours?.length || 0} jour(s)`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total heures hebdomadaires
                </Typography>
                <Typography variant="h6" color="primary">
                  {getTotalWeeklyHours().toFixed(1)}h
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Employés assignés */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon />
                Employés assignés ({employes.length})
              </Typography>
              
              {employes.length > 0 ? (
                <List dense>
                  {employes.map((employe) => (
                    <ListItem key={employe._id} divider>
                      <ListItemText
                        primary={`${employe.nom} ${employe.prenom}`}
                        secondary={employe.email}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun employé assigné à ce planning
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Détail des horaires */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon />
                Horaires détaillés
              </Typography>
              
              {planning.jours && planning.jours.length > 0 ? (
                <Box>
                  {planning.jours.map((jour, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{ p: 3, mb: 2, backgroundColor: '#f8f9fa' }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="h6" sx={{ textTransform: 'capitalize', color: 'primary.main' }}>
                            {jour.nom}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {calculateDailyHours(jour).toFixed(1)}h total
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2" gutterBottom>
                            🌅 Matin
                          </Typography>
                          <Typography variant="body1">
                            {formatTime(jour.h_entrée1)} - {formatTime(jour.h_sortie1)}
                          </Typography>
                          {jour.h_entrée1 && jour.h_sortie1 && (
                            <Typography variant="body2" color="text.secondary">
                              ({calculateTimeDiff(jour.h_entrée1, jour.h_sortie1).toFixed(1)}h)
                            </Typography>
                          )}
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2" gutterBottom>
                            🌆 Après-midi
                          </Typography>
                          <Typography variant="body1">
                            {formatTime(jour.h_entrée2)} - {formatTime(jour.h_sortie2)}
                          </Typography>
                          {jour.h_entrée2 && jour.h_sortie2 && (
                            <Typography variant="body2" color="text.secondary">
                              ({calculateTimeDiff(jour.h_entrée2, jour.h_sortie2).toFixed(1)}h)
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      Total hebdomadaire:
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {getTotalWeeklyHours().toFixed(1)} heures
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Alert severity="warning">
                  Aucun horaire configuré pour ce planning. 
                  <Button
                    size="small"
                    onClick={() => navigate(`/plannings/${id}/modifier`)}
                    sx={{ ml: 1 }}
                  >
                    Configurer maintenant
                  </Button>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de suppression */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le planning "{planning.intitule}" ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Cette action est irréversible et supprimera tous les horaires associés.
            Les employés assignés à ce planning devront être réassignés.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
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

export default PlanningDetailPage;

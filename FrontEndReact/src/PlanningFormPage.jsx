import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Grid
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { AuthContext } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { useTestDataStore, isTestMode } from './utils/testUtils';

const PlanningFormPage = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const testStore = useTestDataStore();

  const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const steps = ['Informations générales', 'Configuration des horaires', 'Validation'];

  // Formulaire pour planning
  const [formData, setFormData] = useState({
    intitule: '',
    description: ''
  });

  // Liste des jours configurés
  const [jours, setJours] = useState([]);

  // Données pour un nouveau jour
  const [newJour, setNewJour] = useState({
    nom: 'lundi',
    h_entrée1: '08:00',
    h_sortie1: '12:00',
    h_entrée2: '14:00',
    h_sortie2: '18:00'
  });

  useEffect(() => {
    if (isEditing) {
      fetchPlanning();
    }
  }, [id, isEditing]);

  const fetchPlanning = async () => {
    try {
      setLoadingData(true);
      
      if (isTestMode(token)) {
        console.log('🔄 Mode test activé pour fetch planning - ID:', id);
        // Chercher le planning dans le store ou créer un mock
        let mockPlanning;
        if (id && id !== 'nouveau') {
          mockPlanning = testStore.getPlanningById(id);
        }
        
        if (!mockPlanning) {
          mockPlanning = {
            intitule: id === 'nouveau' ? '' : `Planning ${id}`,
            description: id === 'nouveau' ? '' : `Description du planning ${id}`,
            dateDebut: '2025-01-15',
            dateFin: '2025-01-30',
            horaires: [
              { jour: 'lundi', heureDebut: '08:00', heureFin: '17:00', active: true },
              { jour: 'mardi', heureDebut: '08:00', heureFin: '17:00', active: true }
            ]
          };
        }
        
        setFormData({
          intitule: mockPlanning.intitule || mockPlanning.nom || '',
          description: mockPlanning.description || ''
        });
        setError('');
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

      const planning = await response.json();
      setFormData({
        intitule: planning.intitule || '',
        description: planning.description || ''
      });
      setJours(planning.jours || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.intitule.trim()) {
      setError('L\'intitulé est obligatoire');
      return;
    }

    try {
      setLoading(true);
      
      if (isTestMode(token)) {
        console.log('🔄 Mode test activé pour soumission planning');
        
        const planningData = {
          ...formData,
          jours: jours,
          dateDebut: formData.dateDebut || '2025-01-15',
          dateFin: formData.dateFin || '2025-01-30',
          statut: 'actif',
          nom: formData.intitule
        };
        
        if (isEditing && id) {
          // Modification
          const updated = testStore.updatePlanning(id, planningData);
          if (updated) {
            setSuccess('Planning modifié avec succès (mode test)');
          }
        } else {
          // Création
          const created = testStore.addPlanning(planningData);
          if (created) {
            setSuccess('Planning créé avec succès (mode test)');
          }
        }
        
        setError('');
        
        // Simuler un délai puis redirection
        setTimeout(() => {
          navigate('/plannings');
        }, 2000);
        return;
      }

      const url = isEditing 
        ? `http://localhost:5001/api/plannings/${id}`
        : 'http://localhost:5001/api/plannings';
      
      const method = isEditing ? 'PUT' : 'POST';

      // Préparer les données du planning avec les jours intégrés
      const planningData = {
        ...formData,
        jours: jours
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planningData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      setSuccess(isEditing ? 'Planning modifié avec succès' : 'Planning créé avec succès');
      setTimeout(() => {
        navigate('/plannings');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addJour = () => {
    if (jours.some(j => j.nom === newJour.nom)) {
      setError('Ce jour est déjà ajouté au planning');
      return;
    }
    
    setJours([...jours, { ...newJour }]);
    setNewJour({
      nom: getNextAvailableDay(),
      h_entrée1: '08:00',
      h_sortie1: '12:00',
      h_entrée2: '14:00',
      h_sortie2: '18:00'
    });
    setError('');
  };

  const removeJour = (index) => {
    setJours(jours.filter((_, i) => i !== index));
  };

  const getNextAvailableDay = () => {
    const usedDays = jours.map(j => j.nom);
    return joursSemaine.find(jour => !usedDays.includes(jour)) || 'lundi';
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.intitule.trim()) {
        setError('L\'intitulé est obligatoire');
        return;
      }
    }
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations du Planning
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Intitulé du planning *"
                    value={formData.intitule}
                    onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
                    placeholder="Ex: Planning équipe du matin"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    multiline
                    rows={4}
                    placeholder="Description optionnelle du planning..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ajouter un jour au planning
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <TextField
                      select
                      fullWidth
                      label="Jour"
                      value={newJour.nom}
                      onChange={(e) => setNewJour({ ...newJour, nom: e.target.value })}
                    >
                      {joursSemaine
                        .filter(jour => !jours.some(j => j.nom === jour))
                        .map((jour) => (
                          <MenuItem key={jour} value={jour}>
                            {jour.charAt(0).toUpperCase() + jour.slice(1)}
                          </MenuItem>
                        ))
                      }
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Entrée matin"
                      type="time"
                      value={newJour.h_entrée1}
                      onChange={(e) => setNewJour({ ...newJour, h_entrée1: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Sortie matin"
                      type="time"
                      value={newJour.h_sortie1}
                      onChange={(e) => setNewJour({ ...newJour, h_sortie1: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Entrée après-midi"
                      type="time"
                      value={newJour.h_entrée2}
                      onChange={(e) => setNewJour({ ...newJour, h_entrée2: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Sortie après-midi"
                      type="time"
                      value={newJour.h_sortie2}
                      onChange={(e) => setNewJour({ ...newJour, h_sortie2: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <Button 
                      fullWidth
                      variant="contained" 
                      onClick={addJour}
                      startIcon={<AddIcon />}
                      disabled={joursSemaine.every(jour => jours.some(j => j.nom === jour))}
                    >
                      Ajouter
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Liste des jours configurés */}
            {jours.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Jours configurés ({jours.length})
                  </Typography>
                  {jours.map((jour, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                            {jour.nom}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Matin:</strong> {jour.h_entrée1 || '--'} - {jour.h_sortie1 || '--'} | 
                            <strong> Après-midi:</strong> {jour.h_entrée2 || '--'} - {jour.h_sortie2 || '--'}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => removeJour(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Récapitulatif du planning
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Intitulé:</strong> {formData.intitule}
                </Typography>
                {formData.description && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Description:</strong> {formData.description}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                <strong>Horaires configurés:</strong>
              </Typography>
              
              {jours.length > 0 ? (
                jours.map((jour, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                      {jour.nom}
                    </Typography>
                    <Typography variant="body2">
                      Matin: {jour.h_entrée1 || '--'} - {jour.h_sortie1 || '--'}
                    </Typography>
                    <Typography variant="body2">
                      Après-midi: {jour.h_entrée2 || '--'} - {jour.h_sortie2 || '--'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="warning.main">
                  Aucun horaire configuré
                </Typography>
              )}
            </CardContent>
          </Card>
        );

      default:
        return 'Étape inconnue';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/plannings')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon fontSize="large" />
          {isEditing ? 'Modifier le Planning' : 'Nouveau Planning'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon />}
            >
              Précédent
            </Button>

            <Box>
              <Button
                onClick={() => navigate('/plannings')}
                startIcon={<CancelIcon />}
                sx={{ mr: 2 }}
              >
                Annuler
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Suivant
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PlanningFormPage;

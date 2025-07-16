import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { AuthContext } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { useTestDataStore, isTestMode } from './utils/testUtils';

const PointerPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [todayPointages, setTodayPointages] = useState([]);
  const [lastPointage, setLastPointage] = useState(null);
  const [workingTime, setWorkingTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { token } = useAuth();
  const theme = useTheme();
  const testStore = useTestDataStore();

  // Mettre à jour l'heure actuelle chaque seconde
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchTodayPointages();
  }, []);

  const getCurrentTimeString = () => {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const fetchCurrentUser = async () => {
    try {
      // Debug : vérifier le token
      console.log('🔍 Token actuel:', token ? `${token.substring(0, 50)}...` : 'AUCUN TOKEN');
      
      if (!token) {
        setError('Aucun token d\'authentification. Veuillez vous connecter.');
        return;
      }

      // TOUJOURS utiliser le backend réel maintenant
      console.log('🌐 Connexion au backend pour récupérer l\'utilisateur courant');
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        console.log('✅ Utilisateur récupéré du backend:', userData);
      } else {
        const errorData = await response.json();
        throw new Error(`Erreur ${response.status}: ${errorData.message || 'Token invalide'}`);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', err);
      setError(`Erreur d'authentification: ${err.message}. Veuillez vous reconnecter.`);
    }
  };

  const fetchTodayPointages = async () => {
    try {
      // TOUJOURS utiliser le backend réel maintenant
      console.log('🌐 Récupération des pointages depuis le backend');
      const response = await fetch('http://localhost:5001/api/pointages/moi', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const pointages = await response.json();
        console.log('✅ Pointages récupérés du backend:', pointages);
        
        // Filtrer les pointages d'aujourd'hui
        const today = new Date().toISOString().slice(0, 10);
        const todayPoints = pointages.filter(p => 
          new Date(p.date).toISOString().slice(0, 10) === today
        );
        
        setTodayPointages(todayPoints);
        
        // Dernier pointage (le plus récent chronologiquement)
        if (todayPoints.length > 0) {
          const sortedPoints = todayPoints.sort((a, b) => {
            const dateA = new Date(a.timestamp || a.date);
            const dateB = new Date(b.timestamp || b.date);
            return dateB - dateA;
          });
          setLastPointage(sortedPoints[0]);
        }

        // Calculer le temps de travail si possible
        calculateWorkingTime(todayPoints);
      } else {
        throw new Error('Erreur lors de la récupération des pointages');
      }
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des pointages:', err);
      setError('Impossible de récupérer les pointages. Vérifiez que le backend est démarré.');
    }
  };

  const calculateWorkingTime = (pointages) => {
    if (pointages.length < 2) return;

    let totalMs = 0;
    const sortedPointages = pointages.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.date);
      const dateB = new Date(b.timestamp || b.date);
      return dateA - dateB;
    });

    for (let i = 0; i < sortedPointages.length; i += 2) {
      const entree = sortedPointages[i];
      const sortie = sortedPointages[i + 1];
      
      if (entree && sortie && 
          (entree.type === 'entrée' || entree.type === 'entree') && 
          sortie.type === 'sortie') {
        const entreeDate = new Date(entree.timestamp || entree.date);
        const sortieDate = new Date(sortie.timestamp || sortie.date);
        totalMs += sortieDate - entreeDate;
      }
    }

    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);

    setWorkingTime({ hours, minutes, totalMs });
  };

  const handlePointage = async (type) => {
    if (!currentUser) {
      setError('Aucun utilisateur connecté');
      return;
    }

    // Vérifier si un pointage a été fait dans les 10 dernières secondes
    if (lastPointage) {
      const lastTime = new Date(lastPointage.timestamp || lastPointage.date);
      const now = new Date();
      const diffInSeconds = (now - lastTime) / 1000;
      
      if (diffInSeconds < 10) {
        setError('Veuillez attendre quelques secondes avant de faire un nouveau pointage');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TOUJOURS utiliser le backend réel maintenant
      console.log('🌐 Envoi du pointage vers le backend -', type);
      
      // Pour l'API, convertir les types si nécessaire
      const apiType = type === 'entrée' ? 'entree' : 'sortie';
      
      const response = await fetch('http://localhost:5001/api/pointages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empreinte_hash: currentUser.empreinte_hash,
          type: apiType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du pointage');
      }

      console.log('✅ Pointage enregistré dans le backend:', data);
      setSuccess(`Pointage ${type} enregistré avec succès dans la base de données !`);
      
      // Actualiser les données depuis le backend
      await fetchTodayPointages();

    } catch (err) {
      console.error('❌ Erreur pointage:', err);
      setError(`Erreur lors du pointage: ${err.message}. Vérifiez que le backend est démarré.`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextAction = () => {
    if (todayPointages.length === 0) {
      return { type: 'entrée', text: 'Pointer l\'arrivée', icon: <LoginIcon /> };
    }
    
    const lastType = lastPointage?.type;
    if (lastType === 'entrée' || lastType === 'entree') {
      return { type: 'sortie', text: 'Pointer le départ', icon: <LogoutIcon /> };
    } else {
      return { type: 'entrée', text: 'Pointer le retour', icon: <LoginIcon /> };
    }
  };

  const nextAction = getNextAction();
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* En-tête */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <AccessTimeIcon fontSize="large" />
          Pointage
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {currentDate}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
          {error.includes('authentification') && (
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => window.location.href = '/'}
                size="small"
              >
                🔑 Se connecter
              </Button>
            </Box>
          )}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Bouton de nettoyage supprimé car on utilise maintenant le vrai backend */}
      {/* Les données sont maintenant persistées dans la base de données MongoDB */}

      <Grid container spacing={3}>
        {/* Carte de pointage principale */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h5" gutterBottom>
                Action de pointage
              </Typography>
              
              {currentUser && (
                <Box sx={{ mb: 3 }}>
                  <Chip
                    icon={<PersonIcon />}
                    label={`${currentUser.nom} ${currentUser.prenom}`}
                    color="primary"
                    size="medium"
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={() => handlePointage(nextAction.type)}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : nextAction.icon}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.2rem',
                  backgroundColor: nextAction.type === 'entrée' ? theme.palette.success.main : theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: nextAction.type === 'entrée' ? theme.palette.success.dark : theme.palette.error.dark,
                  }
                }}
              >
                {loading ? 'Pointage en cours...' : nextAction.text}
              </Button>

              {lastPointage && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Dernier pointage
                  </Typography>
                  <Typography variant="body1">
                    <strong>{(lastPointage.type === 'entree') ? 'Entrée' : 
                             (lastPointage.type === 'entrée') ? 'Entrée' : 
                             (lastPointage.type === 'sortie') ? 'Sortie' : lastPointage.type}</strong> à {formatTime(lastPointage.timestamp || lastPointage.date)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Informations de la journée */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon />
                Résumé de la journée
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre de pointages
                </Typography>
                <Typography variant="h4" color="primary">
                  {todayPointages.length}
                </Typography>
              </Box>

              {workingTime && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Temps de travail
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {workingTime.hours}h {workingTime.minutes}min
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Pointages d'aujourd'hui
              </Typography>

              {todayPointages.length > 0 ? (
                <Box>
                  {todayPointages
                    .sort((a, b) => {
                      const dateA = new Date(a.timestamp || a.date);
                      const dateB = new Date(b.timestamp || b.date);
                      return dateB - dateA; // Tri décroissant (plus récent en premier)
                    })
                    .map((pointage, index) => (
                    <Paper
                      key={index}
                      elevation={index === 0 ? 3 : 1} // Plus d'ombre pour le plus récent
                      sx={{ 
                        p: 2, 
                        mb: 1, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        backgroundColor: index === 0 ? '#f8f9fa' : 'white', // Fond légèrement différent pour le plus récent
                        border: index === 0 ? '1px solid #e3f2fd' : 'none' // Bordure pour le plus récent
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        {(pointage.type === 'entrée' || pointage.type === 'entree') ? (
                          <LoginIcon color="success" />
                        ) : (
                          <LogoutIcon color="error" />
                        )}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {(pointage.type === 'entree') ? 'Entrée' : 
                           (pointage.type === 'entrée') ? 'Entrée' : 
                           (pointage.type === 'sortie') ? 'Sortie' : pointage.type}
                        </Typography>
                        {index === 0 && (
                          <Chip 
                            label="Récent" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: '20px' }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {formatTime(pointage.timestamp || pointage.date)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Aucun pointage aujourd'hui
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statut actuel */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                <CheckCircleIcon 
                  color={(lastPointage?.type === 'entrée' || lastPointage?.type === 'entree') ? 'success' : 'error'} 
                  fontSize="large"
                />
                <Box>
                  <Typography variant="h6">
                    Statut actuel: {' '}
                    <span style={{ 
                      color: (lastPointage?.type === 'entrée' || lastPointage?.type === 'entree') ? theme.palette.success.main : theme.palette.error.main 
                    }}>
                      {todayPointages.length === 0 
                        ? 'Non pointé' 
                        : (lastPointage?.type === 'entrée' || lastPointage?.type === 'entree')
                          ? 'Présent au travail' 
                          : 'Parti du travail'
                      }
                    </span>
                  </Typography>
                  {lastPointage && (
                    <Typography variant="body2" color="text.secondary">
                      Depuis {formatTime(lastPointage.timestamp || lastPointage.date)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PointerPage;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  History as HistoryIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { AuthContext } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { useTestDataStore, isTestMode } from './utils/testUtils';

const PointagesHistoryPage = () => {
  const [pointages, setPointages] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    employe: '',
    dateDebut: '',
    dateFin: '',
    type: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalPointages: 0,
    totalEntrees: 0,
    totalSorties: 0,
    totalHeures: 0
  });

  const { token } = useAuth();
  const testStore = useTestDataStore();

  useEffect(() => {
    fetchCurrentUser();
    fetchPointages();
    fetchEmployes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const fetchCurrentUser = async () => {
    try {
      if (isTestMode(token)) {
        console.log('🔄 Mode test activé pour utilisateur courant (historique)');
        const mockUser = {
          _id: 'test-user',
          nom: 'Dupont',
          prenom: 'Jean',
          role: 'employe',
          email: 'jean.dupont@example.com'
        };
        setCurrentUser(mockUser);
        return;
      }

      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      // Fallback
      const fallbackUser = {
        _id: 'error-user',
        nom: 'Utilisateur',
        prenom: 'Test',
        role: 'employe'
      };
      setCurrentUser(fallbackUser);
    }
  };

  const fetchPointages = async () => {
    try {
      setLoading(true);
      
      // TOUJOURS utiliser le backend réel maintenant
      console.log('🌐 Récupération des pointages depuis le backend...');
      
      // Si l'utilisateur est un employé simple, récupérer seulement ses pointages
      const endpoint = currentUser?.role === 'employe' 
        ? 'http://localhost:5001/api/pointages/moi'
        : 'http://localhost:5001/api/pointages/tous';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPointages(data);
        calculateStats(data);
        console.log('✅ Pointages récupérés:', data);
      } else {
        // Fallback: récupérer les pointages personnels
        const fallbackResponse = await fetch('http://localhost:5001/api/pointages/moi', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setPointages(data);
          calculateStats(data);
          console.log('✅ Pointages personnels récupérés:', data);
        } else {
          throw new Error('Impossible de récupérer les pointages');
        }
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des pointages:', err);
      setError('Erreur lors du chargement des pointages. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployes = async () => {
    try {
      if (isTestMode(token)) {
        console.log('🔄 Mode test activé pour liste employés (historique)');
        const mockEmployes = testStore.getEmployes();
        setEmployes(mockEmployes);
        return;
      }

      const response = await fetch('http://localhost:5001/api/employes', {
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
      console.error('Erreur lors du chargement des employés:', err);
      // Fallback vers le store de test
      const fallbackEmployes = testStore.getEmployes();
      setEmployes(fallbackEmployes);
    }
  };

  const calculateStats = (pointagesData) => {
    const totalPointages = pointagesData.length;
    const totalEntrees = pointagesData.filter(p => p.type === 'entrée' || p.type === 'entree').length;
    const totalSorties = pointagesData.filter(p => p.type === 'sortie').length;
    
    // Calculer le temps de travail total (approximation)
    let totalHeures = 0;
    const groupedByEmployeAndDay = {};

    pointagesData.forEach(pointage => {
      const employeId = pointage.employe?._id || pointage.employe;
      const pointageDate = pointage.timestamp || pointage.date;
      const day = new Date(pointageDate).toISOString().slice(0, 10);
      const key = `${employeId}_${day}`;
      
      if (!groupedByEmployeAndDay[key]) {
        groupedByEmployeAndDay[key] = [];
      }
      groupedByEmployeAndDay[key].push(pointage);
    });

    Object.values(groupedByEmployeAndDay).forEach(dayPointages => {
      const sorted = dayPointages.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.date);
        const dateB = new Date(b.timestamp || b.date);
        return dateA - dateB;
      });
      
      for (let i = 0; i < sorted.length; i += 2) {
        const entree = sorted[i];
        const sortie = sorted[i + 1];
        
        if (entree && sortie && 
            (entree.type === 'entrée' || entree.type === 'entree') && 
            sortie.type === 'sortie') {
          const entreeDate = new Date(entree.timestamp || entree.date);
          const sortieDate = new Date(sortie.timestamp || sortie.date);
          const diff = sortieDate - entreeDate;
          totalHeures += diff / (1000 * 60 * 60); // Convertir en heures
        }
      }
    });

    setStats({
      totalPointages,
      totalEntrees,
      totalSorties,
      totalHeures: Math.round(totalHeures * 10) / 10
    });
  };

  const applyFilters = () => {
    // Cette fonction sera appelée côté client pour filtrer les pointages affichés
    // Dans une vraie application, les filtres seraient appliqués côté serveur
  };

  const getFilteredPointages = () => {
    return pointages.filter(pointage => {
      const pointageDate = new Date(pointage.timestamp || pointage.date);
      const startDate = filters.dateDebut ? new Date(filters.dateDebut) : null;
      const endDate = filters.dateFin ? new Date(filters.dateFin) : null;

      // Filtre par employé
      if (filters.employe && pointage.employe?._id !== filters.employe) {
        return false;
      }

      // Filtre par type (supporter les deux formats)
      if (filters.type) {
        const pointageType = pointage.type;
        if (filters.type === 'entrée' && !(pointageType === 'entrée' || pointageType === 'entree')) {
          return false;
        }
        if (filters.type === 'sortie' && pointageType !== 'sortie') {
          return false;
        }
      }

      // Filtre par date
      if (startDate && pointageDate < startDate) {
        return false;
      }
      if (endDate && pointageDate > endDate) {
        return false;
      }

      return true;
    });
  };

  const formatDateTime = (pointage) => {
    const date = pointage.timestamp || pointage.date;
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (pointage) => {
    const date = pointage.timestamp || pointage.date;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatTime = (pointage) => {
    const date = pointage.timestamp || pointage.date;
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const csvData = getFilteredPointages().map(pointage => ({
      'Date': formatDate(pointage),
      'Heure': formatTime(pointage),
      'Employé': pointage.employe.nom + ' ' + pointage.employe.prenom,
      'Type': pointage.type,
      'Email': pointage.employe.email
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pointages_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filteredPointages = getFilteredPointages();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon fontSize="large" />
          Historique des Pointages
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
          disabled={filteredPointages.length === 0}
        >
          Exporter CSV
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.totalPointages}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total pointages
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.totalEntrees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entrées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {stats.totalSorties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sorties
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stats.totalHeures}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Heures travaillées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filtres
          </Typography>
          
          <Grid container spacing={2}>
            {/* Filtre par employé (seulement pour admin/manager) */}
            {currentUser?.role !== 'employe' && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Employé"
                  value={filters.employe}
                  onChange={(e) => setFilters({ ...filters, employe: e.target.value })}
                  size="small"
                >
                  <MenuItem value="">Tous les employés</MenuItem>
                  {employes.map((employe) => (
                    <MenuItem key={employe._id} value={employe._id}>
                      {employe.nom} {employe.prenom}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Type de pointage"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                size="small"
              >
                <MenuItem value="">Tous les types</MenuItem>
                <MenuItem value="entrée">Entrée</MenuItem>
                <MenuItem value="sortie">Sortie</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                fullWidth
                label="Date de début"
                value={filters.dateDebut}
                onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                fullWidth
                label="Date de fin"
                value={filters.dateFin}
                onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tableau des pointages */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Heure</TableCell>
              {currentUser?.role !== 'employe' && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employé</TableCell>
              )}
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPointages.length > 0 ? (
              filteredPointages
                .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
                .map((pointage, index) => (
                  <TableRow 
                    key={index}
                    hover
                    sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon fontSize="small" color="action" />
                        {formatDate(pointage)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        {formatTime(pointage)}
                      </Box>
                    </TableCell>
                    {currentUser?.role !== 'employe' && (
                      <TableCell>
                        <Typography variant="body2">
                          {pointage.employe?.nom} {pointage.employe?.prenom}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pointage.employe?.email}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {(pointage.type === 'entrée' || pointage.type === 'entree') ? (
                          <LoginIcon color="success" fontSize="small" />
                        ) : (
                          <LogoutIcon color="error" fontSize="small" />
                        )}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {(pointage.type === 'entree') ? 'Entrée' : 
                           (pointage.type === 'entrée') ? 'Entrée' : 
                           (pointage.type === 'sortie') ? 'Sortie' : pointage.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Validé"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={currentUser?.role !== 'employe' ? 5 : 4} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucun pointage trouvé
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Object.values(filters).some(f => f) 
                      ? 'Essayez de modifier vos filtres'
                      : 'Aucun pointage n\'a été enregistré'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination ou informations supplémentaires */}
      {filteredPointages.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {filteredPointages.length} pointage(s) affiché(s)
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PointagesHistoryPage;

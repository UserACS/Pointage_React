import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  List as ListIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const PlanningsNavigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const navigationCards = [
    {
      title: "Liste des Plannings",
      description: "Voir tous les plannings existants",
      icon: <ListIcon fontSize="large" />,
      color: theme.palette.primary.main,
      action: () => navigate('/plannings'),
      buttonText: "Voir la liste"
    },
    {
      title: "Nouveau Planning",
      description: "Créer un nouveau planning",
      icon: <AddIcon fontSize="large" />,
      color: theme.palette.success.main,
      action: () => navigate('/plannings/ajouter'),
      buttonText: "Créer"
    },
    {
      title: "Gestion des Horaires",
      description: "Configurer les horaires de travail",
      icon: <ScheduleIcon fontSize="large" />,
      color: theme.palette.info.main,
      action: () => navigate('/plannings'),
      buttonText: "Gérer"
    },
    {
      title: "Statistiques",
      description: "Voir les statistiques des plannings",
      icon: <TrendingUpIcon fontSize="large" />,
      color: theme.palette.warning.main,
      action: () => navigate('/plannings'),
      buttonText: "Analyser"
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Gestion des Plannings
      </Typography>
      
      <Grid container spacing={3}>
        {navigationCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Paper
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    mb: 2,
                    backgroundColor: card.color,
                    color: 'white',
                    borderRadius: '50%'
                  }}
                >
                  {card.icon}
                </Paper>
                
                <Typography variant="h6" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {card.description}
                </Typography>
                
                <Button
                  variant="contained"
                  onClick={card.action}
                  sx={{
                    backgroundColor: card.color,
                    '&:hover': {
                      backgroundColor: card.color,
                      filter: 'brightness(0.9)'
                    }
                  }}
                  fullWidth
                >
                  {card.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Section d'aide rapide */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            💡 Guide rapide
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                1. Créer un planning
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Commencez par définir l'intitulé et la description de votre planning.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                2. Configurer les horaires
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ajoutez les jours de la semaine avec leurs horaires de travail.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                3. Assigner aux employés
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assignez le planning aux employés concernés.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default PlanningsNavigation;

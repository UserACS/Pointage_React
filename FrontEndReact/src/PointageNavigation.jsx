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
  TouchApp as TouchAppIcon,
  History as HistoryIcon,
  AccessTime as AccessTimeIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

const PointageNavigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const navigationCards = [
    {
      title: "Pointer",
      description: "Enregistrer votre arrivée ou départ",
      icon: <TouchAppIcon fontSize="large" />,
      color: theme.palette.primary.main,
      action: () => navigate('/pointer'),
      buttonText: "Pointer maintenant"
    },
    {
      title: "Historique",
      description: "Consulter vos pointages précédents",
      icon: <HistoryIcon fontSize="large" />,
      color: theme.palette.info.main,
      action: () => navigate('/pointages'),
      buttonText: "Voir l'historique"
    },
    {
      title: "Temps de travail",
      description: "Calculer votre temps de travail",
      icon: <AccessTimeIcon fontSize="large" />,
      color: theme.palette.success.main,
      action: () => navigate('/pointages'),
      buttonText: "Calculer"
    },
    {
      title: "Rapports",
      description: "Générer des rapports de pointage",
      icon: <AnalyticsIcon fontSize="large" />,
      color: theme.palette.warning.main,
      action: () => navigate('/pointages'),
      buttonText: "Voir rapports"
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Gestion du Pointage
      </Typography>
      
      <Grid container spacing={3}>
        {navigationCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
            🕐 Comment pointer ?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                1. Pointer l'arrivée
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cliquez sur "Pointer l'arrivée" dès votre arrivée au travail.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                2. Pointer le départ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                N'oubliez pas de pointer votre départ en fin de journée.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                3. Consulter l'historique
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vérifiez régulièrement vos pointages dans l'historique.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default PointageNavigation;

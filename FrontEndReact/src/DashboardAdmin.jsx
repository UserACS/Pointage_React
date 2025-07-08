import  {React, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
  Divider,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PointageManager from "./PointageManager";
import EmployeManager from "./EmployeManager";
import PlanningManager from "./PlanningManager";
import { AuthProvider } from "./context/AuthContext";
import { useLocation, Navigate } from "react-router-dom";

const drawerWidth = 240;

const DashboardAdmin = () => {
  const [selectedView, setSelectedView] = useState("dashboard");
  const location = useLocation();
  const token = location.state?.token;
if (!token) return <Navigate to="/" replace />;

  const handleNavigateToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const renderContent = () => {
    switch (selectedView) {
      case "dashboard":
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              🚀 Nouveau Dashboard Disponible !
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Découvrez notre nouveau dashboard avec des statistiques en temps réel, 
              des graphiques interactifs et une meilleure expérience utilisateur.
            </Typography>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 4,
              borderRadius: 2,
              mb: 3
            }}>
              <Typography variant="h6" gutterBottom>
                ✨ Nouvelles fonctionnalités
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Statistiques en temps réel
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Graphiques interactifs
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Interface moderne et responsive
              </Typography>
              <Typography variant="body2">
                • Actions rapides selon votre rôle
              </Typography>
            </Box>
            <button 
              onClick={handleNavigateToDashboard}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🚀 Accéder au nouveau Dashboard
            </button>
          </Box>
        );
      case "employes":
        return <EmployeManager />;
      case "plannings":
        return <PlanningManager />;
      case "pointages":
      default:
        return <PointageManager />;
    }
  };

  return (
    <AuthProvider token={token}>

    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Tableau de Bord Administrateur
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItem
              component="button"
              selected={selectedView === "dashboard"}
              onClick={() => setSelectedView("dashboard")}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Nouveau Dashboard" />
            </ListItem>

            <Divider />

            <ListItem
              component="button"
              selected={selectedView === "pointages"}
              onClick={() => setSelectedView("pointages")}
            >
              <ListItemIcon>
                <AccessTimeIcon />
              </ListItemIcon>
              <ListItemText primary="Pointages" />
            </ListItem>

            <ListItem
              component="button"
              selected={selectedView === "employes"}
              onClick={() => setSelectedView("employes")}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Employés" />
            </ListItem>

            <ListItem
              component="button"
              selected={selectedView === "plannings"}
              onClick={() => setSelectedView("plannings")}
            >
              <ListItemIcon>
                <ScheduleIcon />
              </ListItemIcon>
              <ListItemText primary="Plannings" />
            </ListItem>
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
    </AuthProvider>
  );
};

export default DashboardAdmin;
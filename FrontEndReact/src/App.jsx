import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Inscription from './Inscription';
import Authentification from './Authentification';
import DashboardAdmin from "./DashboardAdmin";
import DashboardPage from "./DashboardPage";
import EmployeManager from "./EmployeManager";
import PlanningsListPage from './PlanningsListPage';
import PlanningFormPage from './PlanningFormPage';
import PlanningDetailPage from './PlanningDetailPage';
import PointerPage from './PointerPage';
import PointagesHistoryPage from './PointagesHistoryPage';
import { AuthProvider } from './context/AuthContext';
import { createTestToken } from './utils/testUtils';
import './App.css'

// Wrapper component for pages that need AuthContext
const AuthPageWrapper = ({ Component }) => {
  const location = useLocation();
  const token = location.state?.token || localStorage.getItem('token') || createTestToken();
  
  return (
    <AuthProvider token={token}>
      <Component />
    </AuthProvider>
  );
};

// Wrapper component for DashboardPage to provide AuthContext
const DashboardPageWrapper = () => {
  const location = useLocation();
  const token = location.state?.token || localStorage.getItem('token') || createTestToken();
  
  return (
    <AuthProvider token={token}>
      <DashboardPage />
    </AuthProvider>
  );
};

function App() {
  return (
   <Router>
      <Routes>
        <Route path="/" element={<Authentification  />} />
        <Route path="/inscription"  element={<Inscription />} />
        <Route path="/tableaudebord" element={<DashboardAdmin />} />
        <Route path="/dashboard" element={<DashboardPageWrapper />} />
        
        {/* Routes pour les plannings */}
        <Route path="/plannings" element={<AuthPageWrapper Component={PlanningsListPage} />} />
        <Route path="/plannings/ajouter" element={<AuthPageWrapper Component={PlanningFormPage} />} />
        <Route path="/plannings/:id" element={<AuthPageWrapper Component={PlanningDetailPage} />} />
        <Route path="/plannings/:id/modifier" element={<AuthPageWrapper Component={PlanningFormPage} />} />
        
        {/* Routes pour le pointage */}
        <Route path="/pointer" element={<AuthPageWrapper Component={PointerPage} />} />
        <Route path="/pointages" element={<AuthPageWrapper Component={PointagesHistoryPage} />} />
        <Route path="/pointage/tous" element={<AuthPageWrapper Component={PointagesHistoryPage} />} />
        <Route path="/pointage/historique" element={<AuthPageWrapper Component={PointagesHistoryPage} />} />
        
        {/* Routes pour les employés */}
        <Route path="/employes" element={<AuthPageWrapper Component={EmployeManager} />} />
        <Route path="/employes/gestion" element={<AuthPageWrapper Component={EmployeManager} />} />
      </Routes>
    </Router>
  );
}

export default App

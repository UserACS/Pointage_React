// Ajouter React import pour le hook

// Ajouter React import pour le hook
import React from 'react';

// ========== STORE PARTAGÉ POUR LES DONNÉES DE TEST ==========
// Store in-memory partagé pour que les modifications soient visibles partout
class TestDataStore {
  constructor() {
    // Charger les données depuis localStorage ou utiliser les données initiales
    this.data = this._loadDataFromStorage();
    this.listeners = new Set();
    
    // Mettre à jour les stats du dashboard après le chargement
    this._updateDashboardStats();
    
    // Afficher l'état du localStorage pour debug
    this._debugLocalStorage();
  }
  
  // Méthode de debug pour afficher l'état du localStorage
  _debugLocalStorage() {
    try {
      const savedData = localStorage.getItem('testDataStore');
      if (savedData) {
        const size = new Blob([savedData]).size;
        console.log('🔍 État du localStorage:', {
          taille: `${(size / 1024).toFixed(2)} KB`,
          derniereSauvegarde: JSON.parse(savedData).timestamp || 'Inconnue'
        });
      } else {
        console.log('🔍 Aucune donnée dans localStorage');
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du debug localStorage:', error);
    }
  }

  // Charger les données depuis localStorage
  _loadDataFromStorage() {
    try {
      const savedData = localStorage.getItem('testDataStore');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('📁 Données chargées depuis localStorage:', {
          employes: parsed.employes?.length || 0,
          plannings: parsed.plannings?.length || 0,
          pointages: parsed.pointages?.length || 0
        });
        
        // Vérifier que les données sont valides
        if (parsed.employes && parsed.plannings && parsed.pointages) {
          return {
            employes: parsed.employes,
            plannings: parsed.plannings,
            pointages: parsed.pointages,
            dashboard: parsed.dashboard || this._getInitialDashboardData()
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement des données:', error);
    }
    
    // Si pas de données sauvegardées ou erreur, utiliser les données initiales
    console.log('🆕 Utilisation des données initiales');
    const initialData = {
      employes: this._getInitialEmployes(),
      plannings: this._getInitialPlannings(),
      pointages: this._getInitialPointages(),
      dashboard: this._getInitialDashboardData()
    };
    
    // Sauvegarder immédiatement les données initiales
    try {
      localStorage.setItem('testDataStore', JSON.stringify(initialData));
      console.log('💾 Données initiales sauvegardées dans localStorage');
    } catch (error) {
      console.warn('⚠️ Erreur lors de la sauvegarde initiale:', error);
    }
    
    return initialData;
  }

  // Sauvegarder les données dans localStorage
  _saveDataToStorage() {
    try {
      const dataToSave = {
        employes: this.data.employes,
        plannings: this.data.plannings,
        pointages: this.data.pointages,
        dashboard: this.data.dashboard,
        timestamp: new Date().toISOString() // Horodatage pour debug
      };
      
      localStorage.setItem('testDataStore', JSON.stringify(dataToSave));
      console.log('💾 Données sauvegardées dans localStorage:', {
        employes: dataToSave.employes.length,
        plannings: dataToSave.plannings.length,
        pointages: dataToSave.pointages.length,
        timestamp: dataToSave.timestamp
      });
    } catch (error) {
      console.warn('⚠️ Erreur lors de la sauvegarde:', error);
      
      // Si erreur de quota, essayer de nettoyer le localStorage
      if (error.name === 'QuotaExceededError') {
        console.log('🧹 Nettoyage du localStorage pour faire de la place...');
        try {
          // Garder seulement les données essentielles
          const minimalData = {
            employes: this.data.employes,
            plannings: this.data.plannings,
            pointages: this.data.pointages.slice(-50), // Garder seulement les 50 derniers pointages
            dashboard: this.data.dashboard,
            timestamp: new Date().toISOString()
          };
          
          localStorage.setItem('testDataStore', JSON.stringify(minimalData));
          console.log('✅ Données minimales sauvegardées');
        } catch (retryError) {
          console.error('❌ Impossible de sauvegarder même les données minimales:', retryError);
        }
      }
    }
  }

  // Réinitialiser toutes les données
  resetAllData() {
    this.data = {
      employes: this._getInitialEmployes(),
      plannings: this._getInitialPlannings(),
      pointages: this._getInitialPointages(),
      dashboard: this._getInitialDashboardData()
    };
    this._saveDataToStorage();
    this._notifyListeners('all', 'reset', this.data);
    this._updateDashboardStats();
    console.log('🔄 Toutes les données ont été réinitialisées');
  }
  
  // Forcer la sauvegarde
  forceSave() {
    this._saveDataToStorage();
    console.log('💾 Sauvegarde forcée');
  }
  
  // Vider complètement le localStorage (pour debug)
  clearStorage() {
    try {
      localStorage.removeItem('testDataStore');
      console.log('🗑️ localStorage nettoyé');
    } catch (error) {
      console.warn('⚠️ Erreur lors du nettoyage:', error);
    }
  }
  
  // Afficher les statistiques de persistance
  getStorageStats() {
    try {
      const savedData = localStorage.getItem('testDataStore');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const size = new Blob([savedData]).size;
        return {
          taille: `${(size / 1024).toFixed(2)} KB`,
          employes: parsed.employes?.length || 0,
          plannings: parsed.plannings?.length || 0,
          pointages: parsed.pointages?.length || 0,
          derniereSauvegarde: parsed.timestamp || 'Inconnue'
        };
      }
      return { message: 'Aucune donnée sauvegardée' };
    } catch (error) {
      return { erreur: error.message };
    }
  }

  // Méthodes pour s'abonner aux changements
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notifyListeners(type, action, data) {
    this.listeners.forEach(listener => {
      try {
        listener({ type, action, data });
      } catch (error) {
        console.error('Erreur dans un listener du store:', error);
      }
    });
  }

  // ===== GESTION DES EMPLOYÉS =====
  getEmployes() {
    return [...this.data.employes];
  }

  addEmploye(employe) {
    const newEmploye = {
      ...employe,
      _id: Date.now().toString(),
      matricule: employe.matricule || `EMP${String(this.data.employes.length + 1).padStart(3, '0')}`
    };
    this.data.employes.push(newEmploye);
    this._saveDataToStorage(); // Sauvegarder après modification
    this._notifyListeners('employes', 'add', newEmploye);
    this._updateDashboardStats();
    return newEmploye;
  }

  updateEmploye(id, updates) {
    const index = this.data.employes.findIndex(emp => emp._id === id);
    if (index !== -1) {
      this.data.employes[index] = { ...this.data.employes[index], ...updates };
      this._saveDataToStorage(); // Sauvegarder après modification
      this._notifyListeners('employes', 'update', this.data.employes[index]);
      return this.data.employes[index];
    }
    return null;
  }

  deleteEmploye(id) {
    const index = this.data.employes.findIndex(emp => emp._id === id);
    if (index !== -1) {
      const deleted = this.data.employes.splice(index, 1)[0];
      this._saveDataToStorage(); // Sauvegarder après modification
      this._notifyListeners('employes', 'delete', deleted);
      this._updateDashboardStats();
      return deleted;
    }
    return null;
  }

  // ===== GESTION DES PLANNINGS =====
  getPlannings() {
    return [...this.data.plannings];
  }

  addPlanning(planning) {
    const newPlanning = {
      ...planning,
      _id: Date.now().toString()
    };
    this.data.plannings.push(newPlanning);
    this._saveDataToStorage(); // Sauvegarder après modification
    this._notifyListeners('plannings', 'add', newPlanning);
    this._updateDashboardStats();
    return newPlanning;
  }

  updatePlanning(id, updates) {
    const index = this.data.plannings.findIndex(plan => plan._id === id);
    if (index !== -1) {
      this.data.plannings[index] = { ...this.data.plannings[index], ...updates };
      this._saveDataToStorage(); // Sauvegarder après modification
      this._notifyListeners('plannings', 'update', this.data.plannings[index]);
      this._updateDashboardStats();
      return this.data.plannings[index];
    }
    return null;
  }

  deletePlanning(id) {
    const index = this.data.plannings.findIndex(plan => plan._id === id);
    if (index !== -1) {
      const deleted = this.data.plannings.splice(index, 1)[0];
      this._saveDataToStorage(); // Sauvegarder après modification
      this._notifyListeners('plannings', 'delete', deleted);
      this._updateDashboardStats();
      return deleted;
    }
    return null;
  }

  getPlanningById(id) {
    return this.data.plannings.find(plan => plan._id === id) || null;
  }

  // ===== GESTION DES POINTAGES =====
  getPointages() {
    return [...this.data.pointages];
  }

  addPointage(pointage) {
    // Vérifier s'il n'y a pas déjà un pointage très récent du même employé
    const now = new Date();
    const recentPointages = this.data.pointages.filter(p => {
      const pointageTime = new Date(p.timestamp || p.date);
      const diffInSeconds = (now - pointageTime) / 1000;
      return diffInSeconds < 5 && p.employe?._id === pointage.employe?._id; // 5 secondes
    });

    if (recentPointages.length > 0) {
      console.log('🚫 Pointage ignoré - trop récent');
      return recentPointages[0]; // Retourner le pointage existant
    }

    const newPointage = {
      ...pointage,
      _id: pointage._id || Date.now().toString()
    };
    this.data.pointages.push(newPointage);
    this._saveDataToStorage(); // Sauvegarder après modification
    this._notifyListeners('pointages', 'add', newPointage);
    this._updateDashboardStats();
    return newPointage;
  }

  updatePointage(id, updates) {
    const index = this.data.pointages.findIndex(pt => pt._id === id);
    if (index !== -1) {
      this.data.pointages[index] = { ...this.data.pointages[index], ...updates };
      this._saveDataToStorage(); // Sauvegarder après modification
      this._notifyListeners('pointages', 'update', this.data.pointages[index]);
      this._updateDashboardStats();
      return this.data.pointages[index];
    }
    return null;
  }

  deletePointage(id) {
    const index = this.data.pointages.findIndex(pt => pt._id === id);
    if (index !== -1) {
      const deleted = this.data.pointages.splice(index, 1)[0];
      this._saveDataToStorage(); // Sauvegarder après modification
      this._notifyListeners('pointages', 'delete', deleted);
      this._updateDashboardStats();
      return deleted;
    }
    return null;
  }

  // Nouvelle méthode pour nettoyer les pointages d'aujourd'hui (pour les tests)
  clearTodayPointages() {
    const today = new Date().toISOString().split('T')[0];
    const initialLength = this.data.pointages.length;
    this.data.pointages = this.data.pointages.filter(p => {
      const pointageDate = new Date(p.timestamp || p.date).toISOString().split('T')[0];
      return pointageDate !== today;
    });
    const removedCount = initialLength - this.data.pointages.length;
    if (removedCount > 0) {
      this._saveDataToStorage(); // Sauvegarder après modification
      this._notifyListeners('pointages', 'clear', { removedCount });
      this._updateDashboardStats();
    }
    return removedCount;
  }

  // ===== GESTION DU DASHBOARD =====
  getDashboardData() {
    return { ...this.data.dashboard };
  }

  _updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const pointagesToday = this.data.pointages.filter(p => {
      const pointageDate = new Date(p.timestamp || p.date).toISOString().split('T')[0];
      return pointageDate === today;
    });
    
    // Compter les employés présents (qui ont fait au moins une entrée aujourd'hui)
    const employesPresents = new Set();
    pointagesToday.forEach(p => {
      if (p.type === 'entrée' || p.type === 'entree') {
        employesPresents.add(p.employe._id || p.employe.matricule);
      }
    });
    
    this.data.dashboard = {
      totalEmployes: this.data.employes.length,
      presentsAujourdhui: employesPresents.size,
      enRetard: 0, // Calculer plus tard si nécessaire
      absents: this.data.employes.length - employesPresents.size,
      planningsActifs: this.data.plannings.filter(p => p.statut === 'actif').length,
      pointagesAujourdhui: pointagesToday.length,
      tauxPresence: this.data.employes.length > 0 ? 
        Math.round((employesPresents.size / this.data.employes.length) * 100) : 0,
      alertes: [
        { id: 1, type: 'info', message: 'Mode test activé - Données d\'exemple' },
        { id: 2, type: 'warning', message: 'Connectez-vous avec un vrai compte pour voir les vraies données' }
      ]
    };
    
    this._notifyListeners('dashboard', 'update', this.data.dashboard);
  }

  // Méthodes pour récupérer les données initiales
  _getInitialEmployes() {
    return [
      {
        _id: '1',
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'jean.dupont@example.com',
        telephone: '0123456789',
        poste: 'Développeur',
        matricule: 'EMP001',
        dateEmbauche: '2023-01-15'
      },
      {
        _id: '2',
        prenom: 'Marie',
        nom: 'Martin',
        email: 'marie.martin@example.com',
        telephone: '0987654321',
        poste: 'Designer',
        matricule: 'EMP002',
        dateEmbauche: '2023-02-20'
      },
      {
        _id: '3',
        prenom: 'Pierre',
        nom: 'Durand',
        email: 'pierre.durand@example.com',
        telephone: '0567891234',
        poste: 'Manager',
        matricule: 'EMP003',
        dateEmbauche: '2022-11-10'
      },
      {
        _id: '4',
        prenom: 'Sophie',
        nom: 'Blanc',
        email: 'sophie.blanc@example.com',
        telephone: '0456789123',
        poste: 'Analyste',
        matricule: 'EMP004',
        dateEmbauche: '2023-03-05'
      }
    ];
  }

  _getInitialPlannings() {
    return [
      {
        _id: '1',
        nom: 'Planning Semaine 1',
        description: 'Planning pour la première semaine de janvier',
        dateDebut: '2025-01-06',
        dateFin: '2025-01-12',
        heureDebut: '08:00',
        heureFin: '17:00',
        statut: 'actif',
        equipes: ['Équipe A', 'Équipe B'],
        employes: 8
      },
      {
        _id: '2',
        nom: 'Planning Semaine 2',
        description: 'Planning pour la deuxième semaine de janvier',
        dateDebut: '2025-01-13',
        dateFin: '2025-01-19',
        heureDebut: '09:00',
        heureFin: '18:00',
        statut: 'en_preparation',
        equipes: ['Équipe C'],
        employes: 5
      },
      {
        _id: '3',
        nom: 'Planning Formation',
        description: 'Planning pour session de formation',
        dateDebut: '2025-01-20',
        dateFin: '2025-01-24',
        heureDebut: '10:00',
        heureFin: '16:00',
        statut: 'termine',
        equipes: ['Toutes équipes'],
        employes: 12
      }
    ];
  }

  _getInitialPointages() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return [
      // Pointages d'aujourd'hui
      {
        _id: '1',
        employe: {
          _id: 'emp1',
          nom: 'Dupont',
          prenom: 'Jean',
          matricule: 'EMP001',
          email: 'jean.dupont@example.com'
        },
        timestamp: `${today}T08:15:00.000Z`,
        date: `${today}T08:15:00.000Z`,
        type: 'entrée',
        statut: 'validé',
        methode: 'empreinte'
      },
      {
        _id: '2',
        employe: {
          _id: 'emp1',
          nom: 'Dupont',
          prenom: 'Jean',
          matricule: 'EMP001',
          email: 'jean.dupont@example.com'
        },
        timestamp: `${today}T17:30:00.000Z`,
        date: `${today}T17:30:00.000Z`,
        type: 'sortie',
        statut: 'validé',
        methode: 'empreinte'
      },
      {
        _id: '3',
        employe: {
          _id: 'emp2',
          nom: 'Martin',
          prenom: 'Marie',
          matricule: 'EMP002',
          email: 'marie.martin@example.com'
        },
        timestamp: `${today}T07:45:00.000Z`,
        date: `${today}T07:45:00.000Z`,
        type: 'entrée',
        statut: 'validé',
        methode: 'empreinte'
      },
      {
        _id: '4',
        employe: {
          _id: 'emp2',
          nom: 'Martin',
          prenom: 'Marie',
          matricule: 'EMP002',
          email: 'marie.martin@example.com'
        },
        timestamp: `${today}T17:00:00.000Z`,
        date: `${today}T17:00:00.000Z`,
        type: 'sortie',
        statut: 'validé',
        methode: 'empreinte'
      },
      // Pointages d'hier
      {
        _id: '5',
        employe: {
          _id: 'emp3',
          nom: 'Durand',
          prenom: 'Pierre',
          matricule: 'EMP003',
          email: 'pierre.durand@example.com'
        },
        timestamp: `${yesterday}T08:30:00.000Z`,
        date: `${yesterday}T08:30:00.000Z`,
        type: 'entrée',
        statut: 'validé',
        methode: 'empreinte'
      },
      {
        _id: '6',
        employe: {
          _id: 'emp3',
          nom: 'Durand',
          prenom: 'Pierre',
          matricule: 'EMP003',
          email: 'pierre.durand@example.com'
        },
        timestamp: `${yesterday}T16:45:00.000Z`,
        date: `${yesterday}T16:45:00.000Z`,
        type: 'sortie',
        statut: 'validé',
        methode: 'empreinte'
      }
    ];
  }

  _getInitialDashboardData() {
    return {
      totalEmployes: 4,
      presentsAujourdhui: 2,
      enRetard: 1,
      absents: 2,
      planningsActifs: 1,
      pointagesAujourdhui: 3,
      tauxPresence: 50,
      alertes: [
        { id: 1, type: 'info', message: 'Mode test activé - Données d\'exemple' },
        { id: 2, type: 'warning', message: 'Connectez-vous avec un vrai compte pour voir les vraies données' }
      ]
    };
  }
}

// Instance singleton du store
const testDataStore = new TestDataStore();

// Hook React pour utiliser le store
export const useTestDataStore = () => {
  const [, forceUpdate] = React.useState({});
  
  React.useEffect(() => {
    const unsubscribe = testDataStore.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  return testDataStore;
};

// ========== UTILITAIRES POUR LE MODE TEST ==========
export const createTestToken = () => {
  // Créer un token de test simple (ne pas utiliser en production)
  const testUser = {
    id: 'test-user-id',
    role: 'admin',
    nom: 'Test',
    prenom: 'User',
    email: 'test@example.com'
  };
  
  // En mode développement, on peut créer un faux token
  // En production, il faudrait un vrai JWT
  return btoa(JSON.stringify(testUser)); // Base64 encode pour simuler un token
};

export const isValidToken = (token) => {
  if (!token || token === 'default-token') return false;
  
  try {
    // Vérifier si c'est un JWT (commence par eyJ)
    if (token.startsWith('eyJ')) {
      // C'est un JWT, on considère qu'il pourrait être valide
      // (en réalité, il faudrait le décoder et vérifier la signature)
      return true;
    }
    
    // Vérifier si c'est notre token de test encodé en base64
    const decoded = JSON.parse(atob(token));
    return decoded && decoded.id && decoded.role;
  } catch {
    // Si le décodage échoue, ce n'est pas un token valide
    return false;
  }
};

// ========== FONCTIONS DE COMPATIBILITÉ (pour les composants existants) ==========
// Ces fonctions utilisent maintenant le store partagé
export const getMockDashboardData = () => testDataStore.getDashboardData();
export const getMockEmployes = () => testDataStore.getEmployes();
export const getMockPlannings = () => testDataStore.getPlannings();
export const getMockPointages = () => testDataStore.getPointages();

// ========== CONFIGURATION DU MODE TEST ==========
export const FORCE_TEST_MODE = false; // DÉSACTIVÉ - Utiliser le vrai backend

// Déterminer si on est en mode test
export const isTestMode = (token) => {
  return FORCE_TEST_MODE || !isValidToken(token);
};

// ========== FONCTIONS UTILITAIRES POUR LA PERSISTENCE ==========
// Ces fonctions permettent d'accéder aux méthodes de persistence du store
export const getStorageStats = () => testDataStore.getStorageStats();
export const forceSaveData = () => testDataStore.forceSave();
export const clearAllStorageData = () => testDataStore.clearStorage();
export const resetAllTestData = () => testDataStore.resetAllData();

// Fonction pour vérifier la persistence dans la console
export const debugStorage = () => {
  console.log('=== ÉTAT DE LA PERSISTENCE ===');
  console.log('Stats:', getStorageStats());
  console.log('Données actuelles:', {
    employes: testDataStore.getEmployes().length,
    plannings: testDataStore.getPlannings().length,
    pointages: testDataStore.getPointages().length
  });
  console.log('===============================');
};

// Exposer ces fonctions globalement pour faciliter le debug
if (typeof window !== 'undefined') {
  window.debugPointageStorage = debugStorage;
  window.resetPointageData = resetAllTestData;
  window.forceSavePointageData = forceSaveData;
}

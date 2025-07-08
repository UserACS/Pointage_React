# API de Gestion de Pointage

Cette application Node.js/Express/Mongoose permet la gestion complète des employés, des équipes, des plannings, des affectations et du pointage dans une organisation.  
Elle inclut une authentification JWT sécurisée et une gestion fine des rôles (administrateur, responsable, manager, employé).

---

## 🚀 Fonctionnalités principales

- **Authentification sécurisée** (JWT)
- **Gestion des utilisateurs** (CRUD employé, manager, responsable, administrateur)
- **Gestion et affectation des équipes**
- **Gestion des plannings et des jours**
- **Gestion du pointage par empreinte**
- **Tableau de bord personnalisé**
- **Gestion des rôles et des autorisations**
- **Historique d’affectations, pointages, plannings**

---

## 🏗️ Structure du projet

```
.
├── controllers/
├── middlewares/
├── models/
├── routes/
├── main.js
├── .env
└── README.md
```

---

## ⚙️ Installation

1. **Cloner ce repo**
   ```bash
   git clone <url>
   cd <project>
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Créer un fichier `.env` à la racine**  
   Ex:
   ```
   MONGO_URI_2=mongodb://localhost:27017/pointage
   JWT_SECRET=monSuperSecret
   PORT=5001
   ```

4. **Démarrer le serveur**
   ```bash
   npm start
   ```
   ou
   ```bash
   node main.js
   ```
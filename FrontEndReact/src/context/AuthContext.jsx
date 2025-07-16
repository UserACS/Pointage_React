// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ token, children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // Decode token to get user info or fetch user data
      try {
        // For now, create a mock user object
        // In production, you would decode the JWT token or fetch user data
        setUser({
          id: 1,
          role: 'admin',
          name: 'Admin User'
        });
      } catch (error) {
        console.error('Error processing token:', error);
      }
    }
  }, [token]);

  return <AuthContext.Provider value={{ token, user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// Export AuthContext for direct use in components that need it
export { AuthContext };
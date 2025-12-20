import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentApplication, setCurrentApplication] = useState(null);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setCurrentApplication(null);
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    currentApplication,
    setCurrentApplication
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
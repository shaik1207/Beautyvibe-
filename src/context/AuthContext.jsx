import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/axios';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifySession = async () => {
    const token = localStorage.getItem('beautyvibe_user_token') || localStorage.getItem('beautyvibe_admin_token') || localStorage.getItem('token');
    
    if (!token) {
      setCurrentUser(null);
      setUserRole(null);
      setLoading(false);
      return false;
    }

    try {
      const response = await API.get('/api/auth/me');
      const userData = response.data?.data || response.data;
      setCurrentUser(userData);
      setUserRole(userData?.role || 'user');
      setLoading(false);
      return true;
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem('beautyvibe_user_token');
        localStorage.removeItem('beautyvibe_admin_token');
        localStorage.removeItem('token');
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    verifySession();
  }, []);

  const logout = () => {
    localStorage.removeItem('beautyvibe_user_token');
    localStorage.removeItem('beautyvibe_admin_token');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserRole(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading, verifySession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
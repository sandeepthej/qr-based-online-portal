import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auto_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('auto_token') || null;
  });

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('auto_user', JSON.stringify(userData));
    localStorage.setItem('auto_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auto_user');
    localStorage.removeItem('auto_token');
  };

  // Compute API base URL (Vite dev runs on localhost:5173, Backend on 5001)
  const apiBase = 'http://localhost:5001/api';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, apiBase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

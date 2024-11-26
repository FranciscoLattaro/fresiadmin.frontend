import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (token) => {
    localStorage.setItem('jwt_authorization', token);
    setUser(true);
  };

  const logout = () => {
    localStorage.removeItem('jwt_authorization');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('jwt_authorization');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
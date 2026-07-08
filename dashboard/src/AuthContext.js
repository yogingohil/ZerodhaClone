import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from './config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem('user');
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const existingUser = storedUser ? JSON.parse(storedUser) : null;

    const shouldFetch = email && (!existingUser || existingUser.email !== email);

    if (existingUser && !shouldFetch) {
      setUser(existingUser);
      setLoading(false);
      return;
    }

    if (email) {
      fetch(`${API_URL}/user?email=${encodeURIComponent(email)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch((error) => {
          console.error('Error fetching user from backend:', error);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Redirect to home page
    window.location.href = '/';
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
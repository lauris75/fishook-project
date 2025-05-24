import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081",
  timeout: 10000,
});

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    console.log("🚪 Logging out user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
  };

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (!token || !user) {
        logout();
        return Promise.reject(new Error('No authentication data found'));
      }
      
      try {
        const userData = JSON.parse(user);
        if (!userData || !userData.id || !userData.email) {
          logout();
          return Promise.reject(new Error('Invalid user data'));
        }
      } catch (error) {
        logout();
        return Promise.reject(new Error('Error parsing user data'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const validateStoredAuth = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
        
    if (!token || !user) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(user);
      
      if (userData && userData.id && userData.email) {
        setCurrentUser(userData);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setCurrentUser(null);
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setCurrentUser(null);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    validateStoredAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, api, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
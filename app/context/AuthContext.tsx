'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, removeToken, setToken, getUserFromToken, setTokens, getUserFromTokens } from '../utils/auth';

interface User {
  uid: number;
  exp: number;
  admin: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  loginValidation: (token: string, tokens: string) => void;
}

const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  login: (_token: string) => {
    console.warn('AuthContext not initialized');
  },
  logout: () => {
    console.warn('AuthContext not initialized');
  },
  loginValidation: (_token: string, _tokens: string) => {
    console.warn('AuthContext not initialized');
  },
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = getToken();
      if (token) {
        const userData = getUserFromToken();
        if (userData) {
          setUser(userData);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string) => {
    setToken(token);
    const userData = getUserFromToken();
    console.log('User data from token:', userData);
    if (userData) {
      setUser(userData);
    }
  };

  const loginValidation = (token: string, tokens: string) => {
    setTokens(token, tokens);
    console.log('Tokens set:', token, tokens);
    const userData = getUserFromTokens();
    console.log('User data from tokens:', userData);
    /* if (userData) {
      setUser(userData);
    } */
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        logout,
        loginValidation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

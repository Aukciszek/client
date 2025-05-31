'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  getToken,
  removeCookie,
  setToken,
  getUserFromToken,
  setTokens,
  parseTokensListAndServers,
  getServersList,
  setServersListCookie,
} from '../utils/auth';

interface User {
  uid: number;
  exp: number;
  admin: boolean;
}

interface DecodedToken {
  uid: number;
  isAdmin: boolean;
  exp: number;
}

interface TokenInfo {
  access_token: string;
  server: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  servers: string[];
  // eslint-disable-next-line no-unused-vars
  setUserParamsFromToken: (token: string) => DecodedToken | null;
  logout: () => void;
  // eslint-disable-next-line no-unused-vars
  loginValidation: (tokens: TokenInfo[]) => void;
}

const operation_undefined = () => {
  throw new Error('No operation defined');
};

const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  servers: [],
  setUserParamsFromToken: () => null,
  logout: operation_undefined,
  loginValidation: operation_undefined,
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState<string[]>([]);

  useEffect(() => {
    const initAuth = () => {
      const token = getToken();
      if (token) {
        const userData = getUserFromToken();
        if (userData) {
          setUser({
            uid: userData.uid,
            exp: userData.exp,
            admin: userData.isAdmin,
          });
        }
        const savedServers = getServersList();
        setServers(savedServers);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const setUserParamsFromToken = (token: string): DecodedToken | null => {
    setToken(token);
    const userData = getUserFromToken();
    if (userData) {
      setUser({
        uid: userData.uid,
        exp: userData.exp,
        admin: userData.isAdmin,
      });
      return userData;
    }
    logout();
    return null;
  };

  const loginValidation = (tokens: TokenInfo[]) => {
    try {
      if (!Array.isArray(tokens) || tokens.length === 0) {
        throw new Error('Invalid tokens format or empty array');
      }

      const { decodedFirstToken, servers: serverList } =
        parseTokensListAndServers(tokens);

      if (!decodedFirstToken) {
        throw new Error('Failed to decode first token');
      }

      setUser({
        uid: decodedFirstToken.uid,
        exp: decodedFirstToken.exp,
        admin: decodedFirstToken.isAdmin,
      });
      setServers(serverList);
      setTokens(tokens);
      setServersListCookie(serverList);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to validate login';
      throw new Error(message);
    }
  };

  const logout = () => {
    removeCookie('access_token');
    removeCookie('access_tokens');
    removeCookie('servers_list');
    setUser(null);
    setServers([]);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        servers,
        setUserParamsFromToken,
        logout,
        loginValidation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

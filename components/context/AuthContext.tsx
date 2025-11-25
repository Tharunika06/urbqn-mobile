// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setToken: (token: string | null) => Promise<void>;
  clearToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token on app start
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      
      if (storedToken) {
        setTokenState(storedToken);
      } else {
      }
    } catch (error) {
      console.error(' Error loading token:', error);
    } finally {
      setLoading(false);
    }
  };

  const setToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem('authToken', newToken);
        setTokenState(newToken);
      } else {
        await AsyncStorage.removeItem('authToken');
        setTokenState(null);
      }
    } catch (error) {
      console.error(' Error saving token:', error);
      throw error;
    }
  };

  const clearToken = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setTokenState(null);
      console.log(' Auth token cleared');
    } catch (error) {
      console.error(' Error clearing token:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        isAuthenticated: !!token,
        loading,
        setToken,
        clearToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
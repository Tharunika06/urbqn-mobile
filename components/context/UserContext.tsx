// contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  _id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  profileImage: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Load user data on app start
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserState(parsedUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const setUser = async (userData: UserProfile | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUserState(userData);
        setIsLoggedIn(true);
      } else {
        await AsyncStorage.removeItem('user');
        setUserState(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUserState(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
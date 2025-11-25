// utils/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  _id?: string;
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isVerified?: boolean;
}

export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      return user._id || user.id || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const isLoggedIn = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};

export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['authToken', 'user', 'userCredentials']);
    console.log(' User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
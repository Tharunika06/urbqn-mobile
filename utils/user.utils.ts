// utils/user.utils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserData, ProfileData } from '../types/index';

/**
 * Get current user from AsyncStorage
 */
export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Get current user ID from AsyncStorage
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    return user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
};

/**
 * Save user to AsyncStorage
 */
export const saveUser = async (user: UserData): Promise<boolean> => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error("Error saving user:", error);
    return false;
  }
};

/**
 * Remove user from AsyncStorage (logout)
 */
export const removeUser = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem('user');
    return true;
  } catch (error) {
    console.error("Error removing user:", error);
    return false;
  }
};

/**
 * Get display name from profile or user data
 */
export const getDisplayName = (
  profile: ProfileData | null,
  user: UserData | null,
  fallback: string = 'Guest'
): string => {
  if (profile?.firstName && profile?.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  
  if (user?.firstName) {
    return user.firstName;
  }
  
  if (user?.email) {
    return user.email;
  }
  
  return fallback;
};

/**
 * Get profile image source for React Native Image component
 */
export const getProfileImageSource = (photoUri: string | null) => {
  if (photoUri && photoUri.startsWith('data:image')) {
    return { uri: photoUri };
  }
  return require('../assets/images/avatar.png');
};
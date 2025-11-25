// utils/storage.utils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserData, ProfileData } from '../types/index';

// ============ Storage Keys ============
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'authToken',
  PROFILE: 'userProfile',
  FAVORITES: 'favorites',
  RECENT_SEARCHES: 'recentSearches',
  PREFERENCES: 'userPreferences',
} as const;

// ============ User Storage ============
// ❌ REMOVED - These are in user.utils.ts
// export const saveUser = async (userData: UserData): Promise<boolean> => { ... }
// export const removeUser = async (): Promise<boolean> => { ... }

export const getUser = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// ============ Profile Storage ============
export const saveProfile = async (profileData: ProfileData): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

export const getProfile = async (): Promise<ProfileData | null> => {
  try {
    const profileData = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    return profileData ? JSON.parse(profileData) : null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

export const removeProfile = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE);
    return true;
  } catch (error) {
    console.error('Error removing profile:', error);
    return false;
  }
};

// ============ Token Storage ============
export const saveToken = async (token: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

// ============ Favorites Storage ============
// ❌ REMOVED - These are in favorites.utils.ts
// export const saveFavorites = async (favorites: (string | number)[]): Promise<boolean> => { ... }
// export const getFavorites = async (): Promise<(string | number)[]> => { ... }

export const addFavorite = async (propertyId: string | number): Promise<boolean> => {
  try {
    const { getFavorites, saveFavorites } = require('./favorites.utils');
    const favorites = await getFavorites();
    if (!favorites.includes(propertyId)) {
      favorites.push(propertyId);
      await saveFavorites(favorites);
    }
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
};

export const removeFavorite = async (propertyId: string | number): Promise<boolean> => {
  try {
    const { getFavorites, saveFavorites } = require('./favorites.utils');
    const favorites = await getFavorites();
const updatedFavorites = favorites.filter((id: string | number) => id !== propertyId);
    await saveFavorites(updatedFavorites);
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

// ============ Recent Searches Storage ============
export const saveRecentSearches = async (searches: string[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
    return true;
  } catch (error) {
    console.error('Error saving recent searches:', error);
    return false;
  }
};

export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const searches = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return searches ? JSON.parse(searches) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

export const addRecentSearch = async (query: string, maxItems: number = 10): Promise<boolean> => {
  try {
    const searches = await getRecentSearches();
    const filteredSearches = searches.filter(s => s !== query);
    const updatedSearches = [query, ...filteredSearches].slice(0, maxItems);
    await saveRecentSearches(updatedSearches);
    return true;
  } catch (error) {
    console.error('Error adding recent search:', error);
    return false;
  }
};

export const clearRecentSearches = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    return true;
  } catch (error) {
    console.error('Error clearing recent searches:', error);
    return false;
  }
};

// ============ General Storage Helpers ============
export const clearAllStorage = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all storage:', error);
    return false;
  }
};

export const getAllKeys = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};
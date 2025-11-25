// utils/favorites.utils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'user_favorites';

/**
 * Get all favorites from AsyncStorage
 */
export const getFavorites = async (): Promise<(string | number)[]> => {
  try {
    const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
    if (favoritesJson) {
      return JSON.parse(favoritesJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

/**
 * Save favorites to AsyncStorage
 */
export const saveFavorites = async (
  favorites: (string | number)[]
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error saving favorites:', error);
    return false;
  }
};

/**
 * Add a property to favorites
 */
export const addToFavorites = async (
  propertyId: string | number
): Promise<(string | number)[]> => {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(propertyId)) {
      const updatedFavorites = [...favorites, propertyId];
      await saveFavorites(updatedFavorites);
      return updatedFavorites;
    }
    return favorites;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return [];
  }
};

/**
 * Remove a property from favorites
 */
export const removeFromFavorites = async (
  propertyId: string | number
): Promise<(string | number)[]> => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter((id) => id !== propertyId);
    await saveFavorites(updatedFavorites);
    return updatedFavorites;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return [];
  }
};

/**
 * Toggle favorite status
 */
export const toggleFavoriteStatus = async (
  propertyId: string | number
): Promise<(string | number)[]> => {
  try {
    const favorites = await getFavorites();
    if (favorites.includes(propertyId)) {
      return await removeFromFavorites(propertyId);
    } else {
      return await addToFavorites(propertyId);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return [];
  }
};

/**
 * Check if property is in favorites
 */
export const isPropertyFavorite = async (
  propertyId: string | number
): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.includes(propertyId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

/**
 * Clear all favorites
 */
export const clearFavorites = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
};
// contexts/FavoritesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
  import { BASE_URL } from '../../services/api.service';

// Import the shared Property type
import type { Property } from '../../types/index';

// Define AxiosError type if not available
interface AxiosErrorType {
  isAxiosError: boolean;
  message: string;
  code?: string;
  request?: any;
  response?: {
    data?: any;
    status?: number;
    statusText?: string;
    headers?: any;
  };
  config?: any;
}

// Convert Property to PropertyType for favorites display
type PropertyType = {
  id: string | number;
  title: string;
  desc: string;
  price: string;
  image: { uri: string } | any;
  originalProperty: Property;
};

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Add type for API response
interface FavoriteItem {
  propertyId: string | number;
  property: Property;
}

interface FavoritesApiResponse {
  success: boolean;
  favorites: FavoriteItem[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

interface FavoritesContextType {
  favorites: (string | number)[];
  favoriteProperties: PropertyType[];
  toggleFavorite: (property: Property) => Promise<void>;
  removeFavorite: (id: string | number) => Promise<void>;
  loadFavorites: () => Promise<void>;
  isFavorite: (id: string | number) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  // Get current user
  const getCurrentUser = async (): Promise<UserData | null> => {
    try {
      const userData = await AsyncStorage.getItem('user');
      console.log('Retrieved user data:', userData);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  };

  // Helper function to normalize property ID
  const normalizePropertyId = (property: Property): string => {
    const id = property._id || property.id;
    if (!id) {
      throw new Error('Property has no valid ID');
    }
    return id.toString();
  };

  // Helper function to check if a property is favorited
  const isFavorite = (id: string | number): boolean => {
    return favorites.some(favId => favId.toString() === id.toString());
  };

  // Helper function to convert Property to PropertyType
  const convertPropertyToPropertyType = (property: Property): PropertyType => {
    const safeId = property.id ?? property._id ?? Date.now();
    
    // Determine price display
    let priceDisplay = '';
    const status = property.status?.toLowerCase();
    
    if (status === 'rent' && property.rentPrice) {
      priceDisplay = `₹${property.rentPrice}/month`;
    } else if (status === 'sale' && property.salePrice) {
      priceDisplay = `₹${property.salePrice}`;
    } else if (status === 'both' && property.salePrice) {
      priceDisplay = `₹${property.salePrice}`;
    } else if (property.price) {
      priceDisplay = `₹${property.price}`;
    }

    // Handle image source
    let imageSource;
    if (property.photo && typeof property.photo === 'string' && property.photo.startsWith('data:image/')) {
      imageSource = { uri: property.photo };
    } else if (property.photo && typeof property.photo === 'string' && property.photo.startsWith('/uploads/')) {
      imageSource = { uri: `${BASE_URL.replace('/api', '')}${property.photo}` };
    } else if (property.photo && typeof property.photo === 'string' && property.photo.startsWith('http')) {
      imageSource = { uri: property.photo };
    } else if (property.photo && typeof property.photo === 'object') {
      imageSource = property.photo;
    } else {
      imageSource = require('../../assets/images/placeholder.png');
    }

    return {
      id: safeId,
      title: property.name || property.title || 'Untitled Property',
      desc: `${property.facility?.length || 0} facilities • ${property.country || property.location || 'Location'}`,
      price: priceDisplay,
      image: imageSource,
      originalProperty: property,
    };
  };

  // Helper function to check if error is an Axios error
  const isAxiosError = (error: unknown): error is AxiosErrorType => {
    return typeof error === 'object' && error !== null && (error as any).isAxiosError === true;
  };

  // Load favorites from database using email as userId
  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      
      if (!user || !user.email) {
        console.log('No user logged in or user has no email');
        setFavorites([]);
        setFavoriteProperties([]);
        return;
      }

      console.log('Loading favorites for user:', user.email);

      const response = await axios.get<FavoritesApiResponse>(`${BASE_URL}/favorites/${user.email}`, {
        timeout: 10000,
      });

      console.log('Favorites API response:', response.data);

      if (response.data && response.data.success && response.data.favorites) {
        const favoriteIds = response.data.favorites.map((fav: FavoriteItem) => fav.propertyId);
        const favoriteProps = response.data.favorites.map((fav: FavoriteItem) => 
          convertPropertyToPropertyType(fav.property)
        );

        console.log('Setting favorites:', favoriteIds);
        console.log('Setting favorite properties:', favoriteProps.length);

        setFavorites(favoriteIds);
        setFavoriteProperties(favoriteProps);
      } else {
        console.log('No favorites found or invalid response structure');
        setFavorites([]);
        setFavoriteProperties([]);
      }
    } catch (error: unknown) {
      console.error('Error loading favorites:', error);
      if (isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      setFavorites([]);
      setFavoriteProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add favorite to database using email as userId
  const addFavoriteToDb = async (property: Property): Promise<boolean> => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.email) {
        console.error(' No user logged in or user has no email');
        throw new Error('User not authenticated');
      }

      const propertyId = normalizePropertyId(property);
      

      const response = await axios.post<ApiResponse>(`${BASE_URL}/favorites`, {
        userId: user.email,
        propertyId: propertyId,
        property: property,
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

      
      if (response.data && response.data.success !== false) {
        return true;
      }
      
      console.warn(' Server returned unsuccessful response:', response.data);
      return false;
    } catch (error: unknown) {
      console.error(' Error adding favorite to database:', error);
      if (isAxiosError(error)) {
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          console.error('No response received. Network issue or server down.');
        } else {
          console.error('Request setup error:', error.message);
        }
      }
      throw error;
    }
  };

  // Remove favorite from database using email as userId
  const removeFavoriteFromDb = async (propertyIdOrProperty: string | number | Property): Promise<boolean> => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.email) {
        console.error(' No user logged in or user has no email');
        throw new Error('User not authenticated');
      }

      let propertyId: string;
      if (typeof propertyIdOrProperty === 'object') {
        propertyId = normalizePropertyId(propertyIdOrProperty);
      } else {
        propertyId = propertyIdOrProperty.toString();
      }


      const response = await axios.delete<ApiResponse>(`${BASE_URL}/favorites/${user.email}/${propertyId}`, {
        timeout: 10000,
      });

      
      if (response.data && response.data.success !== false) {
        return true;
      }
      
      return false;
    } catch (error: unknown) {
      console.error(' Error removing favorite from database:', error);
      if (isAxiosError(error)) {
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          
          if (error.response.data?.message === 'Favorite not found') {
            console.warn(' Favorite was already removed from database');
            return true;
          }
        } else if (error.request) {
          console.error('No response received. Network issue or server down.');
        } else {
          console.error('Request setup error:', error.message);
        }
      }
      throw error;
    }
  };

  // Wrapper function that matches the interface signature
  const removeFavorite = async (id: string | number): Promise<void> => {
    try {
      const success = await removeFavoriteFromDb(id);
      if (success) {
        setFavorites(prev => prev.filter(favId => favId.toString() !== id.toString()));
        setFavoriteProperties(prevProps => prevProps.filter(prop => prop.id.toString() !== id.toString()));
      }
    } catch (error: unknown) {
      console.error(' Failed to remove favorite:', error);
      throw error;
    }
  };

  // Toggle favorite with database sync
  const toggleFavorite = async (property: Property) => {
    try {
      const propertyId = normalizePropertyId(property);
      const isFavorited = favorites.some(fav => fav.toString() === propertyId);
      
      console.log('Toggling favorite:', { propertyId, isFavorited });
      
      const originalFavorites = [...favorites];
      const originalFavoriteProperties = [...favoriteProperties];
      
      // Optimistically update UI first
      if (isFavorited) {
        setFavorites(prev => prev.filter(id => id.toString() !== propertyId));
        setFavoriteProperties(prevProps => prevProps.filter(prop => prop.id.toString() !== propertyId));
      } else {
        const convertedProperty = convertPropertyToPropertyType(property);
        setFavorites(prev => [...prev, propertyId]);
        setFavoriteProperties(prevProps => [...prevProps, convertedProperty]);
      }

      // Then sync with database
      try {
        let dbSuccess = false;
        if (isFavorited) {
          dbSuccess = await removeFavoriteFromDb(property);
        } else {
          dbSuccess = await addFavoriteToDb(property);
        }

        if (!dbSuccess) {
          throw new Error('Database operation returned false');
        }
        
        console.log(' Successfully synced favorite with database');
      } catch (dbError: unknown) {
        console.error('Database sync failed, reverting UI changes:', dbError);
        setFavorites(originalFavorites);
        setFavoriteProperties(originalFavoriteProperties);
        
        let errorMessage = 'Failed to sync with server';
        
        if (isAxiosError(dbError)) {
          if (!dbError.response && dbError.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout - server took too long to respond';
          } else if (!dbError.response) {
            errorMessage = 'Network error - please check your connection';
          } else if (dbError.response?.status && dbError.response.status >= 500) {
            errorMessage = 'Server error - please try again later';
          } else if (dbError.response?.status && (dbError.response.status === 401 || dbError.response.status === 403)) {
            errorMessage = 'Authentication error - please log in again';
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      console.error(' Error in toggleFavorite:', error);
      throw error;
    }
  };

  // Load favorites on initial render
  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      favoriteProperties, 
      toggleFavorite, 
      removeFavorite, 
      loadFavorites, 
      isFavorite,
      isLoading 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
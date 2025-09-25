// contexts/FavoritesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the Property type to match your TopEstateGrid
type Property = {
  id?: string | number;
  _id?: string;
  name: string;
  price?: string;
  status?: 'rent' | 'sale' | 'both'; 
  rentPrice?: string;
  salePrice?: string;
  photo: string | any;
  rating: number;
  country: string;
  facility: string[];
  ownerId: string;
  ownerName: string;
  address: string;
};

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

interface FavoritesContextType {
  favorites: (string | number)[];
  favoriteProperties: PropertyType[];
  toggleFavorite: (property: Property) => Promise<void>;
  removeFavorite: (id: string | number) => Promise<void>;
  loadFavorites: () => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = "http://192.168.0.152:5000/api";

  // Get current user
  const getCurrentUser = async (): Promise<UserData | null> => {
    try {
      const userData = await AsyncStorage.getItem('user');
      console.log('Retrieved user data:', userData); // Debug log
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
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

    // Handle image source (same logic as TopEstateGrid)
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
      title: property.name,
      desc: `${property.facility?.length || 0} facilities • ${property.country}`,
      price: priceDisplay,
      image: imageSource,
      originalProperty: property,
    };
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

      console.log('Loading favorites for user:', user.email); // Debug log

      const response = await axios.get<FavoritesApiResponse>(`${BASE_URL}/favorites/${user.email}`, {
        timeout: 10000,
      });

      console.log('Favorites API response:', response.data); // Debug log

      if (response.data && response.data.success && response.data.favorites) {
        const favoriteIds = response.data.favorites.map((fav: FavoriteItem) => fav.propertyId);
        const favoriteProps = response.data.favorites.map((fav: FavoriteItem) => 
          convertPropertyToPropertyType(fav.property)
        );

        console.log('Setting favorites:', favoriteIds); // Debug log
        console.log('Setting favorite properties:', favoriteProps.length); // Debug log

        setFavorites(favoriteIds);
        setFavoriteProperties(favoriteProps);
      } else {
        console.log('No favorites found or invalid response structure');
        setFavorites([]);
        setFavoriteProperties([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Reset to empty on error
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
        console.error('No user logged in or user has no email');
        return false;
      }

      const propertyId = property.id ?? property._id;
      
      console.log('Adding favorite to DB:', { userId: user.email, propertyId }); // Debug log

      const response = await axios.post(`${BASE_URL}/favorites`, {
        userId: user.email,  // Using email as userId since that's what we have
        propertyId: propertyId,
        property: property,
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Add favorite response:', response.data); // Debug log
      return true;
    } catch (error: any) {
      console.error('Error adding favorite to database:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  };

  // Remove favorite from database using email as userId
  const removeFavoriteFromDb = async (propertyId: string | number): Promise<boolean> => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.email) {
        console.error('No user logged in or user has no email');
        return false;
      }

      console.log('Removing favorite from DB:', { userId: user.email, propertyId }); // Debug log

      const response = await axios.delete(`${BASE_URL}/favorites/${user.email}/${propertyId}`, {
        timeout: 10000,
      });

      console.log('Remove favorite response:', response.data); // Debug log
      return true;
    } catch (error: any) {
      console.error('Error removing favorite from database:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  };

  // Wrapper function that matches the interface signature
  const removeFavorite = async (id: string | number): Promise<void> => {
    const success = await removeFavoriteFromDb(id);
    if (success) {
      // Update local state on successful removal
      setFavorites(prev => prev.filter(favId => favId !== id));
      setFavoriteProperties(prevProps => prevProps.filter(prop => prop.id !== id));
    }
  };

  // Toggle favorite with database sync
  const toggleFavorite = async (property: Property) => {
    const safeId = property.id ?? property._id ?? Date.now();
    const isFavorited = favorites.includes(safeId);
    
    console.log('Toggling favorite:', { propertyId: safeId, isFavorited }); // Debug log
    
    // Optimistically update UI first
    if (isFavorited) {
      // Remove from favorites
      setFavorites(prev => prev.filter(id => id !== safeId));
      setFavoriteProperties(prevProps => prevProps.filter(prop => prop.id !== safeId));
    } else {
      // Add to favorites
      const convertedProperty = convertPropertyToPropertyType(property);
      setFavorites(prev => [...prev, safeId]);
      setFavoriteProperties(prevProps => [...prevProps, convertedProperty]);
    }

    // Then sync with database
    let dbSuccess = false;
    if (isFavorited) {
      dbSuccess = await removeFavoriteFromDb(safeId);
    } else {
      dbSuccess = await addFavoriteToDb(property);
    }

    // If database operation failed, revert the UI changes
    if (!dbSuccess) {
      console.warn('Database operation failed, reverting UI changes');
      if (isFavorited) {
        // Restore the favorite
        const convertedProperty = convertPropertyToPropertyType(property);
        setFavorites(prev => [...prev, safeId]);
        setFavoriteProperties(prevProps => [...prevProps, convertedProperty]);
      } else {
        // Remove the favorite
        setFavorites(prev => prev.filter(id => id !== safeId));
        setFavoriteProperties(prevProps => prevProps.filter(prop => prop.id !== safeId));
      }
      
      console.warn('Failed to sync favorite with database');
    } else {
      console.log('Successfully synced favorite with database');
    }
  };

  // Load favorites on initial render
  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, favoriteProperties, toggleFavorite, removeFavorite, loadFavorites, isLoading }}>
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
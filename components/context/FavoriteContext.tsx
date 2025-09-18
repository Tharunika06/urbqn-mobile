// contexts/FavoritesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
};

interface FavoritesContextType {
  favorites: (string | number)[];
  favoriteProperties: PropertyType[];
  toggleFavorite: (property: Property) => void;
  removeFavorite: (id: string | number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<PropertyType[]>([]);

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
    if (typeof property.photo === 'string') {
      imageSource = {
        uri: property.photo.startsWith('http')
          ? property.photo
          : `http://192.168.0.152:5000${property.photo}`,
      };
    } else {
      imageSource = property.photo;
    }

    return {
      id: safeId,
      title: property.name,
      desc: `${property.facility.length} facilities • ${property.country}`,
      price: priceDisplay,
      image: imageSource,
    };
  };

  const toggleFavorite = (property: Property) => {
    const safeId = property.id ?? property._id ?? Date.now();
    
    setFavorites(prev => {
      const isFavorited = prev.includes(safeId);
      
      if (isFavorited) {
        // Remove from favorites
        setFavoriteProperties(prevProps => 
          prevProps.filter(prop => prop.id !== safeId)
        );
        return prev.filter(id => id !== safeId);
      } else {
        // Add to favorites
        const convertedProperty = convertPropertyToPropertyType(property);
        setFavoriteProperties(prevProps => [...prevProps, convertedProperty]);
        return [...prev, safeId];
      }
    });
  };

  const removeFavorite = (id: string | number) => {
    setFavorites(prev => prev.filter(favId => favId !== id));
    setFavoriteProperties(prev => prev.filter(prop => prop.id !== id));
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      favoriteProperties,
      toggleFavorite,
      removeFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
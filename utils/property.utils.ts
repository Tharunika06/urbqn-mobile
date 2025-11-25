// utils/property.utils.ts
import type { Property, PriceDisplay } from '../types/index';

  import { BASE_URL } from '../../urban/services/api.service';

// ============ Image Helpers ============
export const getImageSource = (photo: string | any): any => {
  if (photo && typeof photo === 'string' && photo.startsWith('data:image/')) {
    return { uri: photo };
  }
  if (photo && typeof photo === 'string' && photo.startsWith('/uploads/')) {
    return { uri: `${BASE_URL}${photo}` };
  }
  if (photo && typeof photo === 'string' && photo.startsWith('http')) {
    return { uri: photo };
  }
  if (photo && typeof photo === 'object') {
    return photo;
  }
  return require('../assets/images/placeholder.png');
};

export const getOwnerPhotoSource = (photo: string): any => {
  if (photo && photo.startsWith('data:image/')) {
    return { uri: photo };
  }
  if (photo && photo.startsWith('/uploads/')) {
    return { uri: `${BASE_URL}${photo}` };
  }
  return require('../assets/images/placeholder.png');
};

// ============ Price Helpers ============
export const renderPrice = (property: Property): PriceDisplay => {
  const status = property.status?.toLowerCase();

  if (status === 'sold') {
    return { amount: 'SOLD', unit: '' };
  }

  if (status === 'both') {
    if (property.salePrice) {
      return { amount: `₹${property.salePrice}`, unit: '' };
    }
    if (property.rentPrice && property.salePrice) {
      return { amount: `₹${property.salePrice}`, unit: '' };
    }
  }

  if (status === 'rent' && property.rentPrice) {
    return { amount: `₹${property.rentPrice}`, unit: '/month' };
  }

  if (status === 'sale' && property.salePrice) {
    return { amount: `₹${property.salePrice}`, unit: '' };
  }

  if (property.price) {
    const parts = property.price.split('/');
    return {
      amount: parts[0].startsWith('₹') ? parts[0] : `₹${parts[0]}`,
      unit: parts[1] ? `/${parts[1]}` : ''
    };
  }

  return { amount: 'N/A', unit: '' };
};

export const formatPrice = (price: number, currency: string = '₹'): string => {
  return `${currency}${price.toLocaleString()}`;
};

export const renderPriceLabel = (property: Property): { text: string; unit?: string } => {
  const priceDisplay = renderPrice(property);
  return {
    text: priceDisplay.amount,
    unit: priceDisplay.unit
  };
};

// ============ ID Helpers ============
export const getPropertyId = (
  property: Property, 
  fallbackIndex: number
): string | number => {
  return property.id ?? property._id ?? fallbackIndex;
};

export const getSafePropertyId = (
  property: Property,
  propertyId?: string | number,
  fallbackIndex?: number
): string | number => {
  return property._id || property.id || propertyId || fallbackIndex || 0;
};

// ============ Property Name Helpers ============
export const getPropertyName = (property: Property): string => {
  return property.name || property.title || 'Untitled Property';
};

export const getPropertyLocation = (property: Property): string => {
  return property.country || property.location || 'Unknown Location';
};

export const getPropertyPrice = (property: Property): string | undefined => {
  return property.price || property.salePrice || property.rentPrice;
};

export const getPropertyDescription = (property: Property): string => {
  return property.description || property.desc || 'No description available';
};

// ============ Navigation Helpers ============
export const formatPropertyForNavigation = (
  property: Property,
  index: number,
  propertyId?: string | number
) => {
  const safeId = getSafePropertyId(property, propertyId, index);
  return {
    ...property,
    _id: safeId,
    name: getPropertyName(property),
    photo: property.photo || property.image,
    location: getPropertyLocation(property),
    price: getPropertyPrice(property),
    rating: property.rating || 4.9,
    facility: property.facility || [],
    ownerId: (property.ownerId || '')?.toString(),
    ownerName: property.ownerName || '',
    address: property.address || property.location || property.country || '',
    country: property.country || property.location,
  };
};

// ============ Filter Helpers ============
export const filterPropertiesByRating = (
  properties: Property[],
  minRating: number
): Property[] => {
  return properties.filter((prop) => (prop.rating ?? 0) >= minRating);
};

export const filterAvailableProperties = (properties: Property[]): Property[] => {
  return properties.filter((property) => {
    const status = property.status?.toLowerCase();
    if (status === 'sold') {
      console.log(` Hiding sold property: ${property.name || property.title}`);
      return false;
    }
    return true;
  });
};

export const filterPropertiesByStatus = (
  properties: Property[],
  status: 'rent' | 'sale' | 'both' | 'sold'
): Property[] => {
  return properties.filter((property) => 
    property.status?.toLowerCase() === status.toLowerCase()
  );
};

export const filterPropertiesByCategory = (
  properties: Property[],
  category: string
): Property[] => {
  if (category === 'All') return properties;
  return properties.filter((property) => 
    property.category?.toLowerCase() === category.toLowerCase()
  );
};

export const getFeaturedProperties = (
  properties: Property[],
  count: number = 2
): Property[] => {
  return properties.slice(0, count);
};

export const getPopularProperties = (
  properties: Property[],
  minRating: number = 4.5,
  count: number = 4
): Property[] => {
  return properties
    .filter((prop) => (prop.rating ?? 0) >= minRating)
    .slice(0, count);
};

export const getTopProperties = (
  properties: Property[],
  count: number = 10
): Property[] => {
  return properties.slice(0, count);
};

// ============ Search Helpers ============
export const searchProperties = (
  properties: Property[],
  query: string
): Property[] => {
  if (!query.trim()) return [];
  
  const searchLower = query.toLowerCase().trim();
  
  return properties.filter(property => {
    const nameMatch = property.name?.toLowerCase().includes(searchLower) ?? false;
    const locationMatch = property.country?.toLowerCase().includes(searchLower) ?? false;
    const addressMatch = property.address?.toLowerCase().includes(searchLower) ?? false;
    
    const facilityMatch = Array.isArray(property.facility) 
      ? property.facility.some(f => f?.toLowerCase().includes(searchLower))
      : false;
    
    const priceMatch = 
      property.price?.toString().includes(query) ||
      property.rentPrice?.toString().includes(query) ||
      property.salePrice?.toString().includes(query);

    const ownerMatch = property.ownerName?.toLowerCase().includes(searchLower) ?? false;

    return nameMatch || locationMatch || addressMatch || facilityMatch || priceMatch || ownerMatch;
  });
};

// ============ Sorting Helpers ============
export const sortPropertiesByPrice = (
  properties: Property[],
  order: 'asc' | 'desc' = 'asc'
): Property[] => {
  return [...properties].sort((a, b) => {
    const priceA = parseFloat(a.price || a.salePrice || a.rentPrice || '0');
    const priceB = parseFloat(b.price || b.salePrice || b.rentPrice || '0');
    return order === 'asc' ? priceA - priceB : priceB - priceA;
  });
};

export const sortPropertiesByRating = (
  properties: Property[],
  order: 'asc' | 'desc' = 'desc'
): Property[] => {
  return [...properties].sort((a, b) => {
    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    return order === 'asc' ? ratingA - ratingB : ratingB - ratingA;
  });
};

// ============ Validation Helpers ============
export const isPropertyValid = (property: Property): boolean => {
  return !!(
    property.name && 
    property.photo && 
    (property.price || property.salePrice || property.rentPrice)
  );
};

export const isPropertyAvailable = (property: Property): boolean => {
  return property.status?.toLowerCase() !== 'sold';
};

export { BASE_URL };
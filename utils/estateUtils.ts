// urban/utils/estateUtils.ts

/**
 * Parse and validate price values
 * Handles string, number, null, and undefined inputs
 */
export const parsePrice = (price: string | number | null | undefined): number | null => {
  if (price === null || price === undefined || price === '') return null;
  if (typeof price === 'number') return price;
  const cleanPrice = String(price).replace(/[^0-9.-]+/g, '');
  const numericPrice = parseFloat(cleanPrice);
  return !isNaN(numericPrice) ? numericPrice : null;
};

/**
 * Format price with Indian number system (lakhs, crores)
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN').format(price);
};

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  return distanceKm < 1 
    ? `${Math.round(distanceKm * 1000)} m`
    : `${distanceKm.toFixed(1)} km`;
};

/**
 * Get image source from various formats
 */
export const getImageSrc = (photo: string | any, BASE_URL: string) => {
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

/**
 * Validate phone number (10 digits)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 && /^[0-9]{10}$/.test(cleanPhone);
};

/**
 * Calculate average rating from reviews
 */
export const calculateAverageRating = (reviews: Array<{ rating: number }>): number => {
  if (reviews.length === 0) return 0;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

/**
 * Get facility icon name based on facility text
 */
export const getFacilityIcon = (facility: string): string => {
  const lowerCaseFacility = facility.toLowerCase();
  
  if (lowerCaseFacility.includes('pool')) return 'pool';
  if (lowerCaseFacility.includes('airport')) return 'airplane';
  if (lowerCaseFacility.includes('water')) return 'water-pump';
  if (lowerCaseFacility.includes('parking')) return 'parking';
  if (lowerCaseFacility.includes('ac') || lowerCaseFacility.includes('air condition')) return 'air-conditioner';
  if (lowerCaseFacility.includes('gym')) return 'weight-lifter';
  if (lowerCaseFacility.includes('wifi')) return 'wifi';
  if (lowerCaseFacility.includes('bed')) return 'bed-outline';
  if (lowerCaseFacility.includes('bath')) return 'bathtub-outline';
  if (lowerCaseFacility.includes('electricity')) return 'lightning-bolt';
  
  return 'home-city-outline';
};

/**
 * Get full name from profile object
 */
export const getFullNameFromProfile = (profile: any): string => {
  if (profile.fullName?.trim()) {
    return profile.fullName.trim();
  }
  
  const firstName = profile.firstName?.trim() || '';
  const lastName = profile.lastName?.trim() || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  return firstName;
};

/**
 * Parse name into first and last name
 */
export const parseNameParts = (fullName: string): { firstName: string; lastName: string } => {
  const nameParts = fullName.trim().split(' ');
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
  };
};
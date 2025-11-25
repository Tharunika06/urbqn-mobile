// types/index.ts

// ============ User Types ============
export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
}

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  photo?: string | null;
  email?: string;
  phone?: string;  //  ADDED
  dob?: string;
  gender?: string;
  _id?: string;
  hasPhoto?: boolean;
}

export interface CheckEmailResponse {
  exists: boolean;
  profile?: {
    id: string;
    name: string;
    hasPhoto: boolean;
  } | null;
}

export interface ProfileResponse {
  message: string;
  profile: ProfileData;
}

// ============ Notification Types ============
export interface UnreadCountResponse {
  count: number;
}

// ============ Property Types ============
export interface Property {
  id?: string | number;
  _id?: string;
  name?: string;
  title?: string;
  desc?: string;
  description?: string;
  price?: string;
  status?: 'rent' | 'sale' | 'both' | 'sold';
  rentPrice?: string;
  salePrice?: string;
  photo?: string | any;
  image?: any;
  rating?: number;
  location?: string;
  country?: string;
  city?: string;  //  ADDED
  category?: string;
  facility?: string[];
  ownerId?: string | number;
  ownerName?: string;
  address?: string;
  type?: string;
  bedrooms?: number;
  bath?: number;
  size?: string;
  floor?: string;
  zip?: string;
  about?: string;
}

export interface PopularProperty {
  propertyId: string | number;
  favoriteCount: number;
  property: Property;
}

export interface PriceDisplay {
  amount: string;
  unit: string;
}

// ============ Location Types ============
export interface LocationData {
  id: number;
  name: string;
  count: number;
  image: any;
}

// ============ Owner Types ============
export interface Owner {
  _id: string;
  ownerId?: string;
  name: string;
  photo: string;
}

export interface OwnerData {
  id: string | number;
  name: string;
  properties: number;
  rating: number;
  image?: string;
}

export interface ApiOwnerResponse {
  owners: Owner[];
  count: number;
  includePhotos: boolean;
}

// ============ API Response Types ============
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  properties?: T[];
  data?: T;
}

// ============ Component Props ============
export interface FeaturedSectionProps {
  apiUrl?: string;
  limit?: number;
}

export interface PopularSectionProps {
  apiUrl?: string;
  limit?: number;
}

export interface TopLocationsProps {
  locations: LocationData[];
}

export interface TopEstateGridProps {
  properties: Property[];
}
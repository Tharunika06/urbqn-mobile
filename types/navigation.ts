// urban/types/navigation.ts
export type RootStackParamList = {
  Login: undefined;
  SelectLocation: undefined;
  Dashboard: undefined;
  Notifications: undefined;
  'auth/Estate/EstateDetails': {
    property: {
      _id: string | number;
      name: string;
      price?: string | number;
      photo: any;
      rating?: number;
      location: string;
      facility?: string[];
      ownerId: string | number;
      ownerName: string;
      address: string;
      status?: 'rent' | 'sale' | 'both' | 'sold'; // ✅ Added 'sold'
      rentPrice?: string | number;
      salePrice?: string | number;
      type?: string;
      bedrooms?: number;
      bath?: number;
      size?: string;
      floor?: string;
      zip?: string;
      country?: string;
      city?: string;
      about?: string;
    };
  };
  'auth/Estate/EstateLocation': { 
    property?: {
      _id: string | number;
      name: string;
      price?: string | number;
      photo: any;
      rating?: number;
      location: string;
      facility?: string[];
      ownerId: string | number;
      ownerName: string;
      address: string;
      status?: 'rent' | 'sale' | 'both' | 'sold'; // ✅ Added 'sold'
      rentPrice?: string | number;
      salePrice?: string | number;
      type?: string;
      bedrooms?: number;
      bath?: number;
      size?: string;
      floor?: string;
      zip?: string;
      country?: string;
      city?: string;
      about?: string;
    };
  };
};
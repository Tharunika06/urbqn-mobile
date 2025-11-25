// utils/staticData.ts

import type { LocationData } from '../types/index';

//  FIXED: Use require() for local images instead of string paths
export const LOCATION_DATA: LocationData[] = [
  {
    id: 1,
    name: 'New York',
    count: 245,
    image: require('../assets/images/loc1.png'),
  },
  {
    id: 2,
    name: 'Los Angeles',
    count: 189,
    image: require('../assets/images/loc2.png'),
  },
  {
    id: 3,
    name: 'Chicago',
    count: 156,
    image: require('../assets/images/loc3.png'),
  },
  {
    id: 4,
    name: 'Miami',
    count: 203,
    image: require('../assets/images/loc4.png'),
  },
];

export const FILTER_CATEGORIES = [
  'All',
  'House',
  'Apartment',
  'Villa',
  'Cottage',
  'Penthouse',
];

export const GREETING_MESSAGES = {
  morning: 'Good Morning',
  afternoon: 'Good Afternoon',
  evening: 'Good Evening',
  night: 'Good Night',
};

export const DEFAULT_AVATAR = require('../assets/images/avatar.png');
export const BELL_ICON = require('../assets/icons/bell.png');

export const LOCATIONIQ_API_KEY = 'pk.9bdd1304713dd24e813e3b1207af245b';


export const DEFAULT_VALUES = {
  RATING: 4.9,
  LOCATION: 'Unknown Location',
  PROPERTY_NAME: 'Untitled Property',
};

export const PLACEHOLDER_IMAGES = {
  PROPERTY: require('../assets/images/placeholder.png'),
  OWNER: require('../assets/images/placeholder.png'),
};

export const PRICE_CONFIG = {
  DEFAULT_CURRENCY: '₹',
  RENT_UNIT: '/month',
};

// ========== EstateDetails Constants ==========

export const ESTATE_DETAILS_CONFIG = {
  STAR_SIZE_DEFAULT: 14,
  MAX_RATING: 5,
  STATUS: {
    RENT: 'rent',
    SALE: 'sale',
  },
  DISPLAY_TEXT: {
    FOR_RENT: 'For Rent',
    FOR_SALE: 'For Sale',
    NOT_FOR_RENT: 'Not for rent',
    NOT_FOR_SALE: 'Not available for sale',
    SELECT_OPTION: 'Select an option',
    DEFAULT_PROPERTY_NAME: 'Property',
    LOCATION_PIN: '📍',
  },
  PRICE_FORMAT: {
    RENT_SUFFIX: '/m',
    CURRENCY: '₹',
  },
};

export const ESTATE_POPUP_CONFIG = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
  },
  ICONS: {
    SUCCESS: '✓',
    WARNING: '!',
    ERROR: '✕',
  },
  COLORS: {
    SUCCESS: '#4CAF50',
    ERROR: '#F44336',
    WARNING: '#FF9800',
  },
  ANIMATION: {
    TENSION: 50,
    FRICTION: 7,
  },
};

export const REVIEW_PROMPT_CONFIG = {
  ICON: {
    NAME: 'star',
    SIZE: 40,
    COLOR: '#FFC700',
  },
  TITLE: 'Share Your Experience',
  MESSAGE: 'You recently completed a transaction for this property. Would you like to leave a review?',
  BUTTONS: {
    DISMISS: 'Not Now',
    REVIEW: 'Write Review',
  },
  ACTIONS: {
    REVIEW: 'review',
    LATER: 'later',
    DISMISS: 'dismiss',
  },
};

export const ESTATE_MESSAGES = {
  ERRORS: {
    PROPERTY_NOT_AVAILABLE: 'Property data is not available',
    LOCATION_NOT_AVAILABLE: 'Location Not Available',
    LOCATION_INFO_MISSING: 'This property does not have location information. Please contact the property owner.',
    MAP_PREPARATION_FAILED: 'Failed to prepare property data for map',
    CONNECTION_ERROR: 'Connection Error',
    FAVORITE_UPDATE_FAILED: 'Unable to update favorites. Please check your internet connection and try again.',
    LOADING_REVIEWS_FAILED: 'Error loading reviews',
  },
  SUCCESS: {
    // Add success messages if needed
  },
  INFO: {
    NO_CUSTOMER_IDENTIFIER: ' No customer identifier or property ID found',
    CHECKING_PENDING_REVIEW: ' Checking for pending review...',
    PENDING_REVIEW_RESPONSE: ' Pending review check response:',
    DISTANCE_CALCULATED: ' Distance calculated:',
    USER_LOCATION_OBTAINED: ' User location obtained:',
    PROPERTY_LOCATION: 'Property location:',
    SENDING_PROPERTY_TO_MAP: ' Sending property to map:',
    SKIP_DISTANCE_CALCULATION: ' Skipping distance calculation - no property data',
    CALCULATING_DISTANCE: ' Calculating distance to property...',
  },
  WARNINGS: {
    NO_USER_LOCATION: 'Could not get user location',
    NO_GEOCODE: 'Could not geocode property address',
  },
};

export const ESTATE_STYLES = {
  COLORS: {
    PRIMARY: '#1a2238',
    PRIMARY_BLUE: '#1a73e8',
    PRIMARY_GREEN: '#3a974c',
    BACKGROUND_WHITE: '#fff',
    TEXT_GRAY: '#888',
    TEXT_DARK: '#1a2238',
    TEXT_LIGHT_GRAY: '#6c6c6c',
    TEXT_MEDIUM_GRAY: '#666',
    TEXT_UNAVAILABLE: '#999',
    STAR_GOLD: '#FFC700',
    STAR_GRAY: '#C8C8C8',
    BADGE_RENT_BG: '#e7f4e9',
    BADGE_SALE_BG: '#eaf4ff',
    BUTTON_GRAY_BG: '#f3f3f3',
    BORDER_GRAY: '#e0e0e0',
    REVIEW_PROMPT_BG: '#FFF9E6',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
    OVERLAY_DARK: 'rgba(0, 0, 0, 0.6)',
  },
  FONT_FAMILY: {
    REGULAR: 'Montserrat_400Regular',
    SEMIBOLD: 'Montserrat_600SemiBold',
    BOLD: 'Montserrat_700Bold',
  },
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    XLARGE: 24,
    CIRCLE_SMALL: 30,
    CIRCLE_LARGE: 40,
  },
};
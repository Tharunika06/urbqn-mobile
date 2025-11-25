// utils/mapConstants.ts

import { Platform } from 'react-native';

// Default map region (Coimbatore, India)
export const DEFAULT_MAP_REGION = {
  latitude: 11.0168,
  longitude: 76.9558,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

// Sample/fallback location for demonstrations
export const SAMPLE_LOCATION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Florence, Italy coordinates (for select-location demo)
export const FLORENCE_LOCATION = {
  latitude: 43.7696,
  longitude: 11.2558,
  zoom: 13,
};

// Route fit padding for navigation
export const ROUTE_FIT_PADDING = {
  top: 100,
  right: 50,
  bottom: 100,
  left: 50,
};

// Polyline styling for routes
export const POLYLINE_STYLE = {
  strokeWidth: 4,
  strokeColor: '#1a73e8',
};

// Location accuracy zoom levels
export type LocationAccuracy = 'precise' | 'approximate' | 'city';

export const ACCURACY_ZOOM: Record<
  LocationAccuracy,
  {
    latitudeDelta: number;
    longitudeDelta: number;
  }
> = {
  precise: {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  approximate: {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  city: {
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
};

// OpenStreetMap Configuration
export const OSM_CONFIG = {
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
};

// Nominatim API Configuration
export const NOMINATIM_CONFIG = {
  baseUrl: 'https://nominatim.openstreetmap.org',
  userAgent: 'UrbanApp/1.0 (support@urbanapp.com)',
  searchEndpoint: '/search',
  reverseEndpoint: '/reverse',
  format: 'json',
  addressDetails: true,
};

// Helper function to build Nominatim search URL
export const buildNominatimSearchUrl = (query: string): string => {
  const params = new URLSearchParams({
    q: query,
    format: NOMINATIM_CONFIG.format,
    addressdetails: NOMINATIM_CONFIG.addressDetails.toString(),
  });
  
  return `${NOMINATIM_CONFIG.baseUrl}${NOMINATIM_CONFIG.searchEndpoint}?${params.toString()}`;
};

// Helper function to build Nominatim reverse geocoding URL
export const buildNominatimReverseUrl = (
  latitude: number,
  longitude: number
): string => {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: NOMINATIM_CONFIG.format,
    addressdetails: NOMINATIM_CONFIG.addressDetails.toString(),
  });
  
  return `${NOMINATIM_CONFIG.baseUrl}${NOMINATIM_CONFIG.reverseEndpoint}?${params.toString()}`;
};

// Headers for Nominatim API requests
export const getNominatimHeaders = () => ({
  'User-Agent': NOMINATIM_CONFIG.userAgent,
  Accept: 'application/json',
});

// Map positioning constants
export const MAP_UI_POSITIONS = {
  headerTop: Platform.OS === 'ios' ? 50 : 30,
  searchTop: Platform.OS === 'ios' ? 100 : 80,
  resultsTop: Platform.OS === 'ios' ? 150 : 130,
  bottomSheetBottom: 110,
  buttonBottom: 30,
};

// Map UI spacing
export const MAP_UI_SPACING = {
  horizontal: 20,
  maxResultsHeight: 250,
};

// Format coordinates as display string
export const formatCoordinates = (latitude: number, longitude: number): string => {
  return `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
};

// Generate Leaflet HTML for WebView
export const generateLeafletHTML = (
  latitude: number = FLORENCE_LOCATION.latitude,
  longitude: number = FLORENCE_LOCATION.longitude,
  zoom: number = FLORENCE_LOCATION.zoom
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <style>
          html, body, #map { height: 100%; margin: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
          L.tileLayer('${OSM_CONFIG.tileUrl}', {
            maxZoom: ${OSM_CONFIG.maxZoom},
          }).addTo(map);
          var marker = L.marker([${latitude}, ${longitude}]).addTo(map);
        </script>
      </body>
    </html>
  `;
};

// Property types for location setup
export const PROPERTY_TYPES = [
  { id: '1', name: 'Apartment', image: require('../assets/images/apartment.png') },
  { id: '2', name: 'Villa', image: require('../assets/images/villa.png') },
  { id: '3', name: 'House', image: require('../assets/images/house.png') },
  { id: '4', name: 'Cottage', image: require('../assets/images/cottage.png') },
  { id: '5', name: 'Duplex', image: require('../assets/images/duplex.png') },
  { id: '6', name: 'Modern', image: require('../assets/images/modern.png') },
];

// Animation duration for map transitions (ms)
export const MAP_ANIMATION_DURATION = 1000;
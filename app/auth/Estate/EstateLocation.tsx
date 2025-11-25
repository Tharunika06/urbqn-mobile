// urban/app/auth/Estate/EstateLocation.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DEFAULT_MAP_REGION, ACCURACY_ZOOM, ROUTE_FIT_PADDING, POLYLINE_STYLE,} from '../../../utils/mapConstants';
import { LOCATIONIQ_API_KEY } from '../../../utils/staticData';
import { cleanAddress, assessAccuracy } from '../../../utils/locationUtils';

interface PropertyLocation {
  _id: string | number;
  name: string;
  address: string;
  location: string;
}

export default function EstateLocation() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [property, setProperty] = useState<PropertyLocation | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [propertyCoords, setPropertyCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(true);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [hasGeocoded, setHasGeocoded] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<'precise' | 'approximate' | 'city'>('precise');

  // Parse property data from params
  useEffect(() => {
    try {
      if (params.property && typeof params.property === 'string') {
        const parsedProperty = JSON.parse(params.property);
        setProperty(parsedProperty);
      }
    } catch (err) {
      console.error(' Error parsing property:', err);
      setError('Failed to load property data');
      setLoading(false);
      setGeocoding(false);
    }
  }, [params.property]);

  // Get user location
  useEffect(() => {
    getUserLocation();
  }, []);

  // Geocode property address only once when property is loaded
  useEffect(() => {
    if (property && !hasGeocoded) {
      geocodePropertyAddress();
    }
  }, [property?._id]);

  // Fetch directions when both locations are available
  useEffect(() => {
    if (userLocation && propertyCoords) {
      fetchDirections();
    }
  }, [userLocation, propertyCoords]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(location.coords);
      setLoading(false);

    } catch (error) {
      console.error(' Error getting user location:', error);
      setLoading(false);
    }
  };

  // --------------------------
  // 🌍 GEOCODING SERVICE LOGIC
  // --------------------------
  const geocodePropertyAddress = async () => {
    if (!property || hasGeocoded) {
      return;
    }

    setGeocoding(true);
    setHasGeocoded(true);
    
    const attempts: string[] = [];

    const cleanAddr = property.address ? cleanAddress(property.address) : '';
    const cleanLoc = property.location ? cleanAddress(property.location) : '';
    const cleanName = property.name ? cleanAddress(property.name) : '';

    if (cleanAddr && cleanLoc) {
      if (!cleanAddr.toLowerCase().includes(cleanLoc.toLowerCase())) {
        attempts.push(`${cleanAddr}, ${cleanLoc}`);
      } else {
        attempts.push(cleanAddr);
      }
    }

    if (cleanAddr && !cleanAddr.toLowerCase().includes('coimbatore')) {
      attempts.push(`${cleanAddr}, Coimbatore, Tamil Nadu`);
    }

    if (cleanLoc) {
      attempts.push(cleanLoc);
    }

    if (cleanLoc && !cleanLoc.toLowerCase().includes('coimbatore')) {
      attempts.push(`${cleanLoc}, Coimbatore, Tamil Nadu`);
    }

    if (cleanName && cleanName !== cleanAddr && cleanName !== cleanLoc) {
      attempts.push(`${cleanName}, Coimbatore`);
    }

    const queriesWithCountry = attempts.map(query => {
      if (!query.toLowerCase().includes('india')) {
        return `${query}, India`;
      }
      return query;
    });

    if (queriesWithCountry.length === 0) {
      setError('Property location not available');
      setGeocoding(false);
      return;
    }

    for (let i = 0; i < queriesWithCountry.length; i++) {
      const searchQuery = queriesWithCountry[i];

      try {
        const geocodeUrl = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=3&countrycodes=in`;

        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded');
          }
          continue;
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const bestMatch = data[0];
          const coords = {
            latitude: parseFloat(bestMatch.lat),
            longitude: parseFloat(bestMatch.lon),
          };

          const accuracy = assessAccuracy(bestMatch.display_name, searchQuery);
          setLocationAccuracy(accuracy);

          setPropertyCoords(coords);
          setGeocoding(false);

          if (accuracy === 'city') {
            setError(' Showing approximate city location. Contact owner for exact address.');
          } else if (accuracy === 'approximate') {
            setError(' Showing approximate area. Exact location may vary.');
          }

         if (mapRef.current) {
  setTimeout(() => {
    mapRef.current?.animateToRegion(
      {
        ...coords,
        ...ACCURACY_ZOOM[accuracy],
      },
      1000
    );
  }, 500);
}
      return;
        }

      } catch (err: any) {
        if (err.message?.includes('Rate limit')) {
          setError('Too many requests. Please try again later.');
          setGeocoding(false);
          return;
        }
        continue;
      }
    }

    setError('Could not find property location. Contact the property owner.');
    setGeocoding(false);
  };

  // --------------------------
  // 🧭 FETCH ROUTE DIRECTIONS
  // --------------------------
  const fetchDirections = async () => {
    if (!userLocation || !propertyCoords) return;

    try {
      const start = `${userLocation.longitude},${userLocation.latitude}`;
      const end = `${propertyCoords.longitude},${propertyCoords.latitude}`;
      
      const url = `https://us1.locationiq.com/v1/directions/driving/${start};${end}?key=${LOCATIONIQ_API_KEY}&steps=true&geometries=geojson&overview=full&annotations=true`;

      const response = await fetch(url);
      if (!response.ok) return;

      const data = await response.json();

      if (data.routes?.length > 0) {
        const route = data.routes[0];

        const coordinates = route.geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        setRouteCoordinates(coordinates);

        setDistance(`${(route.distance / 1000).toFixed(1)} km`);
        setDuration(`${Math.round(route.duration / 60)} min`);

        if (mapRef.current) {
          setTimeout(() => {
         mapRef.current?.fitToCoordinates(coordinates, {
  edgePadding: ROUTE_FIT_PADDING,
  animated: true,
});

          }, 800);
        }
      }
    } catch (err) {
      console.error(' Error fetching directions:', err);
    }
  };

  const handleBackPress = () => router.back();

  // ------------------------------
  //  LOADING / ERROR UI HANDLING
  // ------------------------------
  if (loading || geocoding) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>
            {geocoding ? 'Finding property location...' : 'Loading map...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !propertyCoords) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------------
  // 🗺️ MAIN MAP UI
  // ------------------------------
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButtonIcon}>
          <Ionicons name="arrow-back" size={24} color="#1a2238" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{property?.name || 'Property Location'}</Text>
          <Text style={styles.headerSubtitle}>{property?.location || property?.address}</Text>
        </View>
      </View>

      {/* Warning Banner */}
      {error && propertyCoords && (
        <View
          style={[
            styles.warningBanner,
            locationAccuracy === 'city' ? styles.warningBannerError : styles.warningBannerWarning,
          ]}
        >
          <Ionicons
            name={locationAccuracy === 'city' ? 'warning' : 'information-circle'}
            size={18}
            color={locationAccuracy === 'city' ? '#D32F2F' : '#F57C00'}
          />
          <Text style={styles.warningText}>{error}</Text>
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
      initialRegion={{
  latitude: userLocation?.latitude || DEFAULT_MAP_REGION.latitude,
  longitude: userLocation?.longitude || DEFAULT_MAP_REGION.longitude,
  latitudeDelta: DEFAULT_MAP_REGION.latitudeDelta,
  longitudeDelta: DEFAULT_MAP_REGION.longitudeDelta,
}}

        showsUserLocation
        showsMyLocationButton
      >
        {/* Property Marker */}
        {propertyCoords && (
  <Marker
    coordinate={propertyCoords}
    title={property?.name}
    description={property?.address || property?.location}
  >
    <View
      style={[
        styles.propertyMarker,
        locationAccuracy === 'city' && styles.propertyMarkerApproximate,
      ]}
    >
      <Ionicons
        name={locationAccuracy === 'precise' ? 'home' : 'location'}
        size={24}
        color="#fff"
      />
    </View>
  </Marker>
)}


        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
<Polyline
  coordinates={routeCoordinates}
  strokeColor={POLYLINE_STYLE.strokeColor}
  strokeWidth={POLYLINE_STYLE.strokeWidth}
/>
        )}
      </MapView>

      {/* Info Card */}
      {distance && duration && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="navigate" size={20} color="#1a73e8" />
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>{distance}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color="#1a73e8" />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{duration}</Text>
            </View>
          </View>

          {locationAccuracy !== 'precise' && (
            <Text style={styles.infoDisclaimer}>
              {locationAccuracy === 'city'
                ? '* Approximate location - distances may not be accurate'
                : '* Location is approximate'}
            </Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// --------------------------------
// 🔵 STYLE SHEET (UNCHANGED)
// --------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorTitle: { fontSize: 22, fontWeight: '700', color: '#1a2238', marginTop: 16 },
  errorText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backButtonIcon: { padding: 8, marginRight: 8 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 16, color: '#1a2238', fontWeight: '600' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  warningBannerWarning: { backgroundColor: '#FFF3E0' },
  warningBannerError: { backgroundColor: '#FFEBEE' },
  warningText: { flex: 1, fontSize: 12, color: '#666' },
  map: { flex: 1 },
  propertyMarker: {
    backgroundColor: '#1a73e8',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  propertyMarkerApproximate: { backgroundColor: '#F57C00', opacity: 0.8 },
  infoCard: {
    position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#fff',
    borderRadius: 16, padding: 20,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  infoItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 40, backgroundColor: '#e0e0e0', marginHorizontal: 16 },
  infoLabel: { fontSize: 12, color: '#888' },
  infoValue: { fontSize: 18, color: '#1a2238', fontWeight: '700' },
  infoDisclaimer: { fontSize: 10, textAlign: 'center', marginTop: 12, color: '#999' },
  backButton: { backgroundColor: '#1a73e8', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

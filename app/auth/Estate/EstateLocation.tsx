// urban/app/auth/Estate/EstateLocation.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const LOCATIONIQ_API_KEY = 'pk.9bdd1304713dd24e813e3b1207af245b';

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
        console.log('📦 Received property:', parsedProperty);
        setProperty(parsedProperty);
      }
    } catch (err) {
      console.error('❌ Error parsing property:', err);
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
      console.log('🎯 Starting geocoding (first time only)...');
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
        console.log('❌ Location permission denied');
        setLoading(false);
        return;
      }

      console.log('✅ Location permission granted');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log('📍 User location:', location.coords);
      setUserLocation(location.coords);
      setLoading(false);

    } catch (error) {
      console.error('❌ Error getting user location:', error);
      setLoading(false);
    }
  };

  // ✅ NEW: Clean and format address for better geocoding
  const cleanAddress = (text: string): string => {
    return text
      .trim()
      .replace(/\s*,\s*/g, ', ') // Normalize commas
      .replace(/\.\s*,/g, ',')    // Remove periods before commas
      .replace(/\.+$/, '')        // Remove trailing periods
      .replace(/\s+/g, ' ');      // Normalize spaces
  };

  // ✅ NEW: Check if geocoding result is accurate
  const assessAccuracy = (displayName: string, originalQuery: string): 'precise' | 'approximate' | 'city' => {
    const lowerDisplay = displayName.toLowerCase();
    const lowerQuery = originalQuery.toLowerCase();
    
    // Extract key terms from query
    const queryTerms = lowerQuery
      .split(',')
      .map(term => term.trim())
      .filter(term => term && term !== 'india' && term !== 'tamil nadu');
    
    // Check how many query terms appear in result
    const matchedTerms = queryTerms.filter(term => 
      lowerDisplay.includes(term) || term.includes(lowerDisplay.split(',')[0])
    );
    
    // Precise: Has street/road name or specific area
    if (lowerDisplay.includes('road') || 
        lowerDisplay.includes('street') || 
        lowerDisplay.includes('avenue') ||
        matchedTerms.length >= 2) {
      return 'precise';
    }
    
    // Approximate: Has area/neighborhood name
    if (matchedTerms.length === 1 && !lowerDisplay.startsWith('coimbatore,')) {
      return 'approximate';
    }
    
    // City: Only city-level match
    return 'city';
  };

  // ✅ IMPROVED: Geocode with multiple fallback attempts and validation
  const geocodePropertyAddress = async () => {
    if (!property || hasGeocoded) {
      console.log('⏭️ Skipping geocoding (already done or no property)');
      return;
    }

    setGeocoding(true);
    setHasGeocoded(true);
    
    // Build multiple query attempts with decreasing specificity
    const attempts: string[] = [];
    
    // Clean addresses
    const cleanAddr = property.address ? cleanAddress(property.address) : '';
    const cleanLoc = property.location ? cleanAddress(property.location) : '';
    const cleanName = property.name ? cleanAddress(property.name) : '';
    
    // Attempt 1: Full address + location (most specific)
    if (cleanAddr && cleanLoc) {
      if (!cleanAddr.toLowerCase().includes(cleanLoc.toLowerCase())) {
        attempts.push(`${cleanAddr}, ${cleanLoc}`);
      } else {
        attempts.push(cleanAddr);
      }
    }
    
    // Attempt 2: Just address with Coimbatore
    if (cleanAddr && !cleanAddr.toLowerCase().includes('coimbatore')) {
      attempts.push(`${cleanAddr}, Coimbatore, Tamil Nadu`);
    }
    
    // Attempt 3: Just location
    if (cleanLoc) {
      attempts.push(cleanLoc);
    }
    
    // Attempt 4: Location + Coimbatore
    if (cleanLoc && !cleanLoc.toLowerCase().includes('coimbatore')) {
      attempts.push(`${cleanLoc}, Coimbatore, Tamil Nadu`);
    }
    
    // Attempt 5: Property name (last resort)
    if (cleanName && cleanName !== cleanAddr && cleanName !== cleanLoc) {
      attempts.push(`${cleanName}, Coimbatore`);
    }
    
    // Add India suffix to all attempts
    const queriesWithCountry = attempts.map(query => {
      if (!query.toLowerCase().includes('india')) {
        return `${query}, India`;
      }
      return query;
    });

    if (queriesWithCountry.length === 0) {
      console.error('❌ No address or location available for geocoding');
      setError('Property location not available');
      setGeocoding(false);
      return;
    }

    console.log('🔍 Geocoding attempts prepared:', queriesWithCountry.length);

    // Try each query until we get a good result
    for (let i = 0; i < queriesWithCountry.length; i++) {
      const searchQuery = queriesWithCountry[i];
      
      try {
        console.log(`🔍 Attempt ${i + 1}/${queriesWithCountry.length}: ${searchQuery}`);

        const geocodeUrl = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(searchQuery)}&format=json&limit=3&countrycodes=in`;

        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a few minutes.');
          }
          console.log(`⚠️ Attempt ${i + 1} failed: ${response.status}`);
          continue; // Try next query
        }

        const data = await response.json();

        if (data && data.length > 0) {
          console.log(`✅ Geocoding successful on attempt ${i + 1}`);
          
          if (data.length > 1) {
            console.log('⚠️ Multiple locations found:');
            data.forEach((result: any, index: number) => {
              console.log(`   ${index + 1}. ${result.display_name}`);
            });
          }

          const bestMatch = data[0];
          const coords = {
            latitude: parseFloat(bestMatch.lat),
            longitude: parseFloat(bestMatch.lon),
          };

          // ✅ Assess accuracy
          const accuracy = assessAccuracy(bestMatch.display_name, searchQuery);
          setLocationAccuracy(accuracy);

          console.log('📍 Property geocoded to:', bestMatch.display_name);
          console.log('📍 Coordinates:', coords);
          console.log('🎯 Accuracy level:', accuracy);
          
          setPropertyCoords(coords);
          setGeocoding(false);

          // Show warning if accuracy is low
          if (accuracy === 'city') {
            setError('⚠️ Showing approximate city location. Contact owner for exact address.');
          } else if (accuracy === 'approximate') {
            setError('⚠️ Showing approximate area. Exact location may vary.');
          }

          // Zoom to property location
          if (mapRef.current) {
            setTimeout(() => {
              mapRef.current?.animateToRegion({
                ...coords,
                latitudeDelta: accuracy === 'precise' ? 0.01 : accuracy === 'approximate' ? 0.05 : 0.1,
                longitudeDelta: accuracy === 'precise' ? 0.01 : accuracy === 'approximate' ? 0.05 : 0.1,
              }, 1000);
            }, 500);
          }
          
          return; // Success! Exit function
        } else {
          console.log(`⚠️ Attempt ${i + 1} returned no results`);
        }

      } catch (err: any) {
        console.error(`❌ Attempt ${i + 1} error:`, err.message);
        
        if (err.message?.includes('Rate limit')) {
          setError('Too many requests. Please try again in a few minutes.');
          setGeocoding(false);
          return; // Don't continue if rate limited
        }
        
        // Continue to next attempt
        continue;
      }
    }

    // All attempts failed
    console.error('❌ All geocoding attempts failed');
    setError('Could not find property location on map. Please contact the property owner for directions.');
    setGeocoding(false);
  };

  const fetchDirections = async () => {
    if (!userLocation || !propertyCoords) {
      console.log('⚠️ Missing location data for directions');
      return;
    }

    try {
      console.log('🗺️ Fetching directions from LocationIQ...');
      
      const start = `${userLocation.longitude},${userLocation.latitude}`;
      const end = `${propertyCoords.longitude},${propertyCoords.latitude}`;
      
      const url = `https://us1.locationiq.com/v1/directions/driving/${start};${end}?key=${LOCATIONIQ_API_KEY}&steps=true&geometries=geojson&overview=full&annotations=true`;
      
      console.log('🔗 Directions URL:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Directions API error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Directions response received');

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        const coordinates = route.geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        setRouteCoordinates(coordinates);

        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        
        setDistance(`${distanceKm} km`);
        setDuration(`${durationMin} min`);

        console.log(`✅ Route loaded: ${distanceKm} km, ${durationMin} min`);

        if (mapRef.current && coordinates.length > 0) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(
              [
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                propertyCoords,
              ],
              {
                edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                animated: true,
              }
            );
          }, 800);
        }
      } else {
        console.log('⚠️ No routes found in response');
      }

    } catch (err) {
      console.error('❌ Error fetching directions:', err);
      // Silently fail - just show markers without route
    }
  };

  const handleBackPress = () => {
    router.back();
  };

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

      {/* ✅ NEW: Accuracy Warning Banner */}
      {error && propertyCoords && (
        <View style={[
          styles.warningBanner,
          locationAccuracy === 'city' ? styles.warningBannerError : styles.warningBannerWarning
        ]}>
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
          latitude: userLocation?.latitude || 11.0168,
          longitude: userLocation?.longitude || 76.9558,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
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
            <View style={[
              styles.propertyMarker,
              locationAccuracy === 'city' && styles.propertyMarkerApproximate
            ]}>
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
            strokeColor="#1a73e8"
            strokeWidth={4}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat_500Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a2238',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 24,
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButtonIcon: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1a2238',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: '#888',
    marginTop: 2,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  warningBannerWarning: {
    backgroundColor: '#FFF3E0',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  warningBannerError: {
    backgroundColor: '#FFEBEE',
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#666',
    lineHeight: 18,
  },
  map: {
    flex: 1,
  },
  propertyMarker: {
    backgroundColor: '#1a73e8',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  propertyMarkerApproximate: {
    backgroundColor: '#F57C00',
    opacity: 0.8,
  },
  infoCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a2238',
    marginTop: 2,
  },
  infoDisclaimer: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  SAMPLE_LOCATION,
  MAP_UI_POSITIONS,
  MAP_UI_SPACING,
  MAP_ANIMATION_DURATION,
  ACCURACY_ZOOM,
  buildNominatimSearchUrl,
  getNominatimHeaders,
  formatCoordinates,
} from '../../../utils/mapConstants';

const { height } = Dimensions.get('window');

export default function PickLocation() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<Region>(SAMPLE_LOCATION);
  const [address, setAddress] = useState(
    formatCoordinates(SAMPLE_LOCATION.latitude, SAMPLE_LOCATION.longitude)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(buildNominatimSearchUrl(searchQuery), {
        headers: getNominatimHeaders(),
      });
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const handleSelect = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    const newRegion = {
      latitude: lat,
      longitude: lon,
      ...ACCURACY_ZOOM.precise,
    };

    setLocation(newRegion);
    setAddress(item.display_name);
    mapRef.current?.animateToRegion(newRegion, MAP_ANIMATION_DURATION);
    setShowResults(false);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Map */}
      <MapView ref={mapRef} style={styles.map} region={location}>
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
      </MapView>

      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.iconWrapper}>
          <Ionicons name="arrow-back" size={20} color="#000" />
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/Home')} style={styles.skipWrapper}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Find location"
          placeholderTextColor="#696969"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* Search Results */}
      {showResults && (
        <View style={styles.resultsList}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable onPress={() => handleSelect(item)} style={styles.resultItem}>
                <Ionicons name="location-outline" size={16} color="#1a73e8" style={{ marginRight: 6 }} />
                <Text numberOfLines={2} style={styles.resultText}>
                  {item.display_name}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Bottom Card */}
      <View style={styles.bottomSheet}>
        <Text style={styles.detailTitle}>Location detail</Text>
        <Text style={styles.detailText}>{address}</Text>
      </View>

      {/* Sticky Next Button */}
      <View style={styles.bottomButtonWrapper}>
        <Pressable
          style={styles.nextButton}
          onPress={() => router.push('/auth/Location/preferable-type')}
        >
          <Text style={styles.CntButtonText}>Choose your Location</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerRow: {
    position: 'absolute',
    top: MAP_UI_POSITIONS.headerTop,
    left: MAP_UI_SPACING.horizontal,
    right: MAP_UI_SPACING.horizontal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  iconWrapper: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 30,
    elevation: 4,
  },
  skipWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 4,
  },
  skipText: {
    color: '#3A3F67',
    fontWeight: '600',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  searchWrapper: {
    position: 'absolute',
    top: MAP_UI_POSITIONS.searchTop,
    left: MAP_UI_SPACING.horizontal,
    right: MAP_UI_SPACING.horizontal,
    zIndex: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 15,
    fontSize: 14,
    elevation: 5,
    color: '#000',
    fontFamily: 'Montserrat_400Regular',
  },
  resultsList: {
    position: 'absolute',
    top: MAP_UI_POSITIONS.resultsTop,
    left: MAP_UI_SPACING.horizontal,
    right: MAP_UI_SPACING.horizontal,
    maxHeight: MAP_UI_SPACING.maxResultsHeight,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    zIndex: 30,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 13,
    color: '#333',
    flexShrink: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: MAP_UI_POSITIONS.bottomSheetBottom,
    left: MAP_UI_SPACING.horizontal,
    right: MAP_UI_SPACING.horizontal,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    elevation: 8,
  },
  detailTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 6,
    fontFamily: 'Montserrat_700Bold',
  },
  detailText: {
    color: '#333',
    fontSize: 13,
    marginBottom: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  bottomButtonWrapper: {
    position: 'absolute',
    bottom: MAP_UI_POSITIONS.buttonBottom,
    left: MAP_UI_SPACING.horizontal,
    right: MAP_UI_SPACING.horizontal,
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  CntButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
  },
});
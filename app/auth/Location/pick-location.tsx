import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Keyboard,
  Platform,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function PickLocation() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [address, setAddress] = useState('Lat: 37.78825, Lng: -122.4324');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UrbanApp/1.0 (support@urbanapp.com)',
            Accept: 'application/json',
          },
        }
      );
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
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setLocation(newRegion);
    setAddress(item.display_name);
    mapRef.current?.animateToRegion(newRegion, 1000);
    setShowResults(false);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <MapView ref={mapRef} style={styles.map} region={location}>
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
      </MapView>

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconWrapper}>
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Home')} style={styles.skipWrapper}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
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
              <TouchableOpacity onPress={() => handleSelect(item)} style={styles.resultItem}>
                <Ionicons name="location-outline" size={16} color="#1a73e8" style={{ marginRight: 6 }} />
                <Text numberOfLines={2} style={styles.resultText}>
                  {item.display_name}
                </Text>
              </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push('/auth/Location/preferable-type')}
        >
          <Text style={styles.CntButtonText}>Choose your Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { ...StyleSheet.absoluteFillObject },

  headerRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
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
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
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
    top: Platform.OS === 'ios' ? 150 : 130,
    left: 20,
    right: 20,
    maxHeight: 250,
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
    bottom: 110,
    left: 20,
    right: 20,
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
    bottom: 30,
    left: 20,
    right: 20,
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
    // fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
});

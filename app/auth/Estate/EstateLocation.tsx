// EstateLocation.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions,StatusBar } from 'react-native';
// Replace the expo-maps import with:
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';  
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
const agentImage = require('../../../assets/images/agent1.1.png');
const estateImage = require('../../../assets/images/estate1.png'); // Replace with real images later
const estateLocations = [
  { id: 1, latitude: 37.78825, longitude: -122.4324 },
  { id: 2, latitude: 37.78925, longitude: -122.4354 },
  { id: 3, latitude: 37.79025, longitude: -122.4304 },
  { id: 4, latitude: 37.78625, longitude: -122.4314 },
  { id: 5, latitude: 37.78725, longitude: -122.4364 },
];
const EstateLocation = () => {
  const agentCoords = { latitude: 37.78325, longitude: -122.4374 };
  const estateCoords = { latitude: 37.78825, longitude: -122.4324 };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Circle boundary */}
        <Circle
          center={estateCoords}
          radius={500}
          fillColor="rgba(26, 115, 232, 0.1)"
          strokeColor="rgba(26, 115, 232, 0.3)"
        />

        {/* Agent marker */}
        <Marker coordinate={agentCoords}>
          <Image source={agentImage} style={styles.agentMarker} />
        </Marker>

        {/* Estate marker */}
        <Marker coordinate={estateCoords}>
          <Image source={estateImage} style={styles.estateMarker} />
        </Marker>

        {/* Route polyline */}
        <Polyline
          coordinates={[agentCoords, estateCoords]}
          strokeColor="#f24e6f"
          strokeWidth={3}
        />

        {/* Nearby estate markers */}
        {estateLocations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
          >
            <Image source={estateImage} style={styles.otherEstateMarker} />
          </Marker>
        ))}
      </MapView>

      {/* Bottom Location Detail */}
      <View style={styles.locationCard}>
        <Text style={styles.locationTitle}>Location detail</Text>
        <Text style={styles.address}>
          St. Cikoko Timur, Kec. Pancoran, Jakarta Selatan, Indonesia 12770
        </Text>
      </View>
    </View>
    </SafeAreaView>
  );
};

export default EstateLocation;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  image: {
    width: 380,
    height: 460,
marginTop: 40,
    marginBottom: 5,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    color: '#1e1e1e',
    lineHeight: 42,
    fontFamily: 'BebasNeue_400Regular', // ✅ Applied Bebas Neue font
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginVertical: 20,
  },
  progressSegment: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d3d3d3',
  },
  activeSegment: {
    backgroundColor: '#0a84ff',
    width: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 130,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SFPro', // ✅ Applied SF Pro font
  },

  map: {
    width: '100%',
    height: Dimensions.get('window').height,
  },
  agentMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  estateMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#8e44ad',
  },
  otherEstateMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  locationCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 5,
  },
  locationTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1a2238',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#6c757d',
  },
});

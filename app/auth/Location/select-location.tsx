import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function SelectLocationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Home')}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Add your <Text style={styles.highlight}>location</Text>
      </Text>
      <Text style={styles.subtitle}>
        You can edit this later on your account setting.
      </Text>

      {/* OpenStreetMap Box */}
      <View style={styles.mapWrapper}>
        <WebView
          source={{
            html: `
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
                    var map = L.map('map').setView([43.7696, 11.2558], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                      maxZoom: 19,
                    }).addTo(map);
                    var marker = L.marker([43.7696, 11.2558]).addTo(map);
                  </script>
                </body>
              </html>
            `,
          }}
          originWhitelist={['*']}
          style={styles.map}
        />
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push('/auth/Location/pick-location')}
        >
          <Text style={styles.mapButtonText}>SELECT ON MAP</Text>
        </TouchableOpacity>
      </View>

      {/* Location Detail */}
      <TouchableOpacity style={styles.locationDetail}>
        <Ionicons name="location-sharp" size={18} color="#ff4081" />
        <Text style={styles.detailText}>Location detail</Text>
        <Ionicons name="chevron-forward" size={18} color="#aaa" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push('/(tabs)/Home')}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  skip: {
    color: '#3A3F67',
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: '#FFFFFFCC',
    borderRadius: 8,
    fontFamily: 'Montserrat_400Regular', 
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 25,
    fontFamily: 'Montserrat_700Bold', 
    marginBottom: 18,
    color:'#1A1A1A'
  },
  highlight: {
    color: '#0075FF',
     fontWeight: '600',
    fontFamily: 'Montserrat_700Bold', 
  },
  subtitle: {
    fontSize: 13,
    color: '#696969',
    // marginTop: -50,
    fontFamily: 'Montserrat_400Regular', 
    marginBottom: 30,
  },
  mapWrapper: {
    height: 230,
    borderRadius: 14,
    overflow: 'hidden',
    //  marginTop: -70,
    // marginBottom: 20,
    position: 'relative',
  },
  map: {
    flex: 1,
    borderRadius: 14,
  },
  mapButton: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  mapButtonText: {
    color: '#fff',
    // fontWeight: '700',
    fontSize: 14,
     fontWeight: '600',
    fontFamily: 'Montserrat_700Bold',
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4F8',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 45,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#A1A5C1',
    //  fontWeight: '600',
    fontFamily: 'Montserrat_400Regular',
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 10,
    marginTop:80,
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

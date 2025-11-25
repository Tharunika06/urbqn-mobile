// urban/app/auth/Estate/LocationSection.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { EstateDetailsProps } from '../../app/auth/Estate/EstateDetails';

const mapPreview = require('../../assets/images/map.png');

interface LocationSectionProps {
  address: EstateDetailsProps['property']['address'];
  handleViewOnMap: () => void;
  distance?: string | null;
  loadingDistance?: boolean;
}

const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};

export default function LocationSection({ 
  address, 
  handleViewOnMap, 
  distance = null,
  loadingDistance = false 
}: LocationSectionProps) {
  return (
    <>
      <View style={styles.detailsBox}>
        <Text style={styles.detailsLabel}>Location & Public Facilities</Text>
        <View style={styles.locationCard}>
          <View style={styles.addressRow}>
            <Image source={require('../../assets/icons/location-pin.png')} style={styles.addressIcon} />
            <Text style={[textStyle, styles.addressText]}>{address}</Text>
          </View>
          
          {/*  Dynamic Distance Box */}
          <Pressable style={styles.distanceBox} onPress={handleViewOnMap}>
            <Ionicons name="location" size={16} color="#f24e6f" />
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              {loadingDistance ? (
                <>
                  <ActivityIndicator size="small" color="#1a73e8" style={{ marginRight: 8 }} />
                  <Text style={styles.distanceDesc}>Calculating distance...</Text>
                </>
              ) : distance ? (
                <>
                  <Text style={styles.distanceValue}>{distance} </Text>
                  <Text style={styles.distanceDesc}>from your location</Text>
                </>
              ) : (
                <Text style={styles.distanceDesc}>Tap to view location</Text>
              )}
            </View>
            <Feather name="chevron-right" size={16} color="#1a2238" />
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facilityScroll}>
            <View style={styles.facilityPill}><Text style={[textStyle, styles.pillText]}>2 Hospital</Text></View>
            <View style={styles.facilityPill}><Text style={[textStyle, styles.pillText]}>4 Gas stations</Text></View>
            <View style={styles.facilityPill}><Text style={[textStyle, styles.pillText]}>2 Schools</Text></View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.mapWrapper}>
        <Image source={mapPreview} style={styles.mapPreview} />
        <Pressable style={styles.viewAllMapBtn} onPress={handleViewOnMap}>
          <Text style={styles.viewAllMapText}>View on map</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  detailsBox: { paddingHorizontal: 16, marginTop: 20 },
  detailsLabel: { fontWeight: '600', fontSize: 16, marginBottom: 12, color: '#1a2238', fontFamily: 'Montserrat_700Bold' },
  locationCard: { backgroundColor: '#f9f9f9', borderRadius: 16, padding: 16 },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addressIcon: { width: 16, height: 16, marginRight: 8, resizeMode: 'contain' },
  addressText: { color: '#6c757d', fontSize: 13, flex: 1, flexWrap: 'wrap' },
  distanceBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderColor: '#f1f1f1', 
    borderWidth: 1, 
    borderRadius: 12, 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    marginBottom: 12 
  },
  distanceValue: { color: '#252B5C', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  distanceDesc: { color: '#53587A', fontWeight: 'normal', fontFamily: 'Montserrat_400Regular' },
  facilityScroll: { flexDirection: 'row' },
  facilityPill: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#e9ecef' },
  pillText: { color: '#53587A', fontSize: 13, fontWeight: '600' },
  mapWrapper: { marginHorizontal: 16, marginTop: 12, alignItems: 'center' },
  mapPreview: { width: '100%', height: 160, borderRadius: 0 },
  viewAllMapBtn: { marginTop: 0, backgroundColor: '#F5F4F8', width: '100%', borderRadius: 5 },
  viewAllMapText: { color: '#1a2238', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', textAlign: 'center', paddingVertical: 10 },
});
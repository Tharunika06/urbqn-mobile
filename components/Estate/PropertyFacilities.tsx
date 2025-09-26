// urban/app/auth/Estate/PropertyFacilities.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EstateDetailsProps } from '../../app/auth/Estate/EstateDetails';

interface PropertyFacilitiesProps {
  facilities?: EstateDetailsProps['property']['facility'];
}

const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};

export default function PropertyFacilities({ facilities }: PropertyFacilitiesProps) {
  if (!facilities || !Array.isArray(facilities) || facilities.length === 0) {
    return (
      <View style={styles.featuresRow}>
        <Text style={[textStyle, styles.noFacilitiesText]}>No facilities listed.</Text>
      </View>
    );
  }

  return (
    <View style={styles.featuresRow}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {facilities.map((facility, index) => {
          let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] = 'home-city-outline';
          const lowerCaseFacility = facility.toLowerCase();
          if (lowerCaseFacility.includes('pool')) iconName = 'pool';
          else if (lowerCaseFacility.includes('airport')) iconName = 'airplane';
          else if (lowerCaseFacility.includes('water')) iconName = 'water-pump';
          else if (lowerCaseFacility.includes('parking')) iconName = 'parking';
          else if (lowerCaseFacility.includes('ac') || lowerCaseFacility.includes('air condition')) iconName = 'air-conditioner';
          else if (lowerCaseFacility.includes('gym')) iconName = 'weight-lifter';
          else if (lowerCaseFacility.includes('wifi')) iconName = 'wifi';
          else if (lowerCaseFacility.includes('bed')) iconName = 'bed-outline';
          else if (lowerCaseFacility.includes('bath')) iconName = 'bathtub-outline';
          else if (lowerCaseFacility.includes('electricity')) iconName = 'lightning-bolt';
          return (
            <View key={index} style={styles.facilityBox}>
              <MaterialCommunityIcons name={iconName} size={18} color="#e91e63" style={{ marginRight: 4 }} />
              <Text style={styles.facilityText}>{facility}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  featuresRow: { flexDirection: 'row', paddingVertical: 8, marginLeft: 20 },
  facilityBox: { flexDirection: 'row', alignItems: 'center', marginRight: 12, paddingHorizontal: 9, paddingVertical: 9, backgroundColor: '#F5F4F8', borderRadius: 8 },
  facilityText: { fontSize: 13, color: '#3f3f46', fontFamily: 'Montserrat_600SemiBold' },
  noFacilitiesText: { color: '#333', fontStyle: 'italic' },
});
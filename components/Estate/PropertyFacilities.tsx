// urban/components/Estate/PropertyFacilities.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFacilityIcon } from '../../utils/estateUtils';

interface PropertyFacilitiesProps {
  facilities?: string[];
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
          const iconName = getFacilityIcon(facility) as React.ComponentProps<typeof MaterialCommunityIcons>['name'];
          
          return (
            <View key={index} style={styles.facilityBox}>
              <MaterialCommunityIcons 
                name={iconName} 
                size={18} 
                color="#e91e63" 
                style={{ marginRight: 4 }} 
              />
              <Text style={styles.facilityText}>{facility}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  featuresRow: { 
    flexDirection: 'row', 
    paddingVertical: 8, 
    marginLeft: 20 
  },
  facilityBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 12, 
    paddingHorizontal: 9, 
    paddingVertical: 9, 
    backgroundColor: '#F5F4F8', 
    borderRadius: 8 
  },
  facilityText: { 
    fontSize: 13, 
    color: '#3f3f46', 
    fontFamily: 'Montserrat_600SemiBold' 
  },
  noFacilitiesText: { 
    color: '#333', 
    fontStyle: 'italic' 
  },
});
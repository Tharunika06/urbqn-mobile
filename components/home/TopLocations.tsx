import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LOCATION_DATA } from '../../utils/staticData'; // Import from your static data file

// ============ Types ============
interface Location {
  id: number;
  name: string;
  count: number;
  image: any;
}

interface TopLocationsProps {
  locations?: Location[];
}

// ============ Component ============
export default function TopLocations({ locations = LOCATION_DATA }: TopLocationsProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Locations</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {locations.map((loc) => (
          <View key={loc.id} style={styles.pill}>
            <Image source={loc.image} style={styles.image} />
            <Text style={styles.text}>{loc.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  seeAll: {
    color: '#1a73e8',
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
  },
  pill: {
    backgroundColor: '#f1f1f6',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 12,
    minWidth: 100,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
    marginRight: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a2238',
    fontFamily: 'Montserrat_600SemiBold',
  },
});
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';

interface FeaturedSectionProps {
  images: any[];
}

export default function FeaturedSection({ images }: FeaturedSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured</Text>
        <Pressable><Text style={styles.seeAll}>See all</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((imgSrc, index) => (
          <View key={index} style={styles.card}>
            <Image source={imgSrc} style={styles.image} />
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ 4.6</Text>
            </View>
            <View style={styles.overlay}>
              <Text style={styles.propertyTitle}>Modernise Apartment</Text>
              <Text style={styles.location}>New York, US</Text>
              <Text style={styles.price}>
                <Text style={styles.priceAmount}>$31</Text>
                <Text style={styles.priceUnit}> / Night</Text>
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  seeAll: {
    color: '#1a73e8',
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
  },
  card: {
    width: 220,
    height: 300,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
    elevation: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#4C9FFF',
    fontWeight: '600',
    fontFamily: 'Montserrat_400Regular',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  propertyTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_700Bold',
  },
  location: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Montserrat_400Regular',
  },
  price: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceAmount: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceUnit: {
    fontSize: 13,
    color: '#f1f1f1',
  },
});

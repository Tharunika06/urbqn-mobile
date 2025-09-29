import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Property {
  id: number;
  title: string;
  desc: string;
  price: string;
  image: any;
  category: string;
  rating: number;
  location: string;
}

type PopularSectionProps = {
  properties: Property[];
  favorites: (string | number)[];
  toggleFavorite: (id: string | number) => void;
};


export default function PopularSection({ properties, favorites, toggleFavorite }: PopularSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular</Text>
        <Pressable><Text style={styles.seeAll}>See all</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {properties.map((property) => (
          <Pressable key={property.id} style={styles.card}>
            <View style={styles.imageWrapper}>
              <Image source={property.image} style={styles.image} />
              <Pressable
                onPress={() => toggleFavorite(property.id)}
                style={[
                  styles.favoriteBtn,
                  { backgroundColor: favorites.includes(property.id) ? '#ef4444' : '#fff' },
                ]}
              >
                <Ionicons
                  name="heart"
                  size={16}
                  color={favorites.includes(property.id) ? '#fff' : '#ef4444'}
                />
              </Pressable>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{property.category}</Text>
              </View>
            </View>
            <View style={styles.info}>
              <Text style={styles.titleText}>{property.title}</Text>
              <View style={styles.detailsRow}>
                <Ionicons name="star" size={11} color="#FFC107" />
                <Text style={styles.rating}> {property.rating}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Ionicons name="location-sharp" size={11} color="#858585" />
                <Text style={styles.location}> {property.location}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>{property.price.split('/')[0]}</Text>
                <Text style={styles.priceUnit}>/{property.price.split('/')[1]}</Text>
              </View>
            </View>
          </Pressable>
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
    flexDirection: 'row',
    backgroundColor: '#F5F4F8',
    borderRadius: 20,
    padding: 10,
    marginRight: 16,
    width: 320,
    height: 190,
    elevation: 2,
  },
  imageWrapper: {
    width: 150,
    height: 170,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#1a83ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  titleText: {
    fontSize: 13,
    color: '#252B5C',
    fontFamily: 'Montserrat_700Bold',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    marginLeft: 5,
    fontSize: 10,
    color: '#53587A',
    fontFamily: 'Montserrat_700Bold',
  },
  location: {
    marginLeft: 5,
    fontSize: 10,
    color: '#53587A',
    fontFamily: 'Montserrat_400Regular',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 20,
    color: '#252B5C',
    fontFamily: 'Montserrat_700Bold',
  },
  priceUnit: {
    marginLeft: 2,
    fontSize: 14,
    color: '#252B5C',
    fontFamily: 'Montserrat_400Regular',
  },
});

// Updated TopEstateGrid.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import GradientButton from '../../components/Button/GradientButton';
import { useFavorites } from '../context/FavoriteContext';

type Property = {
  id?: string | number;
  _id?: string;
  name: string;
  price?: string;
  status?: 'rent' | 'sale' | 'both'; 
  rentPrice?: string;
  salePrice?: string;
  photo: string | any;
  rating: number;
  country: string;
  facility: string[];
  ownerId: string;
  ownerName: string;
  address: string;
};

type Props = {
  properties: Property[];
  favorites: (string | number)[];
  toggleFavorite: (id: string | number) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TopEstateGrid({ properties }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { favorites, toggleFavorite } = useFavorites();

  const [showAll, setShowAll] = useState(false);  // Track if all properties should be shown

  // Function to get the correct image source
  const getImageSrc = (photo: string | any) => {
    if (photo && typeof photo === 'string' && photo.startsWith('data:image/')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('/uploads/')) {
      return { uri: `http://192.168.0.152:5000${photo}` };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('http')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'object') {
      return photo;
    }
    return require('../../assets/images/placeholder.png'); // Fallback placeholder
  };

  // Helper function to render the correct price label
  const renderPriceLabel = (property: Property) => {
    const status = property.status?.toLowerCase();

    if (status === 'both' && property.rentPrice && property.salePrice) {
      return <Text style={styles.priceText}>₹{property.salePrice}</Text>;
    }
    if (status === 'rent' && property.rentPrice) {
      return (
        <Text style={styles.priceText}>
          ₹{property.rentPrice}
          <Text style={styles.priceUnit}> /month</Text>
        </Text>
      );
    }
    if (status === 'sale' && property.salePrice) {
      return <Text style={styles.priceText}>₹{property.salePrice}</Text>;
    }
    if (property.price) {
      return <Text style={styles.priceText}>₹{property.price}</Text>;
    }
    return <Text style={styles.priceText}>N/A</Text>;
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Top Estates</Text>
        <Pressable onPress={() => setShowAll(!showAll)}>
          <Text style={styles.seeAll}>{showAll ? 'See less' : 'See all'}</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {(showAll ? properties : properties.slice(0, 4)).map((property, index) => {
          const safeId = property.id ?? property._id ?? index;
          const isFavorited = favorites.includes(safeId);

          const imageSource = getImageSrc(property.photo);

          return (
            <Pressable
              key={`property-${safeId}`}
              style={styles.card}
              onPress={() => {
                navigation.navigate('auth/Estate/EstateDetails', {
                  property: {
                    ...property,
                    _id: safeId,
                    location: property.country,
                    price: property.price || property.salePrice || property.rentPrice,
                    rating: property.rating || 4.9,
                    facility: property.facility || [],
                  },
                });
              }}
            >
              <View style={styles.imageWrap}>
                <Image
                  source={imageSource}
                  style={styles.image}
                  onError={() => {
                    console.warn('Failed to load property image for:', property.name);
                  }}
                  defaultSource={require('../../assets/images/placeholder.png')}
                />
                <Pressable
                  onPress={() => toggleFavorite(property)}
                  style={[styles.favoriteBtn, { backgroundColor: isFavorited ? '#ef4444' : '#fff' }]}
                >
                  <Ionicons name="heart" size={16} color={isFavorited ? '#fff' : '#ef4444'} />
                </Pressable>
                <View style={styles.priceTag}>
                  <GradientButton
                    onPress={() => {}}
                    colors={['#0075FF', '#4C9FFF']}
                    label={renderPriceLabel(property)}
                    buttonStyle={{
                      width: 'auto',
                      minWidth: 90,
                      height: 35,
                      paddingHorizontal: 12,
                      marginRight: -10,
                      marginBottom: -8,
                      borderRadius: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </View>
              </View>
              <Text style={styles.propertyTitle} numberOfLines={1}>{property.name}</Text>
              <Text style={styles.propertyMeta}>
                <Text>
                  <Text style={{ color: '#ffc107' }}>★ </Text>
                  <Text style={{ color: '#53587A' }}>{property.rating || '4.9'}</Text>
                </Text>
                <Ionicons name="location-sharp" size={12} color="#858585" style={{ marginLeft: 8 }} />
                <Text style={styles.locationText}>{property.country}</Text>
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  seeAll: {
    fontSize: 13,
    color: '#1a73e8',
    fontFamily: 'Montserrat_600SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    width: '48%',
    backgroundColor: '#F5F4F8',
    borderRadius: 16,
    paddingBottom: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 1,
  },
  imageWrap: {
    width: '95%',
    height: 160,
    marginLeft: 4,
    marginRight: 8,
    marginTop: 8,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 20,
    padding: 6,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 2,
  },
  priceText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceUnit: {
    fontSize: 8,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  propertyTitle: {
    fontSize: 14.7,
    fontWeight: '600',
    marginTop: 8,
    marginHorizontal: 12,
    color: '#252B5C',
    fontFamily: 'Montserrat_700Bold',
  },
  propertyMeta: {
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 12,
    fontFamily: 'Montserrat_400Regular',
    fontWeight: '600',
    alignItems: 'center',
  },
  locationText: {
    color: '#888',
    fontSize: 12,
  },
});
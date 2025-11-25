// File: urban/app/auth/Favorites/FavoritesGridView.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import FavoritesEmptyPage from '../Favorites/FavoriteEmpty';
import GradientButton from '../../../components/Button/GradientButton';

type PropertyType = {
  id: string | number;
  title: string;
  desc: string;
  price: string;
  image: { uri: string } | any;
  originalProperty?: {
    id?: string | number;
    _id?: string;
    rating?: number;
    country?: string;
    status?: 'rent' | 'sale' | 'both'|'sold';
    name?: string;
    photo?: string | any;
    location?: string;
    facility?: string[];
    ownerId?: string | number;
    ownerName?: string;
    address?: string;
    rentPrice?: string;
    salePrice?: string;
  };
};

type Props = {
  favorites: PropertyType[];
  onDelete: (id: string | number) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesGridView({ favorites, onDelete }: Props) {
  const navigation = useNavigation<NavigationProp>();

  const handleHeartPress = (item: PropertyType) => {
    // Use the original property ID (from the property itself, not the favorite document)
    const propertyId = item.originalProperty?.id || item.originalProperty?._id || item.id;
    
    console.log('Removing favorite - propertyId:', propertyId);
    
    // Only call onDelete - this handles all removal logic
    onDelete(propertyId);
  };

  const handlePropertyPress = (item: PropertyType) => {
    const property = item.originalProperty;
    const propertyId = property?.id || property?._id || item.id;
    
    if (!property) {
      console.warn('Missing property data for:', propertyId);
      return;
    }

    navigation.navigate('auth/Estate/EstateDetails', {
      property: {
        ...property,
        _id: propertyId,
        name: property.name || item.title || 'Property',
        photo: property.photo || item.image,
        location: property.country || property.location || 'Unknown Location',
        price: item.price || property.salePrice || property.rentPrice,
        rating: property.rating || 4.9,
        facility: property.facility || [],
        ownerId: property.ownerId || '',
        ownerName: property.ownerName || '',
        address: property.address || property.location || property.country || '',
        country: property.country || property.location,
      },
    });
  };

  const renderItem = ({ item }: { item: PropertyType }) => {
    const rating = item.originalProperty?.rating || 4.9;
    const location = item.originalProperty?.country || 'Location';

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handlePropertyPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.cardImage} />
          
          {/* Heart Icon - Top Right Corner - Now removes from favorites */}
          <TouchableOpacity 
            style={styles.heartIcon} 
            onPress={(e) => {
              e.stopPropagation();
              handleHeartPress(item);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.heartGradient}>
              <Ionicons name="heart" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          
          {/* Price Tag - Bottom Right Corner using inline gradient styling */}
          <View style={[styles.priceTag, { backgroundColor: '#0075FF' }]}>
            <Text style={styles.priceText}>{item.price}</Text>
            {item.originalProperty?.status === 'rent' && (
              <Text style={styles.periodText}>/month</Text>
            )}
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.bottomRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>{rating}</Text>
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.location} numberOfLines={1}>{location}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (favorites.length === 0) {
    return <FavoritesEmptyPage />;
  }

  return (
    <FlatList
      data={favorites}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      style={styles.flatList}
    />
  );
}

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 6,
    paddingTop: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#F5F4F8',
    borderRadius: 29,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 140,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heartGradient: {
    padding: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4995',
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  periodText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '400',
    fontFamily: 'Montserrat_400Regular',
    opacity: 0.9,
  },
  cardContent: {
    padding: 12,
    paddingTop: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A2238',
    marginBottom: 8,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    fontWeight: '600',
    color: '#856404',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  location: {
    fontSize: 11,
    fontFamily: 'Montserrat_400Regular',
    color: '#666666',
    marginLeft: 2,
    flex: 1,
  },
});
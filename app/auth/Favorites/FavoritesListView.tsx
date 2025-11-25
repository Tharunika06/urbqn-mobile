// File: urban/app/auth/Favorites/FavoritesListView.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Dimensions } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation';
import FavoritesEmptyPage from '../Favorites/FavoriteEmpty';

const { width } = Dimensions.get('window');
const cardWidth = width - 40; // 20px padding on each side

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
    status?: 'rent' | 'sale' | 'both'| 'sold';
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

export default function FavoritesListView({ favorites, onDelete }: Props) {
  const navigation = useNavigation<NavigationProp>();

  const handleHeartPress = (item: PropertyType) => {
    // Use the original property ID (from the property itself, not the favorite document)
    const propertyId = item.originalProperty?.id || item.originalProperty?._id || item.id;
    
    console.log('Removing favorite from list view - propertyId:', propertyId);
    
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

  const renderRightActions = (item: PropertyType) => {
    const propertyId = item.originalProperty?.id || item.originalProperty?._id || item.id;
    
    return (
      <Pressable style={styles.deleteBox} onPress={() => onDelete(propertyId)}>
        <Image source={require('../../../assets/icons/delete.png')} style={styles.deleteIcon} />
      </Pressable>
    );
  };

  const getPropertyTypeLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'rent':
        return 'Apartment';
      case 'sale':
        return 'House';
      case 'both':
        return 'Property';
      default:
        return 'Property';
    }
  };

  const renderItem = ({ item }: { item: PropertyType }) => {
    const rating = item.originalProperty?.rating || 4.9;
    const location = item.originalProperty?.country || 'Location';
    const propertyType = getPropertyTypeLabel(item.originalProperty?.status);
    const isFavorite = true;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <Pressable 
          style={styles.card}
          onPress={() => handlePropertyPress(item)}
          android_ripple={{ color: 'rgba(26, 115, 232, 0.1)' }}
        >
          {/* Horizontal layout: Image on left, content on right */}
          <View style={styles.cardContent}>
            {/* Property Image Container - Left Side */}
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.propertyImage} />
              
              {/* Heart Icon - Top Left Corner */}
              <Pressable 
                style={styles.heartContainer}
                onPress={(e) => {
                  e.stopPropagation();
                  handleHeartPress(item);
                }}
              >
                <View style={[styles.heartBackground, { backgroundColor: isFavorite ? '#FF4995' : '#EF4444' }]}>
                  <Ionicons name="heart" size={18} color="#fff" />
                </View>
              </Pressable>
              
              {/* Property Type Badge - Bottom Left Corner */}
              <View style={[styles.propertyBadge, { backgroundColor: '#0075FF' }]}>
                <Text style={styles.propertyBadgeText}>{propertyType}</Text>
              </View>
            </View>

            {/* Property Details - Right Side */}
            <View style={styles.detailsContainer}>
              {/* Title - First */}
              <Text style={styles.propertyTitle} numberOfLines={2}>{item.title}</Text>
              
              {/* Rating - Second */}
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
              
              {/* Location - Third */}
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.locationText}>{location}</Text>
              </View>
              
              {/* Price - Fourth */}
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>{item.price}</Text>
                {item.originalProperty?.status === 'rent' && (
                  <Text style={styles.priceSubtext}>/month</Text>
                )}
              </View>
            </View>
          </View>
        </Pressable>
      </Swipeable>
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
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#F5F4F8',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    width: cardWidth,
    height: 150,
  },
  cardContent: {
    flexDirection: 'row',
    height: 150,
  },
  imageContainer: {
    position: 'relative',
    width: 200,
    height: '100%',
  },
  propertyImage: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    width: 180,
    height: 130,
    resizeMode: 'cover',
    borderRadius: 12,
  },
  heartContainer: {
    position: 'absolute',
    top: 18,
    left: 18,
    zIndex: 1,
  },
  heartBackground: {
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyBadge: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  propertyBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  propertyTitle: {
    fontSize: 14,
    color: '#1A2238',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 6,
    fontFamily: 'Montserrat_400Regular',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  priceText: {
    fontSize: 15,
    color: '#1A2238',
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceSubtext: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  deleteBox: {
    backgroundColor: '#0075FF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
    height: 150,
  },
  deleteIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
});
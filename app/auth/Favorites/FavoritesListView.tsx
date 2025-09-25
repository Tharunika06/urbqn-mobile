import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // 16px padding on each side

type PropertyType = {
  id: string | number;
  title: string;
  desc: string;
  price: string;
  image: { uri: string } | any;
  originalProperty?: {
    rating?: number;
    country?: string;
    status?: 'rent' | 'sale' | 'both';
  };
};

type Props = {
  favorites: PropertyType[];
  onDelete: (id: string | number) => void;
  onToggleFavorite?: (property: PropertyType) => void;
};

export default function FavoritesListView({ favorites, onDelete, onToggleFavorite }: Props) {
  const renderRightActions = (id: string | number) => (
    <TouchableOpacity style={styles.deleteBox} onPress={() => onDelete(id)}>
      <Image source={require('../../../assets/icons/delete.png')} style={styles.deleteIcon} />
    </TouchableOpacity>
  );

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

  const getPropertyTypeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'rent':
        return '#5a8dc7ff';
      case 'sale':
        return '#5a8dc7ff';
      case 'both':
        return '#5a8dc7ff';
      default:
        return '#5a8dc7ff';
    }
  };

  const renderItem = ({ item }: { item: PropertyType }) => {
    const rating = item.originalProperty?.rating || 4.9;
    const location = item.originalProperty?.country || 'Location';
    const propertyType = getPropertyTypeLabel(item.originalProperty?.status);
    const propertyTypeColor = getPropertyTypeColor(item.originalProperty?.status);
    const isFavorite = true; // Assuming you track whether the item is a favorite or not. You can modify this condition based on your logic.

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <View style={styles.card}>
          {/* Horizontal layout: Image on left, content on right */}
          <View style={styles.cardContent}>
            {/* Property Image Container - Left Side */}
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.propertyImage} />
              
              {/* Heart Icon - Top Left Corner */}
              <TouchableOpacity 
                style={styles.heartContainer}
                onPress={() => onToggleFavorite && onToggleFavorite(item)}
              >
                <LinearGradient
                  colors={isFavorite ? ['#FF4995', '#D6034F'] : ['#EF4444', '#EF4444']} // Gradient for active heart
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heartBackground}
                >
                  <Ionicons name="heart" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Property Type Badge - Bottom Left Corner */}
              <LinearGradient
                colors={['#0075FF', '#4C9FFF']}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[styles.propertyBadge]}
              >
                <Text style={styles.propertyBadgeText}>{propertyType}</Text>
              </LinearGradient>
            </View>

            {/* Property Details - Right Side */}
            <View style={styles.detailsContainer}>
              {/* Title - First */}
              <Text style={styles.propertyTitle}>{item.title}</Text>
              
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
        </View>
      </Swipeable>
    );
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No favorites yet</Text>
        <Text style={styles.emptySubtext}>Properties you like will appear here</Text>
      </View>
    );
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
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 18,
  },
  card: {
    backgroundColor: '#F5F4F8',
    borderRadius: 16,
    marginBottom: 16,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 4,
    overflow: 'hidden',
    width: 350,
    height: 150,
  },
  cardContent: {
    flexDirection: 'row',
    height: 200,
  },
  imageContainer: {
    position: 'relative',
    width: 190,
    height: 130,
  },
  propertyImage: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 18,
  },
  heartContainer: {
    position: 'absolute',
    top: 12,
    left: 12, // Changed to left corner
    zIndex: 1,
  },
  heartBackground: {
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyBadge: {
    position: 'absolute',
    bottom: 0, 
    left: 16,
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
    padding: 16,
    justifyContent: 'center',
  },
  propertyTitle: {
    fontSize: 14,
    color: '#1A2238',
    fontFamily: 'Montserrat_600SemiBold',
    marginTop: -45, // Adjust this margin value to move the title higher
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor:'#0075FF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 140,
    borderRadius: 16,
    marginBottom: 16,
    // marginLeft: -10,
  },
  deleteIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2238',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FavoritesEmptyPage from '../Favorites/FavoriteEmpty';

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

export default function FavoritesGridView({ favorites, onDelete, onToggleFavorite }: Props) {
  const handleHeartPress = (item: PropertyType) => {
    // Remove from favorites when heart is clicked
    onDelete(item.id);
    
    // Also call onToggleFavorite if provided (for additional logic)
    if (onToggleFavorite) {
      onToggleFavorite(item);
    }
  };

  const renderItem = ({ item }: { item: PropertyType }) => {
    const rating = item.originalProperty?.rating || 4.9;
    const location = item.originalProperty?.country || 'Location';

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.cardImage} />
          
          {/* Heart Icon - Top Right Corner - Now removes from favorites */}
          <TouchableOpacity 
            style={styles.heartIcon} 
            onPress={() => handleHeartPress(item)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FF4995', '#D6034F']}
              style={styles.heartGradient}
            >
              <Ionicons name="heart" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Delete Icon - Top Left Corner - Alternative delete option */}
          <TouchableOpacity 
            style={styles.deleteIcon} 
            onPress={() => onDelete(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.deleteBackground}>
              <Ionicons name="trash-outline" size={14} color="#FF4444" />
            </View>
          </TouchableOpacity>
          
          {/* Price Tag - Bottom Right Corner */}
          <LinearGradient
            colors={['#0075FF', '#4C9FFF']}
            style={styles.priceTag}
          >
            <Text style={styles.priceText}>{item.price}</Text>
            {item.originalProperty?.status === 'rent' && (
              <Text style={styles.periodText}>/month</Text>
            )}
          </LinearGradient>
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
      </View>
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    margin: 8,
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
  },
  deleteIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 5,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
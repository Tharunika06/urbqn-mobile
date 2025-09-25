import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  // const getPropertyTypeLabel = (status?: string) => {
  //   switch (status?.toLowerCase()) {
  //     case 'rent':
  //       return 'Apartment';
  //     case 'sale':
  //       return 'House';
  //     case 'both':
  //       return 'Property';
  //     default:
  //       return 'Property';
  //   }
  // };

  // const getPropertyTypeColor = (status?: string) => {
  //   switch (status?.toLowerCase()) {
  //     case 'rent':
  //       return '#5a8dc7ff';
  //     case 'sale':
  //       return '#5a8dc7ff';
  //     case 'both':
  //       return '#5a8dc7ff';
  //     default:
  //       return '#5a8dc7ff';
  //   }
  // };

  const renderItem = ({ item }: { item: PropertyType }) => {
    const rating = item.originalProperty?.rating || 4.9;
    const location = item.originalProperty?.country || 'Location';
    // const propertyType = getPropertyTypeLabel(item.originalProperty?.status);
    // const propertyTypeColor = getPropertyTypeColor(item.originalProperty?.status);

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
          
          {/* Heart Icon - Top Right Corner */}
          <TouchableOpacity 
            style={styles.heartIcon} 
            onPress={() => onToggleFavorite && onToggleFavorite(item)}
          >
            <LinearGradient
              colors={['#FF4995', '#D6034F']}
              style={styles.heartGradient}
            >
              <Ionicons name="heart" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Property Type Badge - Bottom Left Corner */}
          {/* <LinearGradient
            colors={['#0075FF', '#4C9FFF']}
            style={styles.propertyBadge}
          >
            <Text style={styles.propertyBadgeText}>{propertyType}</Text>
          </LinearGradient> */}
          
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
          <Text style={styles.title}>{item.title}</Text>
          
          <View style={styles.bottomRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>{rating}</Text>
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.location}>{location}</Text>
            </View>
          </View>
        </View>
      </View>
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
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 34,
    backgroundColor: '#Ffff',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '49%',
    backgroundColor: '#F5F4F8',
    borderRadius: 16,
    overflow: 'hidden',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    marginLeft: 8,
    // marginRight: 9,
    marginTop: 8,
    borderRadius: 18,
    overflow: 'hidden',
    width: '91%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
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
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  propertyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
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
  },
  title: {
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
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
});
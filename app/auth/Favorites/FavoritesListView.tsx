import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Dimensions, StatusBar } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FavoritesEmptyPage from '../Favorites/FavoriteEmpty';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <Pressable style={styles.deleteBox} onPress={() => onDelete(id)}>
      <Image source={require('../../../assets/icons/delete.png')} style={styles.deleteIcon} />
    </Pressable>
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
      <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <View style={styles.card}>
          {/* Horizontal layout: Image on left, content on right */}
          <View style={styles.cardContent}>
            {/* Property Image Container - Left Side */}
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.propertyImage} />
              
              {/* Heart Icon - Top Left Corner */}
              <Pressable 
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
              </Pressable>
              
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
      </SafeAreaView>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: 18,
  },

  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  image: {
    width: 380,
    height: 460,
marginTop: 40,
    marginBottom: 5,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    color: '#1e1e1e',
    lineHeight: 42,
    fontFamily: 'BebasNeue_400Regular', // ✅ Applied Bebas Neue font
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginVertical: 20,
  },
  progressSegment: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d3d3d3',
  },
  activeSegment: {
    backgroundColor: '#0a84ff',
    width: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 130,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SFPro', // ✅ Applied SF Pro font
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
    left:5,
    right:50
  },
  cardContent: {
    flexDirection: 'row',
    height: 150,
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
    // marginTop: -45, // Adjust this margin value to move the title higher
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
    // borderTopLeftRadius:8,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
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

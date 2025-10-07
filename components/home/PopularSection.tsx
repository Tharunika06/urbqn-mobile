import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Property {
  id: number | string;
  name?: string;
  title?: string;
  desc?: string;
  description?: string;
  price?: string;
  rentPrice?: string;
  salePrice?: string;
  photo?: string | any;
  image?: any;
  category?: string;
  status?: 'rent' | 'sale' | 'both';
  rating: number;
  location?: string;
  country?: string;
}

interface PopularProperty {
  propertyId: string | number;
  favoriteCount: number;
  property: Property;
}

type PopularSectionProps = {
  favorites: (string | number)[];
  toggleFavorite: (id: string | number) => void;
  apiUrl?: string;
  limit?: number;
};

export default function PopularSection({ 
  favorites, 
  toggleFavorite, 
  apiUrl = 'http://192.168.0.154:5000/api',
  limit = 10 
}: PopularSectionProps) {
  const [popularProperties, setPopularProperties] = useState<PopularProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchPopularProperties();
  }, []);

  // Function to get the correct image source (same as TopEstateGrid)
  const getImageSrc = (photo: string | any) => {
    if (photo && typeof photo === 'string' && photo.startsWith('data:image/')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('/uploads/')) {
      return { uri: `http://192.168.0.154:5000${photo}` };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('http')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'object') {
      return photo;
    }
    return require('../../assets/images/placeholder.png');
  };

  // Helper function to render the correct price
  const renderPrice = (property: Property) => {
    const status = property.status?.toLowerCase();

    if (status === 'both' && property.salePrice) {
      return { amount: `₹${property.salePrice}`, unit: '' };
    }
    if (status === 'rent' && property.rentPrice) {
      return { amount: `₹${property.rentPrice}`, unit: '/month' };
    }
    if (status === 'sale' && property.salePrice) {
      return { amount: `₹${property.salePrice}`, unit: '' };
    }
    if (property.price) {
      const parts = property.price.split('/');
      return { 
        amount: parts[0].startsWith('₹') ? parts[0] : `₹${parts[0]}`,
        unit: parts[1] ? `/${parts[1]}` : ''
      };
    }
    return { amount: 'N/A', unit: '' };
  };

  const fetchPopularProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${apiUrl}/favorites/popular/${limit}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log('API Response:', JSON.stringify(data, null, 2));

      if (data.success && data.properties) {
        setPopularProperties(data.properties);
        console.log(`Loaded ${data.properties.length} popular properties`);
      } else {
        setError(data.message || 'Failed to load popular properties');
      }
    } catch (err) {
      console.error('Error fetching popular properties:', err);
      setError('Unable to load popular properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeeAll = () => {
    setShowAll(!showAll);
  };

  // Determine how many properties to display
  const getDisplayProperties = () => {
    if (popularProperties.length <= 2) {
      return popularProperties;
    }
    return showAll ? popularProperties : popularProperties.slice(0, 2);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading popular properties...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchPopularProperties} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (popularProperties.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-outline" size={48} color="#858585" />
          <Text style={styles.emptyText}>No popular properties yet</Text>
        </View>
      );
    }

    const displayProperties = getDisplayProperties();

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {displayProperties.map((item) => {
          const property = item.property;
          const propertyId = item.propertyId;
          
          if (!property) {
            console.warn('Missing property data for:', propertyId);
            return null;
          }

          const imageSource = getImageSrc(property.photo || property.image);
          const priceDisplay = renderPrice(property);
          const title = property.name || property.title || 'Untitled Property';
          const location = property.country || property.location || 'Location not available';
          const category = property.category || property.status || 'Property';
          
          return (
            <Pressable key={propertyId} style={styles.card}>
              <View style={styles.imageWrapper}>
                <Image 
                  source={imageSource} 
                  style={styles.image}
                  onError={() => {
                    console.warn('Failed to load property image for:', title);
                  }}
                  defaultSource={require('../../assets/images/placeholder.png')}
                />
                <Pressable
                  onPress={() => toggleFavorite(propertyId)}
                  style={[
                    styles.favoriteBtn,
                    { backgroundColor: favorites.includes(propertyId) ? '#ef4444' : '#fff' },
                  ]}
                >
                  <Ionicons
                    name="heart"
                    size={16}
                    color={favorites.includes(propertyId) ? '#fff' : '#ef4444'}
                  />
                </Pressable>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              </View>
              <View style={styles.info}>
                <Text style={styles.titleText} numberOfLines={2}>
                  {title}
                </Text>
                <View style={styles.detailsRow}>
                  <Ionicons name="star" size={11} color="#FFC107" />
                  <Text style={styles.rating}> {property.rating || '4.9'}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Ionicons name="location-sharp" size={11} color="#858585" />
                  <Text style={styles.location} numberOfLines={1}>
                    {' '}{location}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>{priceDisplay.amount}</Text>
                  {priceDisplay.unit && (
                    <Text style={styles.priceUnit}>{priceDisplay.unit}</Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular</Text>
        {popularProperties.length > 2 && (
          <Pressable onPress={handleSeeAll}>
            <Text style={styles.seeAll}>
              {showAll ? 'Show Less' : 'See All'}
            </Text>
          </Pressable>
        )}
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#858585',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  errorText: {
    marginTop: 12,
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  emptyText: {
    marginTop: 12,
    color: '#858585',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 14,
    color: '#53587A',
    fontFamily: 'Montserrat_700Bold',
  },
  location: {
    marginLeft: 5,
    fontSize: 14,
    color: '#53587A',
    fontFamily: 'Montserrat_400Regular',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  priceAmount: {
    fontSize: 14,
    color: '#252B5C',
    fontFamily: 'Montserrat_700Bold',
  },
  priceUnit: {
    marginLeft: 2,
    fontSize: 11,
    color: '#252B5C',
    fontFamily: 'Montserrat_400Regular',
  },
});
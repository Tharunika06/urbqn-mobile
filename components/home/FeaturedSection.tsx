import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Property {
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
  facility?: string[];
}

interface FeaturedSectionProps {
  apiUrl?: string;
  limit?: number;
}

export default function FeaturedSection({ 
  apiUrl = 'http://192.168.0.154:5000/api',
  limit = 10 
}: FeaturedSectionProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchFeaturedProperties();
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

  const fetchFeaturedProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // You'll need to create this endpoint or use an existing one
      // For now, using the popular endpoint as an example
      const url = `${apiUrl}/favorites/popular/${limit}`;
      console.log('Fetching featured properties from:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Featured API Response:', JSON.stringify(data, null, 2));

      if (data.success && data.properties) {
        // Extract the property objects if they're nested
        const propertiesList = data.properties.map((item: any) => 
          item.property || item
        );
        setProperties(propertiesList);
        console.log(`Loaded ${propertiesList.length} featured properties`);
      } else {
        setError(data.message || 'Failed to load featured properties');
      }
    } catch (err) {
      console.error('Error fetching featured properties:', err);
      setError('Unable to load featured properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeeAll = () => {
    setShowAll(!showAll);
  };

  // Determine how many properties to display
  const getDisplayProperties = () => {
    if (properties.length <= 2) {
      return properties;
    }
    return showAll ? properties : properties.slice(0, 2);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading featured properties...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchFeaturedProperties} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (properties.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="home-outline" size={48} color="#858585" />
          <Text style={styles.emptyText}>No featured properties available</Text>
        </View>
      );
    }

    const displayProperties = getDisplayProperties();

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {displayProperties.map((property, index) => {
          const safeId = property.id || property._id || index;
          const imageSource = getImageSrc(property.photo);
          const priceDisplay = renderPrice(property);

          return (
            <View key={`featured-${safeId}`} style={styles.card}>
              <Image 
                source={imageSource} 
                style={styles.image}
                onError={() => {
                  console.warn('Failed to load featured image for:', property.name);
                }}
                defaultSource={require('../../assets/images/placeholder.png')}
              />
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐{property.rating || '4.6'}</Text>
              </View>
              <View style={styles.overlay}>
                <Text style={styles.propertyTitle} numberOfLines={1}>
                  {property.name || 'Featured Property'}
                </Text>
                <Text style={styles.location} numberOfLines={1}>
                  {property.country || 'Location'}
                </Text>
                <Text style={styles.price}>
                  <Text style={styles.priceAmount}>{priceDisplay.amount}</Text>
                  {priceDisplay.unit && (
                    <Text style={styles.priceUnit}> {priceDisplay.unit}</Text>
                  )}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured</Text>
        {properties.length > 2 && (
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
    paddingVertical: 60,
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
    width: 220,
    height: 300,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    // elevation: 4,
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
    backgroundColor: '#0000003b',
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
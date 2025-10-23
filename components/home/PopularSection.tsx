// urban/components/home/PopularSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

interface Property {
  id?: number | string;
  _id?: string;
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
  status?: 'rent' | 'sale' | 'both' | 'sold';
  rating: number;
  location?: string;
  country?: string;
  ownerId?: string | number;
  ownerName?: string;
  address?: string;
  facility?: string[];
}

interface PopularProperty {
  propertyId: string | number;
  favoriteCount: number;
  property: Property;
}

interface PopularSectionProps {
  apiUrl?: string;
  limit?: number;
  favorites: (string | number)[];
  toggleFavorite: (id: string | number) => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PopularSection({ 
  apiUrl = 'http://192.168.1.45:5000/api',
  limit = 10,
  favorites,
  toggleFavorite
}: PopularSectionProps) {
  const navigation = useNavigation<NavigationProp>();
  const [popularProperties, setPopularProperties] = useState<PopularProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchPopularProperties();
  }, []);

  const getImageSrc = (photo: string | any) => {
    if (photo && typeof photo === 'string' && photo.startsWith('data:image/')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('/uploads/')) {
      return { uri: `http://192.168.1.45:5000${photo}` };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('http')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'object') {
      return photo;
    }
    return require('../../assets/images/placeholder.png');
  };

  const renderPrice = (property: Property) => {
    const status = property.status?.toLowerCase();
    if (status === 'both' && property.salePrice) return { amount: `₹${property.salePrice}`, unit: '' };
    if (status === 'rent' && property.rentPrice) return { amount: `₹${property.rentPrice}`, unit: '/month' };
    if (status === 'sale' && property.salePrice) return { amount: `₹${property.salePrice}`, unit: '' };
    if (property.price) {
      const parts = property.price.split('/');
      return { amount: parts[0].startsWith('₹') ? parts[0] : `₹${parts[0]}`, unit: parts[1] ? `/${parts[1]}` : '' };
    }
    return { amount: 'N/A', unit: '' };
  };

  const fetchPopularProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${apiUrl}/favorites/popular/${limit}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success && data.properties) {
        setPopularProperties(data.properties);
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

  const handleSeeAll = () => setShowAll(!showAll);

  const handlePropertyPress = (property: Property, propertyId: string | number) => {
    const safeId = property._id || property.id || propertyId;
    navigation.navigate('auth/Estate/EstateDetails', {
      property: {
        ...property,
        _id: safeId,
        name: property.name || property.title || 'Property',
        photo: property.photo || property.image,
        location: property.country || property.location || 'Unknown Location',
        price: property.price || property.salePrice || property.rentPrice,
        rating: property.rating || 4.9,
        facility: property.facility || [],
        ownerId: property.ownerId || '',
        ownerName: property.ownerName || '',
        address: property.address || property.location || property.country || '',
        country: property.country || property.location,
      },
    });
  };

  const getDisplayProperties = () => {
    if (popularProperties.length <= 2) return popularProperties;
    return showAll ? popularProperties : popularProperties.slice(0, 2);
  };

  const renderContent = () => {
    if (loading) return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Loading popular properties...</Text>
      </View>
    );

    if (error) return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={fetchPopularProperties} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );

    if (popularProperties.length === 0) return (
      <View style={styles.centerContainer}>
        <Ionicons name="heart-outline" size={48} color="#858585" />
        <Text style={styles.emptyText}>No popular properties yet</Text>
      </View>
    );

    const displayProperties = getDisplayProperties();

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {displayProperties.map((item) => {
          const property = item.property;
          const propertyId = item.propertyId;
          if (!property) return null;

          const imageSource = getImageSrc(property.photo || property.image);
          const priceDisplay = renderPrice(property);
          const title = property.name || property.title || 'Untitled Property';
          const location = property.country || property.location || 'Location not available';
          const category = property.category || property.status || 'Property';
          const safeId = property.id || property._id || propertyId;
          const isFavorited = favorites.includes(safeId);

          return (
            <Pressable 
              key={propertyId} 
              style={styles.card}
              onPress={() => handlePropertyPress(property, propertyId)}
              android_ripple={{ color: 'rgba(26, 115, 232, 0.1)' }}
            >
              <View style={styles.imageWrapper}>
                <Image source={imageSource} style={styles.image} defaultSource={require('../../assets/images/placeholder.png')} />
                
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(safeId);
                  }}
                  style={styles.favoriteBtn}
                >
                  {isFavorited ? (
                    <LinearGradient
                      colors={['#D6034F', '#FF4995']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientContainer}
                    >
                      <Ionicons name="heart" size={16} color="#fff" />
                    </LinearGradient>
                  ) : (
                    <View style={styles.whiteContainer}>
                      <MaskedView
                        maskElement={
                          <View style={styles.maskContainer}>
                            <Ionicons name="heart" size={16} color="#fff" />
                          </View>
                        }
                      >
                        <LinearGradient
                          colors={['#D6034F', '#FF4995']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.gradientHeart}
                        />
                      </MaskedView>
                    </View>
                  )}
                </Pressable>

                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              </View>

              <View style={styles.info}>
                <Text style={styles.titleText} numberOfLines={2}>{title}</Text>
                <View style={styles.detailsRow}>
                  <Ionicons name="star" size={11} color="#FFC107" />
                  <Text style={styles.rating}> {property.rating || '4.9'}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Ionicons name="location-sharp" size={11} color="#858585" />
                  <Text style={styles.location} numberOfLines={1}> {location}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>{priceDisplay.amount}</Text>
                  {priceDisplay.unit && <Text style={styles.priceUnit}>{priceDisplay.unit}</Text>}
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
            <Text style={styles.seeAll}>{showAll ? 'Show Less' : 'See All'}</Text>
          </Pressable>
        )}
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontWeight: '600', fontSize: 18, fontFamily: 'Montserrat_700Bold' },
  seeAll: { color: '#1a73e8', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  centerContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#858585', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
  errorText: { marginTop: 12, color: '#ef4444', fontSize: 14, textAlign: 'center', fontFamily: 'Montserrat_400Regular' },
  emptyText: { marginTop: 12, color: '#858585', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
  retryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#1a73e8', borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat_600SemiBold' },
  card: { flexDirection: 'row', backgroundColor: '#F5F4F8', borderRadius: 20, padding: 10, marginRight: 16, width: 320, height: 190, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  imageWrapper: { width: 150, height: 170, position: 'relative' },
  image: { width: '100%', height: '100%', borderRadius: 16 },
  favoriteBtn: { position: 'absolute', top: 8, left: 8, borderRadius: 20, overflow: 'hidden', zIndex: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3 },
  gradientContainer: { width: 32, height: 32, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  whiteContainer: { width: 32, height: 32, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  maskContainer: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  gradientHeart: { width: 32, height: 32 },
  categoryBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#1a83ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  categoryText: { color: '#fff', fontSize: 11, fontFamily: 'Montserrat_600SemiBold' },
  info: { flex: 1, marginLeft: 15, justifyContent: 'space-between', paddingVertical: 4 },
  titleText: { fontSize: 16, color: '#252B5C', fontFamily: 'Montserrat_700Bold' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  rating: { marginLeft: 5, fontSize: 14, color: '#53587A', fontFamily: 'Montserrat_700Bold' },
  location: { marginLeft: 5, fontSize: 14, color: '#53587A', fontFamily: 'Montserrat_400Regular' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  priceAmount: { fontSize: 14, color: '#252B5C', fontFamily: 'Montserrat_700Bold' },
  priceUnit: { marginLeft: 2, fontSize: 11, color: '#252B5C', fontFamily: 'Montserrat_400Regular' },
});

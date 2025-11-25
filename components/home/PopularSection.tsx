// components/home/PopularSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GradientButton from '../Button/GradientButton';
import { RootStackParamList } from '../../types/navigation';
import { Property, PopularProperty } from '../../types/index';
import { fetchPopularProperties } from '../../services/api.service';
import { 
  getImageSource, 
  renderPrice, 
  getSafePropertyId, 
  getPropertyName, 
  getPropertyLocation,
  formatPropertyForNavigation 
} from '../../utils/property.utils';
import { useFavorites } from '../context/FavoriteContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PopularSectionProps {
  limit?: number;
}

export default function PopularSection({ limit = 10 }: PopularSectionProps) {
  const navigation = useNavigation<NavigationProp>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [popularProperties, setPopularProperties] = useState<PopularProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchPopularProperties(limit);
    setPopularProperties(result.properties);
    setError(result.error);
    setLoading(false);
  };

  const handleSeeAll = () => setShowAll(!showAll);

  const handlePropertyPress = (property: Property, propertyId: string | number) => {
    navigation.navigate('auth/Estate/EstateDetails', {
      property: formatPropertyForNavigation(property, 0, propertyId),
    });
  };

  const getDisplayProperties = () => {
    if (popularProperties.length <= 2) return popularProperties;
    return showAll ? popularProperties : popularProperties.slice(0, 2);
  };

  const handleToggleFavorite = async (property: Property, propertyId: string | number) => {
    try {
      await toggleFavorite(formatPropertyForNavigation(property, 0, propertyId) as any);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
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
        <GradientButton
          onPress={loadProperties}
          label="Retry"
          colors={['#1a73e8', '#4C9FFF']}
          buttonStyle={styles.retryBtn}
          textStyle={styles.retryText}
        />
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

          const imageSource = getImageSource(property.photo || property.image);
          const priceDisplay = renderPrice(property);
          const title = getPropertyName(property);
          const location = getPropertyLocation(property);
          const category = property.category || property.status || 'Property';
          const safeId = getSafePropertyId(property, propertyId);
          const isFavorited = isFavorite(safeId);

          return (
            <Pressable 
              key={propertyId} 
              style={styles.card}
              onPress={() => handlePropertyPress(property, propertyId)}
              android_ripple={{ color: 'rgba(26, 115, 232, 0.1)' }}
            >
              <View style={styles.imageWrapper}>
                <Image 
                  source={imageSource} 
                  style={styles.image} 
                  defaultSource={require('../../assets/images/placeholder.png')} 
                />
                
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(property, propertyId);
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
  retryBtn: { 
    marginTop: 16, 
    width: 'auto',
    height: 'auto',
    paddingHorizontal: 24, 
    paddingVertical: 10, 
    borderRadius: 8,
    marginBottom: 0,
  },
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
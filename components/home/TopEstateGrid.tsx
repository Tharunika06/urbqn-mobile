// components/home/TopEstateGrid.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Property, TopEstateGridProps } from '../../types/index';
import { 
  getImageSource, 
  renderPrice, 
  getPropertyId, 
  formatPropertyForNavigation,
  filterAvailableProperties 
} from '../../utils/property.utils';
import GradientButton from '../Button/GradientButton';
import { useFavorites } from '../context/FavoriteContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TopEstateGrid({ properties }: TopEstateGridProps) {
  const navigation = useNavigation<NavigationProp>();
  const { favorites, toggleFavorite } = useFavorites();
  const [showAll, setShowAll] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingProperties(false), 500);
    return () => clearTimeout(timer);
  }, [properties]);

  const availableProperties = filterAvailableProperties(properties);

  const renderPriceLabel = (property: Property) => {
    const priceDisplay = renderPrice(property);
    
    if (priceDisplay.amount === 'SOLD') {
      return <Text style={[styles.priceText, styles.soldText]}>SOLD</Text>;
    }

    return (
      <Text style={styles.priceText}>
        {priceDisplay.amount}
        {priceDisplay.unit && <Text style={styles.priceUnit}>{priceDisplay.unit}</Text>}
      </Text>
    );
  };

  if (isLoadingProperties) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#1a73e8" />
        <Text style={styles.loadingText}>Loading properties...</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Top Estates</Text>
        <Pressable onPress={() => setShowAll(!showAll)}>
          <Text style={styles.seeAll}>{showAll ? 'See less' : 'See all'}</Text></Pressable>
      </View>

      {availableProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="home-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No properties available at the moment</Text>
          <Text style={styles.emptySubtext}>Check back later for new listings</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {(showAll ? availableProperties : availableProperties.slice(0, 4)).map((property, index) => {
            const safeId = getPropertyId(property, index);
            const isFavorited = favorites.includes(safeId);
            const imageSource = getImageSource(property.photo);

            return (
              <Pressable
                key={`property-${safeId}`}
                style={styles.card}
                onPress={() => {
                  navigation.navigate('auth/Estate/EstateDetails', {
                    property: formatPropertyForNavigation(property, index),
                  });
                }}
              >
                <View style={styles.imageWrap}>
                  <Image
                    source={imageSource}
                    style={styles.image}
                    defaultSource={require('../../assets/images/placeholder.png')}
                  />
                  
                  <Pressable
                    onPress={() => {
                      const propertyWithId = {
                        ...property,
                        _id: (property._id || property.id)?.toString(),
                        id: property.id || property._id,
                      };
                      toggleFavorite(propertyWithId);
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

                  <View style={styles.priceTag}>
                    <GradientButton
                      onPress={() => {}}
                      colors={['#0075FF', '#4C9FFF']}
                      label={renderPriceLabel(property)}
                      buttonStyle={{
                        width: 'auto',
                        minWidth: 90,
                        height: 35,
                        paddingHorizontal: 12,
                        marginRight: -10,
                        marginBottom: -8,
                        borderRadius: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  </View>
                </View>
                <Text style={styles.propertyTitle} numberOfLines={1}>
                  {property.name}
                </Text>
                <Text style={styles.propertyMeta}>
                  <Text>
                    <Text style={{ color: '#ffc107' }}>★ </Text>
                    <Text style={{ color: '#53587A' }}>{property.rating || '4.9'}</Text>
                  </Text>
                  <Ionicons name="location-sharp" size={12} color="#858585" style={{ marginLeft: 8 }} />
                  <Text style={styles.locationText}>{property.country}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 18, fontFamily: 'Montserrat_700Bold' },
  seeAll: { fontSize: 13, color: '#1a73e8', fontFamily: 'Montserrat_600SemiBold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  card: { width: '48%', backgroundColor: '#F5F4F8', borderRadius: 16, paddingBottom: 10, marginBottom: 16, overflow: 'hidden', elevation: 1 },
  imageWrap: { width: '95%', height: 160, marginLeft: 4, marginRight: 8, marginTop: 8, position: 'relative', borderRadius: 16, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  favoriteBtn: { position: 'absolute', top: 8, right: 8, borderRadius: 20, overflow: 'hidden', zIndex: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3 },
  gradientContainer: { width: 32, height: 32, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  whiteContainer: { width: 32, height: 32, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  maskContainer: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  gradientHeart: { width: 32, height: 32 },
  priceTag: { position: 'absolute', bottom: 8, right: 8, zIndex: 2 },
  priceText: { color: '#fff', fontSize: 12.5, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  soldText: { fontSize: 11, fontWeight: '700' },
  priceUnit: { fontSize: 8, fontWeight: '500', fontFamily: 'Montserrat_500Medium' },
  propertyTitle: { fontSize: 14.7, fontWeight: '600', marginTop: 8, marginHorizontal: 12, color: '#252B5C', fontFamily: 'Montserrat_700Bold' },
  propertyMeta: { fontSize: 12, marginTop: 4, marginHorizontal: 12, fontFamily: 'Montserrat_400Regular', fontWeight: '600', alignItems: 'center' },
  locationText: { color: '#888', fontSize: 12 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { marginLeft: 8, color: '#666', fontFamily: 'Montserrat_400Regular' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, color: '#999', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
  emptySubtext: { marginTop: 4, color: '#ccc', fontSize: 12, fontFamily: 'Montserrat_400Regular' },
});
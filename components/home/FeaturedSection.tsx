// components/home/FeaturedSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Property } from '../../types/index';
import { fetchFeaturedProperties } from '../../services/api.service';
import { getImageSource, renderPrice, getPropertyId, formatPropertyForNavigation } from '../../utils/property.utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FeaturedSectionProps {
  limit?: number;
}

export default function FeaturedSection({ limit = 10 }: FeaturedSectionProps) {
  const navigation = useNavigation<NavigationProp>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchFeaturedProperties(limit);
    setProperties(result.properties);
    setError(result.error);
    setLoading(false);
  };

  const handleSeeAll = () => setShowAll(!showAll);

  const handlePropertyPress = (property: Property, index: number) => {
    navigation.navigate('auth/Estate/EstateDetails', {
      property: formatPropertyForNavigation(property, index),
    });
  };

  const getDisplayProperties = () => {
    if (properties.length <= 2) return properties;
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
          <Pressable onPress={loadProperties} style={styles.retryBtn}>
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
          const safeId = getPropertyId(property, index);
          const imageSource = getImageSource(property.photo);
          const priceDisplay = renderPrice(property);

          return (
            <Pressable 
              key={`featured-${safeId}`} 
              style={styles.card}
              onPress={() => handlePropertyPress(property, index)}
            >
              <Image 
                source={imageSource} 
                style={styles.image}
                onError={() => console.warn('Failed to load featured image for:', property.name)}
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
                  {priceDisplay.unit && <Text style={styles.priceUnit}> {priceDisplay.unit}</Text>}
                </Text>
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
        <Text style={styles.title}>Featured</Text>
        {properties.length > 2 && (
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
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontWeight: '600', fontSize: 18, fontFamily: 'Montserrat_700Bold' },
  seeAll: { color: '#1a73e8', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  centerContainer: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#858585', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
  errorText: { marginTop: 12, color: '#ef4444', fontSize: 14, textAlign: 'center', fontFamily: 'Montserrat_400Regular' },
  emptyText: { marginTop: 12, color: '#858585', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
  retryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#1a73e8', borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat_600SemiBold' },
  card: { width: 220, height: 300, marginRight: 16, borderRadius: 24, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%', position: 'absolute' },
  ratingBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#fff', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 14, elevation: 2 },
  ratingText: { fontSize: 12, color: '#4C9FFF', fontWeight: '600', fontFamily: 'Montserrat_400Regular' },
  overlay: { position: 'absolute', bottom: 0, width: '100%', padding: 12, backgroundColor: '#00000032' },
  propertyTitle: { color: '#fff', fontSize: 14, fontWeight: '600', fontFamily: 'Montserrat_700Bold' },
  location: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Montserrat_400Regular' },
  price: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat_600SemiBold' },
  priceAmount: { fontSize: 16, color: '#fff', fontFamily: 'Montserrat_600SemiBold' },
  priceUnit: { fontSize: 13, color: '#f1f1f1' },
});
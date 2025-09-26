// urban/app/auth/Estate/EstateDetails.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types/navigation';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../../components/context/FavoriteContext';
import TransactionHandler from '../../../components/Estate/TransactionHandler';
import { Ionicons } from '@expo/vector-icons';
import PropertyHeader from '../../../components/Estate/PropertyHeader';
import PropertyImageGallery from '../../../components/Estate/PropertyImageGallery';
import PropertyModeSelector from '../../../components/Estate/PropertyModeSelector';
import PropertyOwnerCard from '../../../components/Estate/PropertyOwnerCard';
import PropertyFacilities from '../../../components/Estate/PropertyFacilities';
import LocationSection from '../../../components/Estate/LocationSection';
import ReviewsSection from '../../../components/Estate/ReviewsSection';

const API_BASE_URL = 'http://192.168.0.152:5000';

type EstateDetailsRouteProp = RouteProp<RootStackParamList, 'auth/Estate/EstateDetails'>;

export interface Review {
  _id: string | number;
  propertyId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type EstateDetailsProps = {
    property: {
    _id: string | number;
    name: string;
    location: string;
    address: string;
    ownerId: string | number;
    ownerName: string;
    photo: string;
    status?: string;
    rentPrice?: string | number;
    salePrice?: string | number;
    price?: string | number; 
    country?: string;
    facility?: string[];
    rating?: number;
    // Add other properties that may exist on your object
    [key: string]: any;
  };
};

const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};

export default function EstateDetails() {
  const route = useRoute<EstateDetailsRouteProp>();
  const navigation = useNavigation();
  const { property } = route.params;
  const router = useRouter();

  const { favorites, toggleFavorite } = useFavorites();
  const [displayMode, setDisplayMode] = useState<'rent' | 'sale' | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const propertyId = property._id ?? property.name;
  const isFavorite = favorites.includes(String(propertyId));

  const getImageSrc = (photo: string | any) => {
    if (photo && typeof photo === 'string' && photo.startsWith('data:image/')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('/uploads/')) {
      return { uri: `${API_BASE_URL}${photo}` };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('http')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'object') {
      return photo;
    }
    return require('../../../assets/images/placeholder.png');
  };

  useEffect(() => {
    const initialMode = property.status?.toLowerCase();
    if (initialMode === 'rent' || initialMode === 'sale') {
      setDisplayMode(initialMode);
    } else {
      if (parsePrice(property.rentPrice) !== null) {
        setDisplayMode('rent');
      } else if (parsePrice(property.salePrice) !== null) {
        setDisplayMode('sale');
      }
    }
    fetchReviews();
  }, [property]);

  const fetchReviews = async () => {
    if (!property._id) return;
    setLoadingReviews(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${property._id}`);
      if (response.ok) {
        const reviewData = await response.json();
        setReviews(reviewData);
        if (reviewData.length > 0) {
          const totalRating = reviewData.reduce((sum: number, review: Review) => sum + review.rating, 0);
          setAverageRating(totalRating / reviewData.length);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const parsePrice = (price: string | number | null | undefined): number | null => {
    if (price === null || price === undefined || price === '') return null;
    if (typeof price === 'number') return price;
    const cleanPrice = String(price).replace(/[^0-9.-]+/g, '');
    const numericPrice = parseFloat(cleanPrice);
    return !isNaN(numericPrice) ? numericPrice : null;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const renderStars = (rating: number, size = 14) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name="star"
          size={size}
          color={i <= rating ? "#FFC700" : "#C8C8C8"}
        />
      );
    }
    return stars;
  };

  const getDisplayData = () => {
    if (displayMode === 'rent') {
      const rentPrice = parsePrice(property.rentPrice);
      if (rentPrice !== null) return { statusText: 'For Rent', priceText: `₹ ${formatPrice(rentPrice)} /month`, isValid: true };
      return { statusText: 'For Rent', priceText: 'Not available for rent', isValid: false };
    }
    if (displayMode === 'sale') {
      const salePrice = parsePrice(property.salePrice);
      if (salePrice !== null) return { statusText: 'For Sale', priceText: `₹ ${formatPrice(salePrice)}`, isValid: true };
      return { statusText: 'For Sale', priceText: 'Not available for sale', isValid: false };
    }
    return { statusText: '', priceText: 'Select an option', isValid: false };
  };

  const handleViewOnMap = () => {
    if (!property) {
      Alert.alert('Error', 'Property data is not available');
      return;
    }
    try {
      const propertyForMap = {
        _id: property._id,
        name: property.name || 'Property',
        address: property.address || property.location || '',
        location: property.location || property.address || '',
      };
      router.push({
        pathname: '/auth/Estate/EstateLocation',
        params: { property: JSON.stringify(propertyForMap) }
      });
    } catch (error) {
      console.error('Error preparing property data for map:', error);
      Alert.alert('Error', 'Failed to prepare property data for map');
    }
  };

  const handleToggleFavorite = () => {
    const propertyForFavorites = {
      ...property,
      _id: String(property._id),
      ownerId: String(property.ownerId || ''),
      price: property.price ? String(property.price) : undefined,
      country: property.country ?? 'Unknown',
      facility: property.facility ?? [],
      rentPrice: property.rentPrice ? String(property.rentPrice) : undefined,
      salePrice: property.salePrice ? String(property.salePrice) : undefined,
      rating: property.rating ?? 0,
    };
    toggleFavorite(propertyForFavorites);
  };

  const { statusText, priceText, isValid } = getDisplayData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.headerGalleryContainer}>
          <PropertyHeader
            property={property}
            isFavorite={isFavorite}
            handleToggleFavorite={handleToggleFavorite}
            getImageSrc={getImageSrc}
          />
          <PropertyImageGallery averageRating={averageRating} />
        </View>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.title}>{property.name}</Text>
            <Text style={[textStyle, styles.location]}>📍 {property.location}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {statusText ? (
              <View style={[styles.statusBadge, displayMode === 'rent' ? styles.statusBadgeRent : styles.statusBadgeSale]}>
                <Text style={[styles.statusBadgeText, displayMode === 'rent' ? { color: '#3a974c' } : { color: '#1a73e8' }]}>
                  {statusText}
                </Text>
              </View>
            ) : null}
            <Text style={[styles.price, !isValid && styles.priceUnavailable]}>{priceText}</Text>
          </View>
        </View>

        <PropertyModeSelector
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
        />
        <PropertyOwnerCard ownerName={property.ownerName} />
        <PropertyFacilities facilities={property.facility} />
        <LocationSection
          address={property.address}
          handleViewOnMap={handleViewOnMap}
        />
        <ReviewsSection
          reviews={reviews}
          loadingReviews={loadingReviews}
          averageRating={averageRating}
          formatDate={formatDate}
          renderStars={renderStars}
        />
        <TransactionHandler
          property={property}
          displayMode={displayMode}
          isValid={isValid}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { backgroundColor: '#fff', flex: 1 },
  headerGalleryContainer: { position: 'relative' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginBottom: 4 },
  statusBadgeRent: { backgroundColor: '#e7f4e9' },
  statusBadgeSale: { backgroundColor: '#eaf4ff' },
  statusBadgeText: { fontSize: 12, fontFamily: 'Montserrat_600SemiBold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_700Bold', color: '#1a2238', maxWidth: 250 },
  price: { fontSize: 15, fontWeight: '600', color: '#1a2238', fontFamily: 'Montserrat_700Bold' },
  priceUnavailable: { color: '#999', fontStyle: 'italic', fontSize: 14 },
  location: { color: '#888', marginTop: 4, fontSize: 13 },
});
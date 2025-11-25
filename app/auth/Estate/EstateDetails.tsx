// urban/app/auth/Estate/EstateDetails.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Text,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types/navigation';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../../components/context/FavoriteContext';
import { usePopup } from '../../../components/context/PopupContext';
import { Ionicons } from '@expo/vector-icons';

// Components
import TransactionHandler from '../../../components/Estate/TransactionHandler';
import PropertyHeader from '../../../components/Estate/PropertyHeader';
import PropertyModeSelector from '../../../components/Estate/PropertyModeSelector';
import PropertyOwnerCard from '../../../components/Estate/PropertyOwnerCard';
import PropertyFacilities from '../../../components/Estate/PropertyFacilities';
import LocationSection from '../../../components/Estate/LocationSection';
import ReviewsSection from '../../../components/Estate/ReviewsSection';
import { BASE_URL } from '@/services/api.service';

// Services
import {
  fetchPropertyReviews,
  checkPendingReview,
  dismissPendingReviewPopup,
  deletePendingReview,
  getUserLocation,
  geocodeAddress,
  getCustomerIdentifier,
} from '../../../services/estateService';

// Utils
import {
  parsePrice,
  formatPrice,
  formatDate,
  calculateDistance,
  formatDistance,
  getImageSrc,
  calculateAverageRating,
} from '../../../utils/estateUtils';

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
  const { showError, showWarning } = usePopup();

  const { favorites, toggleFavorite } = useFavorites();
  const [displayMode, setDisplayMode] = useState<'rent' | 'sale' | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Distance calculation states
  const [propertyDistance, setPropertyDistance] = useState<string | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  // Pending review states
  const [pendingReviewInfo, setPendingReviewInfo] = useState<{
    hasPendingReview: boolean;
    customerInfo: any;
  } | null>(null);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  const propertyId = property._id ?? property.name;
  const isFavorite = favorites.includes(String(propertyId));

  // Calculate distance to property
  const calculatePropertyDistance = async () => {
    if (!property._id || !property.location) {
      return;
    }
    
    setCalculatingDistance(true);
    
    try {
      const userLocation = await getUserLocation();
      if (!userLocation) {
        console.log('Could not get user location');
        setCalculatingDistance(false);
        return;
      }

      const propertyCoords = await geocodeAddress(property.address || property.location);
      if (!propertyCoords) {
        setCalculatingDistance(false);
        return;
      }

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        propertyCoords.latitude,
        propertyCoords.longitude
      );

      const formattedDistance = formatDistance(distance);
      setPropertyDistance(formattedDistance);

    } catch (error) {
      console.error('Error calculating distance:', error);
    } finally {
      setCalculatingDistance(false);
    }
  };

  // Check for pending reviews
  const checkForPendingReview = async () => {
    try {
      const { identifier, phone, email, name } = await getCustomerIdentifier();
      
      if (!identifier || !property._id) {
        console.log('No customer identifier or property ID found');
        return;
      }

      console.log('Checking for pending review...');

      const data = await checkPendingReview(property._id, identifier);
      console.log('Pending review check response:', data);

      if (data.hasPendingReview) {
        setPendingReviewInfo({
          hasPendingReview: true,
          customerInfo: {
            phone,
            email,
            name: name || data.customerName || 'Anonymous'
          }
        });
        
        if (data.showPopup) {
          setShowReviewPrompt(true);
        }
      }
    } catch (error) {
      console.error('Error checking pending review:', error);
    }
  };

  // Handle review prompt actions
  const handleReviewPromptAction = async (action: 'review' | 'later' | 'dismiss') => {
    setShowReviewPrompt(false);
    
    if (action === 'review') {
      router.push({
        pathname: '/auth/Reviews/Review',
        params: {
          propertyId: String(property._id),
          propertyName: property.name,
          propertyImage: property.photo,
          propertyLocation: property.location,
          customerPhone: pendingReviewInfo?.customerInfo?.phone,
          customerEmail: pendingReviewInfo?.customerInfo?.email,
          customerName: pendingReviewInfo?.customerInfo?.name,
        }
      });
    } else if (action === 'later') {
      const { identifier } = await getCustomerIdentifier();
      if (identifier) {
        await dismissPendingReviewPopup(property._id, identifier);
      }
    } else if (action === 'dismiss') {
      const { identifier } = await getCustomerIdentifier();
      if (identifier) {
        await deletePendingReview(property._id, identifier);
      }
      setPendingReviewInfo(null);
    }
  };

  // Handle Add Comment button press
  const handleAddCommentPress = () => {
    router.push({
      pathname: '/auth/Reviews/Review',
      params: {
        propertyId: String(property._id),
        propertyName: property.name,
        propertyImage: property.photo,
        propertyLocation: property.location,
        customerPhone: pendingReviewInfo?.customerInfo?.phone,
        customerEmail: pendingReviewInfo?.customerInfo?.email,
        customerName: pendingReviewInfo?.customerInfo?.name,
      }
    });
  };

  // Review Prompt Modal
  const ReviewPromptModal = () => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      if (showReviewPrompt) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      } else {
        scaleAnim.setValue(0);
      }
    }, [showReviewPrompt]);

    return (
      <Modal transparent visible={showReviewPrompt} animationType="fade">
        <View style={reviewPromptStyles.overlay}>
          <Animated.View style={[reviewPromptStyles.container, { transform: [{ scale: scaleAnim }] }]}>
            <View style={reviewPromptStyles.iconCircle}>
              <Ionicons name="star" size={40} color="#FFC700" />
            </View>
            <Text style={reviewPromptStyles.title}>Share Your Experience</Text>
            <Text style={reviewPromptStyles.message}>
              You recently completed a transaction for this property. 
              Would you like to leave a review?
            </Text>
            
            <View style={reviewPromptStyles.buttonsContainer}>
              <Pressable 
                style={[reviewPromptStyles.button, reviewPromptStyles.dismissButton]} 
                onPress={() => handleReviewPromptAction('later')}
              >
                <Text style={reviewPromptStyles.dismissButtonText}>Not Now</Text>
              </Pressable>
              
              <Pressable 
                style={[reviewPromptStyles.button, reviewPromptStyles.reviewButton]} 
                onPress={() => handleReviewPromptAction('review')}
              >
                <Text style={reviewPromptStyles.reviewButtonText}>Write Review</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
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
    loadReviews();
    checkForPendingReview();
    calculatePropertyDistance();
  }, [property]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkForPendingReview();
      loadReviews();
      calculatePropertyDistance();
    });

    return unsubscribe;
  }, [navigation]);

  const loadReviews = async () => {
    if (!property._id) return;
    setLoadingReviews(true);
    try {
      const reviewData = await fetchPropertyReviews(property._id);
      setReviews(reviewData);
      setAverageRating(calculateAverageRating(reviewData));
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
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
      if (rentPrice !== null) return { statusText: 'For Rent', priceText: `₹ ${formatPrice(rentPrice)}/m`, isValid: true };
      return { statusText: 'For Rent', priceText: 'Not for rent ', isValid: false };
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
      showError('Error', 'Property data is not available');
      return;
    }
    
    try {
      const propertyForMap = {
        _id: property._id,
        name: property.name || 'Property',
        address: property.address || property.location || '',
        location: property.location || property.address || '',
      };

      if (!propertyForMap.address && !propertyForMap.location) {
        showWarning(
          'Location Not Available',
          'This property does not have location information. Please contact the property owner.'
        );
        return;
      }

      router.push({
        pathname: '/auth/Estate/EstateLocation',
        params: { property: JSON.stringify(propertyForMap) }
      });
      
    } catch (error) {
      console.error('Error preparing property data for map:', error);
      showError('Error', 'Failed to prepare property data for map');
    }
  };

  const handleToggleFavorite = async () => {
    try {
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
      
      await toggleFavorite(propertyForFavorites);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unable to update favorites. Please check your internet connection and try again.';
      
      showError('Connection Error', errorMessage);
    }
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
            getImageSrc={(photo) => getImageSrc(photo, BASE_URL)}
          />
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
          distance={propertyDistance}
          loadingDistance={calculatingDistance}
        />
        
        <ReviewsSection
          reviews={reviews}
          loadingReviews={loadingReviews}
          averageRating={averageRating}
          formatDate={formatDate}
          renderStars={renderStars}
          pendingReviewInfo={pendingReviewInfo}
          onAddCommentPress={handleAddCommentPress}
        />
        <TransactionHandler
          property={property}
          displayMode={displayMode}
          isValid={isValid}
        />
      </ScrollView>

      <ReviewPromptModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { backgroundColor: '#fff', flex: 1 },
  headerGalleryContainer: { position: 'relative' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginBottom: 4 },
  statusBadgeRent: { backgroundColor: '#e7f4e9'  },
  statusBadgeSale: { backgroundColor: '#eaf4ff' },
  statusBadgeText: { fontSize: 12, fontFamily: 'Montserrat_600SemiBold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_700Bold', color: '#1a2238', maxWidth: 250 },
  price: { fontSize: 15, fontWeight: '600', color: '#1a2238', fontFamily: 'Montserrat_700Bold' },
  priceUnavailable: { color: '#999', fontStyle: 'italic', fontSize: 14 },
  location: { color: '#888', marginTop: 4, fontSize: 13 },
});

const reviewPromptStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF9E6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontFamily: 'Montserrat_700Bold', color: '#1a2238', marginBottom: 12, textAlign: 'center' },
  message: { fontSize: 15, fontFamily: 'Montserrat_400Regular', color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22, paddingHorizontal: 10 },
  buttonsContainer: { flexDirection: 'row', width: '100%', gap: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  dismissButton: { backgroundColor: '#f3f3f3', borderWidth: 1, borderColor: '#e0e0e0' },
  dismissButtonText: { color: '#666', fontSize: 16, fontFamily: 'Montserrat_600SemiBold' },
  reviewButton: { backgroundColor: '#1a73e8' },
  reviewButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat_600SemiBold' },
});
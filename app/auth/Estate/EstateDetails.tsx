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
import TransactionHandler from '../../../components/Estate/TransactionHandler';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropertyHeader from '../../../components/Estate/PropertyHeader';
import PropertyImageGallery from '../../../components/Estate/PropertyImageGallery';
import PropertyModeSelector from '../../../components/Estate/PropertyModeSelector';
import PropertyOwnerCard from '../../../components/Estate/PropertyOwnerCard';
import PropertyFacilities from '../../../components/Estate/PropertyFacilities';
import LocationSection from '../../../components/Estate/LocationSection';
import ReviewsSection from '../../../components/Estate/ReviewsSection';

const API_BASE_URL = 'http://192.168.1.45:5000';

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

interface PopupProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning';
}

const CustomPopup: React.FC<PopupProps> = ({ visible, title, message, onClose, type = 'error' }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      default:
        return '#F44336';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={popupStyles.overlay}>
        <Animated.View style={[popupStyles.container, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[popupStyles.iconCircle, { backgroundColor: getIconColor() }]}>
            <Text style={popupStyles.iconText}>
              {type === 'success' ? '✓' : type === 'warning' ? '!' : '✕'}
            </Text>
          </View>
          <Text style={popupStyles.title}>{title}</Text>
          <Text style={popupStyles.message}>{message}</Text>
          <Pressable style={popupStyles.button} onPress={onClose}>
            <Text style={popupStyles.buttonText}>OK</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
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
  const [popup, setPopup] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
    onCloseAction?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  // Pending review states
  const [pendingReviewInfo, setPendingReviewInfo] = useState<{
    hasPendingReview: boolean;
    customerInfo: any;
  } | null>(null);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  const propertyId = property._id ?? property.name;
  const isFavorite = favorites.includes(String(propertyId));

  const showPopup = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' = 'error',
    onCloseAction?: () => void
  ) => {
    setPopup({ visible: true, title, message, type, onCloseAction });
  };

  const closePopup = () => {
    const action = popup.onCloseAction;
    setPopup({ visible: false, title: '', message: '', type: 'error' });
    if (action) action();
  };

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

  // Check for pending reviews
  const checkForPendingReview = async () => {
    try {
      // Get customer identifier from AsyncStorage (phone or email)
      const customerPhone = await AsyncStorage.getItem('customerPhone');
      const customerEmail = await AsyncStorage.getItem('customerEmail');
      const customerName = await AsyncStorage.getItem('customerName');
      
      const customerIdentifier = customerPhone || customerEmail;
      
      if (!customerIdentifier || !property._id) {
        console.log('🔍 No customer identifier or property ID found');
        return;
      }

      console.log('🔍 Checking for pending review...');
      console.log('   Property ID:', property._id);
      console.log('   Customer:', customerIdentifier);

      const response = await fetch(
        `${API_BASE_URL}/api/reviews/pending/${property._id}/${encodeURIComponent(customerIdentifier)}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pending review check response:', data);

        if (data.hasPendingReview) {
          setPendingReviewInfo({
            hasPendingReview: true,
            customerInfo: {
              phone: customerPhone,
              email: customerEmail,
              name: customerName || data.customerName || 'Anonymous'
            }
          });
          
          // Only show popup if not dismissed before
          if (data.showPopup) {
            setShowReviewPrompt(true);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking pending review:', error);
    }
  };

  // Handle review prompt actions
  const handleReviewPromptAction = async (action: 'review' | 'later' | 'dismiss') => {
    setShowReviewPrompt(false);
    
    if (action === 'review') {
      // Navigate to review screen with customer info
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
      // Mark popup as dismissed but keep pending review active
      try {
        const customerPhone = await AsyncStorage.getItem('customerPhone');
        const customerEmail = await AsyncStorage.getItem('customerEmail');
        const customerIdentifier = customerPhone || customerEmail;

        if (customerIdentifier) {
          await fetch(
            `${API_BASE_URL}/api/reviews/pending/dismiss-popup`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                propertyId: property._id,
                customerIdentifier: customerIdentifier,
              })
            }
          );
          console.log('✅ Popup dismissed, pending review still active');
        }
      } catch (error) {
        console.error('❌ Error dismissing popup:', error);
      }
    } else if (action === 'dismiss') {
      // Delete the pending review completely
      deletePendingReview();
      setPendingReviewInfo(null);
    }
  };

  // Delete pending review
  const deletePendingReview = async () => {
    try {
      const customerPhone = await AsyncStorage.getItem('customerPhone');
      const customerEmail = await AsyncStorage.getItem('customerEmail');
      const customerIdentifier = customerPhone || customerEmail;

      if (!customerIdentifier) return;

      await fetch(
        `${API_BASE_URL}/api/reviews/pending/${property._id}/${encodeURIComponent(customerIdentifier)}`,
        { method: 'DELETE' }
      );
      
      console.log('✅ Pending review deleted');
    } catch (error) {
      console.error('❌ Error deleting pending review:', error);
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
    fetchReviews();
    checkForPendingReview(); // Check for pending reviews on mount
  }, [property]);

  // Re-check pending review when returning from review screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkForPendingReview();
      fetchReviews();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchReviews = async () => {
    if (!property._id) return;
    setLoadingReviews(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/property/${property._id}`);
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
      showPopup('Error', 'Property data is not available', 'error');
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
      showPopup('Error', 'Failed to prepare property data for map', 'error');
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
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unable to update favorites. Please check your internet connection and try again.';
      
      showPopup(
        'Connection Error',
        errorMessage,
        'error'
      );
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
            getImageSrc={getImageSrc}
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

      <CustomPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={closePopup}
      />

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

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a2238',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#6c6c6c',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#1a2238',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});

const reviewPromptStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a2238',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: '#f3f3f3',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dismissButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  reviewButton: {
    backgroundColor: '#1a73e8',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
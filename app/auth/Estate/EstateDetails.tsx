// urban/app/auth/Estate/EstateDetails.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../../types/navigation';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFavorites } from '../../../components/context/FavoriteContext';
import TransactionHandler from './TransactionHandler';

const mapPreview = require('../../../assets/images/map.png');
const thumb3 = require('../../../assets/images/thumb3.png');
const thumbnailImages = [
  require('../../../assets/images/thumb1.png'),
  require('../../../assets/images/thumb2.png'),
];
const icons = {
  backArrow: require('../../../assets/icons/back-arrow.png'),
};
const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};

const API_BASE_URL = 'http://192.168.0.152:5000';

type EstateDetailsRouteProp = RouteProp<RootStackParamList, 'auth/Estate/EstateDetails'>;

interface Review {
  _id: string | number;
  propertyId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function EstateDetails() {
  const route = useRoute<EstateDetailsRouteProp>();
  const navigation = useNavigation();
  const { property } = route.params;
  const router = useRouter();

  // Use the global favorites context instead of local state
  const { favorites, toggleFavorite } = useFavorites();
  const [displayMode, setDisplayMode] = useState<'rent' | 'sale' | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Check if current property is favorited - Fix: Use _id instead of id
  const propertyId = property._id ?? property.name;
  const isFavorite = favorites.includes(String(propertyId)); // Convert to string for consistency

  // Function to get the correct image source (same as TopEstateGrid)
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
    return require('../../../assets/images/placeholder.png'); // Fallback placeholder
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

      console.log('Navigating to map with property:', propertyForMap);

      router.push({
        pathname: '/auth/Estate/EstateLocation',
        params: { 
          property: JSON.stringify(propertyForMap)
        }
      });
    } catch (error) {
      console.error('Error preparing property data for map:', error);
      Alert.alert('Error', 'Failed to prepare property data for map');
    }
  };

  // Fix: Create a handler for toggle favorite that ensures type compatibility
  // Fix: Create a handler for toggle favorite that ensures type compatibility

  // Create a property object that matches the expected Property type
  // Fix: Create a handler for toggle favorite that ensures type compatibility
const handleToggleFavorite = () => {
  // Create a property object that matches the expected Property type
  const propertyForFavorites = {
    ...property,
_id: String(property._id), // Ensure _id is always a string  // Convert ownerId to string
ownerId: String(property.ownerId || ''),
    price: property.price ? String(property.price) : undefined, // Convert price to string
    country: property.country ?? 'Unknown', // Provide default country if undefined
    facility: property.facility ?? [],
    rentPrice: property.rentPrice ? String(property.rentPrice) : undefined, // Convert rentPrice to string
    salePrice: property.salePrice ? String(property.salePrice) : undefined, // Convert salePrice to string
    rating: property.rating ?? 0, // Provide default rating of 0 if undefined
  };
  toggleFavorite(propertyForFavorites);
};
  
  const { statusText, priceText, isValid } = getDisplayData();

  // Get the proper image source
  const imageSource = getImageSrc(property.photo);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={imageSource}
            style={styles.mainImage}
            onError={() => {
              console.warn('Failed to load property image for:', property.name);
            }}
            defaultSource={require('../../../assets/images/placeholder.png')}
          />
          <View style={styles.imageTopRow}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
              <Image source={icons.backArrow} style={styles.icon} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.iconCircle}>
                <Feather name="upload" size={18} color="#1a2238" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconCircle, isFavorite && styles.activeFav]}
                onPress={handleToggleFavorite} // Use the new handler
              >
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? '#fff' : '#1a2238'} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.verticalThumbnailContainer}>
            {thumbnailImages.map((img, index) => (
              <Image key={index} source={img} style={styles.thumbImageVertical} />
            ))}
            <ImageBackground source={thumb3} style={styles.moreThumbsVertical} imageStyle={styles.thumbImageVertical}>
              <Text style={styles.moreText}>+3</Text>
            </ImageBackground>
          </View>
          <View style={styles.bottomLeftBadges}>
            <View style={[styles.ratingBadge, { backgroundColor: '#1a73e8' }]}>
              <Text style={[textStyle,styles.badgeText, { color: '#fff' }]}>
                ⭐ {averageRating > 0 ? averageRating.toFixed(1) : '4.9'}
              </Text>
            </View>
            <View style={[styles.ratingBadge, { backgroundColor: '#1a73e8' }]}>
              <Text style={[textStyle,styles.badgeText, { color: '#fff' }]}>Apartment</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.title}>{property.name}</Text>
            <Text style={[textStyle,styles.location]}>📍 {property.location}</Text>
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

        <View style={styles.rentBuyRow}>
          <View style={styles.leftButtons}>
            <TouchableOpacity style={[styles.rentBtn, displayMode === 'rent' ? styles.activeStatusBtn : styles.inactiveStatusBtn]} onPress={() => setDisplayMode('rent')}>
              <Text style={[displayMode === 'rent' ? styles.activeStatusText : styles.inactiveStatusText]}>Rent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buyBtn, displayMode === 'sale' ? styles.activeStatusBtn : styles.inactiveStatusBtn]} onPress={() => setDisplayMode('sale')}>
              <Text style={[displayMode === 'sale' ? styles.activeStatusText : styles.inactiveStatusText]}>Buy</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Image source={require('../../../assets/icons/360.png')} style={styles.circleImage} />
          </TouchableOpacity>
        </View>

        <View style={styles.agentBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.agentName}>{property.ownerName}</Text>
            <Text style={[textStyle, styles.agentRole]}>Property Owner</Text>
          </View>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#999" />
        </View>

        <View style={styles.featuresRow}>
          {property.facility && Array.isArray(property.facility) && property.facility.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {property.facility.map((facility, index) => {
                let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] = 'home-city-outline';
                const lowerCaseFacility = facility.toLowerCase();
                if (lowerCaseFacility.includes('pool')) iconName = 'pool';
                else if (lowerCaseFacility.includes('airport')) iconName = 'airplane';
                else if (lowerCaseFacility.includes('water')) iconName = 'water-pump';
                else if (lowerCaseFacility.includes('parking')) iconName = 'parking';
                else if (lowerCaseFacility.includes('ac') || lowerCaseFacility.includes('air condition')) iconName = 'air-conditioner';
                else if (lowerCaseFacility.includes('gym')) iconName = 'weight-lifter';
                else if (lowerCaseFacility.includes('wifi')) iconName = 'wifi';
                else if (lowerCaseFacility.includes('bed')) iconName = 'bed-outline';
                else if (lowerCaseFacility.includes('bath')) iconName = 'bathtub-outline';
                else if (lowerCaseFacility.includes('electricity')) iconName = 'lightning-bolt';
                return (
                  <View key={index} style={styles.facilityBox}>
                    <MaterialCommunityIcons name={iconName} size={18} color="#e91e63" style={{ marginRight: 4 }} />
                    <Text style={styles.facilityText}>{facility}</Text>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.noFacilitiesText}>No facilities listed.</Text>
          )}
        </View>

        <View style={styles.detailsBox}>
          <Text style={styles.detailsLabel}>Location & Public Facilities</Text>
          <View style={styles.locationCard}>
            <View style={styles.addressRow}>
              <Image source={require('../../../assets/icons/location-pin.png')} style={styles.addressIcon} />
              <Text style={[textStyle,styles.addressText]}>{property.address}</Text>
            </View>
            <TouchableOpacity style={styles.distanceBox}>
              <Ionicons name="location" size={16} color="#f24e6f" />
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Text style={styles.distanceValue}>2.5 km </Text>
                <Text style={styles.distanceDesc}>from your location</Text>
              </View>
              <Feather name="chevron-down" size={16} color="#1a2238" />
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facilityScroll}>
              <View style={styles.facilityPill}><Text style={[textStyle,styles.pillText]}>2 Hospital</Text></View>
              <View style={styles.facilityPill}><Text style={[textStyle,styles.pillText]}>4 Gas stations</Text></View>
              <View style={styles.facilityPill}><Text style={[textStyle,styles.pillText]}>2 Schools</Text></View>
            </ScrollView>
          </View>
        </View>

        <View style={styles.mapWrapper}>
          <Image source={mapPreview} style={styles.mapPreview} />
          <TouchableOpacity 
            style={styles.viewAllMapBtn} 
            onPress={handleViewOnMap}
          >
            <Text style={styles.viewAllMapText}>View all on map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reviewsSection}>
          <Text style={styles.detailsLabel}>Reviews</Text>
          
          {loadingReviews ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1a73e8" />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : (
            <>
              <View style={styles.ratingBox}>
                <View style={styles.leftRating}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={styles.starWrapper}>
                      <Ionicons name="star" size={30} color="#FFC700" />
                    </View>
                    <View>
                      <View style={styles.ratingStarsRow}>
                        {renderStars(Math.round(averageRating), 14)}
                        <Text style={styles.ratingNumber}> {averageRating > 0 ? averageRating.toFixed(1) : '4.9'}</Text>
                      </View>
                      <Text style={[textStyle,styles.ratingSubtitle]}>
                        From {reviews.length} reviewer{reviews.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.reviewAvatars}>
                  <Image source={require('../../../assets/images/user1.png')} style={styles.reviewerAvatar} />
                  <Image source={require('../../../assets/images/user2.png')} style={[styles.reviewerAvatar, { marginLeft: -10 }]} />
                  <Image source={require('../../../assets/images/user3.png')} style={[styles.reviewerAvatar, { marginLeft: -10 }]} />
                </View>
              </View>

              {reviews.length > 0 ? (
                <>
                  {reviews.slice(0, 3).map((review) => (
                    <View key={review._id} style={styles.reviewCard}>
                      <View style={styles.reviewerImageContainer}>
                        <View style={styles.reviewerImagePlaceholder}>
                          <Text style={styles.reviewerInitial}>
                            {review.customerName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.reviewerHeader}>
                          <Text style={styles.reviewerName}>{review.customerName}</Text>
                          <View style={styles.starsRow}>
                            {renderStars(review.rating, 14)}
                          </View>
                        </View>
                        <Text style={[textStyle,styles.reviewText]}>{review.comment}</Text>
                        <Text style={styles.reviewTime}>{formatDate(review.createdAt)}</Text>
                      </View>
                    </View>
                  ))}

                  {reviews.length > 3 && (
                    <TouchableOpacity style={styles.viewAllReviews} onPress={() => {
                      Alert.alert('All Reviews', `Total ${reviews.length} reviews available`);
                    }}>
                      <Text style={styles.viewAllReviewsText}>View all {reviews.length} reviews</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.noReviewsContainer}>
                  <Text style={styles.noReviewsText}>No reviews yet. Be the first to leave a review!</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Transaction Handler Component */}
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
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginBottom: 4 },
  statusBadgeRent: { backgroundColor: '#e7f4e9' },
  statusBadgeSale: { backgroundColor: '#eaf4ff' },
  statusBadgeText: { fontSize: 12, fontFamily: 'Montserrat_600SemiBold' },
  safeArea: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { backgroundColor: '#fff', flex: 1 },
  imageWrapper: { marginHorizontal: 16, marginTop: 16 },
  mainImage: { width: '100%', height: 550, borderRadius: 30 },
  imageTopRow: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  icon: { width: 16, height: 16, resizeMode: 'contain' },
  activeFav: { backgroundColor: '#f24e6f' },
  verticalThumbnailContainer: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#fff', borderRadius: 12, padding: 6, gap: 6, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  thumbImageVertical: { width: 62, height: 62, borderRadius: 10 },
  moreThumbsVertical: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 10 },
  moreText: { fontSize: 13, fontWeight: '700', color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  bottomLeftBadges: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', gap: 8 },
  ratingBadge: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#1a2238' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_700Bold', color: '#1a2238', maxWidth: 250 },
  price: { fontSize: 15, fontWeight: '600', color: '#1a2238', fontFamily: 'Montserrat_700Bold' },
  priceUnavailable: { color: '#999', fontStyle: 'italic', fontSize: 14 },
  location: { color: '#888', marginTop: 4, fontSize: 13 },
  rentBuyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 10 },
  leftButtons: { flexDirection: 'row', gap: 10 },
  rentBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  buyBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  activeStatusBtn: { backgroundColor: '#1a73e8' },
  inactiveStatusBtn: { backgroundColor: '#f3f3f3' },
  activeStatusText: { color: '#fff', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  inactiveStatusText: { color: '#1a2238', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  circleImage: { width: 44, height: 44, resizeMode: 'contain' },
  agentBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, margin: 16, borderRadius: 16, gap: 12 },
  agentName: { fontWeight: '600', fontSize: 14, fontFamily: 'Montserrat_600SemiBold' },
  agentRole: { fontSize: 12, color: '#888' },
  featuresRow: { flexDirection: 'row', paddingVertical: 8, marginLeft: 20 },
  facilityBox: { flexDirection: 'row', alignItems: 'center', marginRight: 12, paddingHorizontal: 9, paddingVertical: 9, backgroundColor: '#F5F4F8', borderRadius: 8 },
  facilityText: { fontSize: 13, color: '#3f3f46', fontFamily: 'Montserrat_600SemiBold' },
  noFacilitiesText: { color: '#333', fontStyle: 'italic' },
  detailsBox: { paddingHorizontal: 16, marginTop: 20 },
  detailsLabel: { fontWeight: '600', fontSize: 16, marginBottom: 12, color: '#1a2238', fontFamily: 'Montserrat_700Bold' },
  locationCard: { backgroundColor: '#f9f9f9', borderRadius: 16, padding: 16 },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addressIcon: { width: 16, height: 16, marginRight: 8, resizeMode: 'contain' },
  addressText: { color: '#6c757d', fontSize: 13, flex: 1, flexWrap: 'wrap' },
  distanceBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderColor: '#f1f1f1', borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  distanceValue: { color: '#252B5C', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  distanceDesc: { color: '#53587A', fontWeight: 'normal', fontFamily: 'Montserrat_400Regular' },
  facilityScroll: { flexDirection: 'row' },
  facilityPill: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: '#e9ecef' },
  pillText: { color: '#53587A', fontSize: 13, fontWeight: '600' },
  mapWrapper: { marginHorizontal: 16, marginTop: 12, alignItems: 'center' },
  mapPreview: { width: '100%', height: 160, borderRadius: 20 },
  viewAllMapBtn: { marginTop: 10 },
  viewAllMapText: { color: '#1a2238', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  reviewsSection: { paddingHorizontal: 10, marginTop: 24 },
  ratingBox: { backgroundColor: '#1a73e8', borderRadius: 20, padding: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftRating: { flex: 1 },
  starWrapper: { backgroundColor: '#4C9FFF', padding: 10, borderRadius: 14, marginBottom: 6, marginRight: 12 },
  ratingStarsRow: { flexDirection: 'row', alignItems: 'center' },
  ratingNumber: { color: '#fff', fontSize: 20, marginBottom: 2, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  ratingSubtitle: { color: '#dbe4f3', fontSize: 12, textAlign: 'center' },
  reviewAvatars: { flexDirection: 'row', alignItems: 'center' },
  reviewerAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#fff' },
  reviewCard: { backgroundColor: '#f9f9f9', borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, marginTop: 20 },
  reviewerImageContainer: { alignItems: 'center', justifyContent: 'center' },
  reviewerImagePlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a73e8', alignItems: 'center', justifyContent: 'center' },
  reviewerInitial: { color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  reviewerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewerName: { color: '#252B5C', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  starsRow: { flexDirection: 'row', gap: 1 },
  reviewText: { fontSize: 13, color: '#53587A', marginBottom: 8 },
  reviewTime: { fontSize: 11, color: '#9fa5c0' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  loadingText: { marginLeft: 8, color: '#666', fontFamily: 'Montserrat_400Regular' },
  noReviewsContainer: { backgroundColor: '#f9f9f9', borderRadius: 20, padding: 20, marginTop: 12, alignItems: 'center' },
  noReviewsText: { color: '#666', fontSize: 14, fontFamily: 'Montserrat_400Regular', textAlign: 'center' },
  viewAllReviews: { backgroundColor: '#1a73e8', padding: 14, alignItems: 'center', borderRadius: 12, marginTop: 10 },
  viewAllReviewsText: { color: '#fff', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
});
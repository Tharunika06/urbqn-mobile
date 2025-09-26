// urban/app/auth/Estate/ReviewsSection.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../app/auth/Estate/EstateDetails';

interface ReviewsSectionProps {
  reviews: Review[];
  loadingReviews: boolean;
  averageRating: number;
  formatDate: (date: string) => string;
  renderStars: (rating: number, size?: number) => React.JSX.Element[];
}

// Custom popup interface
interface PopupConfig {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  buttons: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};

export default function ReviewsSection({
  reviews,
  loadingReviews,
  averageRating,
  formatDate,
  renderStars,
}: ReviewsSectionProps) {
  // Custom popup state
  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: []
  });

  // Custom popup function to replace Alert.alert
  const showPopup = (
    title: string, 
    message: string, 
    buttons: PopupConfig['buttons'] = [{ text: 'OK', onPress: () => hidePopup() }],
    type: PopupConfig['type'] = 'info'
  ) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
      buttons
    });
  };

  const hidePopup = () => {
    setPopupConfig(prev => ({ ...prev, visible: false }));
  };

  // Get popup icon based on type
  const getPopupIcon = (type: PopupConfig['type']) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#4CAF50' };
      case 'error':
        return { name: 'close-circle' as const, color: '#f44336' };
      case 'warning':
        return { name: 'warning' as const, color: '#ff9800' };
      case 'info':
      default:
        return { name: 'information-circle' as const, color: '#1a73e8' };
    }
  };

  // Custom popup component
  const CustomPopup = () => {
    if (!popupConfig.visible) return null;
    
    const icon = getPopupIcon(popupConfig.type);
    
    return (
      <Modal visible={popupConfig.visible} transparent={true} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            <View style={styles.popupIconContainer}>
              <Ionicons name={icon.name} size={64} color={icon.color} />
            </View>
            <Text style={styles.popupTitle}>{popupConfig.title}</Text>
            <Text style={styles.popupMessage}>{popupConfig.message}</Text>
            
            <View style={styles.popupButtonsContainer}>
              {popupConfig.buttons.map((button, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.popupButton,
                    button.style === 'cancel' && styles.popupCancelButton,
                    button.style === 'destructive' && styles.popupDestructiveButton,
                    popupConfig.buttons.length > 1 && { flex: 1, marginHorizontal: 4 }
                  ]} 
                  onPress={button.onPress}
                >
                  <Text style={[
                    styles.popupButtonText,
                    button.style === 'cancel' && styles.popupCancelButtonText,
                    button.style === 'destructive' && styles.popupDestructiveButtonText
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleViewAllReviews = () => {
    showPopup(
      'All Reviews', 
      `Total ${reviews.length} reviews available. Here you can see all the reviews from customers who have used this property.`,
      [{ text: 'OK', onPress: hidePopup }],
      'info'
    );
  };

  return (
    <>
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
                    <Text style={[textStyle, styles.ratingSubtitle]}>
                      From {reviews.length} reviewer{reviews.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {reviews.length > 0 ? (
              <>
                {reviews.slice(0, 3).map((review) => (
                  <View key={review._id} style={styles.reviewCard}>
                    <View style={styles.reviewerImagePlaceholder}>
                      <Text style={styles.reviewerInitial}>
                        {review.customerName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.reviewerHeader}>
                        <Text style={styles.reviewerName}>{review.customerName}</Text>
                        <View style={styles.starsRow}>
                          {renderStars(review.rating, 14)}
                        </View>
                      </View>
                      <Text style={[textStyle, styles.reviewText]}>{review.comment}</Text>
                      <Text style={styles.reviewTime}>{formatDate(review.createdAt)}</Text>
                    </View>
                  </View>
                ))}

                {reviews.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllReviews}
                    onPress={handleViewAllReviews}
                  >
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

      {/* Custom Popup */}
      <CustomPopup />
    </>
  );
}

const styles = StyleSheet.create({
  reviewsSection: { paddingHorizontal: 10, marginTop: 24 },
  detailsLabel: { fontWeight: '600', fontSize: 16, marginBottom: 12, color: '#1a2238', fontFamily: 'Montserrat_700Bold' },
  ratingBox: { backgroundColor: '#1a73e8', borderRadius: 20, padding: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftRating: { flex: 1 },
  starWrapper: { backgroundColor: '#4C9FFF', padding: 10, borderRadius: 14, marginBottom: 6, marginRight: 12 },
  ratingStarsRow: { flexDirection: 'row', alignItems: 'center' },
  ratingNumber: { color: '#fff', fontSize: 20, marginBottom: 2, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  ratingSubtitle: { color: '#dbe4f3', fontSize: 12, textAlign: 'center' },
  reviewCard: { backgroundColor: '#f9f9f9', borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, marginTop: 20 },
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
  
  // Popup styles
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 280,
    maxWidth: 350,
  },
  popupIconContainer: {
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2238',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  popupButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  popupButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 100,
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  popupCancelButton: {
    backgroundColor: '#f3f3f3',
  },
  popupCancelButtonText: {
    color: '#666',
  },
  popupDestructiveButton: {
    backgroundColor: '#f44336',
  },
  popupDestructiveButtonText: {
    color: '#fff',
  },
});
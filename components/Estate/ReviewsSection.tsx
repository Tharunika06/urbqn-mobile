// urban/app/auth/Estate/ReviewsSection.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Review } from '../../app/auth/Estate/EstateDetails';

interface ReviewsSectionProps {
  reviews: Review[];
  loadingReviews: boolean;
  averageRating: number;
  formatDate: (date: string) => string;
  renderStars: (rating: number, size?: number) => React.JSX.Element[];
  pendingReviewInfo?: {
    hasPendingReview: boolean;
    customerInfo: any;
  } | null;
  onAddCommentPress?: () => void;
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
  pendingReviewInfo,
  onAddCommentPress,
}: ReviewsSectionProps) {
  // State for showing all reviews
  const [showAllReviews, setShowAllReviews] = useState(false);

  const handleToggleReviews = () => {
    setShowAllReviews(!showAllReviews);
  };

  // Check if button should be enabled
  const hasMoreThanThreeReviews = reviews.length > 1;
  
  // Get reviews to display
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 1);

  return (
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

          {/* Pending Review Add Comment Button */}
          {pendingReviewInfo?.hasPendingReview && onAddCommentPress && (
            <Pressable
              style={styles.addCommentCard}
              onPress={onAddCommentPress}
            >
              <View style={styles.addCommentIconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="#1a73e8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addCommentTitle}>Share Your Experience</Text>
                <Text style={styles.addCommentSubtitle}>
                  Tap to add your review for this property
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </Pressable>
          )}

          {reviews.length > 0 ? (
            <>
              {displayedReviews.map((review, index) => (
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

              {/* See All / See Less Button */}
              {hasMoreThanThreeReviews && (
                <View style={styles.viewAllButtonWrapper}>
                  <Pressable
                    onPress={handleToggleReviews}
                    style={styles.viewAllReviewsButton}
                  >
                    <Text style={styles.viewAllReviewsText}>
                      {showAllReviews 
                        ? 'Show less' 
                        : `View all ${reviews.length} reviews`
                      }
                    </Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noReviewsContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
              <Text style={styles.noReviewsText}>No reviews yet. Be the first to leave a review!</Text>
            </View>
          )}
        </>
      )}
    </View>
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
  
  // Add Comment Card Styles
  addCommentCard: {
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#d4e7ff',
    borderStyle: 'dashed',
  },
  addCommentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCommentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a2238',
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 4,
  },
  addCommentSubtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  
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
  noReviewsContainer: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: 20, 
    padding: 30, 
    marginTop: 12, 
    alignItems: 'center',
    gap: 12,
  },
  noReviewsText: { color: '#666', fontSize: 14, fontFamily: 'Montserrat_400Regular', textAlign: 'center' },
  
  // View All Button Styles
  viewAllButtonWrapper: {
    marginTop: 16,
    marginBottom: 0,
    paddingLeft: 6,
    paddingRight: 19
  },
  viewAllReviewsButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  viewAllReviewsText: { 
    color: '#666', 
    fontWeight: '600', 
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold' 
  },
  viewAllReviewsButtonDisabled: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllReviewsTextDisabled: {
    color: '#999',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
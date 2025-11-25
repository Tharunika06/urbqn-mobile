// app/Reviews/Review.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarRating from "../../../components/StarRating";
import { BASE_URL } from "../../../services/api.service";
import { usePopup } from "../../../components/context/PopupContext";

const API_URL = `${BASE_URL}/reviews`;

const ReviewScreen: React.FC = () => {
  const router = useRouter();
  const { 
    propertyId, 
    propertyName, 
    propertyImage, 
    propertyLocation,
    customerPhone: paramPhone,
    customerEmail: paramEmail,
    customerName: paramName
  } = useLocalSearchParams<{
    propertyId: string;
    propertyName?: string;
    propertyImage?: string;
    propertyLocation?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerName?: string;
  }>();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState({
    phone: '',
    email: '',
    name: ''
  });

  const { showWarning, showError, showSuccess, showCustom } = usePopup();

  useEffect(() => {
    loadCustomerInfo();
  }, []);

  const loadCustomerInfo = async () => {
    try {
      // First try to get from route params
      if (paramPhone || paramEmail || paramName) {
        const info = {
          phone: paramPhone || '',
          email: paramEmail || '',
          name: paramName || ''
        };
        setCustomerInfo(info);
        
        // Save to AsyncStorage for future use
        if (paramPhone) await AsyncStorage.setItem('customerPhone', paramPhone);
        if (paramEmail) await AsyncStorage.setItem('customerEmail', paramEmail);
        if (paramName) await AsyncStorage.setItem('customerName', paramName);
        
        return;
      }

      // Otherwise, try to get from AsyncStorage
      const phone = await AsyncStorage.getItem('customerPhone');
      const email = await AsyncStorage.getItem('customerEmail');
      const name = await AsyncStorage.getItem('customerName');
      
      if (phone || email) {
        const info = {
          phone: phone || '',
          email: email || '',
          name: name || ''
        };
        setCustomerInfo(info);
      } else {
        console.log('No customer info found');
      }
    } catch (error) {
      console.error('Error loading customer info:', error);
    }
  };

  const getImageSrc = () => {
    const photo = propertyImage;
    
    if (photo && typeof photo === 'string' && photo.startsWith('data:image/')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('/uploads/')) {
      return { uri: `${BASE_URL}${photo}` };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('http')) {
      return { uri: photo };
    }
    
    return require("../../../assets/images/main.png");
  };

  const markReviewPending = async () => {
    try {
      if (!customerInfo.phone) {
        console.log('No customer phone available, skipping pending review');
        return;
      }
      
      await axios.post(
        `${API_URL}/pending`,
        {
          propertyId,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email || null,
          customerName: customerInfo.name || 'Anonymous',
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Review marked as pending');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('No transaction found');
      } else {
        console.error("Failed to mark review as pending:", error.response?.data || error.message);
      }
    }
  };

  const handleCancel = () => {
    if (rating > 0 || comment.trim()) {
      showCustom(
        "Discard Review?",
        "You have unsaved changes. Are you sure you want to leave without saving?",
        [
          {
            text: 'Keep Editing',
            onPress: () => {},
            style: 'cancel'
          },
          {
            text: 'Review Later',
            onPress: async () => {
              await markReviewPending();
              router.back();
            },
            style: 'destructive'
          }
        ],
        'warning'
      );
    } else {
      markReviewPending().finally(() => router.back());
    }
  };

  const handleSubmit = async () => {
    // Validate rating
    if (rating === 0) {
      showWarning(
        "Rating Required",
        "Please select a star rating before submitting."
      );
      return;
    }

    // Validate comment
    if (!comment.trim()) {
      showWarning(
        "Comment Required",
        "Please write a brief comment about your experience."
      );
      return;
    }

    // Validate property ID
    if (!propertyId) {
      showError(
        "Error",
        "Property information is missing."
      );
      return;
    }

    // Validate customer info
    if (!customerInfo.phone) {
      showError(
        "Error",
        "Customer information is missing. Please complete a transaction first."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        API_URL,
        {
          propertyId,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email || null,
          customerName: customerInfo.name || 'Anonymous',
          rating,
          comment,
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Clear draft from AsyncStorage after successful submission
      const draftKey = `review_draft_${propertyId}_${customerInfo.phone}`;
      await AsyncStorage.removeItem(draftKey);

      showSuccess(
        "Success",
        "Thank you! Your review has been submitted.",
        () => router.back()
      );
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      
      let errorMessage = "We couldn't submit your review. Please try again later.";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your internet connection.";
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = "Network error. Please check if your backend server is running and accessible.";
      } else if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
      }
      
      showError(
        "Submission Error",
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = propertyName || "Property";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSrc()}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Property Info */}
        <View style={styles.card}>
          <Text style={styles.propertyName}>{displayName}</Text>
          {propertyLocation && (
            <Text style={styles.locationText}>📍 {propertyLocation}</Text>
          )}
          <Text style={styles.reviewersText}>⭐⭐ 4 + Reviews</Text>

          <Text style={styles.question}>How is your Experience?</Text>

          <StarRating rating={rating} onRatingChange={setRating} />

          <TextInput
            style={styles.commentInput}
            placeholder="Add detailed review..."
            multiline
            numberOfLines={6}
            value={comment}
            onChangeText={setComment}
            placeholderTextColor="#888"
          />

          {/* Button Container */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Review Later
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit Review</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f7fa",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#e6e6e6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  card: {
    marginTop: 30,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a2238",
    marginBottom: 4,
    fontFamily: "Montserrat_700Bold",
  },
  locationText: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
    fontFamily: "Montserrat_400Regular",
  },
  reviewersText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
    fontFamily: "Montserrat_400Regular",
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#1a2238",
    marginVertical: 16,
    fontFamily: "Montserrat_600SemiBold",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
    marginTop: 20,
    fontFamily: "Montserrat_400Regular",
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#1a73e8",
  },
  cancelButton: {
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonDisabled: {
    backgroundColor: "#a5b4fc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_700Bold",
  },
  cancelButtonText: {
    color: "#666",
  },
});
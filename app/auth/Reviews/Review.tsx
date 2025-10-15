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
  Modal,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "../../../components/StarRating"; // Adjust path

const API_BASE_URL = "http://192.168.0.154:5000";
const API_URL = `${API_BASE_URL}/api/reviews`;

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

const ReviewScreen: React.FC = () => {
  const router = useRouter();
  const { propertyId, propertyName, propertyImage, propertyLocation } = useLocalSearchParams<{
    propertyId: string;
    propertyName?: string;
    propertyImage?: string;
    propertyLocation?: string;
  }>();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: []
  });

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
                <Pressable
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
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const getImageSrc = () => {
    const photo = propertyImage;
    
    if (photo && typeof photo === 'string' && photo.startsWith('data:image/')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('/uploads/')) {
      return { uri: `${API_BASE_URL}${photo}` };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('http')) {
      return { uri: photo };
    }
    
    return require("../../../assets/images/main.png");
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showPopup(
        "Rating Required",
        "Please select a star rating before submitting.",
        [{ text: 'OK', onPress: hidePopup }],
        'warning'
      );
      return;
    }
    if (!comment.trim()) {
      showPopup(
        "Comment Required",
        "Please write a brief comment about your experience.",
        [{ text: 'OK', onPress: hidePopup }],
        'warning'
      );
      return;
    }
    if (!propertyId) {
      showPopup(
        "Error",
        "Property information is missing.",
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = "temp-user-id"; // replace with actual user logic

      const response = await axios.post(
        API_URL,
        {
          propertyId,
          userId,
          rating,
          comment,
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Review submitted successfully:', response.data);

      showPopup(
        "Success",
        "Thank you! Your review has been submitted.",
        [
          {
            text: 'OK',
            
            onPress: () => {
              hidePopup();
              router.back();
            }
          }
        ],
        'success'
      );
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      
      let errorMessage = "We couldn't submit your review. Please try again later.";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your internet connection.";
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = "Network error. Please check if your backend server is running and accessible.";
      } else if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      }
      
      showPopup(
        "Submission Error",
        errorMessage,
        [{ text: 'OK', onPress: hidePopup }],
        'error'
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

          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <CustomPopup />
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
  button: {
    backgroundColor: "#1a73e8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
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
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: "Montserrat_700Bold",
  },
  popupMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: "Montserrat_400Regular",
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
    marginRight:65
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: "Montserrat_600SemiBold",
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
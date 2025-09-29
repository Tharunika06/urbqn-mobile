// app/Reviews/Review.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import StarRating from "../../../components/StarRating"; // Adjust path

const API_URL = "http://192.168.0.152:5000/api/reviews"; // your backend

const ReviewScreen: React.FC = () => {
  const router = useRouter();
  const { propertyId, propertyName, propertyImage } = useLocalSearchParams<{
    propertyId: string;
    propertyName: string;
    propertyImage: string;
  }>();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating before submitting.");
      return;
    }
    if (!comment.trim()) {
      Alert.alert("Comment Required", "Please write a brief comment about your experience.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = "temp-user-id"; // replace with actual user logic

      await axios.post(API_URL, {
        propertyId,
        userId,
        rating,
        comment,
      });

      Alert.alert("Success", "Thank you! Your review has been submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Failed to submit review:", error);
      Alert.alert("Submission Error", "We couldn't submit your review. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={propertyImage ? { uri: propertyImage } : require("../../../assets/images/main.png")}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Property Info */}
        <View style={styles.card}>
          <Text style={styles.propertyName}>{propertyName || "Apartment"}</Text>
          <Text style={styles.reviewersText}>⭐ 440+ Reviews</Text>

          <Text style={styles.question}>How is your Rental Experience?</Text>

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
    marginBottom: 6,
  },
  reviewersText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#1a2238",
    marginVertical: 16,
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
  },
});

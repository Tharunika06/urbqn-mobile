// urban/services/estateService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { BASE_URL } from '../services/api.service';
const LOCATIONIQ_API_KEY = 'pk.9bdd1304713dd24e813e3b1207af245b';

interface Review {
  _id: string | number;
  propertyId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface UserProfile {
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
}

interface TransactionDetails {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  property: { id: string | number; name: string };
  ownerName: string;
  purchaseType: string;
  timestamp: string;
}

/**
 * Fetch reviews for a property
 * FIXED: Changed from /review to /reviews
 */
export const fetchPropertyReviews = async (propertyId: string | number): Promise<Review[]> => {
  try {
    console.log(` Fetching reviews for property: ${propertyId}`);
    console.log(` Request URL: ${BASE_URL}/reviews/property/${propertyId}`);
    
    const response = await fetch(`${BASE_URL}/reviews/property/${propertyId}`);
    
    // If 404, it means no reviews exist yet - return empty array
    if (response.status === 404) {
      console.log(' No reviews found for this property (404) - returning empty array');
      return [];
    }
    
    if (!response.ok) {
      console.warn(` Review fetch failed with status: ${response.status}`);
      return [];
    }
    
    const reviews = await response.json();
    console.log(`Successfully fetched ${reviews.length} reviews`);
    return reviews;
  } catch (error: any) {
    console.error(' Error fetching reviews:', error.message);
    // Return empty array instead of throwing, so the app doesn't crash
    return [];
  }
};

/**
 * Submit a new review
 * NEW FUNCTION: For submitting reviews
 */
export const submitReview = async (reviewData: {
  propertyId: string | number;
  customerPhone: string;
  customerEmail?: string;
  customerName: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(' Submitting review:', reviewData);
    
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to submit review: ${response.status}`);
    }

    const result = await response.json();
    console.log(' Review submitted successfully');
    return { success: true };
  } catch (error: any) {
    console.error(' Failed to submit review:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to submit review' 
    };
  }
};

/**
 * Check property availability (for sale properties)
 */
export const checkPropertyAvailability = async (
  propertyId: string | number
): Promise<{ isAvailable: boolean; soldDate?: string; transactionId?: string }> => {
  try {
    const response = await fetch(
      `${BASE_URL}/property/${propertyId}/availability`
    );
    
    if (!response.ok) {
      console.warn('Could not verify property availability');
      return { isAvailable: true }; // Assume available if check fails
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking property availability:', error);
    return { isAvailable: true }; // Assume available if check fails
  }
};

/**
 * Check for pending reviews for a customer
 * FIXED: Changed from /review to /reviews
 */
export const checkPendingReview = async (
  propertyId: string | number,
  customerIdentifier: string
): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/reviews/pending/${propertyId}/${encodeURIComponent(customerIdentifier)}`
    );

    if (!response.ok) {
      return { hasPendingReview: false };
    }

    const data = await response.json();
    console.log(' Pending review check response:', data);
    return data;
  } catch (error) {
    console.error('Error checking pending review:', error);
    return { hasPendingReview: false };
  }
};

/**
 * Dismiss pending review popup
 * FIXED: Changed from /review to /reviews
 */
export const dismissPendingReviewPopup = async (
  propertyId: string | number,
  customerIdentifier: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${BASE_URL}/reviews/pending/dismiss-popup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          customerIdentifier,
        })
      }
    );
    
    if (response.ok) {
      console.log(' Popup dismissed, pending review still active');
    } else {
      console.warn(' Failed to dismiss popup');
    }
  } catch (error) {
    console.error(' Error dismissing popup:', error);
  }
};

/**
 * Delete pending review
 * FIXED: Changed from /review to /reviews
 */
export const deletePendingReview = async (
  propertyId: string | number,
  customerIdentifier: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${BASE_URL}/reviews/pending/${propertyId}/${encodeURIComponent(customerIdentifier)}`,
      { method: 'DELETE' }
    );
    
    if (response.ok) {
      console.log('Pending review deleted');
    } else {
      console.warn(' Failed to delete pending review');
    }
  } catch (error) {
    console.error('Error deleting pending review:', error);
  }
};

/**
 * Fetch user profile by email
 */
export const fetchUserProfile = async (email: string): Promise<UserProfile | null> => {
  try {
    console.log(`Fetching profile for user: ${email}`);
    
    const checkResponse = await fetch(
      `${BASE_URL}/profiles/check-email/${encodeURIComponent(email)}`
    );
    
    if (!checkResponse.ok) {
      console.log('Profile check failed:', checkResponse.status);
      return null;
    }

    const checkData = await checkResponse.json();
    
    if (!checkData.exists) {
      console.log('No profile found for email:', email);
      return null;
    }

    const profilesResponse = await fetch(
      `${BASE_URL}/profiles?includePhotos=true`
    );
    
    if (!profilesResponse.ok) {
      console.log('Profiles fetch failed:', profilesResponse.status);
      return null;
    }

    const profilesData = await profilesResponse.json();
    
    const userProfile = profilesData.profiles?.find(
      (p: any) => p.email?.toLowerCase() === email.toLowerCase()
    );
    
    return userProfile || null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Create payment intent
 * FIXED: Better error handling for 404
 */
export const createPaymentIntent = async (amount: number): Promise<{ clientSecret: string }> => {
  try {
    console.log(` Creating payment intent for amount: ₹${amount}`);
    console.log(` Request URL: ${BASE_URL}/payment/create-payment-intent`);
    
    const response = await fetch(`${BASE_URL}/payment/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    console.log(` Payment API Response Status: ${response.status}`);

    if (response.status === 404) {
      throw new Error('Payment endpoint not found. Please ensure the payment API is configured on the server.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(' Payment API Error Response:', errorText);
      throw new Error(`Server error: ${response.status}`);
    }

    const responseData = await response.json();
    const { clientSecret, error } = responseData;
    
    if (error || !clientSecret) {
      throw new Error(error || 'Failed to get payment client secret from server.');
    }

    console.log(' Payment intent created successfully');
    return { clientSecret };
  } catch (error: any) {
    console.error('Error creating payment intent:', error.message);
    throw error;
  }
};

/**
 * Save transaction details to server
 */
export const saveTransactionDetails = async (
  transactionDetails: TransactionDetails
): Promise<any> => {
  try {
    console.log('Saving transaction with purchaseType:', transactionDetails.purchaseType);
    
    const response = await fetch(`${BASE_URL}/payment/save-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionDetails }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server returned an error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Transaction details successfully saved to server.");
    console.log(" Pending review created:", result.transaction?.transactionId || 'N/A');
    
    return result;
  } catch (error) {
    console.error(" Failed to save transaction on server:", error);
    throw error;
  }
};

/**
 * Get user's current location coordinates
 */
export const getUserLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log(' Location permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    console.log(' User location obtained:', location.coords.latitude, location.coords.longitude);

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
};

/**
 * Geocode an address to coordinates
 */
export const geocodeAddress = async (address: string): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  try {
    const searchQuery = `${address.trim()}, India`;
    const geocodeUrl = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=in`;

    const response = await fetch(geocodeUrl);
    if (!response.ok) {
      console.log('Geocoding failed');
      return null;
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      console.log(' No geocoding results');
      return null;
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Get current user from storage
 */
export const getCurrentUser = async (): Promise<any> => {
  try {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Save customer info to AsyncStorage for review tracking
 */
export const saveCustomerInfoForReview = async (
  customerName: string,
  customerPhone: string,
  customerEmail: string
): Promise<void> => {
  try {
    if (customerPhone) {
      await AsyncStorage.setItem('customerPhone', customerPhone);
      console.log(' Customer phone saved for review tracking:', customerPhone);
    }
    
    if (customerEmail) {
      await AsyncStorage.setItem('customerEmail', customerEmail);
      console.log(' Customer email saved for review tracking:', customerEmail);
    }
    
    if (customerName) {
      await AsyncStorage.setItem('customerName', customerName);
      console.log(' Customer name saved for review tracking:', customerName);
    }
  } catch (error) {
    console.error(' Error saving customer info for review:', error);
  }
};

/**
 * Get customer identifier from storage (phone or email)
 */
export const getCustomerIdentifier = async (): Promise<{
  identifier: string | null;
  phone: string | null;
  email: string | null;
  name: string | null;
}> => {
  try {
    const customerPhone = await AsyncStorage.getItem('customerPhone');
    const customerEmail = await AsyncStorage.getItem('customerEmail');
    const customerName = await AsyncStorage.getItem('customerName');
    
    return {
      identifier: customerPhone || customerEmail,
      phone: customerPhone,
      email: customerEmail,
      name: customerName,
    };
  } catch (error) {
    console.error('Error getting customer identifier:', error);
    return {
      identifier: null,
      phone: null,
      email: null,
      name: null,
    };
  }
};
// urban/app/auth/Estate/TransactionHandler.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.0.152:5000';

interface UserProfile {
  _id?: string;
  firstName?: string;
  lastName?: string;  // Added lastName field
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
}

interface PropertyType {
  _id: string | number;
  name: string;
  rentPrice?: string | number;
  salePrice?: string | number;
  ownerName: string;
}

interface TransactionHandlerProps {
  property: PropertyType;
  displayMode: 'rent' | 'sale' | null;
  isValid: boolean;
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

export default function TransactionHandler({ property, displayMode, isValid }: TransactionHandlerProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [hasCompleteProfile, setHasCompleteProfile] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  
  // Custom popup state
  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: []
  });

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    loadUserProfile();
  }, []);

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

  // Helper function to construct full name from profile
  const getFullNameFromProfile = (profile: UserProfile): string => {
    // Priority: fullName > firstName + lastName > firstName only
    if (profile.fullName?.trim()) {
      return profile.fullName.trim();
    }
    
    const firstName = profile.firstName?.trim() || '';
    const lastName = profile.lastName?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    return firstName; // Fallback to just firstName if lastName is missing
  };

  // Get current user from AsyncStorage (similar to ViewProfile)
  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  };

  // Fetch profile using the same approach as ViewProfile
  const fetchUserProfile = async (email: string) => {
    try {
      console.log(`Fetching profile for user: ${email}`);
      
      // Check if profile exists using the same endpoint as ViewProfile
      const checkResponse = await fetch(
        `${API_BASE_URL}/api/profiles/check-email/${encodeURIComponent(email)}`
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

      // Get all profiles and find current user's profile (same as ViewProfile)
      const profilesResponse = await fetch(
        `${API_BASE_URL}/api/profiles?includePhotos=true`
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

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      
      // First try to get user from AsyncStorage (same as ViewProfile)
      const user = await getCurrentUser();
      
      let currentUserEmail = null;
      if (user && user.email) {
        currentUserEmail = user.email;
        console.log('User email from user object:', currentUserEmail);
      } else {
        // Fallback to userEmail from AsyncStorage
        currentUserEmail = await AsyncStorage.getItem('userEmail');
        console.log('User email from storage:', currentUserEmail);
      }
      
      if (!currentUserEmail) {
        console.log('No user email found');
        setIsLoadingProfile(false);
        return;
      }

      setUserEmail(currentUserEmail);

      // Try to get cached profile data
      const userData = await AsyncStorage.getItem('userProfile');
      console.log('Cached profile data exists:', !!userData);
      
      if (userData) {
        try {
          const profile: UserProfile = JSON.parse(userData);
          console.log('Parsed cached profile:', profile);
          
          if (profile.email === currentUserEmail) {
            setUserProfile(profile);
            
            const name = getFullNameFromProfile(profile);
            const phone = profile.phone || profile.phoneNumber || '';
            
            console.log('Extracted from cached profile - Name:', name, 'Phone:', phone);
            
            if (name && phone) {
              setHasCompleteProfile(true);
              setUserName(name);
              setUserPhone(phone);
              console.log('Complete cached profile loaded');
              setIsLoadingProfile(false);
              return;
            } else {
              console.log('Cached profile incomplete');
              setUserName(name);
              setUserPhone(phone);
            }
          } else {
            console.log('Cached profile email mismatch');
          }
        } catch (parseError) {
          console.error('Error parsing cached profile:', parseError);
        }
      }

      // Fetch from API using the same approach as ViewProfile
      console.log('Fetching profile from API...');
      const profile = await fetchUserProfile(currentUserEmail);
      
      if (profile) {
        console.log('API Response profile:', profile);
        
        setUserProfile(profile);
        
        // Save to AsyncStorage for future use
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
        
        const name = getFullNameFromProfile(profile);
        const phone = profile.phone || profile.phoneNumber || '';
        
        console.log('Extracted from API profile - Name:', name, 'Phone:', phone);
        console.log('Profile fields - firstName:', profile.firstName, 'lastName:', profile.lastName, 'fullName:', profile.fullName);
        
        if (name && phone) {
          setHasCompleteProfile(true);
          setUserName(name);
          setUserPhone(phone);
          console.log('Complete profile fetched from API');
        } else {
          setUserName(name);
          setUserPhone(phone);
          console.log('Partial profile fetched from API');
        }
      } else {
        console.log('No profile found from API');
      }

    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const parsePrice = (price: string | number | null | undefined): number | null => {
    if (price === null || price === undefined || price === '') return null;
    if (typeof price === 'number') return price;
    const cleanPrice = String(price).replace(/[^0-9.-]+/g, '');
    const numericPrice = parseFloat(cleanPrice);
    return !isNaN(numericPrice) ? numericPrice : null;
  };

  const handleBuyRentClick = () => {
    if (!displayMode) return;
    
    if (hasCompleteProfile && userName.trim() && userPhone.trim()) {
      console.log('Profile complete, proceeding directly to payment');
      handlePayment();
    } else {
      console.log('Profile incomplete, showing user info modal');
      setShowUserInfoModal(true);
    }
  };

  const handleProceedToPayment = () => {
    if (!userName.trim()) {
      showPopup('Validation Error', 'Please enter your name.', [
        { text: 'OK', onPress: hidePopup }
      ], 'error');
      return;
    }
    if (!userPhone.trim() || userPhone.trim().length < 10) {
      showPopup('Validation Error', 'Please enter a valid 10-digit phone number.', [
        { text: 'OK', onPress: hidePopup }
      ], 'error');
      return;
    }

    setShowUserInfoModal(false);
    handlePayment();
  };

  const handlePayment = async () => {
    if (!displayMode || isProcessing) return;
    setIsProcessing(true);

    const price = displayMode === 'rent' ? parsePrice(property.rentPrice) : parsePrice(property.salePrice);
    if (!price) {
      showPopup('Error', 'Price is not available for this option.', [
        { text: 'OK', onPress: hidePopup }
      ], 'error');
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Create a payment intent
      const response = await fetch(`${API_BASE_URL}/api/payment/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price }),
      });
      const { clientSecret, error: backendError } = await response.json();
      if (backendError || !clientSecret) {
        throw new Error(backendError || 'Failed to get payment client secret from server.');
      }

      // 2. Initialize the Payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'RealEstate App Inc.',
        paymentIntentClientSecret: clientSecret,
      });
      if (initError) {
        throw new Error(`Payment sheet initialization failed: ${initError.message}`);
      }

      // 3. Present the Payment sheet
      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          throw new Error(`Payment failed: ${paymentError.message}`);
        }
        setShowCancelPopup(true);
        setIsProcessing(false);
        return;
      }

      // 4. Payment succeeded
      await saveTransactionDetails(clientSecret, price, userName, userPhone);
      await saveUserProfile();

      showPopup(
        'Payment Successful!',
        `Your transaction for "${property.name}" was completed. Please take a moment to leave a review.`,
        [
          {
            text: 'OK',
            onPress: () => {
              hidePopup();
              if (property._id) {
                router.push({
                  pathname: '/auth/Reviews/Review',
                  params: { propertyId: property._id.toString() },
                });
              } else {
                console.error("Cannot navigate to reviews: property._id is missing.");
                router.back();
              }
            },
          },
        ],
        'success'
      );

    } catch (error: any) {
      console.error(error);
      showPopup('Payment Error', error.message || 'An unexpected error occurred.', [
        { text: 'OK', onPress: hidePopup }
      ], 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveUserProfile = async () => {
    try {
      if (userName.trim() && userPhone.trim()) {
        // Split the entered name into first and last name for saving
        const nameParts = userName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const profileData = {
          firstName: firstName,
          lastName: lastName,
          fullName: userName.trim(), // Also save as fullName for convenience
          phone: userPhone.trim(),
          email: userEmail,
          ...userProfile,
        };
        
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
        setUserProfile(profileData);
        setHasCompleteProfile(true);
        console.log('User profile saved/updated');
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const saveTransactionDetails = async (clientSecret: string, amount: number, name: string, phone: string) => {
    try {
      if (!property._id) {
        console.error("Critical Error: Property _id is missing. Cannot save transaction.");
        showPopup("Error", "Could not save transaction because of a data issue.", [
          { text: 'OK', onPress: hidePopup }
        ], 'error');
        return;
      }
      const transactionDetails = {
        id: clientSecret.split('_secret')[0], 
        customerName: name,
        customerPhone: phone,
        customerEmail: userEmail,
        paymentMethod: 'card',
        amount: amount,
        property: { id: property._id, name: property.name },
        ownerName: property.ownerName,
      };
      const response = await fetch(`${API_BASE_URL}/api/payment/save-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionDetails }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned an error: ${response.status}`);
      }
      console.log("Transaction details successfully sent to the server.");
    } catch (error: any) {
      console.error("Failed to save transaction on server:", error);
      showPopup(
        "Save Error", 
        `Your payment was successful, but we failed to save the transaction record. Please contact support.\n\nDetails: ${error.message}`,
        [{ text: 'OK', onPress: hidePopup }],
        'warning'
      );
    }
  };

  const getBuyButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (!displayMode) return 'Select Option';
    
    if (hasCompleteProfile) {
      return `${displayMode === 'rent' ? 'Rent' : 'Buy'} `;
    }
    
    return displayMode === 'rent' ? 'Rent Now' : 'Buy Now';
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

  const CancelPaymentPopup = () => (
    <Modal visible={showCancelPopup} transparent={true} animationType="fade">
      <View style={styles.popupOverlay}>
        <View style={styles.popupContainer}>
          <View style={styles.popupIconContainer}>
            <Ionicons name="close-circle" size={64} color="#f39c12" />
          </View>
          <Text style={styles.popupTitle}>Payment Cancelled</Text>
          <Text style={styles.popupMessage}>
            The payment process was not completed. You can try again whenever you're ready.
          </Text>
          <Pressable 
            style={styles.popupButton} 
            onPress={() => setShowCancelPopup(false)}
          >
            <Text style={styles.popupButtonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

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

  return (
    <>
      {/* Buy/Rent Button */}
      <View style={styles.buyWrapper}>
        <Pressable
          style={[ 
            styles.buyCTA, 
            (!isValid || !displayMode || isProcessing) && { backgroundColor: '#a5a5a5' },
            hasCompleteProfile && styles.buyCtaWithProfile
          ]}
          disabled={!isValid || !displayMode || isProcessing}
          onPress={handleBuyRentClick}
        >
          <Text style={styles.buyText}>
            {getBuyButtonText()}
          </Text>
        </Pressable>
      </View>

      {/* Custom Cancel Payment Popup */}
      <CancelPaymentPopup />

      {/* Custom Alert Popup */}
      <CustomPopup />

      {/* User Info Modal */}
      <Modal visible={showUserInfoModal} transparent={true} animationType="slide" onRequestClose={() => setShowUserInfoModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {userProfile ? 'Confirm Your Details' : 'Enter Your Details'}
                </Text>
                <Pressable onPress={() => setShowUserInfoModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#1a2238" />
                </Pressable>
              </View>
              
              <Text style={styles.modalSubtitle}>
                {userProfile 
                  ? 'Please confirm or update your details to proceed with the payment.'
                  : `Please provide your details to proceed with the ${displayMode === 'rent' ? 'rental' : 'purchase'}.`
                }
              </Text>

              {isLoadingProfile && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#1a73e8" />
                  <Text style={styles.loadingText}>Loading your profile...</Text>
                </View>
              )}

              {userProfile && (
                <View style={styles.profileNotice}>
                  <Ionicons name="information-circle" size={16} color="#1a73e8" />
                  <Text style={styles.profileNoticeText}>
                    Details loaded from your profile. You can edit them if needed.
                  </Text>
                </View>
              )}

              {userEmail && (
                <View style={styles.emailContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.emailDisplay}>
                    <Ionicons name="mail" size={16} color="#1a73e8" />
                    <Text style={styles.emailText}>{userEmail}</Text>
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={userName} 
                  onChangeText={setUserName} 
                  placeholder="Enter your full name" 
                  placeholderTextColor="#999" 
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={userPhone} 
                  onChangeText={setUserPhone} 
                  placeholder="Enter your 10-digit phone number" 
                  placeholderTextColor="#999" 
                  keyboardType="phone-pad" 
                  maxLength={10}
                />
              </View>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={() => setShowUserInfoModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.proceedButton} onPress={handleProceedToPayment}>
                  <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  profileStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  profileStatusText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#4CAF50',
    fontFamily: 'Montserrat_400Regular',
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
  buyWrapper: { marginHorizontal: 10, marginTop: 5, marginBottom: 20 },
  buyCTA: { 
    backgroundColor: '#1a73e8', 
    paddingVertical: 14, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 6, 
    elevation: 5 
  },
  buyCtaWithProfile: {
    backgroundColor: 'linear-gradient(to left, #0075FF, #4C9FFF)',
  },
  buyText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a2238', fontFamily: 'Montserrat_700Bold' },
  closeButton: { padding: 4 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 24, fontFamily: 'Montserrat_400Regular' },
  emailContainer: { marginBottom: 20 },
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4ff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  emailText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1a73e8',
    fontFamily: 'Montserrat_500Medium',
  },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1a2238', marginBottom: 8, fontFamily: 'Montserrat_600SemiBold' },
  textInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1a2238', fontFamily: 'Montserrat_400Regular', backgroundColor: '#f9f9f9' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, backgroundColor: '#f3f3f3', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  proceedButton: { flex: 2, backgroundColor: '#1a73e8', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  proceedButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  profileNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  profileNoticeText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#1a73e8',
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
  },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  loadingText: { marginLeft: 8, color: '#666', fontFamily: 'Montserrat_400Regular' },
});
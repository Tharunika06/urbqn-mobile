// urban/components/Estate/TransactionHandler.tsx
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import GradientButton from '../Button/GradientButton';
import { usePopup } from '../context/PopupContext';

// Services
import {
  checkPropertyAvailability,
  fetchUserProfile,
  getCurrentUser,
  createPaymentIntent,
  saveTransactionDetails,
  saveCustomerInfoForReview,
} from '../../services/estateService';

// Utils
import {
  parsePrice,
  formatPrice,
  validatePhoneNumber,
  getFullNameFromProfile,
  parseNameParts,
} from '../../utils/estateUtils';

interface UserProfile {
  _id?: string;
  firstName?: string;
  lastName?: string;
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
  photo?: string;
  location?: string;
  status?: 'rent' | 'sale' | 'both'|'sold';
}

interface TransactionHandlerProps {
  property: PropertyType;
  displayMode: 'rent' | 'sale' | null;
  isValid: boolean;
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
  
  // Availability check states
  const [isPropertySold, setIsPropertySold] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  
  const { showCustom, showError, showWarning, showInfo } = usePopup();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [property._id, displayMode]);

  const checkAvailability = async () => {
    const propertyStatus = property.status?.toLowerCase();
    const isSaleProperty = propertyStatus === 'sale' || propertyStatus === 'both';
    
    if (displayMode !== 'sale' && !isSaleProperty) {
      setCheckingAvailability(false);
      setIsPropertySold(false);
      return;
    }

    try {
      setCheckingAvailability(true);
      console.log(`Checking availability for property: ${property._id}`);
      
      const data = await checkPropertyAvailability(property._id);
      setIsPropertySold(!data.isAvailable);
      
      if (!data.isAvailable) {
        console.log('Property is already sold');
        console.log(`Sold on: ${data.soldDate}`);
        console.log(`Transaction: ${data.transactionId}`);
      } else {
        console.log('Property is available for purchase');
      }
    } catch (error) {
      console.error('Error checking property availability:', error);
      setIsPropertySold(false);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      
      const user = await getCurrentUser();
      
      let currentUserEmail = null;
      if (user && user.email) {
        currentUserEmail = user.email;
        console.log('User email from user object:', currentUserEmail);
      } else {
        currentUserEmail = await AsyncStorage.getItem('userEmail');
        console.log('User email from storage:', currentUserEmail);
      }
      
      if (!currentUserEmail) {
        console.log('No user email found');
        setIsLoadingProfile(false);
        return;
      }

      setUserEmail(currentUserEmail);

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
            
            if (name && phone && phone.length >= 10) {
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

      console.log('Fetching profile from API...');
      const profile = await fetchUserProfile(currentUserEmail);
      
      if (profile) {
        console.log('API Response profile:', profile);
        
        setUserProfile(profile);
        
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
        
        const name = getFullNameFromProfile(profile);
        const phone = profile.phone || profile.phoneNumber || '';
        
        console.log('Extracted from API profile - Name:', name, 'Phone:', phone);
        
        if (name && phone && phone.length >= 10) {
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

  const handleBuyRentClick = () => {
    if (!displayMode) return;
    
    if (displayMode === 'sale' && isPropertySold) {
      showCustom(
        'Property Not Available',
        'This property has already been sold and is no longer available for purchase. Please explore other available properties.',
        [
          { 
            text: 'Browse Properties', 
            onPress: () => router.back()
          },
          { 
            text: 'OK', 
            onPress: () => {},
            style: 'cancel'
          }
        ],
        'warning'
      );
      return;
    }
    
    if (hasCompleteProfile && userName.trim() && userPhone.trim() && validatePhoneNumber(userPhone)) {
      console.log('Profile complete, proceeding directly to payment');
      handlePayment();
    } else {
      console.log('Profile incomplete, showing user info modal');
      setShowUserInfoModal(true);
    }
  };

  const handleProceedToPayment = () => {
    const trimmedName = userName.trim();
    const trimmedPhone = userPhone.trim();

    if (!trimmedName) {
      showError('Validation Error', 'Please enter your full name.');
      return;
    }

    if (trimmedName.length < 2) {
      showError('Validation Error', 'Name must be at least 2 characters long.');
      return;
    }

    if (!validatePhoneNumber(trimmedPhone)) {
      showError('Validation Error', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setShowUserInfoModal(false);
    handlePayment();
  };

  const handlePayment = async () => {
    if (!displayMode || isProcessing) return;
    
    if (displayMode === 'sale' && isPropertySold) {
      showError(
        'Property No Longer Available',
        'This property was just sold. Please select a different property.',
        () => router.back()
      );
      return;
    }
    
    setIsProcessing(true);

    const price = displayMode === 'rent' ? parsePrice(property.rentPrice) : parsePrice(property.salePrice);
    if (!price || price <= 0) {
      showError('Error', 'Price is not available for this option.');
      setIsProcessing(false);
      return;
    }

    try {
      console.log(' Starting payment process...');
      console.log(` Amount: ₹${price}`);
      
      // Step 1: Create payment intent
      const { clientSecret } = await createPaymentIntent(price);
      console.log('Payment intent created');
      console.log(' Client Secret format check:', clientSecret?.substring(0, 20) + '...');

      // Validate client secret format
      if (!clientSecret || !clientSecret.startsWith('pi_')) {
        throw new Error('Invalid client secret received from server');
      }

      // Step 2: Initialize payment sheet
      console.log('🔧 Initializing payment sheet...');
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'RealEstate App Inc.',
        paymentIntentClientSecret: clientSecret,
        returnURL: 'your-app://stripe-redirect',
        // Add default billing details for better UX
        defaultBillingDetails: {
          name: userName.trim(),
          email: userEmail,
          phone: userPhone.trim(),
        },
        // Optional: Add appearance customization
        appearance: {
          colors: {
            primary: '#1a73e8',
          },
        },
      });
      
      if (initError) {
        console.error(' Payment sheet init error:', initError);
        throw new Error(`Payment sheet initialization failed: ${initError.message}`);
      }

      console.log(' Payment sheet initialized');

      // Step 3: Present payment sheet
      console.log(' Presenting payment sheet...');
      const { error: paymentError } = await presentPaymentSheet();
      
      if (paymentError) {
        console.error(' Payment error:', paymentError);
        
        if (paymentError.code === 'Canceled') {
          console.log(' Payment canceled by user');
          setShowCancelPopup(true);
          setIsProcessing(false);
          return;
        }
        
        // Handle specific error codes
        if (paymentError.code === 'Failed') {
          throw new Error('Payment failed. Please check your card details and try again.');
        }
        
        throw new Error(`Payment failed: ${paymentError.message}`);
      }

      console.log(' Payment successful!');

      // Step 4: Extract transaction ID safely
      let transactionId: string;
      try {
        // Client secret format: pi_xxxxx_secret_yyyyy
        const parts = clientSecret.split('_secret');
        if (parts.length < 1 || !parts[0].startsWith('pi_')) {
          throw new Error('Invalid client secret format');
        }
        transactionId = parts[0];
        console.log(' Transaction ID:', transactionId);
      } catch (error) {
        console.error(' Could not extract transaction ID, using timestamp fallback');
        transactionId = `txn_${Date.now()}`;
      }

      const purchaseType = displayMode === 'rent' ? 'rent' : 'buy';
      
      // Step 5: Save transaction details
      console.log(' Saving transaction details...');
      const transactionData = {
        id: transactionId,
        customerName: userName.trim(),
        customerPhone: userPhone.trim(),
        customerEmail: userEmail,
        paymentMethod: 'card',
        amount: price,
        currency: 'INR',
        property: { 
          id: property._id, 
          name: property.name 
        },
        ownerName: property.ownerName,
        purchaseType: purchaseType,
        timestamp: new Date().toISOString(),
        clientSecret: clientSecret, // Store for reference
      };
      
      try {
        await saveTransactionDetails(transactionData);
        console.log(' Transaction details saved');
      } catch (saveError) {
        console.error(' Failed to save transaction:', saveError);
        // Don't throw - payment succeeded, just log the error
      }
      
      // Step 6: Save customer info for review tracking
      try {
        await saveCustomerInfoForReview(userName.trim(), userPhone.trim(), userEmail);
        console.log(' Customer info saved');
      } catch (error) {
        console.error(' Failed to save customer info:', error);
      }
      
      // Step 7: Save user profile
      try {
        await saveUserProfileData();
        console.log(' User profile saved');
      } catch (error) {
        console.error(' Failed to save user profile:', error);
      }

      // Step 8: Mark property as sold locally
      if (displayMode === 'sale') {
        setIsPropertySold(true);
        console.log(' Property marked as sold');
      }

      // Step 9: Show success message
      showCustom(
        'Payment Successful!',
        `Your ${displayMode === 'rent' ? 'rental' : 'purchase'} of "${property.name}" was completed successfully. Please take a moment to leave a review.`,
        [
          {
            text: 'Review Now',
            onPress: () => {
              if (property._id) {
                router.push({
                  pathname: '/auth/Reviews/Review',
                  params: { 
                    propertyId: property._id.toString(),
                    propertyName: property.name,
                    propertyImage: property.photo || '',
                    propertyLocation: property.location || '',
                    customerPhone: userPhone.trim(),
                    customerEmail: userEmail,
                    customerName: userName.trim(),
                  },
                });
              } else {
                console.error("Cannot navigate to reviews: property._id is missing.");
                router.back();
              }
            },
          },
          {
            text: 'Later',
            onPress: () => router.back(),
            style: 'cancel'
          }
        ],
        'success'
      );

    } catch (error: any) {
      console.error('❌ Payment process failed:', error);
      
      // Show user-friendly error message
      let errorMessage = 'An unexpected error occurred during payment.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Add more context for specific errors
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('client secret')) {
        errorMessage = 'Payment initialization failed. Please try again.';
      }
      
      showError('Payment Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveUserProfileData = async () => {
    try {
      const trimmedName = userName.trim();
      const trimmedPhone = userPhone.trim();
      
      if (trimmedName && trimmedPhone) {
        const { firstName, lastName } = parseNameParts(trimmedName);
        
        const profileData: UserProfile = {
          ...userProfile,
          firstName,
          lastName,
          fullName: trimmedName,
          phone: trimmedPhone,
          email: userEmail,
        };
        
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
        setUserProfile(profileData);
        setHasCompleteProfile(true);
        console.log('User profile saved/updated successfully');
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const getBuyButtonText = () => {
    if (checkingAvailability) return 'Checking...';
    if (displayMode === 'sale' && isPropertySold) return 'Sold Out';
    if (isProcessing) return 'Processing...';
    if (!displayMode) return 'Select Option';
    
    return displayMode === 'rent' ? 'Rent Now' : 'Buy Now';
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

  return (
    <>
      <View style={styles.buyWrapper}>
        {checkingAvailability ? (
          <View style={styles.checkingContainer}>
            <ActivityIndicator size="small" color="#1a73e8" />
            <Text style={styles.checkingText}>Checking availability...</Text>
          </View>
        ) : (
          <GradientButton
            onPress={handleBuyRentClick}
            label={getBuyButtonText()}
            colors={
              (displayMode === 'sale' && isPropertySold) 
                ? ['#9ca3af', '#6b7280']
                : ['#000000', '#474747']
            }
            buttonStyle={[
              styles.buyCTA,
              (displayMode === 'sale' && isPropertySold) && styles.soldButton
            ]}
            textStyle={styles.buyText}
            disabled={isProcessing || (displayMode === 'sale' && isPropertySold)}
          />
        )}
      </View>

      <CancelPaymentPopup />

      <Modal 
        visible={showUserInfoModal} 
        transparent={true} 
        animationType="slide" 
        onRequestClose={() => setShowUserInfoModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <ScrollView 
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              keyboardShouldPersistTaps="handled"
            >
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

              {userProfile && !isLoadingProfile && (
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
                  editable={!isLoadingProfile}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={userPhone} 
                  onChangeText={(text) => setUserPhone(text.replace(/\D/g, ''))} 
                  placeholder="Enter your 10-digit phone number" 
                  placeholderTextColor="#999" 
                  keyboardType="phone-pad" 
                  maxLength={10}
                  editable={!isLoadingProfile}
                />
                {userPhone.length > 0 && userPhone.length < 10 && (
                  <Text style={styles.validationHint}>
                    {10 - userPhone.length} more digit{10 - userPhone.length !== 1 ? 's' : ''} required
                  </Text>
                )}
              </View>

              <View style={styles.modalActions}>
                <Pressable 
                  style={styles.cancelButton} 
                  onPress={() => setShowUserInfoModal(false)}
                  disabled={isLoadingProfile}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[
                    styles.proceedButton,
                    isLoadingProfile && styles.proceedButtonDisabled
                  ]} 
                  onPress={handleProceedToPayment}
                  disabled={isLoadingProfile}
                >
                  <Text style={styles.proceedButtonText}>
                    {isLoadingProfile ? 'Loading...' : 'Proceed to Payment'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  popupContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10, minWidth: 280, maxWidth: 340 },
  popupIconContainer: { marginBottom: 16 },
  popupTitle: { fontSize: 20, fontWeight: '700', color: '#1a2238', fontFamily: 'Montserrat_700Bold', marginBottom: 12, textAlign: 'center' },
  popupMessage: { fontSize: 14, color: '#666', fontFamily: 'Montserrat_400Regular', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  popupButton: { backgroundColor: '#1a73e8', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, minWidth: 100 },
  popupButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold', textAlign: 'center' },
  buyWrapper: { marginHorizontal: 10, marginTop: 5, marginBottom: -30 },
  buyCTA: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  soldButton: { opacity: 0.6 },
  buyText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  checkingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', paddingVertical: 14, borderRadius: 14 },
  checkingText: { marginLeft: 8, color: '#666', fontSize: 14, fontFamily: 'Montserrat_500Medium' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalContentContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a2238', fontFamily: 'Montserrat_700Bold', flex: 1 },
  closeButton: { padding: 4 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 24, fontFamily: 'Montserrat_400Regular', lineHeight: 20 },
  emailContainer: { marginBottom: 20 },
  emailDisplay: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eaf4ff', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1a73e8' },
  emailText: { marginLeft: 8, fontSize: 16, color: '#1a73e8', fontFamily: 'Montserrat_500Medium', flex: 1 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1a2238', marginBottom: 8, fontFamily: 'Montserrat_600SemiBold' },
  textInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1a2238', fontFamily: 'Montserrat_400Regular', backgroundColor: '#f9f9f9' },
  validationHint: { fontSize: 12, color: '#ff9800', marginTop: 4, fontFamily: 'Montserrat_400Regular' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, backgroundColor: '#f3f3f3', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  proceedButton: { flex: 2, backgroundColor: '#1a73e8', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  proceedButtonDisabled: { backgroundColor: '#93c5fd', opacity: 0.6 },
  proceedButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  profileNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eaf4ff', padding: 12, borderRadius: 8, marginBottom: 16 },
  profileNoticeText: { marginLeft: 8, fontSize: 12, color: '#1a73e8', flex: 1, fontFamily: 'Montserrat_400Regular' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  loadingText: { marginLeft: 8, color: '#666', fontFamily: 'Montserrat_400Regular' },
});
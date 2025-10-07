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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import GradientButton from '../Button/GradientButton';

const API_BASE_URL = 'http://192.168.0.154:5000';

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
}

interface TransactionHandlerProps {
  property: PropertyType;
  displayMode: 'rent' | 'sale' | null;
  isValid: boolean;
}

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

  const getFullNameFromProfile = (profile: UserProfile): string => {
    if (profile.fullName?.trim()) {
      return profile.fullName.trim();
    }
    
    const firstName = profile.firstName?.trim() || '';
    const lastName = profile.lastName?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    return firstName;
  };

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  };

  const fetchUserProfile = async (email: string) => {
    try {
      console.log(`Fetching profile for user: ${email}`);
      
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
        console.log('Profile fields - firstName:', profile.firstName, 'lastName:', profile.lastName, 'fullName:', profile.fullName);
        
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

  const parsePrice = (price: string | number | null | undefined): number | null => {
    if (price === null || price === undefined || price === '') return null;
    if (typeof price === 'number') return price;
    const cleanPrice = String(price).replace(/[^0-9.-]+/g, '');
    const numericPrice = parseFloat(cleanPrice);
    return !isNaN(numericPrice) ? numericPrice : null;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10 && /^[0-9]{10}$/.test(cleanPhone);
  };

  const handleBuyRentClick = () => {
    if (!displayMode) return;
    
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
      showPopup('Validation Error', 'Please enter your full name.', [
        { text: 'OK', onPress: hidePopup }
      ], 'error');
      return;
    }

    if (trimmedName.length < 2) {
      showPopup('Validation Error', 'Name must be at least 2 characters long.', [
        { text: 'OK', onPress: hidePopup }
      ], 'error');
      return;
    }

    if (!validatePhoneNumber(trimmedPhone)) {
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
    if (!price || price <= 0) {
      showPopup('Error', 'Price is not available for this option.', [
        { text: 'OK', onPress: hidePopup }
      ], 'error');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const { clientSecret, error: backendError } = await response.json();
      if (backendError || !clientSecret) {
        throw new Error(backendError || 'Failed to get payment client secret from server.');
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'RealEstate App Inc.',
        paymentIntentClientSecret: clientSecret,
        returnURL: 'your-app://stripe-redirect',
      });
      
      if (initError) {
        throw new Error(`Payment sheet initialization failed: ${initError.message}`);
      }

      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          setShowCancelPopup(true);
          setIsProcessing(false);
          return;
        }
        throw new Error(`Payment failed: ${paymentError.message}`);
      }

      await saveTransactionDetails(clientSecret, price, userName.trim(), userPhone.trim());
      await saveUserProfile();

      showPopup(
        'Payment Successful!',
        `Your transaction for "${property.name}" was completed successfully. Please take a moment to leave a review.`,
        [
          {
            text: 'Ok',
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
          // {
          //   text: 'Later',
          //   onPress: () => {
          //     hidePopup();
          //     router.back();
          //   },
          //   style: 'cancel',
          // },
        ],
        'success'
      );

    } catch (error: any) {
      console.error('Payment error:', error);
      showPopup('Payment Error', error.message || 'An unexpected error occurred during payment.', [
        { text: 'OK', onPress: hidePopup }
      ], 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveUserProfile = async () => {
    try {
      const trimmedName = userName.trim();
      const trimmedPhone = userPhone.trim();
      
      if (trimmedName && trimmedPhone) {
        const nameParts = trimmedName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const profileData: UserProfile = {
          ...userProfile,
          firstName: firstName,
          lastName: lastName,
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

  const saveTransactionDetails = async (clientSecret: string, amount: number, name: string, phone: string) => {
    try {
      if (!property._id) {
        console.error("Critical Error: Property _id is missing. Cannot save transaction.");
        showPopup("Error", "Could not save transaction due to missing property information.", [
          { text: 'OK', onPress: hidePopup }
        ], 'error');
        return;
      }
      
      const transactionDetails = {
        id: clientSecret.split('_secret')[0], 
        customerName: userName,
        customerPhone: userPhone,
        customerEmail: userEmail,
        paymentMethod: 'card',
        amount: amount,
        currency: 'INR',
        property: { id: property._id, name: property.name },
        ownerName: property.ownerName,
        transactionType: displayMode,
        timestamp: new Date().toISOString(),
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
      
      console.log("Transaction details successfully saved to server.");
    } catch (error: any) {
      console.error("Failed to save transaction on server:", error);
      showPopup(
        "Save Error", 
        `Your payment was successful, but we couldn't save the transaction record. Please contact support with your payment confirmation.\n\nError: ${error.message}`,
        [{ text: 'OK', onPress: hidePopup }],
        'warning'
      );
    }
  };

  const getBuyButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (!displayMode) return 'Select Option';
    
    if (hasCompleteProfile) {
      return displayMode === 'rent' ? 'Rent Now' : 'Buy Now';
    }
    
    return displayMode === 'rent' ? 'Rent Now' : 'Buy Now';
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
      <View style={styles.buyWrapper}>
        <GradientButton
          onPress={handleBuyRentClick}
          label={getBuyButtonText()}
          colors={['#000000', '#474747']}
          // disabled={!isValid || !displayMode || isProcessing}
          buttonStyle={styles.buyCTA}
          textStyle={styles.buyText}
        />
      </View>

      <CancelPaymentPopup />
      <CustomPopup />

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
    maxWidth: 340,
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
    marginRight:60
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
  buyWrapper: { 
    marginHorizontal: 10, 
    marginTop: 5, 
    marginBottom: -30 
  },
  buyCTA: { 
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
  buyText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600', 
    fontFamily: 'Montserrat_600SemiBold' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24,
    maxHeight: '85%' 
  },
  modalContentContainer: {
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1a2238', 
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
  },
  closeButton: { 
    padding: 4 
  },
  modalSubtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 24, 
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  emailContainer: { 
    marginBottom: 20 
  },
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
    flex: 1,
  },
  inputContainer: { 
    marginBottom: 20 
  },
  inputLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#1a2238', 
    marginBottom: 8, 
    fontFamily: 'Montserrat_600SemiBold' 
  },
  textInput: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 16, 
    color: '#1a2238', 
    fontFamily: 'Montserrat_400Regular', 
    backgroundColor: '#f9f9f9' 
  },
  validationHint: {
    fontSize: 12,
    color: '#ff9800',
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  modalActions: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 24 
  },
  cancelButton: { 
    flex: 1, 
    backgroundColor: '#f3f3f3', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  cancelButtonText: { 
    color: '#666', 
    fontSize: 16, 
    fontWeight: '600', 
    fontFamily: 'Montserrat_600SemiBold' 
  },
  proceedButton: { 
    flex: 2, 
    backgroundColor: '#1a73e8', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  proceedButtonDisabled: {
    backgroundColor: '#93c5fd',
    opacity: 0.6,
  },
  proceedButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600', 
    fontFamily: 'Montserrat_600SemiBold' 
  },
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
  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 20 
  },
  loadingText: { 
    marginLeft: 8, 
    color: '#666', 
    fontFamily: 'Montserrat_400Regular' 
  },
});
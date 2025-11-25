// urban/app/(tabs)/ViewProfile.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Prompt_400Regular } from '@expo-google-fonts/prompt';

// Import GradientButton component
import GradientButton from '../../components/Button/GradientButton';

// Import services and utilities
import { 
  checkProfileExists, 
  fetchUserProfile, 
  updateProfile, 
  updateProfilePhoto 
} from '../../services/api.service';
import { 
  validateName, 
  validatePhone, 
  validateDateOfBirth 
} from '../../utils/validation.utils';
import { 
  pickAndConvertImage 
} from '../../utils/image.utils';
import { getUser } from '../../utils/storage.utils';
import { removeUser } from '../../utils/user.utils';

interface ProfileData {
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
  phone?: string;
  gender?: string;
  photo?: string | null;
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
}

interface ToastMessage {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

// Custom Toast Component
const CustomToast: React.FC<{ 
  visible: boolean; 
  type: 'success' | 'error' | 'info'; 
  title: string; 
  message: string;
  onHide: () => void;
}> = ({ visible, type, title, message, onHide }) => {
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColor = 
    type === 'success' ? '#fff' : 
    type === 'error' ? '#fff' : 
    '#2196F3';

  const icon = 
    type === 'success' ? 'check-circle' : 
    type === 'error' ? 'exclamation-circle' : 
    'info-circle';

  return (
    <Animated.View 
      style={[
        styles.toastContainer, 
        { backgroundColor, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Icon name={icon} size={20} color="#fff" style={styles.toastIcon} />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{title}</Text>
        <Text style={styles.toastMessage}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export default function ViewProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastData, setToastData] = useState<ToastMessage>({
    type: 'info',
    title: '',
    message: ''
  });

  // Toast notification function
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToastData({ type, title, message });
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  // Fetch current user's profile
  const fetchCurrentUserProfile = async (email: string): Promise<ProfileData | null> => {
    try {
      
      // Check if profile exists
      const exists = await checkProfileExists(email);
      
      if (!exists) {
        return {
          firstName: '',
          lastName: '',
          dob: '',
          email: email,
          phone: '',
          gender: '',
          photo: null
        };
      }

      // Get user profile
      const userProfile = await fetchUserProfile(email);
      return userProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Load user and their profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        
        const user = await getUser();
        if (!user) {
          showToast('error', 'Authentication Required', 'Please log in to view your profile');
          setTimeout(() => router.push('/auth/LoginScreen'), 2000);
          return;
        }

        setCurrentUser(user);
        
        const userProfile = await fetchCurrentUserProfile(user.email);
        if (userProfile) {
          setProfile(userProfile);
          setOriginalProfile({ ...userProfile });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        showToast('error', 'Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Photo upload functionality using utility
  const openCamera = async () => {
    try {
      const base64Image = await pickAndConvertImage('camera', {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        width: 400,
        height: 400,
        compress: 0.7
      });

      if (base64Image) {
        await updateProfilePhotoHandler(base64Image);
      }
    } catch (error) {
      showToast('error', 'Camera Error', 'Failed to open camera');
    }
  };

  const openImagePicker = async () => {
    try {
      const base64Image = await pickAndConvertImage('library', {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        width: 400,
        height: 400,
        compress: 0.7
      });

      if (base64Image) {
        await updateProfilePhotoHandler(base64Image);
      }
    } catch (error) {
      showToast('error', 'Photo Library Error', 'Failed to open photo library');
    }
  };

  const updateProfilePhotoHandler = async (base64Image: string) => {
    try {
      setUploadingPhoto(true);
      
      // Update local state
      setProfile(prev => ({ ...prev, photo: base64Image }));
      
      // Update on server
      const result = await updateProfilePhoto(profile?.email!, base64Image);

      if (result.success) {
        showToast('success', 'Success', 'Profile picture updated!');
        setOriginalProfile(prev => ({ ...prev, photo: base64Image }));
      } else {
        // Revert on failure
        setProfile(prev => ({ ...prev, photo: originalProfile?.photo || null }));
        showToast('error', 'Upload Failed', result.error || 'Failed to update photo');
      }
      
    } catch (error: unknown) {
      console.error('Photo update error:', error);
      setProfile(prev => ({ ...prev, photo: originalProfile?.photo || null }));
      showToast('error', 'Error', 'Failed to update photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Profile validation using utilities
  const validateProfileData = (profileData: ProfileData): boolean => {
    // First Name validation
    const firstNameValidation = validateName(profileData.firstName || '', 'First name');
    if (!firstNameValidation.valid) {
      showToast('error', 'Validation Error', firstNameValidation.error!);
      return false;
    }

    // Last Name validation
    const lastNameValidation = validateName(profileData.lastName || '', 'Last name');
    if (!lastNameValidation.valid) {
      showToast('error', 'Validation Error', lastNameValidation.error!);
      return false;
    }

    // Phone validation if provided
    if (profileData.phone) {
      const phoneValidation = validatePhone(profileData.phone);
      if (!phoneValidation.valid) {
        showToast('error', 'Invalid Phone', phoneValidation.error!);
        return false;
      }
    }

    // DOB validation if provided
    if (profileData.dob) {
      const dobValidation = validateDateOfBirth(profileData.dob);
      if (!dobValidation.valid) {
        showToast('error', 'Invalid Date', dobValidation.error!);
        return false;
      }
    }

    // Gender validation
    if (!profileData.gender?.trim()) {
      showToast('error', 'Validation Error', 'Gender is required');
      return false;
    }

    return true;
  };

  // Save profile changes using API service
  const handleSave = async () => {
    if (!profile || !validateProfileData(profile)) return;

    try {
      setSaving(true);
      
      const updatedProfile = {
        firstName: profile.firstName?.trim(),
        lastName: profile.lastName?.trim(),
        dob: profile.dob?.trim(),
        email: profile.email,
        phone: profile.phone?.trim(),
        gender: profile.gender?.trim(),
        photo: profile.photo,
      };

      const result = await updateProfile(updatedProfile.email!, updatedProfile);

      if (result.success) {
        showToast('success', 'Success', 'Profile updated successfully!');
        setOriginalProfile({ ...updatedProfile });
        setIsEditing(false);
      } else {
        showToast('error', 'Update Failed', result.error || 'Failed to update profile');
      }
      
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      showToast('error', 'Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Navigation and editing controls
  const handleGoBack = () => {
    if (isEditing) {
      setShowUnsavedDialog(true);
    } else {
      router.push('/(tabs)/Home');
    }
  };

  const confirmGoBack = () => {
    setShowUnsavedDialog(false);
    router.push('/(tabs)/Home');
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    if (originalProfile) setProfile({ ...originalProfile });
    setIsEditing(false);
    setShowCancelDialog(false);
  };

  // Logout functionality using storage utility
  const handleLogout = async () => {
    try {
      const success = await removeUser();
      if (success) {
        showToast('success', 'Logged Out', 'You have been logged out successfully');
        setTimeout(() => {
          router.push('/auth/LoginScreen');
        }, 1000);
      } else {
        showToast('error', 'Logout Failed', 'Failed to logout. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showToast('error', 'Logout Failed', 'Failed to logout. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  // Not authenticated state
  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Text style={styles.errorText}>Please log in to view your profile</Text>
        <Pressable 
          style={styles.loginButton} 
          onPress={() => router.push('/auth/LoginScreen')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Custom Toast */}
      <CustomToast
        visible={toastVisible}
        type={toastData.type}
        title={toastData.title}
        message={toastData.message}
        onHide={hideToast}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleGoBack} style={styles.iconCircle}>
              <Image 
                source={require('../../assets/icons/back-arrow.png')} 
                style={styles.icon} 
              />
            </Pressable>
            <Text style={styles.title}>My Profile</Text>
            <Pressable 
              onPress={isEditing ? handleCancel : handleEdit} 
              style={styles.editIcon}
            >
              <Icon 
                name={isEditing ? "times" : "pencil"} 
                size={20} 
                color={isEditing ? "#fa2b2bff" : "#040405ff"} 
              />
            </Pressable>
          </View>

          {/* Profile Photo */}
          <View style={styles.photoContainer}>
            <Pressable 
              onPress={openImagePicker}
              onLongPress={openCamera}
              style={styles.photoWrapper}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <View style={styles.photoLoadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.photoLoadingText}>Uploading...</Text>
                </View>
              ) : (
                <>
                  <Image
                    source={
                      profile?.photo 
                        ? { uri: profile.photo } 
                        : require('../../assets/images/avatar.png')
                    }
                    style={styles.photo}
                  />
                  <View style={styles.photoEditOverlay}>
                    <Icon name="camera" size={16} color="#fff" />
                  </View>
                </>
              )}
            </Pressable>
          </View>

          {/* Profile Form */}
          <Text style={styles.Text}>First Name </Text>
          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="First Name"
            value={profile?.firstName || ''}
            editable={isEditing}
            onChangeText={(text) => setProfile(prev => ({ ...prev, firstName: text }))}
          />
          <Text style={styles.Text}>Last Name </Text>

          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="Last Name"
            value={profile?.lastName || ''}
            editable={isEditing}
            onChangeText={(text) => setProfile(prev => ({ ...prev, lastName: text }))}
          />
          <Text style={styles.Text}>Date of Birth</Text>
 
          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={profile?.dob || ''}
            editable={isEditing}
            onChangeText={(text) => setProfile(prev => ({ ...prev, dob: text }))}
          />
          <Text style={styles.Text}>Email </Text>

          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Email"
            value={profile?.email || ''}
            editable={false}
          />
          <Text style={styles.Text}>Phone Number </Text>

          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="Phone Number"
            value={profile?.phone || ''}
            editable={isEditing}
            keyboardType="phone-pad"
            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
          />
          <Text style={styles.Text}>Gender</Text>

          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="Gender"
            value={profile?.gender || ''}
            editable={isEditing}
            onChangeText={(text) => setProfile(prev => ({ ...prev, gender: text }))}
          />

          {/* Save Button */}
          {isEditing && (
            <Pressable 
              onPress={handleSave} 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>
          )}

          {/* Logout Button using GradientButton */}
          <View style={styles.logoutButtonWrapper}>
            <GradientButton
              onPress={handleLogout}
              label={
                <View style={styles.logoutButtonContent}>
                  <Icon name="sign-out" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.logoutButtonContent}>Logout</Text>
                </View>
              }
              colors={['#474747', '#000000']}
              buttonStyle={styles.gradientButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Custom Dialog for Unsaved Changes */}
      {showUnsavedDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Unsaved Changes</Text>
            <Text style={styles.dialogMessage}>You have unsaved changes. Are you sure?</Text>
            <View style={styles.dialogButtons}>
              <Pressable 
                style={[styles.dialogButton, styles.dialogButtonCancel]} 
                onPress={() => setShowUnsavedDialog(false)}
              >
                <Text style={styles.dialogButtonTextCancel}>Stay</Text>
              </Pressable>
              <Pressable 
                style={[styles.dialogButton, styles.dialogButtonConfirm]} 
                onPress={confirmGoBack}
              >
                <Text style={styles.dialogButtonTextConfirm}>Leave</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Custom Dialog for Cancel Changes */}
      {showCancelDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Cancel Changes</Text>
            <Text style={styles.dialogMessage}>Discard all changes?</Text>
            <View style={styles.dialogButtons}>
              <Pressable 
                style={[styles.dialogButton, styles.dialogButtonCancel]} 
                onPress={() => setShowCancelDialog(false)}
              >
                <Text style={styles.dialogButtonTextCancel}>Continue Editing</Text>
              </Pressable>
              <Pressable 
                style={[styles.dialogButton, styles.dialogButtonConfirm]} 
                onPress={confirmCancel}
              >
                <Text style={styles.dialogButtonTextConfirm}>Discard</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  scrollView: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    textAlign: 'center', 
    color: '#333',
    flex: 1,
    fontFamily: 'Montserrat_700Bold',
  },
  editIcon: { 
    padding: 8,
    borderRadius: 20,
  },
  photoContainer: { alignItems: 'center', marginBottom: 0 },
  photoWrapper: { position: 'relative', marginBottom: 8 },
  photo: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#f0f0f0' },
  photoEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#030406ff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#060606ff',
  },
  photoLoadingContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLoadingText: { marginTop: 8, fontSize: 12, color: '#666' },
  Text: { fontSize: 14, color: '#666', textAlign: 'left',marginBottom: 5, fontFamily: 'Prompt_700Bold' },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  editableInput: {
    backgroundColor: '#fff',
    borderColor: '#111213ff',
    borderWidth: 1,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#0c0d0fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: { backgroundColor: '#ccc' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#777' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toastIcon: {
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  toastMessage: {
    color: '#000',
    fontSize: 14,
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  dialogMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  dialogButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dialogButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  dialogButtonConfirm: {
    backgroundColor: '#0c0d0fff',
  },
  dialogButtonTextCancel: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  dialogButtonTextConfirm: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButtonWrapper: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  gradientButton: {
    width: '100%',
    maxWidth: 350,
    height: 55,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
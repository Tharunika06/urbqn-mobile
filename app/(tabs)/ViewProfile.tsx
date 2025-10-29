//ViewProfile.tsx
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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Prompt_400Regular } from '@expo-google-fonts/prompt';
import { LinearGradient } from 'expo-linear-gradient';


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

interface CheckEmailResponse {
  exists: boolean;
}

interface ProfilesResponse {
  profiles: ProfileData[];
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

  const BASE_URL = "http://192.168.0.152:5000/api";

  // Toast notification function
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToastData({ type, title, message });
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  // Get current user from AsyncStorage
  const getCurrentUser = async (): Promise<UserData | null> => {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  };

  // Fetch current user's profile
  const fetchCurrentUserProfile = async (email: string): Promise<ProfileData | null> => {
    try {
      console.log(`Fetching profile for user: ${email}`);
      
      // Check if profile exists
      const checkResponse = await axios.get<CheckEmailResponse>(
        `${BASE_URL}/profiles/check-email/${encodeURIComponent(email)}`
      );
      
      if (!checkResponse.data.exists) {
        console.log('No profile found, returning empty profile');
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

      // Get all profiles and find current user's profile
      const profilesResponse = await axios.get<ProfilesResponse>(
        `${BASE_URL}/profiles?includePhotos=true`
      );
      
      const userProfile = profilesResponse.data.profiles?.find(
        (p: ProfileData) => p.email?.toLowerCase() === email.toLowerCase()
      );
      
      return userProfile || null;
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
        
        const user = await getCurrentUser();
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

  // Photo upload functionality
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
        showToast('error', 'Permissions Required', 'Camera and photo access needed');
        return false;
      }
      return true;
    } catch (error) {
      showToast('error', 'Permission Error', 'Failed to request permissions');
      return false;
    }
  };

  const convertToBase64 = async (uri: string): Promise<string> => {
    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: 400, height: 400 } }],
      { compress: 0.7, format: SaveFormat.JPEG, base64: true }
    );

    if (manipulatedImage.base64) {
      return `data:image/jpeg;base64,${manipulatedImage.base64}`;
    }
    throw new Error('Failed to convert image');
  };

  const openCamera = async () => {
    if (!(await requestPermissions())) return;
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      showToast('error', 'Camera Error', 'Failed to open camera');
    }
  };

  const openImagePicker = async () => {
    if (!(await requestPermissions())) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      showToast('error', 'Photo Library Error', 'Failed to open photo library');
    }
  };

  const updateProfilePhoto = async (imageUri: string) => {
    try {
      setUploadingPhoto(true);
      const base64Image = await convertToBase64(imageUri);
      
      // Update local state
      setProfile(prev => ({ ...prev, photo: base64Image }));
      
      // Update on server
      await axios.patch(
        `${BASE_URL}/profiles/by-email/${encodeURIComponent(profile?.email!)}/photo`,
        { photo: base64Image },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      showToast('success', 'Success', 'Profile picture updated!');
      setOriginalProfile(prev => ({ ...prev, photo: base64Image }));
      
    } catch (error: unknown) {
      console.error('Photo update error:', error);
      setProfile(prev => ({ ...prev, photo: originalProfile?.photo || null }));
      
      const axiosError = error as any;
      if (axiosError?.response || axiosError?.request || axiosError?.code) {
        if (axiosError.code === 'ECONNABORTED') {
          showToast('error', 'Timeout', 'Photo upload timed out');
        } else if (axiosError.response) {
          showToast('error', 'Server Error', 'Failed to update photo');
        } else if (axiosError.request) {
          showToast('error', 'Network Error', 'No server response');
        } else {
          showToast('error', 'Upload Error', 'Failed to upload photo');
        }
      } else {
        showToast('error', 'Error', 'Failed to update photo');
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Profile validation
  const validateProfile = (profileData: ProfileData): boolean => {
    const required = [
      { field: profileData.firstName?.trim(), name: 'First name' },
      { field: profileData.lastName?.trim(), name: 'Last name' },
      { field: profileData.phone?.trim(), name: 'Phone number' },
      { field: profileData.gender?.trim(), name: 'Gender' },
      { field: profileData.dob?.trim(), name: 'Date of birth' },
    ];

    for (const { field, name } of required) {
      if (!field) {
        showToast('error', 'Validation Error', `${name} is required`);
        return false;
      }
    }

    // Additional validation for DOB format
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (profileData.dob && !dobRegex.test(profileData.dob.trim())) {
      showToast('error', 'Invalid Date', 'Use format: YYYY-MM-DD');
      return false;
    }

    // Phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (profileData.phone && !phoneRegex.test(profileData.phone.replace(/\s/g, ''))) {
      showToast('error', 'Invalid Phone', 'Enter a valid phone number');
      return false;
    }

    return true;
  };

  // Save profile changes
  const handleSave = async () => {
    if (!profile || !validateProfile(profile)) return;

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

      await axios.put(
        `${BASE_URL}/profiles/by-email/${encodeURIComponent(updatedProfile.email!)}`,
        updatedProfile,
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      showToast('success', 'Success', 'Profile updated successfully!');
      setOriginalProfile({ ...updatedProfile });
      setIsEditing(false);
      
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      
      const axiosError = error as any;
      if (axiosError?.response || axiosError?.request || axiosError?.code) {
        if (axiosError.code === 'ECONNABORTED') {
          showToast('error', 'Timeout', 'Request timed out');
        } else if (axiosError.response) {
          const status = axiosError.response.status;
          if (status === 400) {
            showToast('error', 'Invalid Data', 'Check your input');
          } else if (status === 404) {
            showToast('error', 'Not Found', 'Profile not found');
          } else if (status === 500) {
            showToast('error', 'Server Error', 'Try again later');
          } else {
            showToast('error', 'Update Failed', `Server error: ${status}`);
          }
        } else if (axiosError.request) {
          showToast('error', 'Network Error', 'Check your connection');
        } else {
          showToast('error', 'Error', 'Unexpected error occurred');
        }
      } else {
        showToast('error', 'Error', 'Failed to update profile');
      }
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

  // Logout functionality
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      showToast('success', 'Logged Out', 'You have been logged out successfully');
      setTimeout(() => {
        router.push('/auth/LoginScreen');
      }, 1000);
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

          {/* Logout Button */}
          <Pressable 
            onPress={handleLogout} 
            style={styles.logoutButtonWrapper}
          >
            <LinearGradient
              colors={['#474747', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutButton}
            >
              <Icon name="sign-out" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </LinearGradient>
          </Pressable>
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
  // Toast styles
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
  // Dialog styles
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
  // Logout button styles
  logoutButtonWrapper: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    minWidth: 200,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
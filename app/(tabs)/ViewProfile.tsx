//ViewProfile.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

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

export default function ViewProfile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const BASE_URL = "http://192.168.0.152:5000/api";
  
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
          Alert.alert("Authentication Required", "Please log in to view your profile.");
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
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Photo upload functionality
  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!cameraPermission.granted || !mediaLibraryPermission.granted) {
      Alert.alert('Permissions Required', 'Camera and photo access are needed.');
      return false;
    }
    return true;
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

  const handlePhotoSelection = () => {
    Alert.alert('Update Profile Picture', 'Choose an option', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Photo Library', onPress: openImagePicker },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    if (!(await requestPermissions())) return;
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateProfilePhoto(result.assets[0].uri);
    }
  };

  const openImagePicker = async () => {
    if (!(await requestPermissions())) return;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateProfilePhoto(result.assets[0].uri);
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

      Alert.alert('Success', 'Profile picture updated!');
      setOriginalProfile(prev => ({ ...prev, photo: base64Image }));
      
    } catch (error) {
      console.error('Photo update error:', error);
      setProfile(prev => ({ ...prev, photo: originalProfile?.photo || null }));
      Alert.alert('Error', 'Failed to update photo. Please try again.');
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
        Alert.alert("Validation Error", `${name} is required.`);
        return false;
      }
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

      Alert.alert("Success", "Profile updated successfully!");
      setOriginalProfile({ ...updatedProfile });
      setIsEditing(false);
      
    } catch (error: any) {
      console.error("Profile update error:", error);
      
      if (error?.response) {
        Alert.alert("Update Failed", `Server error: ${error.response.status}`);
      } else if (error?.request) {
        Alert.alert("Network Error", "Please check your connection.");
      } else {
        Alert.alert("Error", "Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Navigation and editing controls
  const handleGoBack = () => router.push('/(tabs)/Home');
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    if (originalProfile) setProfile({ ...originalProfile });
    setIsEditing(false);
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.safeArea, styles.centerContent, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // Not authenticated state
  if (!currentUser) {
    return (
      <View style={[styles.safeArea, styles.centerContent, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Text style={styles.errorText}>Please log in to view your profile</Text>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.title}>My Profile</Text>
            <TouchableOpacity 
              onPress={isEditing ? handleCancel : handleEdit} 
              style={styles.editIcon}
            >
              <Icon 
                name={isEditing ? "times" : "pencil"} 
                size={20} 
                color={isEditing ? "#FF6B6B" : "#007AFF"} 
              />
            </TouchableOpacity>
          </View>

          {/* Profile Photo */}
          <View style={styles.photoContainer}>
            <TouchableOpacity 
              onPress={handlePhotoSelection}
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
            </TouchableOpacity>
            <Text style={styles.photoHintText}>Tap to change photo</Text>
          </View>

          {/* Profile Form */}
          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="First Name"
            value={profile?.firstName || ''}
            editable={isEditing}
            onChangeText={(text) => setProfile(prev => ({ ...prev, firstName: text }))}
          />
          
          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="Last Name"
            value={profile?.lastName || ''}
            editable={isEditing}
            onChangeText={(text) => setProfile(prev => ({ ...prev, lastName: text }))}
          />
          
          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={profile?.dob || ''}
            editable={isEditing}
            onChangeText={(text) => setProfile(prev => ({ ...prev, dob: text }))}
          />
          
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Email"
            value={profile?.email || ''}
            editable={false}
          />
          
          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="Phone Number"
            value={profile?.phone || ''}
            editable={isEditing}
            keyboardType="phone-pad"
            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
          />
          
          <TextInput
            style={[styles.input, isEditing && styles.editableInput]}
            placeholder="Gender"
            value={profile?.gender || ''}
            editable={isEditing}
            onChangeText={(text) => setProfile(prev => ({ ...prev, gender: text }))}
          />

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
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
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#333',
    flex: 1,
  },
  editIcon: { 
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
  },
  photoContainer: { alignItems: 'center', marginBottom: 30 },
  photoWrapper: { position: 'relative', marginBottom: 8 },
  photo: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#f0f0f0' },
  photoEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
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
  photoHintText: { fontSize: 14, color: '#666', textAlign: 'center' },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  editableInput: {
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: { backgroundColor: '#ccc' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#777' },
  errorText: { fontSize: 18, color: 'red' },
});
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BellIcon from '../../assets/icons/bell.png';
import Greeting from '../../constants/Greeting';

interface HeaderProps {
  userEmail: string | null;
  userName?: string | null;
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  photo?: string | null;
  email?: string;
  _id?: string;
  hasPhoto?: boolean;
}

interface CheckEmailResponse {
  exists: boolean;
  profile?: {
    id: string;
    name: string;
    hasPhoto: boolean;
  } | null;
}

interface ProfileResponse {
  message: string;
  profile: ProfileData;
}

export default function Header({ userEmail, userName }: HeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('Guest');
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [profileCheckComplete, setProfileCheckComplete] = useState(false);

  // New state to handle modal visibility
  const [isModalVisible, setModalVisible] = useState(false);

  const BASE_URL = "http://192.168.0.152:5000/api";

  // Get current user from AsyncStorage
  const getCurrentUser = async (): Promise<UserData | null> => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  };

  // Check if profile exists for user email
  const checkProfileExists = async (email: string): Promise<boolean> => {
    try {
      const checkResponse = await axios.get<CheckEmailResponse>(`${BASE_URL}/profiles/check-email/${encodeURIComponent(email)}`);
      return checkResponse.data.exists;
    } catch (error) {
      console.error("Error checking profile existence:", error);
      return false;
    }
  };

  // Fetch user's profile data including photo
  const fetchUserProfile = async (email: string): Promise<ProfileData | null> => {
    try {
      const profileResponse = await axios.get<ProfileResponse>(`${BASE_URL}/profiles/by-email/${encodeURIComponent(email)}`);
      return profileResponse.data.profile || null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Navigate to profile creation with user info
  const navigateToProfileCreation = (user: UserData) => {
    router.push({
      pathname: '/(tabs)/Profile',
      params: {
        userEmail: user.email,
        firstName: user.firstName || '',
        fromHeader: 'true',
      },
    });
  };

  // Handle avatar click - navigate to appropriate page
  const handleAvatarClick = () => {
    if (loading) return;
    
    if (profileExists && userProfile) {
      // Profile exists, go to view profile
      router.push('/(tabs)/ViewProfile');
    } else if (currentUser) {
      // No profile, show modal for profile creation
      setModalVisible(true);
    }
  };

  // Load user data and profile on component mount and focus
  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const exists = await checkProfileExists(user.email);
        setProfileExists(exists);

        if (exists) {
          const profile = await fetchUserProfile(user.email);
          setUserProfile(profile);
          setProfilePhoto(profile?.photo || null);
          setDisplayName(profile?.firstName && profile?.lastName 
            ? `${profile.firstName} ${profile.lastName}`
            : userName || user.firstName || user.email || 'Guest');
        } else {
          setDisplayName(userName || user.firstName || user.email || 'Guest');
        }
      } else {
        setCurrentUser(null);
        setProfileExists(false);
        setDisplayName(userName || userEmail || 'Guest');
      }

      setProfileCheckComplete(true);
    } catch (error) {
      console.error("Error loading user data:", error);
      setDisplayName('Guest');
      setProfileExists(false);
      setProfileCheckComplete(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userEmail, userName]);

  useFocusEffect(
    React.useCallback(() => {
      if (profileCheckComplete) {
        loadUserData();
      }
    }, [profileCheckComplete])
  );

  const getProfileImageSource = () => {
    if (profilePhoto && profilePhoto.startsWith('data:image')) {
      return { uri: profilePhoto };
    }
    return require('../../assets/images/avatar.png');
  };

  const getAvatarStyle = () => {
    if (loading) {
      return [styles.avatar, { opacity: 0.7 }];
    }

    if (profileExists && userProfile) {
      return [styles.avatar, { borderColor: '#4CAF50' }]; // Green border for complete profile
    } else {
      return [styles.avatar, { borderColor: '#FF9800' }]; // Orange border for incomplete profile
    }
  };

  // Close modal when the cross button is clicked
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.header}>
      <Pressable onPress={handleAvatarClick} style={styles.avatarContainer} disabled={loading}>
        {loading ? (
          <View style={styles.avatarLoading}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        ) : (
          <Image source={getProfileImageSource()} style={getAvatarStyle()} />
        )}
      </Pressable>

      <View style={styles.greetingContainer}>
        <Greeting />
        {loading ? (
          <View style={styles.nameLoading}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <Text style={styles.username} numberOfLines={1}>
            {displayName}
          </Text>
        )}
      </View>

      <Pressable style={styles.notificationWrapper} onPress={() => router.push('/auth/notifications')}>
        <Image source={BellIcon} style={styles.bellIcon} />
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>2</Text>
        </View>
      </Pressable>

      {/* Modal for profile creation prompt */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
            <Text style={styles.modalText}>Complete your profile to continue using the app.</Text>
            <Pressable onPress={() => navigateToProfileCreation(currentUser!)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Create Profile</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 10,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  avatarLoading: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIncompleteIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF9800',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileIncompleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  greetingContainer: {
    flex: 1,
    marginRight: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000',
    fontFamily: 'BebasNeue_400Regular',
  },
  profileStatus: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
    marginTop: 2,
  },
  nameLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'BebasNeue_400Regular',
  },
  bellIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // New styles for the modal
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignSelf: 'center',
    maxHeight: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 25,
    zIndex: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});


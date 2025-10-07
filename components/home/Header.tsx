import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
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

interface UnreadCountResponse {
  count: number;
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
  
  // Notification count state
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const BASE_URL = "http://192.168.0.154:5000/api";
  const NOTIFICATIONS_URL = "http://192.168.0.154:5000/api/notifications";

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

  // Fetch notification count from the mobile endpoint
  const fetchNotificationCount = async () => {
    try {
      const response = await fetch(`${NOTIFICATIONS_URL}/mobile/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: UnreadCountResponse = await response.json();
        setNotificationCount(data.count);
      } else {
        console.error('Failed to fetch notification count:', response.status);
        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
      setNotificationCount(0);
    }
  };

  // Handle avatar click - only navigate to view profile if profile exists
  const handleAvatarClick = () => {
    if (loading) return;
    
    if (profileExists && userProfile) {
      // Profile exists, go to view profile
      router.push('/(tabs)/ViewProfile');
    } else {
      // No profile exists - do nothing or show a subtle indicator
      console.log('User profile not found. Avatar click ignored.');
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    router.push('/auth/notifications');
  };

  // Load user data and profile on component mount and focus
  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      if (user) {
        setCurrentUser(user);
        
        try {
          const exists = await checkProfileExists(user.email);
          setProfileExists(exists);

          if (exists) {
            const profile = await fetchUserProfile(user.email);
            if (profile) {
              setUserProfile(profile);
              setProfilePhoto(profile?.photo || null);
              setDisplayName(profile?.firstName && profile?.lastName 
                ? `${profile.firstName} ${profile.lastName}`
                : userName || user.firstName || user.email || 'Guest');
            } else {
              // Profile check returned exists but couldn't fetch - use fallback
              setDisplayName(userName || user.firstName || user.email || 'Guest');
              setProfileExists(false);
            }
          } else {
            // No profile exists - use user data as fallback
            setDisplayName(userName || user.firstName || user.email || 'Guest');
          }
        } catch (profileError) {
          console.error("Error during profile check:", profileError);
          // If profile check fails, continue with basic user info
          setDisplayName(userName || user.firstName || user.email || 'Guest');
          setProfileExists(false);
        }
      } else {
        // No user logged in
        setCurrentUser(null);
        setProfileExists(false);
        setDisplayName(userName || userEmail || 'Guest');
        setNotificationCount(0);
      }

      setProfileCheckComplete(true);
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback to basic display
      setDisplayName('Guest');
      setProfileExists(false);
      setProfileCheckComplete(true);
      setNotificationCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications whenever the component is focused
  useEffect(() => {
    loadUserData();
    fetchNotificationCount();
  }, [userEmail, userName]);

  useFocusEffect(
    React.useCallback(() => {
      if (profileCheckComplete) {
        loadUserData();
        fetchNotificationCount(); // Refresh notification count on focus
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
    return [styles.avatar, { borderWidth: 0 }]; // No border for complete profile
  } else {
    return [styles.avatar, { borderWidth: 0 }]; // No border for no profile
  }
};

  return (
    <View style={styles.header}>
      <Pressable onPress={handleAvatarClick} style={styles.avatarContainer} disabled={loading || !profileExists}>
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

      <Pressable style={styles.notificationWrapper} onPress={handleNotificationClick}>
        <Image source={BellIcon} style={styles.bellIcon} />
        {/* Only show badge if there are unread notifications */}
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </Text>
          </View>
        )}
      </Pressable>
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
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
});
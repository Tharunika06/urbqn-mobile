// components/home/Header.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Greeting from '../../constants/Greeting';

// Import types
import type { UserData, ProfileData } from '../../types/index';

// Import services
import {
  checkProfileExists,
  fetchUserProfile,
  fetchNotificationCount,
} from '../../services/api.service';

// Import utils
import {
  getCurrentUser,
  getCurrentUserId,
  getDisplayName,
  getProfileImageSource,
} from '../../utils/user.utils';

import { BELL_ICON } from '../../utils/staticData';

interface HeaderProps {
  userEmail: string | null;
  userName?: string | null;
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
  const [notificationCount, setNotificationCount] = useState<number>(0);

  // Handle avatar click - only navigate to view profile if profile exists
  const handleAvatarClick = () => {
    if (loading) return;
    
    if (profileExists && userProfile) {
      router.push('/(tabs)/ViewProfile');
    } else {
      console.log('User profile not found. Avatar click ignored.');
    }
  };

  // Handle notification click
  const handleNotificationClick = () => {
    router.push('/auth/notifications');
  };

  // Load notification count
  const loadNotificationCount = async () => {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.warn(' No user ID found - user not logged in');
        setNotificationCount(0);
        return;
      }

      const count = await fetchNotificationCount(userId);
      setNotificationCount(count);
    } catch (error) {
      console.error("Error loading notification count:", error);
      setNotificationCount(0);
    }
  };

  // Load user data and profile
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
              setDisplayName(getDisplayName(profile, user, userName || 'Guest'));
            } else {
              setDisplayName(getDisplayName(null, user, userName || 'Guest'));
              setProfileExists(false);
            }
          } else {
            setDisplayName(getDisplayName(null, user, userName || 'Guest'));
          }
        } catch (profileError) {
          console.error("Error during profile check:", profileError);
          setDisplayName(getDisplayName(null, user, userName || 'Guest'));
          setProfileExists(false);
        }
      } else {
        setCurrentUser(null);
        setProfileExists(false);
        setDisplayName(userName || userEmail || 'Guest');
        setNotificationCount(0);
      }

      setProfileCheckComplete(true);
    } catch (error) {
      console.error("Error loading user data:", error);
      setDisplayName('Guest');
      setProfileExists(false);
      setProfileCheckComplete(true);
      setNotificationCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadUserData();
    loadNotificationCount();
  }, [userEmail, userName]);

  // Refresh on focus
  useFocusEffect(
    React.useCallback(() => {
      if (profileCheckComplete) {
        loadUserData();
        loadNotificationCount();
      }
    }, [profileCheckComplete])
  );

  const getAvatarStyle = () => {
    if (loading) {
      return [styles.avatar, { opacity: 0.7 }];
    }
    return [styles.avatar, { borderWidth: 0 }];
  };

  return (
    <View style={styles.header}>
      <Pressable 
        onPress={handleAvatarClick} 
        style={styles.avatarContainer} 
        disabled={loading || !profileExists}
      >
        {loading ? (
          <View style={styles.avatarLoading}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        ) : (
          <Image 
            source={getProfileImageSource(profilePhoto)} 
            style={getAvatarStyle()} 
          />
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
        <Image source={BELL_ICON} style={styles.bellIcon} />
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
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import Footer from '../../../components/Footer';

type TabKey = 'All' | 'Review' | 'Sold' | 'House' | 'Villa' | 'Rental';

type Notification = {
  _id: string;
  type: string;
  title?: string;
  message: string; // Admin message (technical)
  userMessage?: string; // User-friendly message for mobile
  userName?: string;
  userImage?: string;
  propertyName?: string;
  time: string;
  isRead: boolean;
};

const icons = {
  backArrow: require('../../../assets/icons/back-arrow.png'),
  delete: require('../../../assets/icons/delete.png'),
};

const TABS: TabKey[] = ['All', 'Review', 'Sold', 'House', 'Villa', 'Rental'];

// ✅ YOUR CORRECT API BASE URL (Note: removed /notification, kept /api)
const API_BASE_URL = 'http://192.168.0.152:5000/api';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from API with better error handling
  const fetchNotifications = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
        setError(null);
      }
      
      const typeParam = activeTab !== 'All' ? `?type=${activeTab}` : '';
      // ✅ This will call: http://192.168.0.152:5000/api/notifications
      const url = `${API_BASE_URL}/notifications${typeParam}`;
      
      console.log('🔄 Fetching from:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server response:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Notifications fetched:', data.length);
      setNotifications(data);
      setError(null);
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      
      let errorMessage = 'Failed to load notifications';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Server not responding.\n\nCheck if server is running on:\nhttp://192.168.0.152:5000';
      } else if (error.message === 'Network request failed') {
        errorMessage = 'Cannot connect to server.\n\nTroubleshooting:\n1. Server running?\n2. Same WiFi network?\n3. Firewall blocking?\n\nServer: http://192.168.0.152:5000';
      } else if (error.message.includes('Server error')) {
        errorMessage = `Server error: ${error.message}\n\nCheck server console for errors.`;
      }
      
      setError(errorMessage);
      
      if (showLoader) {
        Alert.alert(
          'Connection Error',
          errorMessage,
          [
            { text: 'Retry', onPress: () => fetchNotifications(true) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchNotifications();
  }, [activeTab, fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  const deleteNotification = async (id: string) => {
    try {
      // ✅ DELETE: http://192.168.0.152:5000/api/notifications/:id
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications(prev => prev.filter(notif => notif._id !== id));
      Alert.alert('Success', 'Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // ✅ PUT: http://192.168.0.152:5000/api/notifications/:id/read
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === id ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getDefaultAvatar = (type: string) => {
    try {
      return require('../../../assets/images/placeholder.png');
    } catch {
      return null;
    }
  };

  const timeAgo = (timestamp: string) => {
    try {
      const now = new Date();
      const notifTime = new Date(timestamp);
      const diffInMinutes = Math.floor((now.getTime() - notifTime.getTime()) / 60000);

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const renderRightActions = () => (
      <View style={styles.swipeDeleteContainer}>
        <Pressable
          style={styles.deleteBtn}
          onPress={() => {
            Alert.alert(
              'Delete Notification',
              'Are you sure you want to delete this notification?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  onPress: () => deleteNotification(item._id), 
                  style: 'destructive' 
                },
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </Pressable>
      </View>
    );

    const displayName = item.title || item.userName || 'Notification';

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <Pressable 
          onPress={() => markAsRead(item._id)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={[styles.card, !item.isRead && styles.unreadCard]}>
            <Image
              source={
                item.userImage
                  ? { uri: item.userImage }
                  : getDefaultAvatar(item.type)
              }
              style={styles.avatar}
            />
            <View style={styles.textGroup}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.timeText}>{timeAgo(item.time)}</Text>
              </View>
              <Text style={styles.message} numberOfLines={2}>
                {item.message}
              </Text>
              {item.propertyName && (
                <Text style={styles.propertyName} numberOfLines={1}>
                  {item.propertyName}
                </Text>
              )}
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Pressable 
            style={styles.iconCircle} 
            onPress={() => navigation.goBack()}
          >
            <Image source={icons.backArrow} style={styles.icon} />
          </Pressable>

          <View style={styles.segmentContainer}>
            <Pressable style={[styles.segmentButton, styles.activeSegment]}>
              <Text style={[styles.segmentText, styles.activeSegmentText]}>
                Notification
              </Text>
            </Pressable>

            <Pressable
              style={styles.segmentButton}
              onPress={() => router.push('/auth/notifications/MessagesScreen')}
            >
              <Text style={styles.segmentText}>Messages</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContainer}
          >
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={styles.tabWrapper}
              >
                {activeTab === tab ? (
                  <LinearGradient
                    colors={['#1e90ff', '#007aff']}
                    style={styles.activeTab}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.activeTabText}>{tab}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveTab}>
                    <Text style={styles.inactiveTabText}>{tab}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1e90ff" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
            <Text style={styles.apiUrlText}>Server: {API_BASE_URL}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color="#ff4444" />
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => fetchNotifications(true)}>
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={renderNotificationItem}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
                <Text style={styles.noData}>No notifications</Text>
                <Text style={styles.noDataSubtext}>
                  {activeTab === 'All' 
                    ? 'You have no notifications yet' 
                    : `No ${activeTab} notifications`}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}

        <Footer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f6f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f6f6f6',
    borderRadius: 20,
    padding: 4,
    alignSelf: 'center',
    marginBottom: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#555',
  },
  activeSegment: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeSegmentText: {
    color: '#1a2238',
    fontFamily: 'Montserrat_700Bold',
  },
  tabsContainer: {
    height: 48,
  },
  tabsScrollContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabWrapper: {
    marginRight: 10,
  },
  activeTab: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  activeTabText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
  },
  inactiveTab: {
    backgroundColor: '#f6f5f9',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  inactiveTabText: {
    color: '#1a2238',
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
  },
  flatListContent: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  unreadCard: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#1e90ff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  textGroup: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: '#1a2238',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  message: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    fontFamily: 'Montserrat_400Regular',
  },
  propertyName: {
    fontSize: 11,
    color: '#1e90ff',
    marginTop: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1e90ff',
    marginLeft: 8,
  },
  swipeDeleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    width: 85,
    height: '87%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 10,
  },
  deleteBtn: {
    padding: 12,
    borderRadius: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  apiUrlText: {
    marginTop: 8,
    fontSize: 11,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#ff4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#1e90ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noData: {
    textAlign: 'center',
    color: '#333',
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  noDataSubtext: {
    textAlign: 'center',
    color: '#888',
    marginTop: 8,
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
  },
});
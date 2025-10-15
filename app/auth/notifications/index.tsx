// urban/app/auth/notifications/index.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import Footer from '../../../components/Footer';
import { getCurrentUserId } from '../../../utils/auth';
type TabKey = 'All' | 'Review' | 'Sold' | 'House' | 'Villa' | 'Rental';

type Notification = {
  _id: string;
  type: string;
  title?: string;
  message: string;
  userName?: string;
  userImage?: string;
  propertyName?: string;
  propertyImage?: string;
  time: string;
  isRead: boolean;
};

interface PopupProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  type?: 'success' | 'error' | 'warning' | 'confirm';
  showCancel?: boolean;
}

const CustomPopup: React.FC<PopupProps> = ({ 
  visible, 
  title, 
  message, 
  onClose, 
  onConfirm,
  type = 'error',
  showCancel = false 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
      case 'confirm':
        return '#FF9800';
      default:
        return '#F44336';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      case 'confirm':
        return '?';
      default:
        return '✕';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={popupStyles.overlay}>
        <Animated.View style={[popupStyles.container, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[popupStyles.iconCircle, { backgroundColor: getIconColor() }]}>
            <Text style={popupStyles.iconText}>{getIcon()}</Text>
          </View>
          <Text style={popupStyles.title}>{title}</Text>
          <Text style={popupStyles.message}>{message}</Text>
          
          <View style={popupStyles.buttonContainer}>
            {showCancel && (
              <Pressable 
                style={[popupStyles.button, popupStyles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={popupStyles.cancelButtonText}>Cancel</Text>
              </Pressable>
            )}
            <Pressable 
              style={[
                popupStyles.button, 
                popupStyles.confirmButton,
                showCancel && { flex: 1 }
              ]} 
              onPress={onConfirm || onClose}
            >
              <Text style={popupStyles.confirmButtonText}>
                {showCancel ? (type === 'confirm' ? 'Confirm' : 'Delete') : 'OK'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const icons = {
  backArrow: require('../../../assets/icons/back-arrow.png'),
  delete: require('../../../assets/icons/delete.png'),
};

const TABS: TabKey[] = ['All', 'Review', 'Sold', 'House', 'Villa', 'Rental'];

const API_BASE_URL = 'http://192.168.0.154:5000/api/notifications';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
   const [userId, setUserId] = useState<string | null>(null); 
  const [popup, setPopup] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'confirm';
    showCancel: boolean;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
  });

  const showPopup = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'confirm' = 'error',
    onConfirm?: () => void,
    showCancel = false
  ) => {
    setPopup({ visible: true, title, message, type, showCancel, onConfirm });
  };

  const closePopup = () => {
    setPopup({ 
      visible: false, 
      title: '', 
      message: '', 
      type: 'error', 
      showCancel: false 
    });
  };

  const fetchUnreadCount = async () => {
    try {
      if (!userId) return;
      
      const response = await fetch(`${API_BASE_URL}/mobile/unread-count?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
        setError(null);
      }

      if (!userId) {
        console.warn('⚠️ No userId available');
        setLoading(false);
        return;
      }
      
      let url = `${API_BASE_URL}/mobile?userId=${userId}`;
      if (activeTab !== 'All') {
        url += `&type=${activeTab}`;
      }
      
      console.log('🔄 Fetching mobile notifications from:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server response:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Mobile notifications fetched:', data.length);
      
      let filteredData = data;
      if (activeTab !== 'All') {
        filteredData = data.filter((notif: Notification) => notif.type === activeTab);
      }
      
      setNotifications(filteredData);
      setError(null);
      fetchUnreadCount();
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      let errorMessage = 'Failed to load notifications';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Server not responding.\n\nCheck if server is running on:\nhttp://192.168.0.154:5000';
      } else if (error.message === 'Network request failed') {
        errorMessage = 'Cannot connect to server.\n\nTroubleshooting:\n1. Server running?\n2. Same WiFi network?\n3. Firewall blocking?\n\nServer: http://192.168.0.154:5000';
      } else if (error.message.includes('Server error')) {
        errorMessage = `Server error: ${error.message}\n\nCheck server console for errors.`;
      }
      
      setError(errorMessage);
      
      if (showLoader) {
        showPopup(
          'Connection Error',
          errorMessage,
          'error',
          () => {
            closePopup();
            fetchNotifications(true);
          },
          true
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, userId]); // ← ADD userId to dependencies

  // ✅ UPDATED: Initialize userId on mount
  useEffect(() => {
    const initializeUserId = async () => {
      const id = await getCurrentUserId();
      if (id) {
        setUserId(id);
        console.log('✅ User ID loaded:', id);
      } else {
        console.warn('⚠️ No user ID found - user not logged in');
      }
    };
    
    initializeUserId();
  }, []);

  // ✅ UPDATED: Fetch notifications only after userId is set
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [activeTab, fetchNotifications, userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  // ✅ UPDATED: Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications(prev => prev.filter(notif => notif._id !== id));
      fetchUnreadCount();
      showPopup('Success', 'Notification deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showPopup('Error', 'Failed to delete notification', 'error');
    }
  };

  // ✅ UPDATED: Mark as read with userId
  const markAsRead = async (id: string) => {
    try {
      if (!userId) return;

      const response = await fetch(`${API_BASE_URL}/${id}/read`, {
        method: 'PUT', // Changed from PATCH to PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }), // ← SEND userId
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === id ? { ...notif, isRead: true } : notif
          )
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // ✅ UPDATED: Mark all as read with userId
  const markAllAsRead = async () => {
    try {
      if (!userId) return;

      const response = await fetch(`${API_BASE_URL}/mobile/mark-all-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }), // ← SEND userId
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        showPopup('Success', 'All notifications marked as read', 'success');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      showPopup('Error', 'Failed to mark all as read', 'error');
    }
  };

  const clearAllNotifications = async () => {
    showPopup(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      'confirm',
      async () => {
        closePopup();
        try {
          const response = await fetch(`${API_BASE_URL}/mobile/clear`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            setNotifications([]);
            setUnreadCount(0);
            showPopup('Success', 'All notifications cleared', 'success');
          }
        } catch (error) {
          console.error('Error clearing notifications:', error);
          showPopup('Error', 'Failed to clear notifications', 'error');
        }
      },
      true
    );
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
            showPopup(
              'Delete Notification',
              'Are you sure you want to delete this notification?',
              'confirm',
              () => {
                closePopup();
                deleteNotification(item._id);
              },
              true
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
            
            {(item.propertyImage || item.userImage) && (
              <Image
                source={{ uri: item.propertyImage || item.userImage }}
                style={styles.avatar}
              />
            )}

            <View style={styles.textGroup}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.timeText}>{timeAgo(item.time)}</Text>
              </View>
              <Text style={styles.message} numberOfLines={3}>
                {item.message}
              </Text>
              {item.propertyName && (
                <Text style={styles.propertyName} numberOfLines={1}>
                  📍 {item.propertyName}
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
          <View style={styles.headerRow}>
            <Pressable 
              style={styles.iconCircle} 
              onPress={() => navigation.goBack()}
            >
              <Image source={icons.backArrow} style={styles.icon} />
            </Pressable>

            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <Pressable 
                  style={styles.actionButton}
                  onPress={markAllAsRead}
                >
                  <Ionicons name="checkmark-done-outline" size={20} color="#1e90ff" />
                </Pressable>
              )}
              <Pressable 
                style={styles.actionButton}
                onPress={clearAllNotifications}
              >
                <Ionicons name="trash-outline" size={20} color="#ff4444" />
              </Pressable>
            </View>
          </View>

          <View style={styles.segmentContainer}>
            <Pressable style={[styles.segmentButton, styles.activeSegment]}>
              <Text style={[styles.segmentText, styles.activeSegmentText]}>
                Notification {unreadCount > 0 && `(${unreadCount})`}
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
      </View>

      <CustomPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        showCancel={popup.showCancel}
        onClose={closePopup}
        onConfirm={popup.onConfirm}
      />

      <Footer />
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
    paddingTop: 36,
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f6f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f6f5f9',
    justifyContent: 'center',
    alignItems: 'center',
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

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a2238',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#6c6c6c',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#1a2238',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});
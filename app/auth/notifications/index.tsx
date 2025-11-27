// urban/app/auth/notifications/index.tsx
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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import GradientButton from '../../../components/Button/GradientButton';
import Footer from '../../../components/Footer';
import { usePopup } from '../../../components/context/PopupContext';
import { getCurrentUserId } from '../../../utils/auth';
import { BASE_URL } from '../../../services/api.service';
import {
  notificationService,
  timeAgo,
  getNotificationImage,
  type Notification,
  type NotificationType,
} from '../../../services/notification.service';

type TabKey = 'All' | 'Review' | 'Sold' | 'House' | 'Villa' | 'Rental';

const icons = {
  backArrow: require('../../../assets/icons/back-arrow.png'),
};

const TABS: TabKey[] = ['All', 'Review', 'Sold', 'House', 'Villa', 'Rental'];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const popup = usePopup(); // 🎯 Global popup hook
  
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      if (!userId) return;
      const count = await notificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
          setError(null);
        }

        if (!userId) {
          console.warn('No userId available');
          setLoading(false);
          return;
        }

        const result = await notificationService.fetchNotifications(
          userId,
          activeTab !== 'All' ? activeTab : undefined
        );

        if (!result.success) {
          setError(result.error || 'Failed to load notifications');
          if (showLoader) {
            popup.showError(
              'Connection Error',
              result.error || 'Failed to load notifications',
              () => fetchNotifications(true)
            );
          }
        } else {
          setNotifications(result.notifications);
          setError(null);
          fetchUnreadCount();
        }
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        const errorMessage = 'An unexpected error occurred';
        setError(errorMessage);

        if (showLoader) {
          popup.showError('Error', errorMessage, () => fetchNotifications(true));
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, userId, popup]
  );

  useEffect(() => {
    const initializeUserId = async () => {
      const id = await getCurrentUserId();
      if (id) {
        setUserId(id);
        console.log('User ID loaded:', id);
      } else {
        console.warn('No user ID found - user not logged in');
      }
    };

    initializeUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [activeTab, fetchNotifications, userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    if (!userId) {
      popup.showError('Error', 'User ID not found');
      return;
    }

    popup.showConfirm(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      async () => {
        try {
          const result = await notificationService.deleteNotification(id, userId);

          if (result.success) {
            setNotifications((prev) => prev.filter((notif) => notif._id !== id));
            fetchUnreadCount();
            popup.showSuccess('Deleted', 'Notification deleted successfully');
          } else {
            popup.showError('Error', result.error || 'Failed to delete notification');
          }
        } catch (error) {
          console.error('Error deleting notification:', error);
          popup.showError('Error', 'Failed to delete notification');
        }
      }
    );
  };

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      if (!userId) return;

      const result = await notificationService.markAsRead(id, userId);

      if (result.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, isRead: true } : notif
          )
        );
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      if (!userId) return;

      const result = await notificationService.markAllAsRead(userId);

      if (result.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        popup.showSuccess('Done', 'All notifications marked as read');
      } else {
        popup.showError('Error', result.error || 'Failed to mark all as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      popup.showError('Error', 'Failed to mark all as read');
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    popup.showConfirm(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      async () => {
        try {
          if (!userId) {
            popup.showError('Error', 'User ID not found');
            return;
          }

          const result = await notificationService.clearAllNotifications(userId);

          if (result.success) {
            setNotifications([]);
            setUnreadCount(0);
            popup.showSuccess('Cleared', 'All notifications cleared');
          } else {
            popup.showError('Error', result.error || 'Failed to clear notifications');
          }
        } catch (error) {
          console.error('Error clearing notifications:', error);
          popup.showError('Error', 'Failed to clear notifications');
        }
      }
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const renderRightActions = () => (
      <View style={styles.swipeDeleteContainer}>
        <Pressable
          style={styles.deleteBtn}
          onPress={() => deleteNotification(item._id)}
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
            <Image source={getNotificationImage(item)} style={styles.avatar} />

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
                <Pressable style={styles.actionButton} onPress={markAllAsRead}>
                  <Ionicons
                    name="checkmark-done-outline"
                    size={20}
                    color="#1e90ff"
                  />
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
              <View key={tab} style={styles.tabWrapper}>
                <GradientButton
                  onPress={() => setActiveTab(tab)}
                  colors={
                    activeTab === tab
                      ? ['#1e90ff', '#007aff']
                      : ['#f6f5f9', '#f6f5f9']
                  }
                  label={tab}
                  buttonStyle={styles.tabButton}
                  textStyle={
                    activeTab === tab
                      ? styles.activeTabText
                      : styles.inactiveTabText
                  }
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1e90ff" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
            <Text style={styles.apiUrlText}>Server: {BASE_URL}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color="#ff4444" />
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => fetchNotifications(true)}
            >
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
                <Ionicons
                  name="notifications-off-outline"
                  size={64}
                  color="#ccc"
                />
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
  tabButton: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    width: 'auto',
    height: 'auto',
    marginBottom: 0,
  },
  activeTabText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
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
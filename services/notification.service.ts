// services/notification.service.ts
import { BASE_URL } from './api.service';

export type NotificationType = 'All' | 'Review' | 'Sold' | 'House' | 'Villa' | 'Rental';

export interface Notification {
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
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  error?: string;
}

export interface NotificationActionResponse {
  success: boolean;
  error?: string;
}

class NotificationService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch notifications for a user
   */
  async fetchNotifications(
    userId: string,
    type?: string
  ): Promise<NotificationResponse> {
    try {
      console.log('📖 Fetching notifications for user:', userId);
      
      // Updated to use new endpoint: /notifications/:userId/notifications
      const url = type
        ? `${this.baseUrl}/notifications/${userId}/notifications?type=${type}`
        : `${this.baseUrl}/notifications/${userId}/notifications`;

      console.log('🔗 Request URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response Status:', response.status);

      if (response.status === 404) {
        console.log('ℹ️ No notifications endpoint or no notifications found');
        return {
          success: true,
          notifications: [],
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Fetch notifications error:', errorData);
        return {
          success: false,
          notifications: [],
          error: errorData.message || `Server error: ${response.status}`,
        };
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.notifications?.length || 0} notifications`);
      
      return {
        success: true,
        notifications: data.notifications || data || [],
      };
    } catch (error: any) {
      console.error('❌ Fetch notifications error:', error);
      return {
        success: false,
        notifications: [],
        error: error.message || 'Network error - please check your connection',
      };
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      console.log('🔢 Getting unread count for user:', userId);
      
      // Updated to use new endpoint: /notifications/:userId/unread-count
      const response = await fetch(
        `${this.baseUrl}/notifications/${userId}/unread-count`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 404) {
        console.log('ℹ️ Unread count endpoint not available');
        return 0;
      }

      if (!response.ok) {
        console.error('⚠️ Failed to fetch unread count:', response.status);
        return 0;
      }

      const data = await response.json();
      console.log(`✅ Unread count: ${data.count || 0}`);
      return data.count || 0;
    } catch (error) {
      console.error('❌ Get unread count error:', error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationActionResponse> {
    try {
      console.log('✅ Marking notification as read:', notificationId);
      
      const response = await fetch(
        `${this.baseUrl}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || 'Failed to mark as read',
        };
      }

      console.log('✅ Notification marked as read');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Mark as read error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<NotificationActionResponse> {
    try {
      console.log('✅ Marking all as read for user:', userId);
      
      // Updated to use new endpoint: /notifications/:userId/read-all
      const response = await fetch(
        `${this.baseUrl}/notifications/${userId}/read-all`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || 'Failed to mark all as read',
        };
      }

      console.log('✅ All notifications marked as read');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Mark all as read error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<NotificationActionResponse> {
    try {
      console.log('🗑️ Deleting notification:', notificationId, 'for user:', userId);
      
      // Use the mobile soft-delete endpoint
      const response = await fetch(
        `${this.baseUrl}/notifications/mobile/${notificationId}/delete-for-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || 'Failed to delete notification',
        };
      }

      console.log('✅ Notification deleted');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Delete notification error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(
    userId: string
  ): Promise<NotificationActionResponse> {
    try {
      console.log('🧹 Clearing all notifications for user:', userId);
      
      // Updated to use new endpoint: /notifications/:userId/clear-all
      const response = await fetch(
        `${this.baseUrl}/notifications/${userId}/clear-all`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || 'Failed to clear notifications',
        };
      }

      console.log('✅ All notifications cleared');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Clear all notifications error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService(BASE_URL);

// Export utility functions
export const timeAgo = (timestamp: string): string => {
  try {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - notifTime.getTime()) / 60000
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  } catch {
    return 'Recently';
  }
};

// Static images for notifications
export const NOTIFICATION_IMAGES = {
  propertyCreated: require('../assets/icons/property-created.png'),
  propertyDeleted: require('../assets/icons/property-deleted.png'),
  ownerNotification: require('../assets/icons/owner-icon.png'),
  defaultProperty: require('../assets/icons/default-property.png'),
  defaultUser: require('../assets/icons/placeholder.png'),
};

export const getNotificationImage = (notification: Notification) => {
  const message = notification.message.toLowerCase();

  if (
    message.includes('property created') ||
    message.includes('new property')
  ) {
    return NOTIFICATION_IMAGES.propertyCreated;
  }

  if (message.includes('property deleted') || message.includes('removed')) {
    return NOTIFICATION_IMAGES.propertyDeleted;
  }

  if (message.includes('owner') || notification.type === 'owner') {
    return NOTIFICATION_IMAGES.ownerNotification;
  }

  if (notification.propertyName || notification.type === 'property') {
    return NOTIFICATION_IMAGES.defaultProperty;
  }

  return NOTIFICATION_IMAGES.defaultUser;
};
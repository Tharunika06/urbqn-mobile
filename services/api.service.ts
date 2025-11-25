// services/api.service.ts
import axios from 'axios';
import type {
  UserData,
  ProfileData,
  CheckEmailResponse,
  ProfileResponse,
  UnreadCountResponse,
  Property,
  PopularProperty,
  Owner,
  ApiOwnerResponse,
  ApiResponse,
} from '../types/index';

// ============ API Configuration ============
const BASE_URL = "http://192.168.0.153:5000/api";
const NOTIFICATIONS_URL = "http://192.168.0.153:5000/api/notifications";

// Configure axios defaults
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ============ Authentication APIs ============
export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<{ 
    success: boolean; 
    data?: any; 
    error?: string;
    requiresVerification?: boolean;
  }> => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.error || 'Invalid credentials',
          requiresVerification: error.response.data?.requiresVerification
        };
      }
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  // Signup
  signup: async (email: string, password: string): Promise<{ 
    success: boolean; 
    error?: string;
  }> => {
    try {
      const response = await axios.post(`${BASE_URL}/signup`, { email, password });
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.error || 'Unable to create account'
        };
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Forgot Password - Send OTP
  forgotPassword: async (email: string): Promise<{ 
    success: boolean; 
    error?: string;
  }> => {
    try {
      const response = await axios.post(`${BASE_URL}/forgot-password`, { email });
      return { success: true };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.error || 'Failed to send OTP'
        };
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Verify OTP (for signup)
  verifySignupOTP: async (email: string, otp: string): Promise<{ 
    success: boolean; 
    error?: string;
  }> => {
    try {
      const response = await axios.post(`${BASE_URL}/verify-code`, { email, otp });
      return { success: true };
    } catch (error: any) {
      console.error('Verify signup OTP error:', error);
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.error || 'Invalid or expired OTP'
        };
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Verify OTP (for password reset)
  verifyResetOTP: async (email: string, otp: string): Promise<{ 
    success: boolean; 
    error?: string;
  }> => {
    try {
      const response = await axios.post(`${BASE_URL}/verify-reset-otp`, { email, otp });
      return { success: true };
    } catch (error: any) {
      console.error('Verify reset OTP error:', error);
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.error || 'Invalid or expired OTP'
        };
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  // Reset Password
  resetPassword: async (email: string, password: string): Promise<{ 
    success: boolean; 
    error?: string;
  }> => {
    try {
      const response = await axios.post(`${BASE_URL}/reset-password`, { email, password });
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.error || 'Failed to reset password'
        };
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  },
};

// ============ Profile APIs ============
export const checkProfileExists = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.get<CheckEmailResponse>(
      `${BASE_URL}/profiles/check-email/${encodeURIComponent(email)}`
    );
    return response.data.exists;
  } catch (error) {
    console.error("Error checking profile existence:", error);
    return false;
  }
};

export const fetchUserProfile = async (email: string): Promise<ProfileData | null> => {
  try {
    const response = await axios.get<ProfileResponse>(
      `${BASE_URL}/profiles/by-email/${encodeURIComponent(email)}`
    );
    return response.data.profile || null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const createProfile = async (profileData: ProfileData): Promise<{ success: boolean; error?: string }> => {
  try {
    await axios.post(
      `${BASE_URL}/profiles`,
      profileData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );
    return { success: true };
  } catch (error: any) {
    console.error("Error creating profile:", error);
    let errorMessage = "Failed to create profile. Please try again.";
    
    if (error.response) {
      errorMessage = error.response.data?.error || errorMessage;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timeout. Please try again.";
    }
    
    return { success: false, error: errorMessage };
  }
};

export const updateProfile = async (
  email: string,
  profileData: Partial<ProfileData>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await axios.put(
      `${BASE_URL}/profiles/by-email/${encodeURIComponent(email)}`,
      profileData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    let errorMessage = "Failed to update profile.";
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timed out.";
    } else if (error.response) {
      const status = error.response.status;
      if (status === 400) errorMessage = "Invalid data provided.";
      else if (status === 404) errorMessage = "Profile not found.";
      else if (status === 500) errorMessage = "Server error. Try again later.";
      else errorMessage = `Server error: ${status}`;
    } else if (error.request) {
      errorMessage = "Network error. Check your connection.";
    }
    
    return { success: false, error: errorMessage };
  }
};

export const updateProfilePhoto = async (
  email: string,
  photo: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await axios.patch(
      `${BASE_URL}/profiles/by-email/${encodeURIComponent(email)}/photo`,
      { photo },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile photo:", error);
    let errorMessage = "Failed to update photo.";
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = "Photo upload timed out.";
    } else if (error.response) {
      errorMessage = "Server error uploading photo.";
    } else if (error.request) {
      errorMessage = "Network error.";
    }
    
    return { success: false, error: errorMessage };
  }
};

// ============ Notification APIs ============
export const fetchNotificationCount = async (userId: string): Promise<number> => {
  try {
    if (!userId) {
      console.warn('No user ID provided');
      return 0;
    }

    console.log('Fetching notification count for user:', userId);

    const response = await fetch(
      `${NOTIFICATIONS_URL}/mobile/unread-count?userId=${userId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.ok) {
      const data: UnreadCountResponse = await response.json();
      return data.count;
    } else {
      return 0;
    }
  } catch (error) {
    return 0;
  }
};

// ============ Property APIs ============
export const fetchProperties = async (filter: string = 'All'): Promise<Property[]> => {
  try {
    const endpoint = filter === 'All' 
      ? `${BASE_URL}/property` 
      : `${BASE_URL}/property?category=${filter}`;
    
    const response = await axios.get<Property[]>(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
};

export const fetchPropertyById = async (id: string | number): Promise<Property | null> => {
  try {
    const response = await axios.get<Property>(`${BASE_URL}/property/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
};

export const searchProperties = async (query: string): Promise<Property[]> => {
  try {
    const response = await axios.get<Property[]>(`${BASE_URL}/property`);
    const allProperties = response.data;
    
    if (!query.trim()) {
      return [];
    }

    const searchLower = query.toLowerCase().trim();
    
    return allProperties.filter(property => {
      const nameMatch = property.name?.toLowerCase().includes(searchLower) ?? false;
      const locationMatch = property.country?.toLowerCase().includes(searchLower) ?? false;
      const addressMatch = property.address?.toLowerCase().includes(searchLower) ?? false;
      
      const facilityMatch = Array.isArray(property.facility) 
        ? property.facility.some(f => f?.toLowerCase().includes(searchLower))
        : false;
      
      const priceMatch = 
        property.price?.toString().includes(query) ||
        property.rentPrice?.toString().includes(query) ||
        property.salePrice?.toString().includes(query);

      const ownerMatch = property.ownerName?.toLowerCase().includes(searchLower) ?? false;

      return nameMatch || locationMatch || addressMatch || facilityMatch || priceMatch || ownerMatch;
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    return [];
  }
};

// ============ Featured Properties API ============
export const fetchFeaturedProperties = async (
  limit: number = 10
): Promise<{ properties: Property[]; error: string | null }> => {
  try {
    const url = `${BASE_URL}/favorites/popular/${limit}`;
    console.log('Fetching featured properties from:', url);

    const response = await axios.get<ApiResponse<Property>>(url);
    const data = response.data;

    console.log('Featured API Response:', JSON.stringify(data, null, 2));

    if (data.success && data.properties) {
      const propertiesList = data.properties.map((item: any) => 
        item.property || item
      );
      console.log(`Loaded ${propertiesList.length} featured properties`);
      return { properties: propertiesList, error: null };
    }
    
    return { 
      properties: [], 
      error: data.message || 'Failed to load featured properties' 
    };
  } catch (err) {
    console.error('Error fetching featured properties:', err);
    return { 
      properties: [], 
      error: 'Unable to load featured properties. Please try again.' 
    };
  }
};

// ============ Popular Properties API ============
interface PopularPropertiesResponse {
  success: boolean;
  properties?: PopularProperty[];
  message?: string;
  error?: string;
}

export const fetchPopularProperties = async (
  limit: number = 10
): Promise<{ properties: PopularProperty[]; error: string | null }> => {
  try {
    const url = `${BASE_URL}/favorites/popular/${limit}`;
    console.log('Fetching popular properties from:', url);

    const response = await axios.get<PopularPropertiesResponse>(url);
    const data = response.data;

    if (data.success && data.properties) {
      console.log(`Loaded ${data.properties.length} popular properties`);
      return { properties: data.properties, error: null };
    }
    
    return { 
      properties: [], 
      error: data.message || 'Failed to load popular properties' 
    };
  } catch (err) {
    console.error('Error fetching popular properties:', err);
    return { 
      properties: [], 
      error: 'Unable to load popular properties. Please try again.' 
    };
  }
};

// ============ Owner APIs ============
export const fetchOwners = async (): Promise<{ owners: Owner[]; error: string | null }> => {
  try {
    const response = await axios.get<ApiOwnerResponse>(`${BASE_URL}/owners`);
    
    if (response.data && response.data.owners && Array.isArray(response.data.owners)) {
      return { owners: response.data.owners, error: null };
    }
    
    return { owners: [], error: 'Invalid data received from server' };
  } catch (error) {
    console.error('Error fetching owners:', error);
    return { owners: [], error: 'Failed to fetch owners' };
  }
};

// ============ Export Configuration ============
export { BASE_URL, NOTIFICATIONS_URL };

// ============ Notification APIs ============
interface NotificationsResponse {
  notifications?: any[];
  [key: string]: any;
}

export const notificationAPI = {
  // Get unread notification count
  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      if (!userId) {
        console.warn('No user ID provided');
        return 0;
      }

      const response = await axios.get<UnreadCountResponse>(
        `${NOTIFICATIONS_URL}/mobile/unread-count?userId=${userId}`
      );

      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Fetch notifications with optional type filter
  fetchNotifications: async (
    userId: string,
    type?: string
  ): Promise<{ notifications: any[]; error: string | null }> => {
    try {
      if (!userId) {
        return { notifications: [], error: 'User ID is required' };
      }

      let url = `${NOTIFICATIONS_URL}/mobile?userId=${userId}`;
      if (type && type !== 'All') {
        url += `&type=${type}`;
      }

      const response = await axios.get<any[]>(url, { timeout: 10000 });

      let notifications = response.data;
      
      // Ensure notifications is an array
      if (!Array.isArray(notifications)) {
        console.warn('Unexpected response format, expected array');
        notifications = [];
      }
      
      // Filter by type if needed
      if (type && type !== 'All') {
        notifications = notifications.filter((notif: any) => notif.type === type);
      }

      return { notifications, error: null };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      
      let errorMessage = 'Failed to load notifications';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Server not responding.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Check your connection.';
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      }

      return { notifications: [], error: errorMessage };
    }
  },

  // Delete notification for user
  deleteNotification: async (
    notificationId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!userId) {
        return { success: false, error: 'User ID not found' };
      }

      const response = await axios.post(
        `${NOTIFICATIONS_URL}/mobile/${notificationId}/delete-for-user`,
        { userId }
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete notification' 
      };
    }
  },

  // Mark notification as read
  markAsRead: async (
    notificationId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!userId) {
        return { success: false, error: 'User ID not found' };
      }

      const response = await axios.put(
        `${NOTIFICATIONS_URL}/${notificationId}/read`,
        { userId }
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error marking as read:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to mark as read' 
      };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!userId) {
        return { success: false, error: 'User ID not found' };
      }

      const response = await axios.post(
        `${NOTIFICATIONS_URL}/mobile/mark-all-read`,
        { userId }
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to mark all as read' 
      };
    }
  },

  // Clear all notifications for user
  clearAllNotifications: async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!userId) {
        return { success: false, error: 'User ID not found' };
      }

      const response = await axios.post(
        `${NOTIFICATIONS_URL}/mobile/clear-for-user`,
        { userId }
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error clearing notifications:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to clear notifications' 
      };
    }
  },
};
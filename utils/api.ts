import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const API_BASE_URL = 'http://192.168.0.152:5000/api';

export const apiGet = async (endpoint: string) => {
  const token = await AsyncStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    await AsyncStorage.multiRemove(['authToken', 'user']);
    Alert.alert('Session Expired', 'Please login again');
    router.replace('/auth/LoginScreen');
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return await response.json();
};

export const apiPost = async (endpoint: string, data: any) => {
  const token = await AsyncStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (response.status === 401) {
    await AsyncStorage.multiRemove(['authToken', 'user']);
    Alert.alert('Session Expired', 'Please login again');
    router.replace('/auth/LoginScreen');
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return await response.json();
};  
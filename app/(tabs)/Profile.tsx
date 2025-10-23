import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, ScrollView, StatusBar, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface ProfileData {
  firstName: string | undefined;
  lastName: string | undefined;
  dob: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  gender: string | undefined;
  photo: string | null | undefined;
}

// Custom popup interface
interface PopupConfig {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  buttons: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    phone: '',
    gender: '',
    photo: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Custom popup state
  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: []
  });

  const showPopup = (
    title: string, 
    message: string, 
    buttons: PopupConfig['buttons'] = [{ text: 'OK', onPress: () => hidePopup() }],
    type: PopupConfig['type'] = 'info'
  ) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
      buttons
    });
  };

  const hidePopup = () => {
    setPopupConfig(prev => ({ ...prev, visible: false }));
  };

  // Get popup icon based on type
  const getPopupIcon = (type: PopupConfig['type']) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#4CAF50' };
      case 'error':
        return { name: 'close-circle' as const, color: '#f44336' };
      case 'warning':
        return { name: 'warning' as const, color: '#ff9800' };
      case 'info':
      default:
        return { name: 'information-circle' as const, color: '#1a73e8' };
    }
  };

  // Custom popup component
  const CustomPopup = () => {
    if (!popupConfig.visible) return null;
    
    const icon = getPopupIcon(popupConfig.type);
    
    return (
      <Modal visible={popupConfig.visible} transparent={true} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            <View style={styles.popupIconContainer}>
              <Ionicons name={icon.name} size={64} color={icon.color} />
            </View>
            <Text style={styles.popupTitle}>{popupConfig.title}</Text>
            <Text style={styles.popupMessage}>{popupConfig.message}</Text>
            
            <View style={styles.popupButtonsContainer}>
              {popupConfig.buttons.map((button, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.popupButton,
                    button.style === 'cancel' && styles.popupCancelButton,
                    button.style === 'destructive' && styles.popupDestructiveButton,
                    popupConfig.buttons.length > 1 && { flex: 1, marginHorizontal: 4 }
                  ]} 
                  onPress={button.onPress}
                >
                  <Text style={[
                    styles.popupButtonText,
                    button.style === 'cancel' && styles.popupCancelButtonText,
                    button.style === 'destructive' && styles.popupDestructiveButtonText
                  ]}>
                    {button.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ✅ Pick image and convert to base64
  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showPopup(
          "Permission Required", 
          "Permission to access camera roll is required!",
          [{ text: 'OK', onPress: hidePopup }],
          'warning'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true, // ✅ Get base64 data
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // ✅ Determine proper MIME type from URI
        let mimeType = 'image/jpeg'; // default
        if (asset.uri) {
          const extension = asset.uri.split('.').pop()?.toLowerCase();
          switch (extension) {
            case 'png':
              mimeType = 'image/png';
              break;
            case 'gif':
              mimeType = 'image/gif';
              break;
            case 'webp':
              mimeType = 'image/webp';
              break;
            default:
              mimeType = 'image/jpeg';
          }
        }
        
        // ✅ Create proper data URL format with specific MIME type
        const base64Image = `data:${mimeType};base64,${asset.base64}`;
        
        console.log('Image MIME type:', mimeType);
        console.log('Base64 prefix:', base64Image.substring(0, 50) + '...');
        
        setProfile({
          ...profile,
          photo: base64Image,
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showPopup(
        "Error", 
        "Failed to pick image",
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
    }
  };

  // ✅ Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ Validate phone number (exactly 10 digits)
  const isValidPhone = (phone: string) => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    // Check if exactly 10 digits
    return digitsOnly.length === 10;
  };

  // ✅ Save profile with proper validation and error handling
  const handleSave = async () => {
    try {
      // ✅ Enhanced validation
      if (!profile.firstName?.trim()) {
        showPopup(
          "Validation Error", 
          "First Name is required.",
          [{ text: 'OK', onPress: hidePopup }],
          'error'
        );
        return;
      }

      if (!profile.lastName?.trim()) {
        showPopup(
          "Validation Error", 
          "Last Name is required.",
          [{ text: 'OK', onPress: hidePopup }],
          'error'
        );
        return;
      }

      if (!profile.email?.trim()) {
        showPopup(
          "Validation Error", 
          "Email is required.",
          [{ text: 'OK', onPress: hidePopup }],
          'error'
        );
        return;
      }

      if (!isValidEmail(profile.email)) {
        showPopup(
          "Validation Error", 
          "Please enter a valid email address.",
          [{ text: 'OK', onPress: hidePopup }],
          'error'
        );
        return;
      }

      if (profile.phone && !isValidPhone(profile.phone)) {
        showPopup(
          "Validation Error", 
          "Please enter a valid 10-digit phone number.",
          [{ text: 'OK', onPress: hidePopup }],
          'error'
        );
        return;
      }

      setLoading(true);

      // ✅ Prepare data as JSON (matching backend expectations)
      const profileData = {
        firstName: profile.firstName?.trim(),
        lastName: profile.lastName?.trim(),
        email: profile.email?.trim().toLowerCase(),
        phone: profile.phone?.trim(),
        dob: profile.dob,
        gender: profile.gender?.toLowerCase(),
        photo: profile.photo, // Base64 string or null
      };

      console.log('Sending profile data:', {
        ...profileData,
        photo: profileData.photo ? 'Base64 image data...' : null
      });

      // ✅ Use correct endpoint and send as JSON
      const response = await axios.post(
        "http://192.168.1.45:5000/api/profiles", // ✅ Correct endpoint
        profileData,
        {
          headers: {
            'Content-Type': 'application/json', // ✅ JSON content type
          },
          timeout: 30000, // 30 second timeout for large images
        }
      );

      console.log('✅ Profile saved successfully:', response.data);
      
      showPopup(
        "Success", 
        "Profile created successfully!",
        [
          {
            text: 'Continue',
            onPress: () => {
              hidePopup();
              // Reset form
              setProfile({
                firstName: '',
                lastName: '',
                dob: '',
                email: '',
                phone: '',
                gender: '',
                photo: null,
              });
              router.push('/auth/LoginScreen');
            }
          }
        ],
        'success' 
      );

    } catch (err: any) {
      console.error("❌ Save error:", err);
      
      let errorMessage = "Failed to save profile. Please try again.";
      
      if (err.response) {
        errorMessage = err.response.data?.error || errorMessage;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      }
      
      showPopup(
        "Error", 
        errorMessage,
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setProfile({ ...profile, dob: formattedDate });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Fill Your Profile</Text>

          {/* Profile Photo Section */}
          <View style={styles.photoContainer}>
            <Image
              source={
                profile.photo
                  ? { uri: profile.photo }
                  : require('../../assets/images/avatar.png')
              }
              style={styles.photo}
            />
            <Pressable 
              style={styles.editIcon} 
              onPress={pickImage}
              disabled={loading}
            >
              <Text style={styles.editIconText}>✎</Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <TextInput
            style={styles.input}
            placeholder="First Name *"
            value={profile.firstName}
            onChangeText={(text) => setProfile({ ...profile, firstName: text })}
            editable={!loading}
            maxLength={50}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name *"
            value={profile.lastName}
            onChangeText={(text) => setProfile({ ...profile, lastName: text })}
            editable={!loading}
            maxLength={50}
          />

          {/* DOB Picker */}
          <Pressable 
            onPress={() => !loading && setShowDatePicker(true)} 
            style={[styles.input, loading && styles.disabledInput]}
          >
            <Text style={profile.dob ? styles.dateText : styles.placeholderText}>
              {profile.dob ? new Date(profile.dob).toLocaleDateString() : "Select Date of Birth"}
            </Text>
          </Pressable>
          
          {showDatePicker && (
            <DateTimePicker
              value={profile.dob ? new Date(profile.dob) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email *"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number (10 digits)"
            keyboardType="phone-pad"
            value={profile.phone}
            onChangeText={(text) => {
              // Only allow digits, max 10
              const digitsOnly = text.replace(/\D/g, '').slice(0, 10);
              setProfile({ ...profile, phone: digitsOnly });
            }}
            editable={!loading}
            maxLength={10}
          />

          {/* Gender Dropdown */}
          <View style={[styles.pickerContainer, loading && styles.disabledInput]}>
            <Picker
              selectedValue={profile.gender}
              onValueChange={(value) => !loading && setProfile({ ...profile, gender: value })}
              enabled={!loading}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>

          {/* Save Button */}
          <Pressable 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Profile...' : 'Continue'}
            </Text>
          </Pressable>

          {/* Required fields note */}
          <Text style={styles.requiredNote}>* Required fields</Text>
        </View>
      </ScrollView>

      {/* Custom Popup */}
      <CustomPopup />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1,
    paddingBottom: 20
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 30,
    marginTop: 10,
    color: '#333'
  },
  photoContainer: { 
    alignItems: 'center', 
    marginBottom: 30,
    position: 'relative'
  },
  photo: { 
    width: 120, 
    height: 120, 
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#f0f0f0'
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: '35%',
    backgroundColor: '#090909ff',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 12,
    padding: 16, 
    marginBottom: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
    fontSize: 16,
    minHeight: 52
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999'
  },
  dateText: {
    color: '#333',
    fontSize: 16
  },
  placeholderText: {
    color: '#999',
    fontSize: 16
  },
  pickerContainer: {
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 12,
    marginBottom: 16, 
    overflow: "hidden",
    backgroundColor: '#fff',
    minHeight: 52
  },
  button: {
    backgroundColor: '#101011ff', 
    padding: 16, 
    borderRadius: 12, 
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0
  },
  buttonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontWeight: 'bold',
    fontSize: 16
  },
  requiredNote: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic'
  },

  // Popup styles
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 280,
    maxWidth: 350,
  },
  popupIconContainer: {
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2238',
    marginBottom: 12,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  popupButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  popupButton: {
    backgroundColor: '#171717ff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 100,
    marginRight:45
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  popupCancelButton: {
    backgroundColor: '#f3f3f3',
  },
  popupCancelButtonText: {
    color: '#666',
  },
  popupDestructiveButton: {
    backgroundColor: '#f44336',
  },
  popupDestructiveButtonText: {
    color: '#fff',
  },
});
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

export default function Profile() {
  const insets = useSafeAreaInsets();
  
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

  // ✅ Pick image and convert to base64
  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
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
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // ✅ Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ Validate phone number
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // ✅ Save profile with proper validation and error handling
  const handleSave = async () => {
    try {
      // ✅ Enhanced validation
      if (!profile.firstName?.trim()) {
        Alert.alert("Validation Error", "First Name is required.");
        return;
      }

      if (!profile.lastName?.trim()) {
        Alert.alert("Validation Error", "Last Name is required.");
        return;
      }

      if (!profile.email?.trim()) {
        Alert.alert("Validation Error", "Email is required.");
        return;
      }

      if (!isValidEmail(profile.email)) {
        Alert.alert("Validation Error", "Please enter a valid email address.");
        return;
      }

      if (profile.phone && !isValidPhone(profile.phone)) {
        Alert.alert("Validation Error", "Please enter a valid phone number.");
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
        "http://192.168.0.152:5000/api/profiles", // ✅ Correct endpoint
        profileData,
        {
          headers: {
            'Content-Type': 'application/json', // ✅ JSON content type
          },
          timeout: 30000, // 30 second timeout for large images
        }
      );

      console.log('✅ Profile saved successfully:', response.data);
      
      Alert.alert(
        "Success", 
        "Profile created successfully!",
        [
          {
            text: 'Continue',
            onPress: () => {
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
              router.push('/(tabs)/Home');
            }
          }
        ]
      );

    } catch (err: any) {
      console.error("❌ Save error:", err);
      
      let errorMessage = "Failed to save profile. Please try again.";
      
      if (err.response) {
        errorMessage = err.response.data?.error || errorMessage;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      }
      
      Alert.alert("Error", errorMessage);
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
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Status Bar Configuration */}
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      
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
            <TouchableOpacity 
              style={styles.editIcon} 
              onPress={pickImage}
              disabled={loading}
            >
              <Text style={styles.editIconText}>✎</Text>
            </TouchableOpacity>
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
          <TouchableOpacity 
            onPress={() => !loading && setShowDatePicker(true)} 
            style={[styles.input, loading && styles.disabledInput]}
          >
            <Text style={profile.dob ? styles.dateText : styles.placeholderText}>
              {profile.dob ? new Date(profile.dob).toLocaleDateString() : "Select Date of Birth"}
            </Text>
          </TouchableOpacity>
          
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
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={profile.phone}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            editable={!loading}
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
          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Profile...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {/* Required fields note */}
          <Text style={styles.requiredNote}>* Required fields</Text>
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: '#6C63FF',
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
    backgroundColor: '#6C63FF', 
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
  }
});

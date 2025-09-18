import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface ProfileData {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
  gender: string;
  photo: string | null;
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
  const router = useRouter();

  // ✅ Pick image with proper error handling
  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Fixed: Use MediaTypeOptions
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfile({
          ...profile,
          photo: result.assets[0].uri,
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // ✅ Save profile using FormData for proper file upload
  const handleSave = async () => {
    if (!/^\d{10}$/.test(profile.phone)) {
      Alert.alert("Invalid Phone", "Phone number must be 10 digits.");
      return;
    }
    if (!profile.firstName || !profile.email) {
      Alert.alert("Missing Fields", "First Name and Email are required.");
      return;
    }

    try {
      const formData = new FormData();
      
      // ✅ Match backend field names
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      formData.append('dob', profile.dob);
      formData.append('gender', profile.gender);

      // ✅ Append image if selected
      if (profile.photo) {
        const imageUri = profile.photo;
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const imageType = filename.split('.').pop();
        
        formData.append('profileImage', {
          uri: imageUri,
          type: `image/${imageType}`,
          name: filename,
        } as any);
      }

      // ✅ Use correct endpoint
      const response = await axios.post("http://192.168.0.152:5000/api/profiles/add-profile", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('Profile saved:', response.data);
      Alert.alert("Success", "Profile saved successfully!");
      router.push('/(tabs)/Home');
    } catch (err: any) {
      console.error("Save error:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        Alert.alert("Error", `Failed to save profile: ${err.response.data.error || 'Server error'}`);
      } else if (err.request) {
        Alert.alert("Error", "Network error. Please check your connection.");
      } else {
        Alert.alert("Error", "Failed to save profile.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fill Your Profile</Text>

      <View style={styles.photoContainer}>
        <Image
          source={
            profile.photo
              ? { uri: profile.photo }
              : require('../../assets/images/avatar.png')
          }
          style={styles.photo}
        />
        <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
          <Text style={{ color: '#fff' }}>✎</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={profile.firstName}
        onChangeText={(text) => setProfile({ ...profile, firstName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={profile.lastName}
        onChangeText={(text) => setProfile({ ...profile, lastName: text })}
      />

      {/* DOB Picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={profile.dob ? styles.dateText : styles.placeholderText}>
          {profile.dob ? profile.dob : "Select Date of Birth"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={profile.dob ? new Date(profile.dob) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()} // Prevent future dates
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setProfile({ ...profile, dob: selectedDate.toISOString().split('T')[0] });
            }
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={profile.email}
        onChangeText={(text) => setProfile({ ...profile, email: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="numeric"
        value={profile.phone}
        maxLength={10}
        onChangeText={(text) => setProfile({ ...profile, phone: text })}
      />

      {/* Gender Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={profile.gender}
          onValueChange={(value) => setProfile({ ...profile, gender: value })}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  editIcon: {
    position: 'absolute',
    bottom: 10,
    right: 120,
    backgroundColor: 'purple',
    borderRadius: 20,
    padding: 5,
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 10,
    padding: 12, 
    marginBottom: 12,
    justifyContent: 'center',
  },
  dateText: {
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  pickerContainer: {
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 10,
    marginBottom: 12, 
    overflow: "hidden",
  },
  button: {
    backgroundColor: '#6C63FF', 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 20,
  },
  buttonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
});
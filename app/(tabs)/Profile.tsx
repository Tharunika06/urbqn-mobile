// urban/app/(tabs)/Profile.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { createProfile } from '../../services/api.service';
import {validateName,validateEmail,validatePhone,formatPhoneNumber} from '../../utils/validation.utils';
import { pickAndConvertImage } from '../../utils/image.utils';
import { usePopup } from '../../components/context/PopupContext';

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
  const { showError, showSuccess } = usePopup();

  // Pick image using utility
  const pickImage = async () => {
    try {
      const base64Image = await pickAndConvertImage('library', {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        width: 400,
        height: 400,
        compress: 0.7
      });

      if (base64Image) {
        setProfile({ ...profile, photo: base64Image });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showError("Error", "Failed to pick image");
    }
  };

  // Save profile with validation
  const handleSave = async () => {
    try {
      // Validate first name
      const firstNameValidation = validateName(profile.firstName || '', 'First name');
      if (!firstNameValidation.valid) {
        showError("Validation Error", firstNameValidation.error!);
        return;
      }

      // Validate last name
      const lastNameValidation = validateName(profile.lastName || '', 'Last name');
      if (!lastNameValidation.valid) {
        showError("Validation Error", lastNameValidation.error!);
        return;
      }

      // Validate email
      const emailValidation = validateEmail(profile.email || '');
      if (!emailValidation.valid) {
        showError("Validation Error", emailValidation.error!);
        return;
      }

      // Validate phone if provided
      if (profile.phone) {
        const phoneValidation = validatePhone(profile.phone);
        if (!phoneValidation.valid) {
          showError("Validation Error", phoneValidation.error!);
          return;
        }
      }

      setLoading(true);

      // Prepare data
      const profileData = {
        firstName: profile.firstName?.trim(),
        lastName: profile.lastName?.trim(),
        email: profile.email?.trim().toLowerCase(),
        phone: profile.phone?.trim(),
        dob: profile.dob,
        gender: profile.gender?.toLowerCase(),
        photo: profile.photo,
      };

      console.log('Sending profile data:', {
        ...profileData,
        photo: profileData.photo ? 'Base64 image data...' : null
      });

      // Use API service
      const result = await createProfile(profileData);

      if (result.success) {
        showSuccess(
          "Success", 
          "Profile created successfully!",
          () => {
            setProfile({
              firstName: '',
              lastName: '',
              dob: '',
              email: '',
              phone: '',
              gender: '',
              photo: null,
            });
            router.push('/auth/Location/select-location');
          }
        );
      } else {
        showError("Error", result.error || "Failed to save profile");
      }

    } catch (err: any) {
      console.error("Save error:", err);
      showError("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

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
                  : require('../../assets/images/placeholder.png')
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
              const formatted = formatPhoneNumber(text);
              setProfile({ ...profile, phone: formatted });
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

          <Text style={styles.requiredNote}>* Required fields</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
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
});
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import {
  useFonts,
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';

interface Props {
  onClose: () => void;
  email: string;
}

export default function ResetPasswordScreen({ onClose, email }: Props) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Montserrat_400Regular,
  });

  if (!fontsLoaded) return null;

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }

    try {
      const res = await fetch('http://192.168.0.152:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Success', 'Password has been reset successfully!', [
          { text: 'OK', onPress: () => router.push('/auth/LoginScreen') },
        ]);
      } else {
        Alert.alert('Reset Failed', data.error || 'Please try again.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <View style={styles.overlay}>
      <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />

      <View style={styles.modal}>
        {/* 🔙 Custom back arrow */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('./auth/LoginScreen')}
        >
          <Image
            source={require('../../assets/icons/back-arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.heading}>RESET PASSWORD</Text>
        <Text style={styles.description}>
          Set the new password for your account so you can login and access all the features.
        </Text>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/icons/lock.png')}
            style={{ width: 18, height: 18, tintColor: '#6c757d' }}
          />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#6c757d"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <Image
              source={
                showNewPassword
                  ? require('../../assets/icons/eye.png')
                  : require('../../assets/icons/eye-off.png')
              }
              style={{ width: 20, height: 20, tintColor: '#6c757d' }}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/icons/lock.png')}
            style={{ width: 18, height: 18, tintColor: '#6c757d' }}
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#6c757d"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Image
              source={
                showConfirmPassword
                  ? require('../../assets/icons/eye.png')
                  : require('../../assets/icons/eye-off.png')
              }
              style={{ width: 20, height: 20, tintColor: '#6c757d' }}
            />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
                  <GradientButton
  onPress={handleSubmit}
  label="Submit"
  colors={['#000000', '#474747']}
 
/>

        <Text style={styles.legalText}>
          By continuing, you agree to Shopping{' '}
          <Text style={{ color: '#007aff' }}>Conditions of Use</Text> and{' '}
          <Text style={{ color: '#007aff' }}>Privacy Notice</Text>.
        </Text>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    width,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    paddingTop: 60,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  heading: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1,
    color: '#000',
  },
  description: {
    color: '#6c6c6c',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 16,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'SFProText-Bold', // Replace with local SF Pro if used
  },
  legalText: {
    fontSize: 12,
    color: '#6c6c6c',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
});

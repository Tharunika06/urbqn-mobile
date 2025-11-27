// urban/app/auth/ResetPasswordScreen.tsx
// ============================================================================
// urban/app/auth/ResetPasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';
import { authAPI } from '../../services/api.service';
import { usePopup } from '../../components/context/PopupContext';

interface Props {
  onClose: () => void;
  email: string;
  otp: string; // ✅ ADD THIS - OTP should be passed from parent
}

export default function ResetPasswordScreen({ onClose, email, otp }: Props) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showError, showSuccess } = usePopup();

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Montserrat_400Regular,
  });

  if (!fontsLoaded) return null;

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      showError('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Error', 'Passwords do not match');
      return;
    }

    try {
      // ✅ Pass all three parameters in correct order
      const result = await authAPI.resetPassword(email, newPassword, otp);

      if (result.success) {
        showSuccess('Success', 'Password has been reset successfully!', () => {
          router.push('/auth/LoginScreen');
        });
      } else {
        showError('Reset Failed', result.error || 'Please try again.');
      }
    } catch (err) {
      console.error(err);
      showError('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <View style={styles.fullScreen}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />

      <View style={styles.modalContainer}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <Image
            source={require('../../assets/icons/back-arrow.png')}
            style={styles.backIcon}
          />
        </Pressable>

        <Text style={styles.heading}>RESET PASSWORD</Text>
        <Text style={styles.description}>
          Set the new password for your account so you can login and access all the features.
        </Text>

        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/icons/lock.png')}
            style={{ width: 18, height: 18, tintColor: '#6c757d', marginRight: 10 }}
          />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#6c757d"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
          />
          <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
            <Image
              source={
                showNewPassword
                  ? require('../../assets/icons/eye.png')
                  : require('../../assets/icons/eye-off.png')
              }
              style={{ width: 20, height: 20, tintColor: '#6c757d' }}
            />
          </Pressable>
        </View>

        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/icons/lock.png')}
            style={{ width: 18, height: 18, tintColor: '#6c757d', marginRight: 10 }}
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#6c757d"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
          <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Image
              source={
                showConfirmPassword
                  ? require('../../assets/icons/eye.png')
                  : require('../../assets/icons/eye-off.png')
              }
              style={{ width: 20, height: 20, tintColor: '#6c757d' }}
            />
          </Pressable>
        </View>

        <GradientButton
          onPress={handleSubmit}
          label="Submit"
          colors={['#000000', '#474747']}
        />

        <Text style={styles.legalText}>
          By continuing, you agree to Shopping{' '}
          <Text style={styles.link}>Conditions of Use</Text> and{' '}
          <Text style={styles.link}>Privacy Notice</Text>.
        </Text>
      </View>
    </View>
  );
}

const { width: resetWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: resetWidth,
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 60,
    paddingBottom: 40,
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
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1,
    color: '#000',
  },
  description: {
    color: '#6c6c6c',
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
    fontSize: 14,
  },
  legalText: {
    fontSize: 12,
    color: '#6c6c6c',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 16,
    lineHeight: 18,
  },
  link: {
    color: '#007aff',
    fontFamily: 'Montserrat_400Regular',
  },
});
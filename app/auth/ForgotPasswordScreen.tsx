// urban/app/auth/ForgotPasswordScreen.tsx
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
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';
import { authAPI } from '../../services/api.service';
import { usePopup } from '../../components/context/PopupContext';

interface Props {
  onClose: () => void;
  onContinue: (email: string) => void;
}

export default function ForgetPasswordScreen({ onClose, onContinue }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showWarning, showSuccess, showError } = usePopup();

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Montserrat_400Regular,
  });

  if (!fontsLoaded) return null;

  const handleSendOTP = async () => {
    if (!email) {
      showWarning('Validation', 'Please enter your email');
      return;
    }

    try {
      setLoading(true);
      const result = await authAPI.forgotPassword(email);

      if (result.success) {
        showSuccess('Success', 'OTP sent to your email', () => {
          onContinue(email);
        });
      } else {
        showError('Error', result.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error(error);
      showError('Error', 'Something went wrong. Try again later.');
    } finally {
      setLoading(false);
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

        <Text style={styles.title}>FORGOT PASSWORD</Text>
        <Text style={styles.description}>
          Don't worry, it happens to the best of us. Enter your email address below and we'll help you reset your password.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#6c757d" style={styles.icon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#6c757d"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Pressable disabled={loading}>
          <GradientButton
            onPress={handleSendOTP}
            label={loading ? 'Sending OTP...' : 'Continue'}
            colors={['#000000', '#474747']}
          />
        </Pressable>

        <Text style={styles.legalText}>
          By continuing, you agree to Shopping{' '}
          <Text style={styles.link}>Conditions of Use</Text> and{' '}
          <Text style={styles.link}>Privacy Notice</Text>
        </Text>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width,
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
  title: {
    fontSize: 24,
    fontFamily: 'BebasNeue_400Regular',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
    color: '#000',
  },
  description: {
    color: '#6c6c6c',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontFamily: 'Montserrat_400Regular',
  },
  legalText: {
    fontSize: 12,
    color: '#6c6c6c',
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 18,
  },
  link: {
    color: '#0d6efd',
    fontFamily: 'Montserrat_400Regular',
  },
});
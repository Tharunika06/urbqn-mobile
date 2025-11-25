// urban/app/auth/VerificationScreen.tsx
// ============================================================================

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';
import { authAPI } from '../../services/api.service';
import { usePopup } from '../../components/context/PopupContext';

interface VerificationProps {
  onClose: () => void;
  onContinue: () => void;
  isFromSignup?: boolean;
  email: string;
}

export default function VerificationScreen({
  onClose,
  onContinue,
  isFromSignup = false,
  email,
}: VerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const { showWarning, showSuccess, showError } = usePopup();

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Montserrat_400Regular,
  });

  if (!fontsLoaded) return null;

  const handleChangeText = (val: string, index: number) => {
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (index === 5 && val.length === 1) {
      handleVerify(newCode.join(''));
    }
  };

  const handleVerify = async (otpParam?: string) => {
    const otp = otpParam || code.join('');
    if (otp.length < 6) {
      showWarning('Incomplete OTP', 'Please enter the full 6-digit code.');
      return;
    }

    try {
      const result = isFromSignup 
        ? await authAPI.verifySignupOTP(email, otp)
        : await authAPI.verifyResetOTP(email, otp);

      if (result.success) {
        showSuccess('Success', 'OTP verified successfully', onContinue);
      } else {
        showError('Verification Failed', result.error || 'Invalid or expired OTP');
      }
    } catch (error) {
      console.error('Verification Error:', error);
      showError('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.fullscreen}>
      <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />

      <View style={styles.modal}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <Image
            source={require('../../assets/icons/back-arrow.png')}
            style={styles.backIcon}
          />
        </Pressable>

        <Text style={styles.heading}>VERIFICATION</Text>
        <Text style={styles.description}>
          Enter the 6-digit code that you received on your email.
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(val) => handleChangeText(val, index)}
              maxLength={1}
              keyboardType="numeric"
              style={styles.codeInput}
              returnKeyType="next"
              onSubmitEditing={() => {
                if (index < 5) inputs.current[index + 1]?.focus();
              }}
            />
          ))}
        </View>

        <GradientButton
          onPress={() => handleVerify()}
          label="Continue"
          colors={['#000000', '#474747']}
        />

        <Text style={styles.footer}>
          By continuing, you agree to Shopping{' '}
          <Text style={styles.link}>Conditions of Use</Text> and{' '}
          <Text style={styles.link}>Privacy Notice</Text>.
        </Text>
      </View>
    </View>
  );
}

const { width: verifyWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  fullscreen: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modal: {
    width: verifyWidth,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  heading: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'BebasNeue_400Regular',
    color: '#000',
    letterSpacing: 1,
  },
  description: {
    color: '#6c6c6c',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 18,
    width: 45,
    height: 55,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
  },
  footer: {
    fontSize: 12,
    color: '#6c6c6c',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  link: {
    color: '#007aff',
    fontFamily: 'Montserrat_400Regular',
  },
});
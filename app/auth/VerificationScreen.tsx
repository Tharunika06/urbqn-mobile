import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  useFonts,
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';

interface VerificationProps {
  onClose: () => void;
  onContinue: () => void;
  isFromSignup?: boolean;
  email: string;
}

interface PopupProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning';
}

const CustomPopup: React.FC<PopupProps> = ({ visible, title, message, onClose, type = 'error' }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      default:
        return '#F44336';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.popupOverlay}>
        <Animated.View style={[styles.popupContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconCircle, { backgroundColor: getIconColor() }]}>
            <Text style={styles.iconText}>
              {type === 'success' ? '✓' : type === 'warning' ? '!' : '✕'}
            </Text>
          </View>
          <Text style={styles.popupTitle}>{title}</Text>
          <Text style={styles.popupMessage}>{message}</Text>
          <Pressable style={styles.popupButton} onPress={onClose}>
            <Text style={styles.popupButtonText}>OK</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default function VerificationScreen({
  onClose,
  onContinue,
  isFromSignup = false,
  email,
}: VerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [popup, setPopup] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
    onCloseAction?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Montserrat_400Regular,
  });

  if (!fontsLoaded) return null;

  const showPopup = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' = 'error',
    onCloseAction?: () => void
  ) => {
    setPopup({ visible: true, title, message, type, onCloseAction });
  };

  const closePopup = () => {
    const action = popup.onCloseAction;
    setPopup({ visible: false, title: '', message: '', type: 'error' });
    if (action) action();
  };

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
      showPopup('Incomplete OTP', 'Please enter the full 6-digit code.', 'warning');
      return;
    }

    const endpoint = isFromSignup ? '/api/verify-code' : '/api/verify-reset-otp';

    try {
      const response = await fetch(`http://192.168.0.154:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        showPopup('Success', 'OTP verified successfully', 'success', onContinue);
      } else {
        showPopup('Verification Failed', data.error || 'Invalid or expired OTP', 'error');
      }
    } catch (error) {
      console.error('Verification Error:', error);
      showPopup('Error', 'Something went wrong. Please try again.', 'error');
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

      <CustomPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={closePopup}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

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
    width,
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
  // Popup styles
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  popupTitle: {
    fontSize: 20,
    fontFamily: 'BebasNeue_400Regular',
    color: '#000',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  popupMessage: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#6c6c6c',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  popupButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    fontWeight: '600',
  },
});
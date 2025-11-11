import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';

interface Props {
  onClose: () => void;
  onContinue: (email: string) => void;
}

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

export default function ForgetPasswordScreen({ onClose, onContinue }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: []
  });

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Montserrat_400Regular,
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

  if (!fontsLoaded) return null;

  const handleSendOTP = async () => {
    if (!email) {
      showPopup(
        'Validation',
        'Please enter your email',
        [{ text: 'OK', onPress: hidePopup }],
        'warning'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        showPopup(
          'Success',
          'OTP sent to your email',
          [
            {
              text: 'OK',
              onPress: () => {
                hidePopup();
                onContinue(email);
              }
            }
          ],
          'success'
        );
      } else {
        showPopup(
          'Error',
          data.error || 'Failed to send OTP',
          [{ text: 'OK', onPress: hidePopup }],
          'error'
        );
      }
    } catch (error) {
      console.error(error);
      showPopup(
        'Error',
        'Something went wrong. Try again later.',
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
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

      <CustomPopup />
    </View>
  );
}

const { width, height } = Dimensions.get('window');

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
    fontFamily: 'BebasNeue_400Regular',
    letterSpacing: 1,
  },
  popupMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  popupButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  popupButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 8,
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    letterSpacing: 0.5,
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
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
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

export default function ResetPasswordScreen({ onClose, email }: Props) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      showPopup(
        'Error',
        'Please fill in all fields',
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      showPopup(
        'Error',
        'Passwords do not match',
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
      return;
    }

    try {
      const res = await fetch('http://192.168.0.154:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        showPopup(
          'Success',
          'Password has been reset successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                hidePopup();
                router.push('/auth/LoginScreen');
              }
            }
          ],
          'success'
        );
      } else {
        showPopup(
          'Reset Failed',
          data.error || 'Please try again.',
          [{ text: 'OK', onPress: hidePopup }],
          'error'
        );
      }
    } catch (err) {
      console.error(err);
      showPopup(
        'Error',
        'Something went wrong. Please try again later.',
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.overlay}>
        <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />

        <View style={styles.modal}>
          {/* 🔙 Custom back arrow */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.push('./auth/LoginScreen')}
          >
            <Image
              source={require('../../assets/icons/back-arrow.png')}
              style={styles.backIcon}
            />
          </Pressable>

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

      <CustomPopup />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  image: {
    width: 380,
    height: 460,
    marginTop: 40,
    marginBottom: 5,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    color: '#1e1e1e',
    lineHeight: 42,
    fontFamily: 'BebasNeue_400Regular',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginVertical: 20,
  },
  progressSegment: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d3d3d3',
  },
  activeSegment: {
    backgroundColor: '#0a84ff',
    width: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 130,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SFPro',
  },
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
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 10,
    borderRadius: 6,
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
  legalText: {
    fontSize: 12,
    color: '#6c6c6c',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    marginTop: 10,
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
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import VerificationScreen from './VerificationScreen';
import { useRouter } from 'expo-router';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';

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

export default function SignupScreen() {
  const [agree, setAgree] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: []
  });

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    BebasNeue_400Regular,
    SFPro: require('../../assets/fonts/SFPro-Regular.ttf'),
  });

  // Password validation function - checks all requirements
  const isValidPassword = (pass: string) => {
    // Requires: capital letter, lowercase letter, number, symbol, minimum 8 characters
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    return regex.test(pass);
  };

  // Detailed password validation to show specific errors
  const validatePasswordDetails = (pass: string) => {
    const errors: string[] = [];
    
    if (pass.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(pass)) {
      errors.push("at least one capital letter");
    }
    if (!/[a-z]/.test(pass)) {
      errors.push("at least one lowercase letter");
    }
    if (!/\d/.test(pass)) {
      errors.push("at least one number");
    }
    if (!/[@$!%*#?&]/.test(pass)) {
      errors.push("at least one symbol (@$!%*#?&)");
    }
    
    return errors;
  };

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

  const textStyle = {
    fontFamily: 'Montserrat_400Regular',
    color: '#1a2238',
  };

  if (!fontsLoaded) return null;

  const handleSignup = async () => {
    // Check if all fields are filled
    if (!email || !password) {
      showPopup(
        'Missing Information',
        'Please enter both email and password.',
        [{ text: 'OK', onPress: hidePopup }],
        'warning'
      );
      return; // STOP - Don't proceed
    }

    // Check if terms are agreed
    if (!agree) {
      showPopup(
        'Terms Required',
        'You must agree to the terms and conditions to continue.',
        [{ text: 'OK', onPress: hidePopup }],
        'warning'
      );
      return; // STOP - Don't proceed
    }

    // Validate password requirements
    const passwordErrors = validatePasswordDetails(password);
    if (passwordErrors.length > 0) {
      showPopup(
        'Invalid Password',
        `Password must contain:\n• ${passwordErrors.join('\n• ')}`,
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
      return; // STOP - Don't proceed to backend
    }

    // Double-check with main validation
    if (!isValidPassword(password)) {
      showPopup(
        'Invalid Password',
        'Password must be at least 8 characters and include: a capital letter, a lowercase letter, a number, and a symbol (@$!%*#?&).',
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
      return; // STOP - Don't proceed to backend
    }

    // Only proceed to backend if all validations pass
    try {
      const response = await fetch('http://192.168.1.45:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Only show verification modal if backend accepts
        setShowVerificationModal(true);
      } else {
        showPopup(
          'Signup Failed',
          result.error || 'Unable to create account. Please try again.',
          [{ text: 'OK', onPress: hidePopup }],
          'error'
        );
      }
    } catch (err) {
      console.error(err);
      showPopup(
        'Network Error',
        'Unable to connect to server. Please check your connection and try again.',
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>CREATE YOUR PLACE</Text>
        <Text style={[textStyle, styles.subtitle]}>
          Sign up now to gain access to member-only discounts and personalized recommendations.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#6c757d" style={styles.icon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#6c757d"
            style={[textStyle, styles.input]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#6c757d" style={styles.icon} />
          <TextInput
            placeholder="Password (8+ chars, A-z, 0-9, symbol)"
            placeholderTextColor="#6c757d"
            secureTextEntry={!showPassword}
            style={[textStyle, styles.input]}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#6c757d"
            />
          </Pressable>
        </View>

        <View style={styles.checkboxContainer}>
          <Pressable onPress={() => setAgree(!agree)}>
            <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={20} color="#000" />
          </Pressable>
          <Text style={[textStyle, styles.checkboxText]}>
            {' '}By clicking the <Text style={[textStyle, styles.link]}>Register</Text> button, you agree to the public offer
          </Text>
        </View>

        <GradientButton
          onPress={handleSignup}
          label="Sign up"
          colors={['#000000', '#474747']}
        />

        <View style={styles.dividerRow}>
          <Image source={require('../../assets/icons/left.png')} style={styles.lineImage} />
          <Text style={[textStyle, styles.orText]}>Or continue with</Text>
          <Image source={require('../../assets/icons/right.png')} style={styles.lineImage} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtons}>
          <Pressable style={styles.socialBtn}>
            <Image source={require('../../assets/icons/apple.png')} style={styles.socialIcon} />
            <Text style={[textStyle, styles.socialBtnText]}>Continue with Apple</Text>
          </Pressable>

          <Pressable style={styles.socialBtn}>
            <Image source={require('../../assets/icons/google.png')} style={styles.socialIcon} />
            <Text style={[textStyle, styles.socialBtnText]}>Continue with Google</Text>
          </Pressable>

          <Pressable style={styles.socialBtn}>
            <Image source={require('../../assets/icons/facebook.png')} style={styles.socialIcon} />
            <Text style={[textStyle, styles.socialBtnText]}>Continue with Facebook</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={[textStyle, styles.footer]}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => router.push('/auth/LoginScreen')}>
              Log In
            </Text>
          </Text>
        </View>

        <CustomPopup />
      </View>

      {/* Verification Modal with Blur Overlay */}
      {showVerificationModal && (
        <View style={styles.blurOverlayContainer}>
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
          <VerificationScreen
            onClose={() => setShowVerificationModal(false)}
            onContinue={() => {
              setShowVerificationModal(false);
              router.push('/auth/Location/select-location');
            }}
            isFromSignup={true}
            email={email}
          />
        </View>
      )}
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
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 90,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontFamily: 'BebasNeue_400Regular',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 8,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 50,
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginRight: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  checkboxText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'SFPro',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30,
  },
  lineImage: {
    width: 80,
    height: 2,
    resizeMode: 'contain',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 13,
    color: '#6c757d',
    fontFamily: 'Montserrat_400Regular',
  },
  socialButtons: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  socialBtn: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginLeft: 5,
    marginRight: 40,
    resizeMode: 'contain',
  },
  socialBtnText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footer: {
    fontSize: 13,
    color: '#6c757d',
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  blurOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
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
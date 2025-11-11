// userLoginScreen.tsx - WITH REMEMBER ME FUNCTIONALITY
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  Image,
  StyleSheet,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientButton from '../../components/Button/GradientButton';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { Prompt_700Bold } from '@expo-google-fonts/prompt';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import VerificationScreen from './VerificationScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function LoginScreen() {
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFromSignup, setIsFromSignup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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
    Prompt_700Bold,
  });

  // Load saved credentials on component mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedCredentials = await AsyncStorage.getItem('userCredentials');
      const rememberMeStatus = await AsyncStorage.getItem('rememberMe');
      
      if (savedCredentials && rememberMeStatus === 'true') {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
        console.log('✅ Loaded saved credentials');
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    } finally {
      setIsLoading(false);
    }
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

  // Handle Remember Me toggle
  const handleRememberMeToggle = async (value: boolean) => {
    setRememberMe(value);
    try {
      await AsyncStorage.setItem('rememberMe', value.toString());
      
      // If turning off remember me, clear saved credentials
      if (!value) {
        await AsyncStorage.removeItem('userCredentials');
        console.log('✅ Cleared saved credentials');
      }
    } catch (error) {
      console.error('Error saving remember me preference:', error);
    }
  };

  if (!fontsLoaded || isLoading) return null;

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store the authentication token
        if (data.token) {
          await AsyncStorage.setItem('authToken', data.token);
          console.log('✅ Token stored successfully');
        } else {
          console.warn('⚠️ No token received from server');
        }

        // ✅ Store complete user data
        if (data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          console.log('✅ User data stored:', data.user.email);
        }

        // ✅ Handle remember me - Save credentials ONLY on successful login
        if (rememberMe) {
          await AsyncStorage.setItem('userCredentials', JSON.stringify({ email, password }));
          await AsyncStorage.setItem('rememberMe', 'true');
          console.log('✅ Credentials saved for remember me');
        } else {
          await AsyncStorage.removeItem('userCredentials');
          await AsyncStorage.setItem('rememberMe', 'false');
          console.log('✅ Credentials not saved (remember me disabled)');
        }

        setShowSuccessModal(true);
      } else {
        // Handle specific error cases
        if (data.requiresVerification) {
          showPopup(
            'Email Not Verified',
            'Please verify your email first. We can resend the verification code.',
            [
              { text: 'Cancel', onPress: hidePopup, style: 'cancel' },
              {
                text: 'Verify Now',
                onPress: () => {
                  hidePopup();
                  setIsFromSignup(false);
                  setShowVerification(true);
                }
              }
            ],
            'warning'
          );
        } else {
          showPopup(
            'Login Failed',
            data.error || 'Invalid credentials',
            [{ text: 'OK', onPress: hidePopup }],
            'error'
          );
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      showPopup(
        'Error',
        'Something went wrong. Please check your connection and try again.',
        [{ text: 'OK', onPress: hidePopup }],
        'error'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.container}>
        {(showForgotPassword || showVerification || showResetPassword) && (
          <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
        )}

        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>WELCOME BACK!👋🏻</Text>
        <Text style={[textStyle, styles.subtitle]}>
          We're glad to see you again. Log in to access your account and explore our latest features.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#6c757d" style={styles.icon} />
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
            placeholder="Password"
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

        <View style={styles.optionsRow}>
          <View style={styles.rememberContainer}>
            <Switch
              value={rememberMe}
              onValueChange={handleRememberMeToggle}
              trackColor={{ false: '#ccc', true: '#0d6efd' }}
              thumbColor="#fff"
            />
            <Text style={styles.rememberText}>Remember Me</Text>
          </View>
          <Pressable
            onPress={() => {
              setIsFromSignup(false);
              setShowForgotPassword(true);
            }}
          >
            <Text style={[textStyle, styles.forgotText]}>Forgot Password?</Text>
          </Pressable>
        </View>

        <GradientButton
          onPress={handleLogin}
          label="Login"
          colors={['#000000', '#474747']}
        />

        <View style={styles.dividerRow}>
          <Image source={require('../../assets/icons/left.png')} style={styles.lineImage} />
          <Text style={[textStyle, styles.orText]}>Or continue with</Text>
          <Image source={require('../../assets/icons/right.png')} style={styles.lineImage} />
        </View>

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

        <View style={styles.signupRow}>
          <Text style={[textStyle, styles.footer]}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/auth/SignupScreen')}>
            <Text style={styles.link}>Sign up</Text>
          </Pressable>
        </View>

        {/* Modals */}
        <Modal transparent animationType="slide" visible={showForgotPassword}>
          <ForgotPasswordScreen
            onClose={() => setShowForgotPassword(false)}
            onContinue={(emailFromForgot) => {
              setEmail(emailFromForgot);
              setShowForgotPassword(false);
              setShowVerification(true);
            }}
          />
        </Modal>

        <Modal transparent animationType="slide" visible={showVerification}>
          <VerificationScreen
            email={email}
            isFromSignup={isFromSignup}
            onClose={() => setShowVerification(false)}
            onContinue={() => {
              setShowVerification(false);
              setShowResetPassword(true);
            }}
          />
        </Modal>

        <Modal transparent animationType="slide" visible={showResetPassword}>
          <ResetPasswordScreen
            onClose={() => {
              setShowResetPassword(false);
              setEmail('');
              setPassword('');
            }}
            email={email}
          />
        </Modal>

        <Modal transparent animationType="fade" visible={showSuccessModal}>
          <View style={styles.overlay}>
            <View style={styles.successCard}>
              <Image
                source={require('../../assets/images/success.png')}
                style={styles.successImage}
              />
              <Text style={styles.successText}>SUCCESSFULLY LOGGED IN</Text>
              <GradientButton
                label="Continue"
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/(tabs)/Home');
                }}
                colors={['#000000', '#474747']}
                buttonStyle={{ width: 300, height: 55 }}
              />
            </View>
          </View>
        </Modal>

        <CustomPopup />
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontFamily: 'Montserrat_400Regular',
    color: '#6c757d',
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
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  optionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#000',
    fontFamily: 'Montserrat_400Regular',
  },
  forgotText: {
    fontSize: 13,
    color: '#6c757d',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
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
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialBtnText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 50,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginLeft: 5,
    resizeMode: 'contain',
  },
  signupRow: {
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    width: 350,
    height: 390,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
  },
  successImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  successText: {
    fontSize: 26,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'BebasNeue_400Regular',
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
// urban/app/auth/LoginScreen.tsx
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
import { authAPI } from '../../services/api.service';
import { usePopup } from '../../components/context/PopupContext';

export default function LoginScreen() {
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // ✅ IMPROVED: Two separate OTP states for clarity
  const [signupOtp, setSignupOtp] = useState(''); // For signup verification
  const [resetOtp, setResetOtp] = useState(''); // For password reset
  
  const [isFromSignup, setIsFromSignup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const { showCustom, showError } = usePopup();

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    BebasNeue_400Regular,
    Prompt_700Bold,
  });

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
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const textStyle = {
    fontFamily: 'Montserrat_400Regular',
    color: '#1a2238',
  };

  const handleRememberMeToggle = async (value: boolean) => {
    setRememberMe(value);
    try {
      await AsyncStorage.setItem('rememberMe', value.toString());
      
      if (!value) {
        await AsyncStorage.removeItem('userCredentials');
      }
    } catch (error) {
      console.error('Error saving remember me preference:', error);
    }
  };

  if (!fontsLoaded || isLoading) return null;

  const handleLogin = async () => {
    try {
      const result = await authAPI.login(email, password);

      if (result.success && result.data) {
        if (result.data.token) {
          await AsyncStorage.setItem('authToken', result.data.token);
        } else {
          console.warn('No token received from server');
        }

        if (result.data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(result.data.user));
        }

        if (rememberMe) {
          await AsyncStorage.setItem('userCredentials', JSON.stringify({ email, password }));
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          await AsyncStorage.removeItem('userCredentials');
          await AsyncStorage.setItem('rememberMe', 'false');
        }

        setShowSuccessModal(true);
      } else {
        if (result.requiresVerification) {
          showCustom(
            'Email Not Verified',
            'Please verify your email first. We can resend the verification code.',
            [
              { text: 'Cancel', onPress: () => {}, style: 'cancel' },
              {
                text: 'Verify Now',
                onPress: () => {
                  setIsFromSignup(true); // ✅ This is for signup verification
                  setShowVerification(true);
                }
              }
            ],
            'warning'
          );
        } else {
          showError(
            'Login Failed',
            result.error || 'Invalid credentials'
          );
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      showError(
        'Error',
        'Something went wrong. Please check your connection and try again.'
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
              setIsFromSignup(false); // ✅ This is for password reset
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

        {/* Forgot Password Modal */}
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

        {/* Verification Modal - Used for BOTH signup and password reset */}
        <Modal transparent animationType="slide" visible={showVerification}>
          <VerificationScreen
            email={email}
            isFromSignup={isFromSignup}
            onClose={() => setShowVerification(false)}
            onContinue={(otp: string) => {
              // ✅ IMPROVED: Store OTP in the appropriate state based on flow
              if (isFromSignup) {
                // Signup verification - OTP not needed after verification
                setSignupOtp(otp);
                setShowVerification(false);
                // Could navigate to profile creation or show success
                showCustom(
                  'Verified!',
                  'Your email has been verified. You can now log in.',
                  [{ text: 'OK', onPress: () => {} }],
                  'success'
                );
              } else {
                // Password reset verification - OTP needed for reset
                setResetOtp(otp);
                setShowVerification(false);
                setShowResetPassword(true);
              }
            }}
          />
        </Modal>

        {/* Reset Password Modal */}
        <Modal transparent animationType="slide" visible={showResetPassword}>
          <ResetPasswordScreen
            onClose={() => {
              setShowResetPassword(false);
              setEmail('');
              setPassword('');
              setResetOtp(''); // ✅ Clear reset OTP
              setSignupOtp(''); // ✅ Clear signup OTP
            }}
            email={email}
            otp={resetOtp}  // ✅ Pass the reset OTP specifically
          />
        </Modal>

        {/* Success Modal */}
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
});
//LoginScreen.tsx

import React, { useState } from 'react';
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
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientButton from '../../components/Button/GradientButton';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';

import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

import ForgotPasswordScreen from './ForgotPasswordScreen';
import VerificationScreen from './VerificationScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    BebasNeue_400Regular,
  });
  const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};
  if (!fontsLoaded) return null;

  const handleLogin = async () => {
  try {
    const res = await fetch('http://192.168.0.152:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      await AsyncStorage.setItem('user', JSON.stringify({ email }));
      if (rememberMe) {
        await AsyncStorage.setItem('userCredentials', JSON.stringify({ email, password }));
      } else {  
        await AsyncStorage.removeItem('userCredentials');
      }
      setShowSuccessModal(true);
    } else {
      Alert.alert('Login Failed', data.error || 'Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Something went wrong. Please try again.');
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
        <Text style={[textStyle,styles.subtitle]}>
          We're glad to see you again. Log in to access your account and explore our latest features.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#6c757d" style={styles.icon} />
          <TextInput
            placeholder="User Name"
            placeholderTextColor="#6c757d"
            style={[textStyle,styles.input]}
            value={email}
            onChangeText={setEmail}
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
              onValueChange={() => setRememberMe(!rememberMe)}
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
            <Text style={[textStyle,styles.forgotText]}>Forgot Password?</Text>
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
          <Text style={[textStyle,styles.footer]}>Don't have an account? </Text>
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
            isFromSignup={isFromSignup} // ✅ important flag
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
              <Pressable
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/(tabs)/Home');
                }}
                style={styles.successButton}
              >
                <Text style={styles.successButtonText}>Continue</Text>
              </Pressable>
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
  fontFamily: 'SFPro', // ✅ SF Pro font
},
dividerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  marginBottom: 20,
},

lineImage: {
  width: 80,           // Adjust width to match your line length
  height: 2,           // Thin line look
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
  successButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 110,
    marginTop: 15,
    borderRadius: 10,
  },
  successButtonText: {
    color: '#fff',
      fontFamily: 'Prompt_700Bold',
    
  },
});
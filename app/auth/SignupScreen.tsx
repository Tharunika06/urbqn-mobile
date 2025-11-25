// urban/app/auth/SignupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import VerificationScreen from './VerificationScreen';
import { useRouter } from 'expo-router';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';
import { authAPI } from '../../services/api.service';
import { usePopup } from '../../components/context/PopupContext';

export default function SignupScreen() {
  const [agree, setAgree] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { showWarning, showError } = usePopup();

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    BebasNeue_400Regular,
    SFPro: require('../../assets/fonts/SFPro-Regular.ttf'),
  });

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

  const textStyle = {
    fontFamily: 'Montserrat_400Regular',
    color: '#1a2238',
  };

  if (!fontsLoaded) return null;

  const handleSignup = async () => {
    if (!email || !password) {
      showWarning('Missing Information', 'Please enter both email and password.');
      return;
    }

    if (!agree) {
      showWarning('Terms Required', 'You must agree to the terms and conditions to continue.');
      return;
    }

    const passwordErrors = validatePasswordDetails(password);
    if (passwordErrors.length > 0) {
      showError('Invalid Password', `Password must contain:\n• ${passwordErrors.join('\n• ')}`);
      return;
    }

    try {
      const result = await authAPI.signup(email, password);

      if (result.success) {
        setShowVerificationModal(true);
      } else {
        showError('Signup Failed', result.error || 'Unable to create account. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showError('Network Error', 'Unable to connect to server. Please check your connection and try again.');
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

        <View style={styles.footerRow}>
          <Text style={[textStyle, styles.footer]}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => router.push('/auth/LoginScreen')}>
              Log In
            </Text>
          </Text>
        </View>
      </View>

      {showVerificationModal && (
        <View style={styles.blurOverlayContainer}>
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
          <VerificationScreen
            onClose={() => setShowVerificationModal(false)}
            onContinue={() => {
              setShowVerificationModal(false);
              router.push('/(tabs)/Profile');
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
});

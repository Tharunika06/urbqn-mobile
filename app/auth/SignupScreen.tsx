import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import VerificationScreen from './VerificationScreen';
import { useRouter } from 'expo-router';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';
export default function SignupScreen() {
  const [agree, setAgree] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    BebasNeue_400Regular,
    SFPro: require('../../assets/fonts/SFPro-Regular.ttf'),
  });

  const textStyle = {
    fontFamily: 'Montserrat_400Regular',
    color: '#1a2238',
  };

  if (!fontsLoaded) return null;

  const handleSignup = async () => {
    if (!email || !password || !agree) {
      return Alert.alert("Error", "Please fill all fields and agree to terms.");
    }

    try {
      const response = await fetch('http://192.168.0.152:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowVerificationModal(true);
      } else {
        Alert.alert('Signup Failed', result.error || 'Try again later');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  return (
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
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#6c757d"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={() => setAgree(!agree)}>
          <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={20} color="#000" />
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.socialBtn}>
          <Image source={require('../../assets/icons/apple.png')} style={styles.socialIcon} />
          <Text style={[textStyle, styles.socialBtnText]}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn}>
          <Image source={require('../../assets/icons/google.png')} style={styles.socialIcon} />
          <Text style={[textStyle, styles.socialBtnText]}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn}>
          <Image source={require('../../assets/icons/facebook.png')} style={styles.socialIcon} />
          <Text style={[textStyle, styles.socialBtnText]}>Continue with Facebook</Text>
        </TouchableOpacity>
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

      {/* Verification Modal */}
      <Modal visible={showVerificationModal} animationType="slide" transparent>
        <VerificationScreen
          onClose={() => setShowVerificationModal(false)}
          onContinue={() => {
            setShowVerificationModal(false);
            router.push('/auth/Location/select-location');
          }}
          isFromSignup={true}
          email={email}
        />
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
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
});

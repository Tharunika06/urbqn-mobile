import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import GradientButton from '../../components/Button/GradientButton';

interface Props {
  onClose: () => void;
  onContinue: (email: string) => void;
}

export default function ForgetPasswordScreen({ onClose, onContinue }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Montserrat_400Regular,
  });

  
  if (!fontsLoaded) return null;

  const handleSendOTP = async () => {
    if (!email) {
      return Alert.alert('Validation', 'Please enter your email');
    }

    try {
      setLoading(true);
      const response = await fetch('http://192.168.0.152:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'OTP sent to your email');
        onContinue(email);
      } else {
        Alert.alert('Error', data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
     <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
    <View style={styles.overlay}>
      <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />

      <View style={styles.modal}>
        {/* ⬅️ Custom back arrow image */}
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Image
            source={require('../../assets/icons/back-arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.title}>FORGOT PASSWORD</Text>
        <Text style={styles.description}>
          Don’t worry, it happens to the best of us. Enter your email address below and we'll help you reset your password.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#6c757d" style={styles.icon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#6c757d"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
        </View>

        <TouchableOpacity disabled={loading}>
    <GradientButton
  onPress={handleSendOTP}
  label="Continue"
  colors={['#000000', '#474747']}
 
/>
            <Text style={styles.buttonText}>
              {loading ? 'Sending OTP...' : 'Continue'}
            </Text>
          
        </TouchableOpacity>

        <Text style={styles.legalText}>
          By continuing, you agree to Shopping{' '}
          <Text style={styles.link}>Conditions of Use</Text> and{' '}
          <Text style={styles.link}>Privacy Notice</Text>
        </Text>
      </View>
    </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    paddingTop: 60,
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
    marginBottom: 10,
    letterSpacing: 1,
    color: '#000',
  },
  description: {
    color: '#6c6c6c',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 20,
  },
  inputContainer: {
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
    fontFamily: 'Montserrat_400Regular',
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'SFProText-Bold', // ✅ Your SF Pro font (ensure it's loaded globally)
  },
  legalText: {
    fontSize: 12,
    color: '#6c6c6c',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Montserrat_400Regular',
  },
  link: {
    color: '#0d6efd',
    fontFamily: 'Montserrat_400Regular',
  },
});

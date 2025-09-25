import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import GradientButton from '../../../components/Button/GradientButton';

const Page1 = () => {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    SFPro: require('../../../assets/fonts/SFPro-Regular.ttf'), // Load your SF Pro font here
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
  style={styles.backButton}
  onPress={() => router.push('/auth/LoginScreen')}
>
  <Image
    source={require('../../../assets/icons/back-arrow.png')}
    style={styles.backIcon}
  />
</TouchableOpacity>


      {/* Image + Text */}
      <View style={{ alignItems: 'center' }}>
        <Image
          source={require('../../../assets/images/house1.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          EXPERIENCE VIRTUAL HOME{'\n'}TOURS FROM THE COMFORT{'\n'}OF YOUR COUCH
        </Text>
      </View>

      {/* Progress + Next */}
      <View style={{ alignItems: 'center' }}>
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, styles.activeSegment]} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>

            <GradientButton
  onPress={() => router.push('/auth/onboarding/page2')}
  label="Next"
  colors={['#000000', '#474747']}
 
/>
      </View>
    </View>
  );
};

export default Page1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backIcon: {
  width: 24,
  height: 24,
  resizeMode: 'contain',
},

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  image: {
    width: 380,
    height: 460,
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    color: '#1e1e1e',
    lineHeight: 42,
    fontFamily: 'BebasNeue_400Regular', // ✅ Applied Bebas Neue font
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
    fontFamily: 'SFPro', // ✅ Applied SF Pro font
  },
});

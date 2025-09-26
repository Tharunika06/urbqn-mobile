import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GradientButton from '@/components/Button/GradientButton';
export default function Page2() {
  const router = useRouter();

  return (
  <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          
    <View style={styles.container}>
      <TouchableOpacity
       style={styles.backButton}
       onPress={() => router.push('/auth/onboarding/page1')}
     >
       <Image
         source={require('../../../assets/icons/back-arrow.png')}
         style={styles.backIcon}
       />
     </TouchableOpacity>

      <Image
        source={require('../../../assets/images/house2.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        STAY INFORMED WITH REAL-TIME{'\n'}NOTIFICATIONS FOR NEW{'\n'}LISTINGS
      </Text>

      <View style={styles.progressBar}>
        <View style={styles.progressSegment} />
        <View style={[styles.progressSegment, styles.activeSegment]} />
        <View style={styles.progressSegment} />
      </View>

            <GradientButton
  onPress={() => router.push('/auth/onboarding/page3')}
  label="Next"
  colors={['#000000', '#474747']}
 
/>
    </View>
    </SafeAreaView>
  );
}

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
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    padding: 8,
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

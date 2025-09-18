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
import GradientButton from '@/components/Button/GradientButton';
export default function Page2() {
  const router = useRouter();

  return (
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
  );
}

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
    marginTop: 60,
    marginBottom: 10,
  },
   title: {
    fontSize: 30,
    textAlign: 'center',
    color: '#1e1e1e',
    lineHeight: 35,
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
  },
});

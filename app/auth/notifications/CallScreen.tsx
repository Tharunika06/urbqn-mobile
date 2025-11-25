import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ImageSourcePropType, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientButton from '../../../components/Button/GradientButton';

const CallScreen: React.FC = () => {
  const router = useRouter();
  
  // Get the parameters passed from the ChatScreen
  const { name, image } = useLocalSearchParams();

  // Process the image parameter to get a usable source
  const avatarSource = image
    ? (Number(image) as ImageSourcePropType)
    : require('../../../assets/images/user1.png'); // Fallback image

  const handleEndCall = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
    
    <View style={styles.container}>
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={handleEndCall}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </Pressable>

      {/* Name (Use the passed 'name' parameter) */}
      <Text style={styles.name}>{name || 'Unknown User'}</Text>

      {/* Call Duration */}
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>12:25</Text>
      </View>

      {/* Glowing Profile Image (Use the passed 'image' parameter) */}
      <View style={styles.imageGlowWrapper}>
        <View style={styles.imageOuterGlow}>
          <Image source={avatarSource} style={styles.image} />
        </View>
      </View>

      {/* Call Controls */}
      <View style={styles.callControlsWrapper}>
        <View style={styles.controlsRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#1a2238" />
          </View>
          <View style={styles.iconCircle}>
            <Ionicons name="mic-off-outline" size={22} color="#1a2238" />
          </View>
        </View>

        {/* End Call Button with GradientButton */}
        <View style={styles.endCallWrapper}>
          <GradientButton
            onPress={handleEndCall}
            label={
              <View style={styles.endCallContent}>
                <Text style={styles.endCallText}>End Call</Text>
                <Ionicons name="call-outline" size={20} color="#a5d8ff" style={{ marginLeft: 8 }} />
              </View>
            }
            colors={['#1e90ff', '#0090ff']}
            buttonStyle={styles.endCallButton}
          />
        </View>
      </View>
    </View>
    </SafeAreaView>
  );
};

export default CallScreen;

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
    fontFamily: 'BebasNeue_400Regular',
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
    fontFamily: 'SFPro',
  },
  name: {
    fontSize: 22,
    color: '#1a2238',
    marginTop: 20,
    fontFamily: 'Montserrat_700Bold',
  },
  durationBadge: {
    backgroundColor: '#e63946',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  imageGlowWrapper: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOuterGlow: {
    padding: 6,
    borderRadius: 100,
    backgroundColor: '#fff',
    shadowColor: '#ff2e63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  callControlsWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#f5f4f8',
    paddingVertical: 40,
    paddingHorizontal: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  iconCircle: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  endCallWrapper: {
    width: '70%',
    alignItems: 'center',
  },
  endCallButton: {
    width: '100%',
    height: 50,
    borderRadius: 10,
  },
  endCallContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallText: {
    color: '#fff',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
  },
});
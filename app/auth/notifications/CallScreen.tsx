import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
import { LinearGradient } from 'expo-linear-gradient';

const CallScreen: React.FC = () => {
  const router = useRouter();
  // --- MODIFICATION START ---
  // Get the parameters passed from the ChatScreen
  const { name, image } = useLocalSearchParams();

  // Process the image parameter to get a usable source
  const avatarSource = image
    ? (Number(image) as ImageSourcePropType)
    : require('../../../assets/images/user1.png'); // Fallback image
  // --- MODIFICATION END ---

  const handleEndCall = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleEndCall}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

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

        {/* End Call Button with Gradient */}
        <TouchableOpacity style={styles.endCallWrapper} onPress={handleEndCall}>
          <LinearGradient
            colors={['#1e90ff', '#0090ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.endCallButton}
          >
            <Text style={styles.endCallText}>End Call</Text>
            <Ionicons name="call-outline" size={20} color="#a5d8ff" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
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
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
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
  },
  endCallButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  endCallText: {
    color: '#fff',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
  },
});
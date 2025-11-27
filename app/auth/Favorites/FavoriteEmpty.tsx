// app/auth/Favorites/FavoriteEmpty.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function EmptyFavorites() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Montserrat_800ExtraBold': Montserrat_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Show nothing until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/empty-favorites.png')}
        style={styles.image}
      />
      <Text style={styles.text}>Your favorite page is </Text>
      <Text style={styles.empText}>empty</Text>
      <Text style={styles.subText}>Click add button above to start exploring and choose your favorite estates. </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginTop: -250,
    marginBottom: 30,
  },
  text: {
    fontSize: 26,
    fontWeight: '600',
    color: '#252B5C',
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
  },
  empText: {
    fontSize: 26,
    color: '#0075FF',
    fontFamily: 'Montserrat_800ExtraBold',
  },
  subText: {
    fontSize: 11,
    marginLeft: 20,
    marginRight: 10,
    color: '#53587A',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Montserrat_400Regular',
  }
});
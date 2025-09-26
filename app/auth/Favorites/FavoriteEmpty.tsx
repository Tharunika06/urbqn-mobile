// app/auth/Favorites/FavoriteEmpty.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';  // Import the useFonts hook
import { Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat';
import AppLoading from 'expo-app-loading'; // Import AppLoading to show while fonts are loading
import { SafeAreaView } from 'react-native-safe-area-context';
export default function EmptyFavorites() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Montserrat_800ExtraBold':Montserrat_800ExtraBold, // Ensure this path is correct
  });
 if(!fontsLoaded){
  return null;
 }
  // Show loading screen until fonts are loaded
  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/empty-favorites.png')}
        style={styles.image}
      />
      <Text style={styles.text}>Your favorite page is </Text>
      <Text style={styles.empText}>empty</Text>
      <Text style={styles.subText}>Click add button above to start exploring and choose your favorite estates. </Text>
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
  // container: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   padding: 16,
  //   backgroundColor: '#fff',
  // },
  // image: {
  //   width: 180,
  //   height: 180,
  //   resizeMode: 'contain',
  //   marginTop: -250,
  //   marginBottom: 30,
  // },
  text: {
    fontSize: 26,
    fontWeight: '600',
    color: '#252B5C',
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',  // Ensure this font is loaded
  },
  empText: {
    fontSize: 26,
    color: '#0075FF',
    fontFamily: 'Montserrat_800ExtraBold',  // Apply the ExtraBold font here
  },
  subText: {
    fontSize: 11,
    marginLeft:20,
    marginRight:10,
    color: '#53587A',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Montserrat_400Regular',  // Ensure this font is loaded
  }
});

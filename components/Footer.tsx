import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (pathname.includes('Home')) {
      setActiveTab('home');
    } else if (pathname.includes('Search')) {
      setActiveTab('search');
    } else if (pathname.includes('Favorites')) {
      setActiveTab('favorites');
    }
  }, [pathname]);

  return (
    <SafeAreaView>
      <View style={styles.footerNav}>
        {/* Home Tab */}
        <Pressable
          onPress={() => {
            setActiveTab('home');
            router.push('/(tabs)/Home');
          }}
        >
          <Image
            source={activeTab === 'home' ? require('../assets/icons/nav-home-active.png') : require('../assets/icons/nav-home.png')}
            style={styles.navHome}
          />
        </Pressable>

        {/* Search Tab */}
        <Pressable
          onPress={() => {
            setActiveTab('search');
            router.push('/(tabs)/Search');
          }}
        >
          <Image
            source={activeTab === 'search' ? require('../assets/icons/nav-search.png') : require('../assets/icons/nav-search.png')}
            style={styles.navIcon}
          />
        </Pressable>

        {/* Favorites Tab */}
        <Pressable
          onPress={() => {
            setActiveTab('favorites');
            router.push('/auth/Favorites');
          }}
        >
          <Image
            source={activeTab === 'favorites' ? require('../assets/icons/nav-heart-active.png') : require('../assets/icons/nav-heart.png')}
            style={styles.navIcon}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footerNav: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    height: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 5,
  },
  navIcon: {
    width: 20,
    height: 35,
    bottom: 15,
    resizeMode: 'contain',
    alignItems: 'center',
  },
  navHome: {
    width: 20,
    height: 25,
    bottom: 15,
  }
});
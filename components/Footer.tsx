// components/Footer.tsx
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.footerNav}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/Home')}>
        <Image
          source={require('../assets/icons/nav-home.png')}
          style={styles.navIcon}
        />
      </TouchableOpacity>

      <TouchableOpacity>
               <Image source={require('../assets/icons/nav-location.png')} style={styles.navIcon} />
             </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/Favorites')}>
        <Image
          source={require('../assets/icons/nav-heart.png')}
          style={styles.navIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footerNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 5,
  },
  navIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    alignItems: 'center',
  },
});

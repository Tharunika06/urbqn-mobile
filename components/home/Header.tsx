import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BellIcon from '../../assets/icons/bell.png';
import Greeting from '../../constants/Greeting';

interface HeaderProps {
  userEmail: string | null;
  userName?: string | null; // optional name if you want it later
}

export default function Header({ userEmail, userName }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/Profile')}>
        <Image
          source={require('../../assets/images/avatar.png')}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <View>
        <Greeting />
        <Text style={styles.username}>{userName || userEmail || 'Guest'}</Text>
      </View>

      <TouchableOpacity
        style={styles.notificationWrapper}
        onPress={() => router.push('/auth/notifications')}
      >
        <Image source={BellIcon} style={styles.bellIcon} />
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>2</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000',
    fontFamily: 'BebasNeue_400Regular',
  },
  bellIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
});
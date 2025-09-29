// urban/app/auth/Estate/PropertyModeSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';

interface PropertyModeSelectorProps {
  displayMode: 'rent' | 'sale' | null;
  setDisplayMode: (mode: 'rent' | 'sale') => void;
}

const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};

export default function PropertyModeSelector({ displayMode, setDisplayMode }: PropertyModeSelectorProps) {
  return (
    <View style={styles.rentBuyRow}>
      <View style={styles.leftButtons}>
        <Pressable
          style={[styles.rentBtn, displayMode === 'rent' ? styles.activeStatusBtn : styles.inactiveStatusBtn]}
          onPress={() => setDisplayMode('rent')}
        >
          <Text style={[displayMode === 'rent' ? styles.activeStatusText : styles.inactiveStatusText]}>Rent</Text>
        </Pressable>
        <Pressable
          style={[styles.buyBtn, displayMode === 'sale' ? styles.activeStatusBtn : styles.inactiveStatusBtn]}
          onPress={() => setDisplayMode('sale')}
        >
          <Text style={[displayMode === 'sale' ? styles.activeStatusText : styles.inactiveStatusText]}>Buy</Text>
        </Pressable>
      </View>
      <Pressable>
        <Image source={require('../../assets/icons/360.png')} style={styles.circleImage} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rentBuyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 10 },
  leftButtons: { flexDirection: 'row', gap: 10 },
  rentBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  buyBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  activeStatusBtn: { backgroundColor: '#1a73e8' },
  inactiveStatusBtn: { backgroundColor: '#f3f3f3' },
  activeStatusText: { color: '#fff', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  inactiveStatusText: { color: '#1a2238', fontWeight: '600', fontFamily: 'Montserrat_600SemiBold' },
  circleImage: { width: 44, height: 44, resizeMode: 'contain' },
});
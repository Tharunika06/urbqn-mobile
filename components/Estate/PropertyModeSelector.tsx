// urban/components/Estate/PropertyModeSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import GradientButton from '@/components/Button/GradientButton';

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
        {displayMode === 'rent' ? (
          <GradientButton
            onPress={() => setDisplayMode('rent')}
            label="Rent"
            colors={['#0075FF', '#4C9FFF']}
            buttonStyle={styles.activeBtn}
            textStyle={styles.activeStatusText}
          />
        ) : (
          <Pressable
            style={styles.buttonContainer}
            onPress={() => setDisplayMode('rent')}
          >
            <View style={[styles.inactiveBtn, styles.inactiveStatusBtn]}>
              <Text style={styles.inactiveStatusText}>Rent</Text>
            </View>
          </Pressable>
        )}

        {displayMode === 'sale' ? (
          <GradientButton
            onPress={() => setDisplayMode('sale')}
            label="Buy"
            colors={['#0075FF', '#4C9FFF']}
            buttonStyle={styles.activeBtn}
            textStyle={styles.activeStatusText}
          />
        ) : (
          <Pressable
            style={styles.buttonContainer}
            onPress={() => setDisplayMode('sale')}
          >
            <View style={[styles.inactiveBtn, styles.inactiveStatusBtn]}>
              <Text style={styles.inactiveStatusText}>Buy</Text>
            </View>
          </Pressable>
        )}
      </View>
      <Pressable>
        <Image source={require('../../assets/icons/360.png')} style={styles.circleImage} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rentBuyRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    marginTop: 10 
  },
  leftButtons: { 
    flexDirection: 'row', 
    gap: 10 
  },
  buttonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  activeBtn: {
    width: 'auto',
    height: 'auto',
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 10,
    marginBottom: 0,
  },
  inactiveBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveStatusBtn: { 
    backgroundColor: '#f3f3f3' 
  },
  activeStatusText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  inactiveStatusText: { 
    color: '#1a2238', 
    fontWeight: '600', 
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  circleImage: { 
    width: 44, 
    height: 44, 
    resizeMode: 'contain' 
  },
});
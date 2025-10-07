import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
          style={styles.buttonContainer}
          onPress={() => setDisplayMode('rent')}
        >
          {displayMode === 'rent' ? (
            <LinearGradient
              colors={['#0075FF', '#4C9FFF']}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={styles.rentBtn}
            >
              <Text style={styles.activeStatusText}>Rent</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.rentBtn, styles.inactiveStatusBtn]}>
              <Text style={styles.inactiveStatusText}>Rent</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={styles.buttonContainer}
          onPress={() => setDisplayMode('sale')}
        >
          {displayMode === 'sale' ? (
            <LinearGradient
              colors={['#0075FF', '#4C9FFF']}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={styles.buyBtn}
            >
              <Text style={styles.activeStatusText}>Buy</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.buyBtn, styles.inactiveStatusBtn]}>
              <Text style={styles.inactiveStatusText}>Buy</Text>
            </View>
          )}
        </Pressable>
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
    overflow: 'hidden', // Important for gradient border radius
  },
  rentBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtn: { 
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
    fontFamily: 'Montserrat_600SemiBold' 
  },
  inactiveStatusText: { 
    color: '#1a2238', 
    fontWeight: '600', 
    fontFamily: 'Montserrat_600SemiBold' 
  },
  circleImage: { 
    width: 44, 
    height: 44, 
    resizeMode: 'contain' 
  },
});
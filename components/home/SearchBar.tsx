import React from 'react';
import { View, TextInput, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar() {
  return (
    <View style={styles.searchBar}>
      <Image source={require('../../assets/icons/search-icon.png')} style={styles.icon} />
      <TextInput placeholder="Search" placeholderTextColor="#777" style={styles.input} />
      <Ionicons name="options" size={20} color="#007AFF" style={{ transform: [{ rotate: '90deg' }] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontFamily: 'Montserrat_400Regular',
  },
});

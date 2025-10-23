import React from 'react';
import { View, TextInput, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function SearchBar() {
  const router = useRouter();

  const handleSearchPress = () => {
    router.push('/(tabs)/Search');
  };

  return (
    <Pressable onPress={handleSearchPress}>
      <View style={styles.searchBar}>
        <Image source={require('../../assets/icons/search-icon.png')} style={styles.icon} />
        <TextInput 
          placeholder="Search" 
          placeholderTextColor="#777" 
          style={styles.input}
          editable={false}
        />
      </View>
    </Pressable>
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
// app/auth/Favorites/FavoriteEmpty.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function EmptyFavorites() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/empty-favorites.png')}
        style={styles.image}
      />
      <Text style={styles.text}>You have no favorites yet!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2238',
    textAlign: 'center',
  },
});

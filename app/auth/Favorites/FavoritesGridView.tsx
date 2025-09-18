// app/auth/Favorites/FavoritesGridView.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PropertyType = {
  id: string | number;
  title: string;
  desc: string;
  price: string;
  image: { uri: string } | any;
};

type Props = {
  favorites: PropertyType[];
  onDelete: (id: string | number) => void;
};

export default function FavoritesGridView({ favorites, onDelete }: Props) {
  const renderItem = ({ item }: { item: PropertyType }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <TouchableOpacity style={styles.heartIcon} onPress={() => onDelete(item.id)}>
        <Ionicons name="heart" size={18} color="#f24e6f" />
      </TouchableOpacity>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.desc}</Text>
      <Text style={styles.price}>{item.price}</Text>
    </View>
  );

  return (
    <FlatList
      data={favorites}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 16,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    marginTop: 8,
    color: '#1a2238',
  },
  desc: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  price: {
    color: '#1a73e8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});
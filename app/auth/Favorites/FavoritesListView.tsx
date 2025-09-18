// app/auth/Favorites/FavoritesListView.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
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

export default function FavoritesListView({ favorites, onDelete }: Props) {
  const renderRightActions = (id: string | number) => (
    <TouchableOpacity style={styles.deleteBox} onPress={() => onDelete(id)}>
      <Image source={require('../../../assets/icons/delete.png')} style={styles.deleteIcon} />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: PropertyType }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.card}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.desc}</Text>
          <Text style={styles.price}>{item.price}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="heart" size={22} color="#f24e6f" />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  return (
    <FlatList
      data={favorites}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    color: '#1a2238',
  },
  description: {
    fontSize: 12,
    color: '#777',
    marginVertical: 2,
  },
  price: {
    color: '#1a73e8',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBox: {
    backgroundColor: '#f24e6f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    borderRadius: 12,
  },
  deleteIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
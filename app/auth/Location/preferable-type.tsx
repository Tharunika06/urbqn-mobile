import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

const propertyTypes = [
  { id: '1', name: 'Apartment', image: require('../../../assets/images/apartment.png') },
  { id: '2', name: 'Villa', image: require('../../../assets/images/villa.png') },
  { id: '3', name: 'House', image: require('../../../assets/images/house.png') },
  { id: '4', name: 'Cottage', image: require('../../../assets/images/cottage.png') },
  { id: '5', name: 'Duplex', image: require('../../../assets/images/duplex.png') },
  { id: '6', name: 'Modern', image: require('../../../assets/images/modern.png') },
];

export default function PreferableType() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const renderItem = ({ item }: { item: typeof propertyTypes[0] }) => {
    const isSelected = selected.includes(item.id);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isSelected && styles.selectedCard,
          pressed && styles.pressedCard
        ]}
        onPress={() => toggleSelection(item.id)}
      >
        {isSelected && (
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark" size={18} color="#ffff" />
          </View>
        )}
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <Text style={[styles.cardLabel, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Pressable>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Add your <Text style={styles.highlight}>location</Text>
      </Text>
      <Text style={styles.subtitle}>
        You can edit this later on your account setting.
      </Text>

      {/* Grid */}
      <FlatList
        data={propertyTypes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Next Button */}
      <Pressable style={styles.nextButton} onPress={() => router.push('/auth/LoginScreen')}>
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  skip: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 14,
    padding: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    fontFamily: 'Montserrat_700Bold',
  },
  highlight: {
    color: '#1a73e8',
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f6f6f6',
    position: 'relative',
  },
  selectedCard: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
    borderWidth: 2,
  },
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '90%',
    height: 150,
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  cardLabel: {
    padding: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_700Bold',
  },
  selectedText: {
    color: '#fff',
  },
  checkIcon: {
    position: 'absolute',
    top: 18,
    left: 15,
    zIndex: 10,
    backgroundColor: '#36ED18',
    borderRadius: 20,
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
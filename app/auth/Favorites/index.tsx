// app/auth/Favorites/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EmptyFavorites from './FavoriteEmpty';
import FavoritesListView from './FavoritesListView';
import FavoritesGridView from './FavoritesGridView';
import { useFavorites } from '../../../components/context/FavoriteContext';

export default function Favorites() {
  const navigation = useNavigation();
  const { favoriteProperties, removeFavorite } = useFavorites();
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleDelete = (id: string | number) => {
    removeFavorite(id);
  };

  const icons = {
    gridActive: require('../../../assets/icons/grid-active.png'),
    gridInactive: require('../../../assets/icons/grid-inactive.png'),
    listActive: require('../../../assets/icons/list-active.png'),
    listInactive: require('../../../assets/icons/list-inactive.png'),
    backArrow: require('../../../assets/icons/back-arrow.png'),
    moreDots: require('../../../assets/icons/more-dots.png'),
  };

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconCircle}>
          <Image source={icons.moreDots} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.title}>
          <Text style={styles.bold}>{favoriteProperties.length}</Text> estates
        </Text>

        <View style={styles.viewDisplay}>
          <TouchableOpacity onPress={() => setViewMode('grid')}>
            <Image
              source={viewMode === 'grid' ? icons.gridActive : icons.gridInactive}
              style={styles.viewIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('list')}>
            <Image
              source={viewMode === 'list' ? icons.listActive : icons.listInactive}
              style={styles.viewIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (favoriteProperties.length === 0) return <EmptyFavorites />;

  return (
    <View style={styles.container}>
      {renderHeader()}
      {viewMode === 'list' ? (
        <FavoritesListView favorites={favoriteProperties} onDelete={handleDelete} />
      ) : (
        <FavoritesGridView favorites={favoriteProperties} onDelete={handleDelete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: {
    marginTop: 50,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f6f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    color: '#14142B',
    fontWeight: '500',
  },
  bold: {
    fontWeight: 'bold',
  },
  viewDisplay: {
    backgroundColor: '#f6f5f9',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 4,
    gap: 6,
  },
  viewIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});
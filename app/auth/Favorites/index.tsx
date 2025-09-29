// app/auth/Favorites/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator, StatusBar} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EmptyFavorites from './FavoriteEmpty';
import FavoritesListView from './FavoritesListView';
import FavoritesGridView from './FavoritesGridView';
import { useFavorites } from '../../../components/context/FavoriteContext';
import Footer from '../../../components/Footer';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Favorites() {
  const navigation = useNavigation();
  const { favoriteProperties, removeFavorite, isLoading, loadFavorites } = useFavorites();
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [refreshing, setRefreshing] = useState(false);

  // Refresh favorites when component mounts or becomes focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Favorites screen focused, loading favorites...');
      loadFavorites();
    });

    return unsubscribe;
  }, [navigation, loadFavorites]);

  const handleDelete = (id: string | number) => {
    console.log('Deleting favorite with id:', id);
    removeFavorite(id);
  };

  // Handle heart toggle - same as delete for favorites page
  const handleToggleFavorite = (property: any) => {
    console.log('Removing from favorites:', property.id);
    removeFavorite(property.id);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
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
        <Pressable style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.icon} />
        </Pressable>

        <Pressable style={styles.iconCircle} onPress={handleRefresh}>
          <Image source={icons.moreDots} style={styles.icon} />
        </Pressable>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.title}>
          <Text style={styles.bold}>{favoriteProperties.length}</Text> estates
        </Text>

        <View style={styles.viewDisplay}>
          <Pressable onPress={() => setViewMode('list')}>
            <Image
              source={viewMode === 'list' ? icons.listActive : icons.listInactive}
              style={styles.viewIcon}
            />
          </Pressable>
          <Pressable onPress={() => setViewMode('grid')}>
            <Image
              source={viewMode === 'grid' ? icons.gridActive : icons.gridInactive}
              style={styles.viewIcon}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );

  // Show loading spinner while initial load
  if (isLoading && favoriteProperties.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.container}>
          {renderHeader()}
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text style={styles.loadingText}>Loading favorites...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no favorites
  if (favoriteProperties.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.container}>
          {renderHeader()}
          <View style={styles.content}>
            <EmptyFavorites />
          </View>
          <Footer />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {renderHeader()}
        {refreshing && (
          <View style={styles.refreshingIndicator}>
            <ActivityIndicator size="small" color="#1a73e8" />
            <Text style={styles.refreshingText}>Refreshing...</Text>
          </View>
        )}
        <View style={styles.content}>
          {viewMode === 'list' ? (
            <FavoritesListView 
              favorites={favoriteProperties} 
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <FavoritesGridView 
              favorites={favoriteProperties} 
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </View>
        <Footer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerWrapper: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 24,
    color: '#1e1e1e',
    fontFamily: 'BebasNeue_400Regular',
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
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  refreshingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  refreshingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
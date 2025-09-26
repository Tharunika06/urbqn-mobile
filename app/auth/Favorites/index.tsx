// app/auth/Favorites/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, StatusBar} from 'react-native';
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
<SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <View style={styles.headerWrapper}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconCircle} onPress={handleRefresh}>
          <Image source={icons.moreDots} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.title}>
          <Text style={styles.bold}>{favoriteProperties.length}</Text> estates
        </Text>

        <View style={styles.viewDisplay}>
      
          <TouchableOpacity onPress={() => setViewMode('list')}>
            <Image
              source={viewMode === 'list' ? icons.listActive : icons.listInactive}
              style={styles.viewIcon}
            />
          </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewMode('grid')}>
            <Image
              source={viewMode === 'grid' ? icons.gridActive : icons.gridInactive}
              style={styles.viewIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </SafeAreaView>
  );

  // Show loading spinner while initial load
  if (isLoading && favoriteProperties.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        {renderHeader()}
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </View>
    );
  }

  // Show empty state if no favorites
  if (favoriteProperties.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <EmptyFavorites />
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {refreshing && (
        <View style={styles.refreshingIndicator}>
          <ActivityIndicator size="small" color="#1a73e8" />
          <Text style={styles.refreshingText}>Refreshing...</Text>
        </View>
      )}
      {viewMode === 'list' ? (
        <FavoritesListView favorites={favoriteProperties} onDelete={handleDelete} />
      ) : (
        <FavoritesGridView favorites={favoriteProperties} onDelete={handleDelete} />
      )}
      <Footer />
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  image: {
    width: 380,
    height: 460,
marginTop: 40,
    marginBottom: 5,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    color: '#1e1e1e',
    lineHeight: 42,
    fontFamily: 'BebasNeue_400Regular', // ✅ Applied Bebas Neue font
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginVertical: 20,
  },
  progressSegment: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d3d3d3',
  },
  activeSegment: {
    backgroundColor: '#0a84ff',
    width: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 130,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SFPro', // ✅ Applied SF Pro font
  },
  
  loadingContainer: {
    justifyContent: 'flex-start',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
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
  // title: {
  //   fontSize: 16,
  //   color: '#14142B',
  //   fontWeight: '500',
  // },
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
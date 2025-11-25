// app/(tabs)/Search.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Image, StyleSheet, Text, FlatList, Pressable, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import GradientButton from '../../components/Button/GradientButton';
import { useFavorites } from '../../components/context/FavoriteContext';
import Footer from '../../components/Footer';
import { fetchProperties } from '../../services/api.service';
import { 
  getImageSource, 
  renderPriceLabel, 
  getPropertyId,
  searchProperties as searchPropertiesUtil 
} from '../../utils/property.utils';
import type { Property } from '../../types/index';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { favorites, toggleFavorite } = useFavorites();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const properties = await fetchProperties();
      
      if (properties.length > 0) {
      }
      
      setAllProperties(properties);
    } catch (error) {
      console.error('Error loading properties:', error);
      setError('Failed to load properties');
      setAllProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = searchPropertiesUtil(allProperties, query);
    setSearchResults(results);
  };

  const renderPropertyCard = ({ item: property, index }: { item: Property; index: number }) => {
    const safeId = getPropertyId(property, index);
    const isFavorited = favorites.includes(safeId);
    const imageSource = getImageSource(property.photo);
    const priceLabel = renderPriceLabel(property);

    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          navigation.navigate('auth/Estate/EstateDetails', {
            property: {
              ...property,
              _id: safeId,
              name: property.name || property.title || 'Unnamed Property',  //  FIXED
              location: property.country || property.city || '',  // FIXED
              price: property.price || property.salePrice || property.rentPrice,
              rating: property.rating || 4.9,
              facility: property.facility || [],
              ownerId: property.ownerId || property._id || safeId,  //  FIXED
              ownerName: property.ownerName || 'Owner',  // FIXED
              address: property.address || '',  //  FIXED
              photo: property.photo,
            },
          });
        }}
      >
        <View style={styles.imageWrap}>
          <Image
            source={imageSource}
            style={styles.image}
            onError={() => {
              console.warn('Failed to load property image for:', property.name);
            }}
            defaultSource={require('../../assets/images/placeholder.png')}
          />
          <Pressable
            onPress={() => toggleFavorite(property)}
            style={[styles.favoriteBtn, { backgroundColor: isFavorited ? '#ef4444' : '#fff' }]}
          >
            <Ionicons name="heart" size={16} color={isFavorited ? '#fff' : '#ef4444'} />
          </Pressable>
          <View style={styles.priceTag}>
            <GradientButton
              onPress={() => {}}
              colors={['#0075FF', '#4C9FFF']}
              label={
                <Text style={styles.priceText}>
                  {priceLabel.text}
                  {priceLabel.unit && <Text style={styles.priceUnit}>{priceLabel.unit}</Text>}
                </Text>
              }
              buttonStyle={{
                width: 'auto',
                minWidth: 90,
                height: 35,
                paddingHorizontal: 12,
                marginRight: -10,
                marginBottom: -8,
                borderRadius: 6,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </View>
        </View>
        <Text style={styles.propertyTitle} numberOfLines={1}>{property.name || property.title}</Text>
        <Text style={styles.propertyMeta}>
          <Text>
            <Text style={{ color: '#ffc107' }}>★ </Text>
            <Text style={{ color: '#53587A' }}>{property.rating || '4.9'}</Text>
          </Text>
          <Ionicons name="location-sharp" size={12} color="#858585" style={{ marginLeft: 8 }} />
          <Text style={styles.locationText}> {property.country || property.city}</Text>
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Image source={require('../../assets/icons/search-icon.png')} style={styles.icon} />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#777"
            style={styles.input}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={true}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.resultsContainer}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading properties...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text style={styles.emptyText}>Error loading properties</Text>
            <Text style={styles.emptySubtext}>{error}</Text>
            <Pressable 
              onPress={loadProperties}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : searchQuery === '' ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>Search for properties</Text>
            <Text style={styles.emptySubtext}>
              Try searching by name, location, or facilities
            </Text>
            {allProperties.length > 0 && (
              <Text style={[styles.emptySubtext, { marginTop: 8, color: '#666' }]}>
                {allProperties.length} properties available
              </Text>
            )}
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>
              Try a different search term
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {searchResults.length} {searchResults.length === 1 ? 'property' : 'properties'} found
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderPropertyCard}
              keyExtractor={(item, index) => `${getPropertyId(item, index)}`}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
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
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252B5C',
    marginBottom: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  card: {
    width: '48%',
    backgroundColor: '#F5F4F8',
    borderRadius: 16,
    paddingBottom: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 1,
  },
  imageWrap: {
    width: '95%',
    height: 160,
    marginLeft: 4,
    marginRight: 8,
    marginTop: 8,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 20,
    padding: 6,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 2,
  },
  priceText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceUnit: {
    fontSize: 8,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  propertyTitle: {
    fontSize: 14.7,
    fontWeight: '600',
    marginTop: 8,
    marginHorizontal: 12,
    color: '#252B5C',
    fontFamily: 'Montserrat_700Bold',
  },
  propertyMeta: {
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 12,
    fontFamily: 'Montserrat_400Regular',
    fontWeight: '600',
    alignItems: 'center',
  },
  locationText: {
    color: '#888',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#252B5C',
    marginTop: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#0075FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

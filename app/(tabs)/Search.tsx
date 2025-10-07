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
type Property = {
  id?: string | number;
  _id?: string;
  name: string;
  price?: string;
  status?: 'rent' | 'sale' | 'both'; 
  rentPrice?: string;
  salePrice?: string;
  photo: string | any;
  rating: number;
  country: string;
  facility: string[];
  ownerId: string;
  ownerName: string;
  address: string;
};

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
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching properties from API...');
      const response = await fetch('http://192.168.0.154:5000/api/property');
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw API response:', JSON.stringify(data, null, 2));
      
      let properties: Property[] = [];
      
      if (Array.isArray(data)) {
        properties = data;
        console.log('✅ Data is array, using directly');
      } else if (data.properties && Array.isArray(data.properties)) {
        properties = data.properties;
        console.log('✅ Using data.properties array');
      } else if (data.data && Array.isArray(data.data)) {
        properties = data.data;
        console.log('✅ Using data.data array');
      } else {
        console.warn('⚠️ Unexpected API response format:', data);
        properties = [];
      }
      
      console.log('✅ Fetched properties count:', properties.length);
      if (properties.length > 0) {
        console.log('📝 First property:', JSON.stringify(properties[0], null, 2));
        console.log('📝 First property name:', properties[0].name);
      } else {
        console.warn('⚠️ No properties found in response');
      }
      
      setAllProperties(properties);
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
      setError(error instanceof Error ? error.message : 'Failed to load properties');
      setAllProperties([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Fetch complete, isLoading set to false');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const searchLower = query.toLowerCase().trim();
    console.log('🔍 Searching for:', searchLower);
    console.log('📊 Total properties to search:', allProperties.length);

    const filtered = allProperties.filter(property => {
      const nameMatch = property.name?.toLowerCase().includes(searchLower) ?? false;
      const locationMatch = property.country?.toLowerCase().includes(searchLower) ?? false;
      const addressMatch = property.address?.toLowerCase().includes(searchLower) ?? false;
      
      const facilityMatch = Array.isArray(property.facility) 
        ? property.facility.some(f => f?.toLowerCase().includes(searchLower))
        : false;
      
      const priceMatch = 
        property.price?.toString().includes(query) ||
        property.rentPrice?.toString().includes(query) ||
        property.salePrice?.toString().includes(query);

      const ownerMatch = property.ownerName?.toLowerCase().includes(searchLower) ?? false;

      return nameMatch || locationMatch || addressMatch || facilityMatch || priceMatch || ownerMatch;
    });
    
    console.log('✅ Filtered results:', filtered.length);
    setSearchResults(filtered);
  };

  const getImageSrc = (photo: string | any) => {
    if (photo && typeof photo === 'string' && photo.startsWith('data:image/')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('/uploads/')) {
      return { uri: `http://192.168.0.154:5000${photo}` };
    }
    if (photo && typeof photo === 'string' && photo.startsWith('http')) {
      return { uri: photo };
    }
    if (photo && typeof photo === 'object') {
      return photo;
    }
    return require('../../assets/images/placeholder.png');
  };

  const renderPriceLabel = (property: Property) => {
    const status = property.status?.toLowerCase();

    if (status === 'both' && property.rentPrice && property.salePrice) {
      return <Text style={styles.priceText}>₹{property.salePrice}</Text>;
    }
    if (status === 'rent' && property.rentPrice) {
      return (
        <Text style={styles.priceText}>
          ₹{property.rentPrice}
          <Text style={styles.priceUnit}> /month</Text>
        </Text>
      );
    }
    if (status === 'sale' && property.salePrice) {
      return <Text style={styles.priceText}>₹{property.salePrice}</Text>;
    }
    if (property.price) {
      return <Text style={styles.priceText}>₹{property.price}</Text>;
    }
    return <Text style={styles.priceText}>N/A</Text>;
  };

  const renderPropertyCard = ({ item: property, index }: { item: Property; index: number }) => {
    const safeId = property.id ?? property._id ?? index;
    const isFavorited = favorites.includes(safeId);
    const imageSource = getImageSrc(property.photo);

    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          navigation.navigate('auth/Estate/EstateDetails', {
            property: {
              ...property,
              _id: safeId,
              location: property.country,
              price: property.price || property.salePrice || property.rentPrice,
              rating: property.rating || 4.9,
              facility: property.facility || [],
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
              label={renderPriceLabel(property)}
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
        <Text style={styles.propertyTitle} numberOfLines={1}>{property.name}</Text>
        <Text style={styles.propertyMeta}>
          <Text>
            <Text style={{ color: '#ffc107' }}>★ </Text>
            <Text style={{ color: '#53587A' }}>{property.rating || '4.9'}</Text>
          </Text>
          <Ionicons name="location-sharp" size={12} color="#858585" style={{ marginLeft: 8 }} />
          <Text style={styles.locationText}> {property.country}</Text>
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
              onPress={fetchProperties}
              style={{
                marginTop: 16,
                backgroundColor: '#0075FF',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
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
            {allProperties.length === 0 && (
              <Text style={[styles.emptySubtext, { marginTop: 8, color: '#ef4444' }]}>
                No properties loaded from server
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
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {searchResults.length} {searchResults.length === 1 ? 'property' : 'properties'} found
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderPropertyCard}
              keyExtractor={(item, index) => `${item.id || item._id || index}`}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

      </View>


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
  resultsHeader: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252B5C',
    marginBottom: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  listContent: {
    paddingBottom: 120,
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
    paddingTop: 100,
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
});
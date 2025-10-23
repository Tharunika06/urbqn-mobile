import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, StatusBar, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/home/Header';
import SearchBar from '../../components/home/SearchBar';
import FilterTabs from '../../components/home/FilterTabs';
import FeaturedSection from '../../components/home/FeaturedSection';
import PopularSection from '../../components/home/PopularSection';
import TopLocations from '../../components/home/TopLocations';
import TopEstateOwners from '../../components/home/TopOwners';
import TopEstateGrid from '../../components/home/TopEstateGrid';
import Footer from '../../components/Footer';

export default function Home() {
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = (id: string | number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserEmail(user.email);
        }
      } catch (err) {
        console.error('Failed to load user from AsyncStorage:', err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchFilteredProperties = async () => {
      try {
        setLoading(true);
        const baseURL = 'http://192.168.1.45:5000/api/property';
        const url =
          activeFilter === 'All'
            ? baseURL
            : `${baseURL}/category/${activeFilter}`;

        const res = await fetch(url);
        const data = await res.json();
        setAllProperties(data);
      } catch (err) {
        console.error('Failed to fetch filtered properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProperties();
  }, [activeFilter]);

  // Filter properties by category for different sections
  const getPropertiesByCategory = (category?: string) => {
    if (activeFilter === 'All') {
      return category 
        ? allProperties.filter((prop: any) => prop.category === category)
        : allProperties;
    }
    return allProperties;
  };

  // Get featured properties (first 2 from filtered results)
  const featuredProperties = allProperties.slice(0, 2);

  // Get popular properties (properties with high ratings)
  const popularProperties = allProperties
    .filter((prop: any) => prop.rating >= 4.5)
    .slice(0, 4);

  // Get top properties for grid
  const topProperties = allProperties.slice(0, 10);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Header userEmail={userEmail} />
        <SearchBar />
        <FilterTabs active={activeFilter} setActive={setActiveFilter} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E90FF" />
            <Text style={styles.loadingText}>Loading properties...</Text>
          </View>
        ) : allProperties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No properties found</Text>
            <Text style={styles.emptySubText}>
              Try selecting a different category
            </Text>
          </View>
        ) : (
          <>
            {/* Featured Section - Show only if there are featured properties */}
            {featuredProperties.length > 0 && (
              <FeaturedSection/>
            )}

            {/* Popular Section - Show only if there are popular properties */}
            {popularProperties.length > 0 && (
              <PopularSection
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}

            {/* Top Locations - Show only when filter is 'All' */}
            {activeFilter === 'All' && (
              <TopLocations
                locations={[
                  { id: 1, name: 'Bali', image: require('../../assets/images/loc1.png') },
                  { id: 2, name: 'Jakarta', image: require('../../assets/images/loc2.png') },
                  { id: 3, name: 'Yogyakarta', image: require('../../assets/images/loc3.png') },
                  { id: 4, name: 'Semarang', image: require('../../assets/images/loc4.png') },
                ]}
              />
            )}

            {/* Top Estate Owners - Show only when filter is 'All' */}
            {activeFilter === 'All' && <TopEstateOwners />}

            {/* Top Estate Grid - Show all filtered properties */}
            {topProperties.length > 0 && (
              <TopEstateGrid
                properties={topProperties}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            )}
          </>
        )}
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    backgroundColor: '#fff',
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
  },
});
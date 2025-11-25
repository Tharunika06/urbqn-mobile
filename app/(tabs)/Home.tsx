// app/(tabs)/Home.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, StatusBar, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
import type { Property } from '../../types/index';

// Components
import Header from '../../components/home/Header';
import SearchBar from '../../components/home/SearchBar';
import FilterTabs from '../../components/home/FilterTabs';
import FeaturedSection from '../../components/home/FeaturedSection';
import PopularSection from '../../components/home/PopularSection';
import TopLocations from '../../components/home/TopLocations';
import TopEstateOwners from '../../components/home/TopOwners';
import TopEstateGrid from '../../components/home/TopEstateGrid';
import Footer from '../../components/Footer';

// Services
import { fetchProperties } from '../../services/api.service';

// Utils
import { getCurrentUser } from '../../utils/user.utils';
import { 
  getFeaturedProperties, 
  getPopularProperties, 
  getTopProperties 
} from '../../utils/property.utils';
import { LOCATION_DATA } from '../../utils/staticData'; 

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserEmail(user.email);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    loadUser();
  }, []);

  // Fetch properties when filter changes
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const data = await fetchProperties(activeFilter);
        setAllProperties(data);
      } catch (err) {
        console.error('Failed to fetch filtered properties:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [activeFilter]);

  // Compute derived data using utility functions
  const featuredProperties = getFeaturedProperties(allProperties, 2);
  const popularProperties = getPopularProperties(allProperties, 4.5, 4);
  const topProperties = getTopProperties(allProperties, 10);

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
            {featuredProperties.length > 0 && <FeaturedSection />}
            
            {popularProperties.length > 0 && <PopularSection />}
            
            {activeFilter === 'All' && <TopLocations locations={LOCATION_DATA} />}
            
            {activeFilter === 'All' && <TopEstateOwners />}
            
            {topProperties.length > 0 && (
              <TopEstateGrid properties={topProperties} />
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
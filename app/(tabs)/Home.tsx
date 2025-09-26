import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
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
  const [topProperties, setTopProperties] = useState([]);
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
        const baseURL = 'http://192.168.0.152:5000/api/property';
        const url =
          activeFilter === 'All'
            ? baseURL
            : `${baseURL}/category/${activeFilter}`;

        const res = await fetch(url);
        const data = await res.json();
        setTopProperties(data);
      } catch (err) {
        console.error('Failed to fetch filtered properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProperties();
  }, [activeFilter]);

  const featuredImages = [
    require('../../assets/images/f1.png'),
    require('../../assets/images/f2.png'),
  ];

  const popularProperties = [
    {
      id: 1,
      title: 'Sky Dandelions Apartment',
      desc: '4 Bedroom • 2 Bathroom',
      price: '$ 290/month',
      image: require('../../assets/images/pop1.png'),
      category: 'Apartment',
      rating: 4.9,
      location: 'Jakarta, Indonesia',
    },
    {
      id: 2,
      title: 'Urban Villa',
      desc: '3 Bedroom • 2 Bathroom',
      price: '$ 320/month',
      image: require('../../assets/images/pop2.png'),
      category: 'Villa',
      rating: 4.8,
      location: 'Jakarta, Indonesia',
    },
  ];

  const topLocations = [
    { id: 1, name: 'Bali', image: require('../../assets/images/loc1.png') },
    { id: 2, name: 'Jakarta', image: require('../../assets/images/loc2.png') },
    { id: 3, name: 'Yogyakarta', image: require('../../assets/images/loc3.png') },
    { id: 4, name: 'Semarang', image: require('../../assets/images/loc4.png') },
  ];

  const agentData = [
    { id: 1, name: 'Amanda', image: require('../../assets/images/agent1.png') },
    { id: 2, name: 'Jordan', image: require('../../assets/images/agent2.png') },
    { id: 3, name: 'Samantha', image: require('../../assets/images/agent3.png') },
    { id: 4, name: 'Jackson', image: require('../../assets/images/agent4.png') },
  ];

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
        <FeaturedSection images={featuredImages} />
        <PopularSection
          properties={popularProperties}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
        <TopLocations locations={topLocations} />
        <TopEstateOwners />

        {loading ? (
          <ActivityIndicator size="large" color="#1E90FF" style={{ marginVertical: 20 }} />
        ) : (
          <TopEstateGrid
            properties={topProperties}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
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
});
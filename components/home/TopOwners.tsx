import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Pressable } from 'react-native';
import axios from 'axios';

interface Owner {
  _id: string;
  ownerId?: string;
  name: string;
  photo: string; // path returned from backend (e.g., "/uploads/owners/file.jpg")
}

// Type the axios response to match the backend structure
interface ApiResponse {
  owners: Owner[];
  count: number;
  includePhotos: boolean;
}

export default function TopEstateOwners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false); // NEW: Manage showing all owners or just top 4

  // NEW: Function to get the correct owner photo source (same as Owners.jsx)
  const getOwnerPhotoSrc = (photo: string) => {
    if (photo && photo.startsWith('data:image/')) {
      return { uri: photo };
    }
    if (photo && photo.startsWith('/uploads/')) {
      return { uri: `http://192.168.0.154:5000${photo}` };
    }
    return require('../../assets/images/placeholder.png'); // Adjust path as needed
  };

  // NEW: Function to handle image loading errors
  const handleImageError = (ownerName: string) => {
    console.warn(`Failed to load owner photo for: ${ownerName}, using fallback`);
  };

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await axios.get<ApiResponse>('http://192.168.0.154:5000/api/owners'); 
        
        // Handle the response structure (your backend sends { owners: [...], count, includePhotos })
        if (res.data && res.data.owners && Array.isArray(res.data.owners)) {
          setOwners(res.data.owners);
          console.log(`✅ Loaded ${res.data.count} owners`);
        } else {
          console.error('Invalid data structure received:', res.data);
          setError('Invalid data received from server');
          setOwners([]); // Set empty array as fallback
        }
      } catch (error) {
        console.error('Error fetching owners:', error);
        setError('Failed to fetch owners');
        setOwners([]); // Set empty array as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 20 }} />;
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const ownersToShow = showAll ? owners : owners.slice(0, 4); // Display either all or top 4 owners

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Estate Owners</Text>
        <Pressable onPress={() => setShowAll(!showAll)}>
          <Text style={styles.seeAll}>{showAll ? 'See less' : 'See all'}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {ownersToShow.length > 0 ? (
          ownersToShow.map((owner) => (
            <View key={owner._id || owner.ownerId} style={styles.circle}>
              <Image
                source={getOwnerPhotoSrc(owner.photo)}
                style={styles.image}
                onError={() => handleImageError(owner.name)}
                defaultSource={require('../../assets/images/placeholder.png')} // Adjust path as needed
              />
              <Text style={styles.name} numberOfLines={2}>
                {owner.name || 'No Name'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No owners found</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  seeAll: {
    color: '#1a73e8',
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
  },
  circle: {
    alignItems: 'center',
    marginRight: 16,
    width: 80, // Fixed width to prevent text overflow
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35, // Make it perfectly circular
    resizeMode: 'cover',
    // borderWidth: 2,
    // borderColor: '#e0e0e0',
  
  },
  name: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    color: '#333',
    maxWidth: 70,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  noDataText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Montserrat_400Regular',
  },
});

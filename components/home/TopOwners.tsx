import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';

interface Owner {
  _id: string;
  name: string;
  photo: string; // path returned from backend (e.g., "/uploads/owners/file.jpg")
}

export default function TopEstateOwners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await axios.get('http://192.168.0.152:5000/api/owners'); 
        setOwners(res.data);
      } catch (error) {
        console.error('Error fetching owners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Estate Owners</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {owners.map((owner) => (
          <View key={owner._id} style={styles.circle}>
            <Image
              source={{ uri: `http://192.168.0.152:5000${owner.photo}` }}
              style={styles.image}
            />
            <Text style={styles.name}>{owner.name}</Text>
          </View>
        ))}
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
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 50,
    objectFit: 'cover',
  },
  name: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
});

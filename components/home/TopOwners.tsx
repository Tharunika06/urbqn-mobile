// components/home/TopOwners.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Pressable } from 'react-native';
import { Owner } from '../../types/index';
import { fetchOwners } from '../../services/api.service';
import { getOwnerPhotoSource } from '../../utils';

export default function TopEstateOwners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    setLoading(true);
    const result = await fetchOwners();
    setOwners(result.owners);
    setError(result.error);
    setLoading(false);
  };

  const handleImageError = (ownerName: string) => {
    console.warn(`Failed to load owner photo for: ${ownerName}, using fallback`);
  };

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

  const ownersToShow = showAll ? owners : owners.slice(0, 4);

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
                source={getOwnerPhotoSource(owner.photo)}
                style={styles.image}
                onError={() => handleImageError(owner.name)}
                defaultSource={require('../../assets/images/placeholder.png')}
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
  section: { marginBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 18, fontFamily: 'Montserrat_700Bold' },
  seeAll: { color: '#1a73e8', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  circle: { alignItems: 'center', marginRight: 16, width: 80 },
  image: { width: 70, height: 70, borderRadius: 35, resizeMode: 'cover' },
  name: { marginTop: 8, fontSize: 12, fontFamily: 'Montserrat_400Regular', textAlign: 'center', color: '#333', maxWidth: 70 },
  errorText: { color: 'red', fontSize: 14, textAlign: 'center', marginTop: 20, fontFamily: 'Montserrat_400Regular' },
  noDataText: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 20, fontFamily: 'Montserrat_400Regular' },
});
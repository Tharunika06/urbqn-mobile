// urban/app/auth/Estate/PropertyHeader.tsx
import React, { useState } from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { EstateDetailsProps } from '../../app/auth/Estate/EstateDetails';
import PropertyImageGallery from './PropertyImageGallery';

interface PropertyHeaderProps {
  property: EstateDetailsProps['property'];
  isFavorite: boolean;
  handleToggleFavorite: () => void;
  getImageSrc: (photo: string | any) => any;
}

const icons = {
  backArrow: require('../../assets/icons/back-arrow.png'),
};

// Thumbnail images
const thumbnailImages = [
  require('../../assets/images/thumb1.jpg'),
  require('../../assets/images/thumb2.jpg'),
  require('../../assets/images/thumb3.jpg'),
];

export default function PropertyHeader({
  property,
  isFavorite,
  handleToggleFavorite,
  getImageSrc,
}: PropertyHeaderProps) {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState<any>(null);
  
  // Use selected thumbnail or default to property photo
  const displayImage = selectedImage || getImageSrc(property.photo);

  return (
    <View style={styles.imageWrapper}>
      <Image
        source={displayImage}
        style={styles.mainImage}
        onError={() => console.warn('Failed to load property image:', property.name)}
        defaultSource={require('../../assets/images/placeholder.png')}
      />
      <View style={styles.imageTopRow}>
        <Pressable style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Image source={icons.backArrow} style={styles.icon} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable style={styles.iconCircle}>
            <Feather name="upload" size={18} color="#1a2238" />
          </Pressable>
          <Pressable
            style={[styles.iconCircle, isFavorite && styles.activeFav]}
            onPress={handleToggleFavorite}
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? '#fff' : '#1a2238'} />
          </Pressable>
        </View>
      </View>
      
      {/* Pass the setSelectedImage function to gallery */}
      <PropertyImageGallery 
        averageRating={property.averageRating || 4.9}
        onImageSelect={setSelectedImage}
        thumbnailImages={thumbnailImages}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: { marginHorizontal: 16, marginTop: 16 },
  mainImage: { width: '100%', height: 550, borderRadius: 30 },
  imageTopRow: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  icon: { width: 16, height: 16, resizeMode: 'contain' },
  activeFav: { backgroundColor: '#f24e6f' },
});
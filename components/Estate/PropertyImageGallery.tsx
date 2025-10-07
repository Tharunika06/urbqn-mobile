// urban/app/auth/Estate/PropertyImageGallery.tsx
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PropertyImageGalleryProps {
  averageRating: number;
  onImageSelect: (image: any) => void;
  thumbnailImages: any[];
}

const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};

export default function PropertyImageGallery({ 
  averageRating, 
  onImageSelect, 
  thumbnailImages 
}: PropertyImageGalleryProps) {
  return (
    <View style={styles.imageGalleryContainer}>
      <View style={styles.verticalThumbnailContainer}>
        {thumbnailImages.map((img, index) => (
          <Pressable key={index} onPress={() => onImageSelect(img)}>
            <Image source={img} style={styles.thumbImageVertical} />
          </Pressable>
        ))}
      </View>
      <View style={styles.bottomLeftBadges}>
        <LinearGradient
          colors={['#0075FF', '#4C9FFF']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.ratingBadge}
        >
          <Text style={[textStyle, styles.badgeText, { color: '#fff' }]}>
            ⭐ {averageRating > 0 ? averageRating.toFixed(1) : '4.9'}
          </Text>
        </LinearGradient>
        
        <LinearGradient
          colors={['#0075FF', '#4C9FFF']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.ratingBadge}
        >
          <Text style={[textStyle, styles.badgeText, { color: '#fff' }]}>Apartment</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageGalleryContainer: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
  },
  verticalThumbnailContainer: { 
    position: 'absolute', 
    right: 26, 
    bottom: 16, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 6, 
    gap: 6, 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 5 
  },
  thumbImageVertical: { 
    width: 62, 
    height: 62, 
    borderRadius: 10 
  },
  bottomLeftBadges: { 
    position: 'absolute', 
    bottom: 16, 
    left: 16, 
    flexDirection: 'row', 
    gap: 8 
  },
  ratingBadge: { 
    paddingVertical: 10, 
    paddingHorizontal: 10, 
    borderRadius: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 2 
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#fff' // Changed to white for better contrast with gradient
  },
});
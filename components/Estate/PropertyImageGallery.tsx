// urban/app/auth/Estate/PropertyImageGallery.tsx
import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';

interface PropertyImageGalleryProps {
  averageRating: number;
}

const thumb3 = require('../../assets/images/thumb3.png');
const thumbnailImages = [
  require('../../assets/images/thumb1.png'),
  require('../../assets/images/thumb2.png'),
];

const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};

export default function PropertyImageGallery({ averageRating }: PropertyImageGalleryProps) {
  return (
    <View style={styles.imageGalleryContainer}>
      <View style={styles.verticalThumbnailContainer}>
        {thumbnailImages.map((img, index) => (
          <Image key={index} source={img} style={styles.thumbImageVertical} />
        ))}
        <ImageBackground source={thumb3} style={styles.moreThumbsVertical} imageStyle={styles.thumbImageVertical}>
          <Text style={styles.moreText}>+3</Text>
        </ImageBackground>
      </View>
      <View style={styles.bottomLeftBadges}>
        <View style={[styles.ratingBadge, { backgroundColor: '#1a73e8' }]}>
          <Text style={[textStyle, styles.badgeText, { color: '#fff' }]}>
            ⭐ {averageRating > 0 ? averageRating.toFixed(1) : '4.9'}
          </Text>
        </View>
        <View style={[styles.ratingBadge, { backgroundColor: '#1a73e8' }]}>
          <Text style={[textStyle, styles.badgeText, { color: '#fff' }]}>Apartment</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageGalleryContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  verticalThumbnailContainer: { position: 'absolute', right: 26, bottom: 16, backgroundColor: '#fff', borderRadius: 12, padding: 6, gap: 6, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  thumbImageVertical: { width: 62, height: 62, borderRadius: 10 },
  moreThumbsVertical: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 10 },
  moreText: { fontSize: 13, fontWeight: '700', color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  bottomLeftBadges: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', gap: 8 },
  ratingBadge: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#1a2238' },
});
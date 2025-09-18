// components/StarRating.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  starSize?: number;
  disabled?: boolean;
}

const StarRating = ({
  rating,
  onRatingChange,
  maxRating = 5,
  starSize = 40,
  disabled = false,
}: StarRatingProps) => {
  return (
    <View style={styles.container}>
      {[...Array(maxRating)].map((_, index) => {
        const starNumber = index + 1;
        return (
          <TouchableOpacity
            key={starNumber}
            onPress={() => onRatingChange(starNumber)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Ionicons
              name={starNumber <= rating ? 'star' : 'star-outline'}
              size={starSize}
              color={starNumber <= rating ? '#FFD700' : '#A9A9A9'}
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  star: {
    marginHorizontal: 4,
  },
});

export default StarRating;
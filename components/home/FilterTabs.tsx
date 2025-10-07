import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface FilterTabsProps {
  active: string;
  setActive: (filter: string) => void;
}

export default function FilterTabs({ active, setActive }: FilterTabsProps) {
  const filters = ['All', 'House', 'Apartment', 'Villas', 'Guest House'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
      {filters.map((item) => (
        <Pressable
          key={item}
          onPress={() => setActive(item)}
          style={{ marginRight: 10 }}
        >
          {active === item ? (
            <LinearGradient
              colors={['#0075FF', '#4C9FFF']}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={styles.tab}
            >
              <Text style={[styles.text, styles.activeText]}>{item}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.tab}>
              <Text style={styles.text}>{item}</Text>
            </View>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginVertical: 16 },
  tab: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 7,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a2238',
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeText: {
    color: '#fff',
  },
});
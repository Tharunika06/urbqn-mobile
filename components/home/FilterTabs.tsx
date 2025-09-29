import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

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
          style={[styles.tab, active=== item && styles.activeTab]}
          onPress={() => setActive(item)}
        >
          <Text style={[styles.text, active === item && styles.activeText]}>{item}</Text>
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
    marginRight: 10,
  },
 activeTab: { backgroundColor: '#1E90FF' },
 
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

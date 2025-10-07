import React, { useState } from 'react';
import { View, TextInput, Image, StyleSheet, Pressable, Modal, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface SearchBarProps {
  onFilterChange?: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  propertyType: string;
  priceRange: string;
  status: string;
  sortBy: string;
}

export default function SearchBar({ onFilterChange }: SearchBarProps) {
  const router = useRouter();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    propertyType: 'All',
    priceRange: 'All',
    status: 'All',
    sortBy: 'Newest',
  });

  const propertyTypes = ['All', 'House', 'Apartment', 'Villas', 'Guest House'];
  const priceRanges = ['All', 'Under ₹50L', '₹50L - ₹1Cr', '₹1Cr - ₹2Cr', 'Above ₹2Cr'];
  const statusOptions = ['All', 'Rent', 'Sale', 'Both'];
  const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Rating'];

  const handleSearchPress = () => {
    router.push('/(tabs)/Search');
  };

  const handleFilterPress = (e: any) => {
    e.stopPropagation();
    setShowFilterModal(true);
  };

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      propertyType: 'All',
      priceRange: 'All',
      status: 'All',
      sortBy: 'Newest',
    };
    setFilters(defaultFilters);
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  };

  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
    setShowFilterModal(false);
  };

  const hasActiveFilters = 
    filters.propertyType !== 'All' || 
    filters.priceRange !== 'All' || 
    filters.status !== 'All' || 
    filters.sortBy !== 'Newest';

  return (
    <>
      <Pressable onPress={handleSearchPress}>
        <View style={styles.searchBar}>
          <Image source={require('../../assets/icons/search-icon.png')} style={styles.icon} />
          <TextInput 
            placeholder="Search" 
            placeholderTextColor="#777" 
            style={styles.input}
            editable={false}
          />
          <Pressable onPress={handleFilterPress} style={styles.filterButton}>
            <Ionicons 
              name="options" 
              size={20} 
              color={hasActiveFilters ? "#007AFF" : "#777"} 
              style={{ transform: [{ rotate: '90deg' }] }} 
            />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </Pressable>
        </View>
      </Pressable>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#252B5C" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Property Type */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Property Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {propertyTypes.map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.filterChip,
                        filters.propertyType === type && styles.activeFilterChip,
                      ]}
                      onPress={() => updateFilter('propertyType', type)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.propertyType === type && styles.activeFilterChipText,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Price Range</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {priceRanges.map((range) => (
                    <Pressable
                      key={range}
                      style={[
                        styles.filterChip,
                        filters.priceRange === range && styles.activeFilterChip,
                      ]}
                      onPress={() => updateFilter('priceRange', range)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.priceRange === range && styles.activeFilterChipText,
                        ]}
                      >
                        {range}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Status */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {statusOptions.map((status) => (
                    <Pressable
                      key={status}
                      style={[
                        styles.filterChip,
                        filters.status === status && styles.activeFilterChip,
                      ]}
                      onPress={() => updateFilter('status', status)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.status === status && styles.activeFilterChipText,
                        ]}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Sort By */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Sort By</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {sortOptions.map((sort) => (
                    <Pressable
                      key={sort}
                      style={[
                        styles.filterChip,
                        filters.sortBy === sort && styles.activeFilterChip,
                      ]}
                      onPress={() => updateFilter('sortBy', sort)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.sortBy === sort && styles.activeFilterChipText,
                        ]}
                      >
                        {sort}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <Pressable style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontFamily: 'Montserrat_400Regular',
  },
  filterButton: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#252B5C',
    fontFamily: 'Montserrat_700Bold',
  },
  filterSection: {
    paddingVertical: 16,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252B5C',
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  filterChip: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a2238',
    fontFamily: 'Montserrat_500Medium',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Montserrat_600SemiBold',
  },
});
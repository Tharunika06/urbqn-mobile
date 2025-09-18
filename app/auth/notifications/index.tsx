import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import Footer from '../../../components/Footer';

type TabKey = 'All' | 'Review' | 'Sold' | 'House' | 'Villa' | 'Rental';

type Notification = {
  id: string;
  name: string;
  message: string;
  image: any;
};
const icons = {
  backArrow: require('../../../assets/icons/back-arrow.png'),
  delete: require('../../../assets/icons/delete.png'),
};
const TABS: TabKey[] = ['All', 'Review', 'Sold', 'House', 'Villa', 'Rental'];
const router = useRouter();

const mockData: Record<TabKey, Notification[]> = {
  All: [
    {
      id: '1',
      name: 'Everett Perry',
      message: 'Send you a message in your Modern Apartment',
      image: require('../../../assets/images/user1.png'),
    },
    {
      id: '2',
      name: 'Candida',
      message: 'Send you a message in your Modern Apartment',
      image: require('../../../assets/images/user2.png'),
    },
  ],
  Review: [
    {
      id: '3',
      name: 'Walter Lindsey',
      message: 'Just giving 5 Star review on your listing Schoolview House',
      image: require('../../../assets/images/user3.png'),
    },
  ],
  Sold: [
    {
      id: '4',
      name: 'Vivian Cole',
      message: 'Congratulations on selling your White Crane House',
      image: require('../../../assets/images/user4.png'),
    },
  ],
  House: [],
  Villa: [],
  Rental: [],
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabKey>('All');

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const renderRightActions = () => (
      <View style={styles.swipeDeleteContainer}>
        <TouchableOpacity style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <View style={styles.card}>
          <Image source={item.image} style={styles.avatar} />
          <View style={styles.textGroup}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
         <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
                  <Image source={icons.backArrow} style={styles.icon} />
                </TouchableOpacity>

        {/* Toggle Segment */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity style={[styles.segmentButton, styles.activeSegment]}>
            <Text style={[styles.segmentText, styles.activeSegmentText]}>Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.segmentButton}
            onPress={() => router.push('/auth/notifications/MessagesScreen')}
          >
            <Text style={styles.segmentText}>Messages</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {TABS.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabWrapper}>
              {activeTab === tab ? (
                <LinearGradient
                  colors={['#1e90ff', '#007aff']}
                  style={styles.activeTab}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.activeTabText}>{tab}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTab}>
                  <Text style={styles.inactiveTabText}>{tab}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={mockData[activeTab]}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={<Text style={styles.noData}>No notifications</Text>}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer Navigation */}
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  topSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
   iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f6f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  backWrapper: {
    backgroundColor: '#f3f3f3',
    width: 60,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f6f6f6',
    borderRadius: 20,
    padding: 4,
    alignSelf: 'center',
    marginBottom: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#555',
  },
  activeSegment: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeSegmentText: {
    color: '#1a2238',
    fontFamily: 'Montserrat_700Bold',
  },
  tabsContainer: {
    height: 48,
  },
  tabsScrollContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabWrapper: {
    marginRight: 10,
  },
  activeTab: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  activeTabText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
  },
  inactiveTab: {
    backgroundColor: '#f6f5f9',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  inactiveTabText: {
    color: '#1a2238',
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
  },
  flatListContent: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    color: '#1a2238',
    fontFamily: 'Montserrat_700Bold',
  },
  message: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
    fontFamily: 'Montserrat_400Regular',
  },
  swipeDeleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e90ff',
     width: 85,
    height: '87%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 10,
  },
  deleteBtn: {
    padding: 12,
    borderRadius: 12,
  },
  noData: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
});

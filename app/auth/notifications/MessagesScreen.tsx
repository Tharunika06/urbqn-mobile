import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  Dimensions,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '../../../components/Footer';

const screenHeight = Dimensions.get('window').height;

const initialChatData = [
  {
    id: '1',
    name: 'Marvin McKinney',
    message: 'tempor incididunt ut labore et dolore',
    time: '10:45',
    online: true,
    image: require('../../../assets/images/user2.png'),
  },
  {
    id: '2',
    name: 'Kathryn Murphy',
    message: 'Ut enim ad minim veniam',
    time: '09:30',
    online: false,
    image: require('../../../assets/images/user1.png'),
  },
  {
    id: '3',
    name: 'Kristin Watson',
    message: 'consectetur adipiscing elit',
    time: '08:15',
    online: false,
    image: require('../../../assets/images/user3.png'),
  },
  {
    id: '4',
    name: 'Ralph Edwards',
    message: 'Excepteur sint occaecat cupidatat non',
    time: '12:50',
    online: false,
    image: require('../../../assets/images/user4.png'),
  },
  {
    id: '5',
    name: 'Floyd Miles',
    message: 'tempor incididunt ut labore et dolore',
    time: '11:20',
    online: true,
    image: require('../../../assets/images/user5.png'),
  },
  {
    id: '6',
    name: 'Arlene McCoy',
    message: 'Duis aute irure dolor in reprehenderit',
    time: '14:00',
    online: false,
    image: require('../../../assets/images/user6.png'),
  },
];

const icons = {
  backArrow: require('../../../assets/icons/back-arrow.png'),
};

export default function MessagesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [chats, setChats] = useState(initialChatData);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleDelete = () => {
    if (selectedChatId) {
      setChats((prev) => prev.filter((chat) => chat.id !== selectedChatId));
      setSelectedChatId(null);
    }
    setModalVisible(false);
  };

  const openConfirmModal = (id: string) => {
    setSelectedChatId(id);
    setModalVisible(true);
  };

  const renderRightActions = (id: string) => (
    <Pressable onPress={() => openConfirmModal(id)} style={styles.deleteButton}>
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </Pressable>
  );

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <Pressable
        style={styles.chatCard}
        onPress={() =>
          router.push({
            pathname: '../notifications/ChatScreen',
            params: {
              id: item.id,
              name: item.name,
              image: item.image,
              online: item.online || false,
            },
          })
        }
      >
        <Image source={item.image} style={styles.avatar} />
        <View style={styles.chatContent}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.message}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.chatTime}>{item.time}</Text>
          {item.online && <View style={styles.onlineDot} />}
        </View>
      </Pressable>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <Pressable style={styles.iconCircle} onPress={() => navigation.goBack()}>
            <Image source={icons.backArrow} style={styles.icon} />
          </Pressable>

          <View style={styles.segmentContainer}>
            <Pressable
              style={styles.segmentButton}
              onPress={() => router.push('/auth/notifications')}
            >
              <Text style={styles.segmentText}>Notification</Text>
            </Pressable>
            <Pressable style={[styles.segmentButton, styles.activeSegment]}>
              <Text style={[styles.segmentText, styles.activeSegmentText]}>Messages</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>All chats</Text>

        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Confirmation Modal */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setModalVisible(false)}
          onBackButtonPress={() => setModalVisible(false)}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalBar} />
            <View style={styles.modalIconCircle}>
              <Ionicons name="help" size={36} color="#4cd137" />
            </View>
            <Text style={styles.modalTitle}>
              Are you sure want to <Text style={styles.deleteBold}>delete</Text> all your chat?
            </Text>
            <Text style={styles.modalSubtitle}>This action can't be undo</Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={handleDelete}>
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  topSection: {
    marginBottom: 12,
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 4,
    alignSelf: 'center',
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#1a2238',
    marginBottom: 12,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: '#1a2238',
    marginBottom: 2,
  },
  chatMessage: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    color: '#555',
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 10,
    color: '#aaa',
    marginBottom: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    backgroundColor: '#4cd137',
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '85%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 8,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    alignItems: 'center',
    minHeight: screenHeight * 0.35,
  },
  modalBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginBottom: 16,
  },
  modalIconCircle: {
    backgroundColor: 'rgba(76, 209, 55, 0.1)',
    padding: 16,
    borderRadius: 40,
    marginBottom: 16,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1a2238',
    fontFamily: 'Montserrat_600SemiBold',
  },
  deleteBold: {
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'Montserrat_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  cancelText: {
    color: '#fff',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
  confirmText: {
    color: '#1a2238',
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
  },
});
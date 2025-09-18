import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const ChatScreen = () => {
  const { name, image, online } = useLocalSearchParams();
  const router = useRouter();

  const avatarSource = image
    ? (Number(image) as ImageSourcePropType)
    : require('../../../assets/images/user1.png');
  const isOnline = online === 'true';

  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: 'Hey! How can I help you today?',
      sender: 'them',
      time: '10:30',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'me',
      time: 'Now',
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setMessage('');
    setLoading(true);

    setTimeout(() => {
      const lower = message.toLowerCase();
      let reply = "Sorry, I didn't understand that.";

      if (lower.includes('hello') || lower.includes('hi')) {
        reply = 'Hello! 👋 How can I assist you today?';
      } else if (lower.includes('price')) {
        reply = 'Prices vary depending on the property. Would you like to see the latest listings?';
      } else if (lower.includes('location')) {
        reply = 'Which city or area are you looking in?';
      } else if (lower.includes('thanks') || lower.includes('thank you')) {
        reply = "You're welcome! 😊";
      } else if (lower.includes('bye')) {
        reply = 'Goodbye! Have a great day!';
      }

      const botReply = {
        id: Date.now() + 1,
        text: reply,
        sender: 'them',
        time: 'Now',
      };

      setChatMessages((prev) => [...prev, botReply]);
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{name || 'User'}</Text>
          <Text style={[styles.status, { color: isOnline ? '#4cd137' : '#aaa' }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        {/* --- MODIFICATION START --- */}
        {/* Update the call button to pass the current user's data */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/auth/notifications/CallScreen',
              params: { name, image }, // Pass the name and image
            })
          }
        >
          <Ionicons name="call-outline" size={24} color="#000" />
        </TouchableOpacity>
        {/* --- MODIFICATION END --- */}
      </View>

      {/* Chat messages */}
      <ScrollView style={styles.chatBody}>
        {chatMessages.map((msg) => (
          <View
            key={msg.id}
            style={[msg.sender === 'me' ? styles.outgoingMessage : styles.incomingMessage]}
          >
            <Text style={msg.sender === 'me' ? styles.outgoingText : styles.incomingText}>
              {msg.text}
            </Text>
            <Text style={styles.time}>{msg.time}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.incomingMessage}>
            <ActivityIndicator color="#fff" size="small" />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Say something"
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={handleSend}>
          <Ionicons name="send" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userInfo: { flex: 1 },
  name: {
    fontSize: 16,
    color: '#1a2238',
    fontFamily: 'Montserrat_700Bold',
  },
  status: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  chatBody: {
    padding: 16,
    flex: 1,
  },
  outgoingMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 12,
    maxWidth: '75%',
    marginBottom: 8,
  },
  outgoingText: {
    color: '#1a2238',
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
  },
  incomingMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a2238',
    padding: 10,
    borderRadius: 12,
    maxWidth: '75%',
    marginBottom: 8,
  },
  incomingText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
  },
  time: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 4,
    alignSelf: 'flex-end',
    fontFamily: 'Montserrat_400Regular',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    marginBottom: 50,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
  },
});
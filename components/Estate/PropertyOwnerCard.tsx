// urban/app/auth/Estate/PropertyOwnerCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PropertyOwnerCardProps {
  ownerName: string;
}

const textStyle = {
  fontFamily: 'Montserrat_400Regular',
  color: '#1a2238',
};

export default function PropertyOwnerCard({ ownerName }: PropertyOwnerCardProps) {
  return (
    <View style={styles.agentBox}>
      <View style={{ flex: 1 }}>
        <Text style={styles.agentName}>{ownerName}</Text>
        <Text style={[textStyle, styles.agentRole]}>Property Owner</Text>
      </View>
      <Ionicons name="chatbubble-ellipses-outline" size={20} color="#999" />
    </View>
  );
}

const styles = StyleSheet.create({
  agentBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, margin: 16, borderRadius: 16, gap: 12 },
  agentName: { fontWeight: '600', fontSize: 14, fontFamily: 'Montserrat_600SemiBold' },
  agentRole: { fontSize: 12, color: '#888' },
});
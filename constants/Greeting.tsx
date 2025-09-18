import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

const Greeting = () => {
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning! 👋🏻');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon! ☀️');
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good Evening! 🌇');
    } else {
      setGreeting('Good Night! 🌙');
    }
  }, []);

  return <Text style={styles.greeting}>{greeting}</Text>;
};

const styles = StyleSheet.create({
    greeting: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  
});

export default Greeting;

import {
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import {
  Prompt_700Bold,
} from '@expo-google-fonts/prompt';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FavoritesProvider } from '../components/context/FavoriteContext';
// Import the PopupProvider
import { PopupProvider } from '../components/context/PopupContext';

const STRIPE_PUBLISHABLE_KEY='pk_test_51SXxqiRyog1qZParqWcUB9WnEIgEH3eutO0viK5Am0mZjgwmXLO4pBtpY7oV1Z2HdapSLZyidlKjkhO7ArAFPxhZ00Evfu72ZM';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Prompt_700Bold,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <FavoritesProvider>
      <PopupProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
              <Stack
                initialRouteName="index"
                screenOptions={{ headerShown: false }}
              />
            </View>
          </StripeProvider>
        </GestureHandlerRootView>
      </PopupProvider>
    </FavoritesProvider>
  );
}
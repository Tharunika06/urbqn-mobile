import { Stack } from 'expo-router';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import {
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  Prompt_700Bold,
} from '@expo-google-fonts/prompt';
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import { FavoritesProvider } from '../components/context/FavoriteContext';
// Import the PopupProvider
import { PopupProvider } from '../components/context/PopupContext';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Rse2K3IbV3tDsovgiLaWx92RBz8FguswSyQXKmgpxl7x79yqbY7KJsSo41NQY6MOLZWstyrKKAx5AGraZIYpQ6t00mpIqWZRC'; 

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
                initialRouteName="auth/splash/index"
                screenOptions={{ headerShown: false }}
              />
            </View>
          </StripeProvider>
        </GestureHandlerRootView>
      </PopupProvider>
    </FavoritesProvider>
  );
}
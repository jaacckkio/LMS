import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/theme';
import { AuthModalProvider } from '../contexts/AuthModal';
import { AuthBottomSheet } from '../components/auth/AuthBottomSheet';

// Keep the splash screen up until fonts are ready.
// .catch is defensive — hot-reload can double-invoke this.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    // Single-weight Bebas Neue. The name "BebasNeue" is what components
    // reference via Fonts.display — keep them in sync.
    BebasNeue: require('../assets/fonts/BebasNeue-Regular.ttf'),
  });

  useEffect(() => {
    // Loudly flag silent font failures — they love to hide until TestFlight.
    if (fontsError) {
      console.warn('[fonts] Bebas Neue failed to load — falling back to system:', fontsError);
    }
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontsError]);

  // Hold the splash while we're neither loaded nor errored.
  if (!fontsLoaded && !fontsError) return null;

  return (
    <SafeAreaProvider>
      <AuthModalProvider>
        <View style={styles.root}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'slide_from_right',
            }}
          />
          <AuthBottomSheet />
        </View>
      </AuthModalProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
});

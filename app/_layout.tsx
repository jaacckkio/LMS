import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { AuthModalProvider } from '../contexts/AuthModal';
import { AuthBottomSheet } from '../components/auth/AuthBottomSheet';

export default function RootLayout() {
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

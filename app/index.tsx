import { Redirect } from 'expo-router';

// Always open to the tabs — no auth gate. Guest mode fully functional.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}

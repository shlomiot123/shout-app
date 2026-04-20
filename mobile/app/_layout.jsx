import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" backgroundColor="#F5C000" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="notifications"
          options={{
            title: 'התראות',
            headerStyle: { backgroundColor: '#F5C000' },
            headerTintColor: '#0D0D0D',
            headerTitleStyle: { fontWeight: '800', fontSize: 18 },
            headerBackTitle: '',
          }}
        />
        <Stack.Screen
          name="create"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="squad-lobby"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="company-lobby"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="welcome"
          options={{ headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

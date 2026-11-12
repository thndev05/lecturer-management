import '../global.css';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreferencesProvider, usePreferences } from '../lib/preferences';
import { AuthProvider, useAuth } from '../lib/auth';
import { Button, ErrorMessage, Loading, Page } from '../components/ui';
import { useTranslation } from 'react-i18next';
import { errorText } from '../lib/api';

function Navigation() {
  const prefs = usePreferences();
  const auth = useAuth();
  const { t } = useTranslation();
  if (!prefs.ready || !auth.ready) return <Loading />;
  if (auth.error)
    return (
      <Page>
        <ErrorMessage message={errorText(auth.error)} />
        <Button title={t('retry')} onPress={auth.retry} />
      </Page>
    );
  return (
    <>
      <StatusBar style={prefs.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: prefs.colors.card },
          headerTintColor: prefs.colors.text,
          contentStyle: { backgroundColor: prefs.colors.bg },
          headerShadowVisible: false,
          headerBackTitle: t('back'),
        }}
      >
        <Stack.Protected guard={!auth.admin}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!!auth.admin}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="new-lecturer" options={{ title: t('add') }} />
          <Stack.Screen name="lecturer/[id]/index" options={{ title: t('detail') }} />
          <Stack.Screen name="lecturer/[id]/edit" options={{ title: t('editTitle') }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <AuthProvider>
            <Navigation />
          </AuthProvider>
        </PreferencesProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

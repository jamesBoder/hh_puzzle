import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={false}
      />
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
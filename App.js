import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from 'react-query';
import List from './list';
import ListDetails from './listDetails';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const queryClient = new QueryClient();

export default function App() {

  const { Navigator, Screen } = createNativeStackNavigator();

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar hidden />
        <Navigator screenOptions={{
          headerShown: false,
        }}>
          <Screen
            name='Home'
            component={List}
          />
          <Screen
            name='ListDetails'
            component={ListDetails}
          />
        </Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

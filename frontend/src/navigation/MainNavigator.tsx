import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/home/HomeScreen';
// We'll add more screens later

const Stack = createStackNavigator();

export const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'HH Puzzle' }}
      />
    </Stack.Navigator>
  );
};
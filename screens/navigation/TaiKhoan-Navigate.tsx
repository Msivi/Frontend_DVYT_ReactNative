
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TaiKhoan from "../Components/TaiKhoan/TaiKhoan"
const Stack = createNativeStackNavigator();
export default function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator>

                <Stack.Screen
          name='Tài Khoản'
          component={TaiKhoan}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

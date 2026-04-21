import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen.js';
import LoginScreen from '../screens/LoginScreen.js';
import DashboardScreen from '../screens/DashboardScreen';

import {useAuth} from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const {isLoggedIn} = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
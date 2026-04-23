import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/splash/SplashScreen';
import LoginScreen from '../screens/login/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import {useAuth} from '../context/AuthContext';


import MyProfileScreen from '../screens/MyProfile/MyProfileScreen';
import EditProfileScreen from '../screens/MyProfile/EditProfileScreen';
import ApplyLeaveScreen from '../screens/MyProfile/ApplyLeaveScreen';
import MyLeaveRecordScreen from '../screens/MyProfile/MyLeaveRecordScreen';
import ChangePasswordScreen from '../screens/MyProfile/ChangePasswordScreen';
import MySalaryScreen from '../screens/MyProfile/MySalaryScreen';
import SalaryReceiptScreen from '../screens/MyProfile/SalaryReceiptScreen';


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
          <Stack.Screen name="ProfileScreen" component={MyProfileScreen} />
          <Stack.Screen name="MySalaryScreen" component={MySalaryScreen} />
          <Stack.Screen name="SalaryReceiptScreen" component={SalaryReceiptScreen} />
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          <Stack.Screen name="ApplyLeaveScreen" component={ApplyLeaveScreen} />
          <Stack.Screen name="MyLeaveRecordScreen" component={MyLeaveRecordScreen} />
          <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

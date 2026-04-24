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

import AttendanceScreen from '../screens/studentAttendence/StudentAttendanceScreen';
import ViewAttendanceScreen from '../screens/studentAttendence/ViewAttendanceScreen';
// import MarkAttendanceScreen from '../screens/studentAttendence/MarkAttendanceScreen';
import MainClassAttendanceScreen from '../screens/studentAttendence/MainClassAttendanceScreen';
import CoachingClassAttendanceScreen from '../screens/studentAttendence/CoachingClassAttendanceScreen';
import HomeWorkScreen from '../screens/homework/HomeWorkScreen';
import AssignmentHistoryScreen from '../screens/homework/AssignmentHistoryScreen';

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
          <Stack.Screen
  name="StudentAttendanceScreen"
  component={AttendanceScreen}
  options={{headerShown: false}}
/>

    <Stack.Screen
      name="ViewAttendanceScreen"
      component={ViewAttendanceScreen}
      options={{headerShown: false}}
    />
    {/* <Stack.Screen
      name="MarkAttendanceScreen"
      component={MarkAttendanceScreen}
      options={{headerShown: false}}
    /> */}

<Stack.Screen
  name="MainClassAttendanceScreen"
  component={MainClassAttendanceScreen}
  options={{headerShown: false}}
/>

<Stack.Screen
  name="CoachingClassAttendanceScreen"
  component={CoachingClassAttendanceScreen}
  options={{headerShown: false}}
/>
          <Stack.Screen name="HomeWorkScreen" component={HomeWorkScreen} />
          

          <Stack.Screen
  name="AssignmentHistoryScreen"
  component={AssignmentHistoryScreen}
  options={{headerShown: false}}
/>
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

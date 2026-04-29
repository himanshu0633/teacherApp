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
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import AttendanceScreen from '../screens/studentAttendence/StudentAttendanceScreen';
import ViewAttendanceScreen from '../screens/studentAttendence/ViewAttendanceScreen';
// import MarkAttendanceScreen from '../screens/studentAttendence/MarkAttendanceScreen';
import MainClassAttendanceScreen from '../screens/studentAttendence/MainClassAttendanceScreen';
import CoachingClassAttendanceScreen from '../screens/studentAttendence/CoachingClassAttendanceScreen';
import HomeWorkScreen from '../screens/homework/HomeWorkScreen';
import AssignmentHistoryScreen from '../screens/homework/AssignmentHistoryScreen';
import MarkEntryScreen from '../screens/MarkEntry/MarkEntryScreen';
import StudentPortfolioScreen from '../screens/portfolio/StudentPortfolioScreen';
import SportsEntryScreen from '../screens/portfolio/SportsEntryScreen';
import ActivityEntryScreen from '../screens/portfolio/ActivityEntryScreen';
import SportsEntryListScreen from '../screens/portfolio/SportsEntryListScreen';
import ActivityEntryListScreen from '../screens/portfolio/ActivityEntryListScreen';
import ClassGalleryScreen from '../screens/gallery/ClassGalleryScreen';
import CreateClassGalleryCategoryScreen from '../screens/gallery/CreateClassGalleryCategoryScreen';
import ViewClassGalleryCategoryScreen from '../screens/gallery/ViewClassGalleryCategoryScreen';
import ClassGalleryImagesScreen from '../screens/gallery/ClassGalleryImagesScreen';
import ViewClassGalleryImagesScreen from '../screens/gallery/ViewClassGalleryImagesScreen';
import GalleryImageGridScreen from '../screens/gallery/GalleryImageGridScreen';
import CreateLinkScreen from "../screens/CreateLink/CreateLinkScreen";
import SchoolDiaryScreen from '../screens/SchoolDiary/SchoolDiaryScreen';
import EmployeeCircularScreen from '../screens/circular/EmployeeCircularScreen';
import MyCircularListScreen from '../screens/circular/MyCircularListScreen';
import ViewCircularScreen from '../screens/circular/ViewCircularScreen';
import CircularReadStatusScreen from '../screens/circular/CircularReadStatusScreen';
import DisciplineScreen from '../screens/discipline/DisciplineScreen';
import DisciplineFeedbackScreen from '../screens/discipline/DisciplineFeedbackScreen';
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
<Stack.Screen
  name="MarkEntryScreen"
  component={MarkEntryScreen}
  options={{headerShown: false}}
/>
<Stack.Screen
  name="NotificationsScreen"
  component={NotificationsScreen}
  options={{headerShown: false}}
/>
<Stack.Screen name="StudentPortfolioScreen" component={StudentPortfolioScreen} />
<Stack.Screen name="SportsEntryScreen" component={SportsEntryScreen} />
<Stack.Screen name="ActivityEntryScreen" component={ActivityEntryScreen} />
<Stack.Screen name="SportsEntryListScreen" component={SportsEntryListScreen} />
<Stack.Screen name="ActivityEntryListScreen" component={ActivityEntryListScreen} />
<Stack.Screen name="GalleryScreen" component={ClassGalleryScreen} />
<Stack.Screen name="CreateClassGalleryCategoryScreen" component={CreateClassGalleryCategoryScreen} />
<Stack.Screen name="ViewClassGalleryCategoryScreen" component={ViewClassGalleryCategoryScreen} />
<Stack.Screen name="ClassGalleryImagesScreen" component={ClassGalleryImagesScreen} />
<Stack.Screen name="ViewClassGalleryImagesScreen" component={ViewClassGalleryImagesScreen} />
<Stack.Screen name="GalleryImageGridScreen" component={GalleryImageGridScreen} />
<Stack.Screen name="CreateLinkScreen" component={CreateLinkScreen} />
<Stack.Screen name="SchoolDiaryScreen" component={SchoolDiaryScreen} />
<Stack.Screen name="EmployeeCircularScreen" component={EmployeeCircularScreen} />
<Stack.Screen name="MyCircularListScreen" component={MyCircularListScreen} />
<Stack.Screen name="ViewCircularScreen" component={ViewCircularScreen} />
<Stack.Screen name="CircularReadStatusScreen" component={CircularReadStatusScreen} />
<Stack.Screen name="DisciplineScreen" component={DisciplineScreen} />
<Stack.Screen name="DisciplineFeedbackScreen" component={DisciplineFeedbackScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

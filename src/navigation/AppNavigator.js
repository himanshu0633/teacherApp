import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/splash/SplashScreen';
import LoginScreen from '../screens/login/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { useAuth } from '../context/AuthContext';

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
import CreateLinkScreen from '../screens/CreateLink/CreateLinkScreen';
import SchoolDiaryScreen from '../screens/SchoolDiary/SchoolDiaryScreen';
import EmployeeCircularScreen from '../screens/circular/EmployeeCircularScreen';
import StudentCircularScreen from '../screens/circular/StudentCircularScreen';
import MyCircularListScreen from '../screens/circular/MyCircularListScreen';
import SendByMeCircularListScreen from '../screens/circular/SendByMeCircularListScreen';
import ViewCircularScreen from '../screens/circular/ViewCircularScreen';
import CircularReadStatusScreen from '../screens/circular/CircularReadStatusScreen';
import DisciplineScreen from '../screens/discipline/DisciplineScreen';
import DisciplineFeedbackScreen from '../screens/discipline/DisciplineFeedbackScreen';
import MyFeedbackListScreen from '../screens/discipline/MyFeedbackListScreen';
import EmployeeDalRecordScreen from '../screens/employeeDal/EmployeeDalRecordScreen';
import EmployeeDlaReportScreen from '../screens/employeeDal/EmployeeDlaReportScreen';
import EPtmRecordScreen from '../screens/ePtm/EPtmRecordScreen';
import EPTMSRPScreen from '../screens/ePtm/EPTMSRPScreen';
import EmployeeLeaveRequestScreen from '../screens/employeeLeave/EmployeeLeaveRequestScreen';
import EmployeeRequestsScreen from '../screens/employeeRequests/EmployeeRequestsScreen';
import RequestsScreen from '../screens/employeeRequests/RequestsScreen';
import ExtraDayRequestScreen from '../screens/employeeRequests/ExtraDayRequestScreen';
import EComplaintRecordScreen from '../screens/eComplaint/EComplaintRecordScreen';
import EComplaintForMeScreen from '../screens/eComplaint/EComplaintForMeScreen';
import EComplaintSubmitScreen from '../screens/eComplaint/EComplaintSubmitScreen';
import PendingComplaintListScreen from '../screens/eComplaint/PendingComplaintListScreen';
import ResolvedComplaintListScreen from '../screens/eComplaint/ResolvedComplaintListScreen';
import UploadDocumentScreen from '../screens/uploadDocument/UploadDocumentScreen';
import NoDueStudentListScreen from '../screens/noDue/NoDueStudentListScreen';
import HostelParentingScreen from '../screens/hostelParenting/HostelParentingScreen';
import HostelParentingListScreen from '../screens/hostelParenting/HostelParentingListScreen';
import AcademicCalendarScreen from '../screens/academicCalendar/AcademicCalendarScreen';
import SuggestionByParentsStudentsScreen from '../screens/suggestion/SuggestionByParentsStudentsScreen';
import {
  SchoolMatterCalendarScreen,
  SchoolMatterTaskDetailScreen,
} from '../screens/schoolMatterCalendar/SchoolMatterCalendarScreens';
import {
  MedicalEntryListScreen,
  MedicalEntryScreen,
} from '../screens/medicalEntry/MedicalEntryScreens';
import {
  AssignTaskScreen,
  ForwardTaskScreen,
  TaskAssignedByMeScreen,
  TaskAssignedToMeScreen,
  TaskCommentsScreen,
  TaskManagementScreen,
} from '../screens/taskManagement/TaskManagementScreens';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash || loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="ProfileScreen" component={MyProfileScreen} />
          <Stack.Screen name="MySalaryScreen" component={MySalaryScreen} />
          <Stack.Screen
            name="SalaryReceiptScreen"
            component={SalaryReceiptScreen}
          />
          <Stack.Screen
            name="EditProfileScreen"
            component={EditProfileScreen}
          />
          <Stack.Screen name="ApplyLeaveScreen" component={ApplyLeaveScreen} />
          <Stack.Screen
            name="MyLeaveRecordScreen"
            component={MyLeaveRecordScreen}
          />
          <Stack.Screen
            name="ChangePasswordScreen"
            component={ChangePasswordScreen}
          />
          <Stack.Screen
            name="StudentAttendanceScreen"
            component={AttendanceScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ViewAttendanceScreen"
            component={ViewAttendanceScreen}
            options={{ headerShown: false }}
          />
          {/* <Stack.Screen
      name="MarkAttendanceScreen"
      component={MarkAttendanceScreen}
      options={{headerShown: false}}
    /> */}

          <Stack.Screen
            name="MainClassAttendanceScreen"
            component={MainClassAttendanceScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="CoachingClassAttendanceScreen"
            component={CoachingClassAttendanceScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="HomeWorkScreen" component={HomeWorkScreen} />

          <Stack.Screen
            name="AssignmentHistoryScreen"
            component={AssignmentHistoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MarkEntryScreen"
            component={MarkEntryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NotificationsScreen"
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StudentPortfolioScreen"
            component={StudentPortfolioScreen}
          />
          <Stack.Screen
            name="SportsEntryScreen"
            component={SportsEntryScreen}
          />
          <Stack.Screen
            name="ActivityEntryScreen"
            component={ActivityEntryScreen}
          />
          <Stack.Screen
            name="SportsEntryListScreen"
            component={SportsEntryListScreen}
          />
          <Stack.Screen
            name="ActivityEntryListScreen"
            component={ActivityEntryListScreen}
          />
          <Stack.Screen name="GalleryScreen" component={ClassGalleryScreen} />
          <Stack.Screen
            name="CreateClassGalleryCategoryScreen"
            component={CreateClassGalleryCategoryScreen}
          />
          <Stack.Screen
            name="ViewClassGalleryCategoryScreen"
            component={ViewClassGalleryCategoryScreen}
          />
          <Stack.Screen
            name="ClassGalleryImagesScreen"
            component={ClassGalleryImagesScreen}
          />
          <Stack.Screen
            name="ViewClassGalleryImagesScreen"
            component={ViewClassGalleryImagesScreen}
          />
          <Stack.Screen
            name="GalleryImageGridScreen"
            component={GalleryImageGridScreen}
          />
          <Stack.Screen name="CreateLinkScreen" component={CreateLinkScreen} />
          <Stack.Screen
            name="SchoolDiaryScreen"
            component={SchoolDiaryScreen}
          />
          <Stack.Screen
            name="EmployeeCircularScreen"
            component={EmployeeCircularScreen}
          />
          <Stack.Screen
            name="StudentCircularScreen"
            component={StudentCircularScreen}
          />
          <Stack.Screen
            name="MyCircularListScreen"
            component={MyCircularListScreen}
          />
          <Stack.Screen
            name="SendByMeCircularListScreen"
            component={SendByMeCircularListScreen}
          />
          <Stack.Screen
            name="ViewCircularScreen"
            component={ViewCircularScreen}
          />
          <Stack.Screen
            name="CircularReadStatusScreen"
            component={CircularReadStatusScreen}
          />
          <Stack.Screen name="DisciplineScreen" component={DisciplineScreen} />
          <Stack.Screen
            name="DisciplineFeedbackScreen"
            component={DisciplineFeedbackScreen}
          />
          <Stack.Screen
            name="MyFeedbackListScreen"
            component={MyFeedbackListScreen}
          />
          <Stack.Screen
            name="EmployeeDalRecordScreen"
            component={EmployeeDalRecordScreen}
          />
          <Stack.Screen
            name="EmployeeDlaReportScreen"
            component={EmployeeDlaReportScreen}
          />
          <Stack.Screen name="EPtmRecordScreen" component={EPtmRecordScreen} />
          <Stack.Screen name="EPTMSPRScreen" component={EPTMSRPScreen} />
          <Stack.Screen name="EPTMSRPScreen" component={EPTMSRPScreen} />
          <Stack.Screen
            name="EmployeeLeaveRequestScreen"
            component={EmployeeLeaveRequestScreen}
          />
          <Stack.Screen
            name="RequestsScreen"
            component={RequestsScreen}
          />
          <Stack.Screen
            name="EmployeeRequestsScreen"
            component={EmployeeRequestsScreen}
          />
          <Stack.Screen
            name="ExtraDayRequestScreen"
            component={ExtraDayRequestScreen}
          />
          <Stack.Screen
            name="EComplaintRecordScreen"
            component={EComplaintRecordScreen}
          />
          <Stack.Screen
            name="EComplaintSubmitScreen"
            component={EComplaintSubmitScreen}
          />
          <Stack.Screen
            name="EComplaintForMeScreen"
            component={EComplaintForMeScreen}
          />
          <Stack.Screen
            name="PendingComplaintListScreen"
            component={PendingComplaintListScreen}
          />
          <Stack.Screen
            name="ResolvedComplaintListScreen"
            component={ResolvedComplaintListScreen}
          />
          <Stack.Screen
            name="UploadDocumentScreen"
            component={UploadDocumentScreen}
          />
          <Stack.Screen
            name="NoDueStudentListScreen"
            component={NoDueStudentListScreen}
          />
          <Stack.Screen
            name="TaskManagementScreen"
            component={TaskManagementScreen}
          />
          <Stack.Screen name="AssignTaskScreen" component={AssignTaskScreen} />
          <Stack.Screen
            name="ForwardTaskScreen"
            component={ForwardTaskScreen}
          />
          <Stack.Screen
            name="TaskAssignedToMeScreen"
            component={TaskAssignedToMeScreen}
          />
          <Stack.Screen
            name="TaskAssignedByMeScreen"
            component={TaskAssignedByMeScreen}
          />
          <Stack.Screen
            name="TaskCommentsScreen"
            component={TaskCommentsScreen}
          />
          <Stack.Screen
            name="HostelParentingScreen"
            component={HostelParentingScreen}
          />
          <Stack.Screen
            name="HostelParentingListScreen"
            component={HostelParentingListScreen}
          />
          <Stack.Screen
            name="AcademicCalendarScreen"
            component={AcademicCalendarScreen}
          />
          <Stack.Screen
            name="SuggestionByParentsStudentsScreen"
            component={SuggestionByParentsStudentsScreen}
          />
          <Stack.Screen
            name="SchoolMatterCalendarScreen"
            component={SchoolMatterCalendarScreen}
          />
          <Stack.Screen
            name="SchoolMatterTaskDetailScreen"
            component={SchoolMatterTaskDetailScreen}
          />
          <Stack.Screen name="MedicalEntryScreen" component={MedicalEntryScreen} />
          <Stack.Screen
            name="MedicalEntryListScreen"
            component={MedicalEntryListScreen}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

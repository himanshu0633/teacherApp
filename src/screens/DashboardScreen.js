import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {
  Menu,
  Bell,
  LogOut,
  UserCircle2,
  ClipboardCheck,
  BookOpen,
  PenSquare,
  Briefcase,
  NotebookPen,
  Images,
  Megaphone,
  ShieldAlert,
  FileText,
  ClipboardList,
  CalendarDays,
  UserCheck,
  MessageCircleWarning,
  MessageSquareText,
} from 'lucide-react-native';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, BASE_URL } from '../utils/constants';

const GRID_ITEMS = [
  {
    id: 1,
    title: 'Profile',
    icon: UserCircle2,
    screen: 'ProfileScreen',
    visibility: 'common',
  },
  {
    id: 2,
    title: 'Student\nAttendance',
    icon: ClipboardCheck,
    screen: 'StudentAttendanceScreen',
    visibility: 'common',
  },
  {
    id: 3,
    title: 'HomeWork',
    icon: BookOpen,
    screen: 'HomeWorkScreen',
    visibility: 'common',
  },
  {
    id: 4,
    title: 'Mark\nEntry',
    icon: PenSquare,
    screen: 'MarkEntryScreen',
    visibility: 'common',
  },
  {
    id: 5,
    title: 'Student Portfolio',
    icon: Briefcase,
    screen: 'StudentPortfolioScreen',
    visibility: 'common',
  },
  {
    id: 6,
    title: 'School Diary',
    icon: NotebookPen,
    screen: 'SchoolDiaryScreen',
    visibility: 'common',
  },
  {
    id: 7,
    title: 'Class Gallery',
    icon: Images,
    screen: 'ClassGalleryImagesScreen',
    visibility: 'staff',
  },
  {
    id: 8,
    title: 'Employee Circular',
    icon: Megaphone,
    screen: 'EmployeeCircularScreen',
    visibility: 'staff',
  },
  {
    id: 9,
    title: 'Discipline',
    icon: ShieldAlert,
    screen: 'DisciplineScreen',
    visibility: 'staff',
  },
  {
    id: 16,
    title: 'Task\nManagement',
    icon: ClipboardList,
    screen: 'TaskManagementScreen',
    visibility: 'staff',
  },
  {
    id: 10,
    title: 'Employee DAL Record',
    icon: FileText,
    screen: 'EmployeeDalRecordScreen',
    visibility: 'principal',
  },
  {
    id: 11,
    title: 'E-PTM Record',
    icon: ClipboardList,
    screen: 'EPtmRecordScreen',
    visibility: 'principal',
  },
  {
    id: 12,
    title: 'Employee Leave Request',
    icon: CalendarDays,
    screen: 'EmployeeLeaveRequestScreen',
    visibility: 'principal',
  },
  {
    id: 13,
    title: 'Employee Requests',
    icon: UserCheck,
    screen: 'EmployeeRequestsScreen',
    visibility: 'principal',
  },
  {
    id: 14,
    title: 'E-Complaint Record',
    icon: MessageCircleWarning,
    screen: 'EComplaintRecordScreen',
    visibility: 'principal',
  },
  {
    id: 15,
    title: 'Suggestion by Parents / Students',
    icon: MessageSquareText,
    alertTitle: 'Suggestion by Parents / Students',
    alertMessage: 'This feature is coming soon.',
    visibility: 'principal',
  },
];

const isPrincipalDesignation = designation =>
  String(designation || '')
    .trim()
    .toLowerCase() === 'principal';

const firstPresentValue = (source, keys, fallback = '0') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }

  return fallback;
};

const normalizeAttendanceCount = response => {
  const data = Array.isArray(response) ? response[0] : response;

  return {
    absent: firstPresentValue(data, [
      'absents',
      'A',
      'a',
      'Absent',
      'absent',
      'absentCount',
    ]),
    leave: firstPresentValue(data, [
      'leaves',
      'L',
      'l',
      'Leave',
      'leave',
      'leaveCount',
    ]),
    present: firstPresentValue(data, [
      'Presents',
      'P',
      'p',
      'Present',
      'present',
      'presentCount',
    ]),
    day: firstPresentValue(
      data,
      ['days', 'Day', 'day', 'dayName', 'DayName'],
      'NA',
    ),
  };
};

const normalizeApiObject = response => {
  return Array.isArray(response) ? response[0] : response;
};

const postForm = async (endpoint, fields) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value === null || value === undefined ? '' : value);
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.log(`${endpoint} JSON PARSE ERROR =>`, error);
    console.log(`${endpoint} RAW RESPONSE =>`, text);
    return null;
  }
};

const updateTeacherLogin = empCode => {
  return postForm(API_ENDPOINTS.UPDATE_LOGIN, {
    empcode: empCode,
  });
};

const getAttendanceCount = ({ empCode, sessionId, branchId }) => {
  return postForm(API_ENDPOINTS.COUNT_ATTENDANCE, {
    empcode: empCode,
    SessionId: sessionId,
    BranchId: branchId,
  });
};

export default function DashboardScreen({ navigation }) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [teacherData, setTeacherData] = useState({
    name: 'NA',
    designation: 'NA',
    branchName: 'NA',
    empCode: '',
    profilePic: '',
    image: 'No',
    sessionName: '2023-24',
  });
  const [attendanceCount, setAttendanceCount] = useState({
    absent: '0',
    leave: '0',
    present: '0',
    day: 'NA',
  });

  const menuWidth = 300;
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;

  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -menuWidth,
      duration: 240,
      useNativeDriver: true,
    }).start(() => {
      setMenuOpen(false);
    });
  }, [menuWidth, slideAnim]);

  const safeValue = useCallback(value => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'null' ||
      value === 'undefined'
    ) {
      return 'NA';
    }
    return String(value);
  }, []);

  const setSafeItem = useCallback(async (key, value) => {
    const finalValue =
      value === null || value === undefined ? '' : String(value);
    await AsyncStorage.setItem(key, finalValue);
  }, []);

  const saveTeacherData = useCallback(
    async teacherResponse => {
      try {
        const currentRaw = await AsyncStorage.getItem('teacherData');
        let currentData = {};

        try {
          currentData = currentRaw ? JSON.parse(currentRaw) : {};
        } catch (error) {
          currentData = {};
        }

        const updatedTeacherData = {
          ...currentData,
          ...teacherResponse,
        };

        await AsyncStorage.setItem(
          'teacherData',
          JSON.stringify(updatedTeacherData),
        );
        await setSafeItem('EmpCode', updatedTeacherData?.EmpCode);
        await setSafeItem('EmpID', updatedTeacherData?.EmpID);
        await setSafeItem('name', updatedTeacherData?.name);
        await setSafeItem('EmpTypeID', updatedTeacherData?.EmpTypeID);
        await setSafeItem('JobType', updatedTeacherData?.JobType);
        await setSafeItem('SessionName', updatedTeacherData?.SessionName);
        await setSafeItem('DepartmentName', updatedTeacherData?.DepartmentName);
        await setSafeItem('LoginTypeName', updatedTeacherData?.LoginTypeName);
        await setSafeItem(
          'DesignationName',
          updatedTeacherData?.DesignationName,
        );
        await setSafeItem('DOB', updatedTeacherData?.DOB);
        await setSafeItem('DOJ', updatedTeacherData?.DOJ);
        await setSafeItem(
          'ResidentialAddress',
          updatedTeacherData?.ResidentialAddress,
        );
        await setSafeItem('MobileNo', updatedTeacherData?.MobileNo);
        await setSafeItem('EmpCategory', updatedTeacherData?.EmpCategory);
        await setSafeItem('Gender', updatedTeacherData?.Gender);
        await setSafeItem('response', updatedTeacherData?.response);
        await setSafeItem('Session', updatedTeacherData?.Session);
        await setSafeItem('SessionId', updatedTeacherData?.SessionId);
        await setSafeItem('image', updatedTeacherData?.image || 'No');
        await setSafeItem(
          'profil_pic',
          updatedTeacherData?.profil_pic || updatedTeacherData?.profile_pic,
        );
        await setSafeItem(
          'profile_pic',
          updatedTeacherData?.profile_pic || updatedTeacherData?.profil_pic,
        );
        await setSafeItem('BranchId', updatedTeacherData?.BranchId);
        await setSafeItem('branchName', updatedTeacherData?.branchName);
        await setSafeItem('SectionName', updatedTeacherData?.SectionName);
        await setSafeItem('SectionId', updatedTeacherData?.SectionId);
        await setSafeItem('Classid', updatedTeacherData?.Classid);
        await setSafeItem('ClassName', updatedTeacherData?.ClassName);
        return updatedTeacherData;
      } catch (error) {
        console.log('SAVE UPDATED STORAGE ERROR =>', error);
        return false;
      }
    },
    [setSafeItem],
  );

  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationRows, setNotificationRows] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const callUpdateLogin = useCallback(
    async empCode => {
      try {
        const data = normalizeApiObject(await updateTeacherLogin(empCode));

        if (data && typeof data === 'object') {
          const savedData = await saveTeacherData(data);

          if (savedData) {
            setTeacherData({
              name: safeValue(savedData?.name),
              designation: safeValue(savedData?.DesignationName),
              branchName: safeValue(savedData?.branchName),
              empCode: savedData?.EmpCode || empCode || '',
              profilePic: savedData?.profile_pic || savedData?.profil_pic || '',
              image: savedData?.image || 'No',
              sessionName: savedData?.SessionName || '2023-24',
            });
          }
        }
      } catch (error) {
        console.log('updatelogin.php CALL ERROR =>', error);
      }
    },
    [safeValue, saveTeacherData],
  );

  const callAttendanceCount = useCallback(
    async ({ empCode, sessionId, branchId }) => {
      try {
        const data = normalizeApiObject(
          await getAttendanceCount({ empCode, sessionId, branchId }),
        );

        if (data) {
          setAttendanceCount(normalizeAttendanceCount(data));
          setNotificationCount(Number(data?.notification_count || 0));

          const profilePic = data?.profile_pic || data?.profil_pic || '';

          if (profilePic || data?.image) {
            setTeacherData(current => ({
              ...current,
              profilePic: profilePic || current.profilePic,
              image: data?.image || current.image,
            }));

            await AsyncStorage.setItem('profile_pic', String(profilePic));
            await AsyncStorage.setItem('profil_pic', String(profilePic));
            await AsyncStorage.setItem('image', String(data?.image || ''));
          }
        }
      } catch (error) {
        console.log('countattendance.php CALL ERROR =>', error);
      }
    },
    [],
  );

  const getNotifications = useCallback(async empCode => {
    const data = await postForm(API_ENDPOINTS.NOTIFICATIONS, {
      empcode: empCode,
    });

    return Array.isArray(data?.response) ? data.response : [];
  }, []);

  const loadNotifications = useCallback(
    async empCode => {
      try {
        console.log('DASHBOARD NOTIFICATIONS PAYLOAD =>', { empcode: empCode });
        const rows = await getNotifications(empCode);
        console.log('DASHBOARD NOTIFICATIONS RESPONSE ROWS =>', rows);
        setNotificationRows(rows);
        setNotificationCount(rows.length);
      } catch (error) {
        console.log('DASHBOARD NOTIFICATIONS ERROR =>', error);
        setNotificationRows([]);
        setNotificationCount(0);
      }
    },
    [getNotifications],
  );

  const handleNotificationsPress = useCallback(async () => {
    if (!teacherData.empCode) {
      Alert.alert('Error', 'EmpCode not found.');
      return;
    }

    setLoadingNotifications(true);
    try {
      let rows = notificationRows;

      if (!rows.length) {
        console.log('NOTIFICATIONS PAYLOAD =>', {
          empcode: teacherData.empCode,
        });
        rows = await getNotifications(teacherData.empCode);
        setNotificationRows(rows);
      }

      console.log('NOTIFICATIONS TO SHOW =>', rows);
      setNotificationCount(0);
      navigation.navigate('NotificationsScreen', {
        notifications: rows,
      });
    } catch (error) {
      console.log('NOTIFICATIONS ERROR =>', error);
      Alert.alert('Error', 'Failed to load notifications.');
    } finally {
      setLoadingNotifications(false);
    }
  }, [getNotifications, navigation, notificationRows, teacherData.empCode]);

  const loadDashboardData = useCallback(async () => {
    try {
      const teacherDataRaw = await AsyncStorage.getItem('teacherData');
      const name = await AsyncStorage.getItem('name');
      const designation = await AsyncStorage.getItem('DesignationName');
      const branchName = await AsyncStorage.getItem('branchName');
      const empCode = await AsyncStorage.getItem('EmpCode');
      const profilePic = await AsyncStorage.getItem('profil_pic');
      const profilePicAlt = await AsyncStorage.getItem('profile_pic');
      const image = await AsyncStorage.getItem('image');
      const sessionName = await AsyncStorage.getItem('SessionName');
      const sessionId = await AsyncStorage.getItem('SessionId');
      const session = await AsyncStorage.getItem('Session');
      const branchId = await AsyncStorage.getItem('BranchId');

      if (!teacherDataRaw) {
        await logout();
        return;
      }

      let parsed = {};
      try {
        parsed = JSON.parse(teacherDataRaw);
      } catch (error) {
        console.log('teacherData parse error =>', error);
        await logout();
        return;
      }

      const finalData = {
        name: safeValue(parsed?.name || name),
        designation: safeValue(parsed?.DesignationName || designation),
        branchName: safeValue(parsed?.branchName || branchName),
        empCode: parsed?.EmpCode || empCode || '',
        profilePic:
          parsed?.profile_pic ||
          parsed?.profil_pic ||
          profilePicAlt ||
          profilePic ||
          '',
        image: parsed?.image || image || 'No',
        sessionName: parsed?.SessionName || sessionName || '2023-24',
        sessionId:
          parsed?.SessionId || parsed?.Session || sessionId || session || '',
        branchId: parsed?.BranchId || branchId || '',
      };

      setTeacherData(finalData);

      if (finalData.empCode) {
        await callUpdateLogin(finalData.empCode);
        await callAttendanceCount({
          empCode: finalData.empCode,
          sessionId: finalData.sessionId,
          branchId: finalData.branchId,
        });
        await loadNotifications(finalData.empCode);
      }
    } catch (error) {
      console.log('LOAD DASHBOARD ERROR =>', error);
      Alert.alert('Error', 'Dashboard data load failed');
    }
  }, [
    callAttendanceCount,
    callUpdateLogin,
    loadNotifications,
    logout,
    safeValue,
  ]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const clearAppSession = useCallback(async () => {
    await AsyncStorage.clear();
    await logout();
  }, [logout]);

  const handleLogout = useCallback(() => {
    closeMenu();

    setTimeout(() => {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAppSession();
            } catch (error) {
              console.log('LOGOUT ERROR =>', error);
              Alert.alert('Error', 'Logout failed');
            }
          },
        },
      ]);
    }, 250);
  }, [clearAppSession, closeMenu]);

  const onPressGrid = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
      return;
    }

    if (item.alertTitle || item.alertMessage) {
      Alert.alert(
        item.alertTitle || item.title,
        item.alertMessage || 'This feature is coming soon.',
      );
    }
  };

  const renderGridCard = item => {
    const Icon = item.icon;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.85}
        style={styles.gridCard}
        onPress={() => onPressGrid(item)}
      >
        <Icon size={36} color="#1B98F3" strokeWidth={2.1} />
        <Text style={styles.gridText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const showNetworkImage = !!teacherData.profilePic;
  const isPrincipal = isPrincipalDesignation(teacherData.designation);
  const visibleGridItems = GRID_ITEMS.filter(item => {
    if (item.visibility === 'common') {
      return true;
    }

    return isPrincipal
      ? item.visibility === 'principal'
      : item.visibility === 'staff';
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <LinearGradient
        colors={['#0A8BE8', '#38D640']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.topSafeSpace} />

        <View style={styles.topBar}>
          <View style={styles.leftSection}>
            <TouchableOpacity activeOpacity={0.7} onPress={openMenu}>
              <Menu size={30} color="#fff" strokeWidth={2.4} />
            </TouchableOpacity>

            <Text style={styles.branchText} numberOfLines={1}>
              {teacherData.branchName === 'NA'
                ? 'HAPS, Hiranagar'
                : teacherData.branchName}
            </Text>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.bellWrapper,
                loadingNotifications && styles.disabledIcon,
              ]}
              disabled={loadingNotifications}
              onPress={handleNotificationsPress}
            >
              <Bell size={24} color="#fff" strokeWidth={2.4} />
              {notificationCount > 0 && ( // optional: show only if count > 0
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={handleLogout}>
              <LogOut size={24} color="#fff" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.avatarWrapper}>
        {showNetworkImage ? (
          <Image
            source={{ uri: teacherData.profilePic }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.fallbackAvatarWrap}>
            <Image
              source={require('../assets/images/avatar-boy.png')}
              style={styles.fallbackAvatar}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      <View style={styles.contentCard}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.nameText}>{teacherData.name}</Text>
          <Text style={styles.designationText}>{teacherData.designation}</Text>

          <View style={styles.attendanceCard}>
            <View style={styles.attendanceHeader}>
              <Text style={styles.attendanceHeaderText}>
                Attendance Summary
              </Text>
              <Text style={styles.attendanceHeaderText}>
                {attendanceCount.day}
              </Text>
            </View>

            <View style={styles.attendanceBody}>
              <View style={styles.attendanceBox}>
                <View style={[styles.labelBox, styles.absentLabelBox]}>
                  <Text style={styles.labelText}>A</Text>
                </View>
                <Text style={styles.countText}>{attendanceCount.absent}</Text>
              </View>

              <View style={styles.attendanceBox}>
                <View style={[styles.labelBox, styles.leaveLabelBox]}>
                  <Text style={styles.labelText}>L</Text>
                </View>
                <Text style={styles.countText}>{attendanceCount.leave}</Text>
              </View>

              <View style={styles.attendanceBox}>
                <View style={[styles.labelBox, styles.presentLabelBox]}>
                  <Text style={styles.labelText}>P</Text>
                </View>
                <Text style={styles.countText}>{attendanceCount.present}</Text>
              </View>
            </View>
          </View>

          <View style={styles.gridWrap}>
            {visibleGridItems.map(renderGridCard)}
          </View>
        </ScrollView>
      </View>

      <SidebarMenu
        visible={menuOpen}
        onClose={closeMenu}
        slideAnim={slideAnim}
        teacherData={teacherData}
        navigation={navigation}
        onLogout={handleLogout}
        menuWidth={menuWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },
  headerGradient: {
    width: '100%',
    height: 210,
  },
  topSafeSpace: {
    height: Platform.OS === 'ios' ? 52 : StatusBar.currentHeight || 24,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
  bellWrapper: {
    marginRight: 18,
    position: 'relative',
  },
  disabledIcon: {
    opacity: 0.6,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF0808',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    marginTop: -45,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingTop: 68,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarWrapper: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DDE7EE',
  },
  fallbackAvatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DDE7EE',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fallbackAvatar: {
    width: 88,
    height: 88,
  },
  nameText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  designationText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6D6D6D',
    marginBottom: 22,
  },
  attendanceCard: {
    borderWidth: 1.3,
    borderColor: '#1598F2',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  attendanceHeader: {
    backgroundColor: '#1797E8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendanceHeaderText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  attendanceBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  attendanceBox: {
    width: '31%',
    backgroundColor: '#E9EEF2',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  labelBox: {
    width: 30,
    height: 30,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  absentLabelBox: {
    backgroundColor: '#FF0D0D',
  },
  leaveLabelBox: {
    backgroundColor: '#F4BE1F',
  },
  presentLabelBox: {
    backgroundColor: '#34B82F',
  },
  labelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  countText: {
    fontSize: 17,
    color: '#333',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '30.5%',
    minHeight: 100,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.2,
    borderColor: '#1897F3',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 14,
    marginBottom: 14,
  },
  gridText: {
    textAlign: 'center',
    fontSize: 11.5,
    lineHeight: 15,
    color: '#333',
    marginTop: 10,
  },
});

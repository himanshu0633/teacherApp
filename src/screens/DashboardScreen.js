import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {BASE_URL} from '../utils/constants';
import SidebarMenu from '../components/SidebarMenu';
import {useAuth} from '../context/AuthContext';

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

export default function DashboardScreen({navigation}) {
  const {logout} = useAuth();
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

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -menuWidth,
      duration: 240,
      useNativeDriver: true,
    }).start(() => {
      setMenuOpen(false);
    });
  };

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

  const saveTeacherData = useCallback(async teacherResponse => {
    try {
      await AsyncStorage.setItem('teacherData', JSON.stringify(teacherResponse));
      await setSafeItem('EmpCode', teacherResponse?.EmpCode);
      await setSafeItem('EmpID', teacherResponse?.EmpID);
      await setSafeItem('name', teacherResponse?.name);
      await setSafeItem('EmpTypeID', teacherResponse?.EmpTypeID);
      await setSafeItem('JobType', teacherResponse?.JobType);
      await setSafeItem('SessionName', teacherResponse?.SessionName);
      await setSafeItem('DepartmentName', teacherResponse?.DepartmentName);
      await setSafeItem('LoginTypeName', teacherResponse?.LoginTypeName);
      await setSafeItem('DesignationName', teacherResponse?.DesignationName);
      await setSafeItem('DOB', teacherResponse?.DOB);
      await setSafeItem('DOJ', teacherResponse?.DOJ);
      await setSafeItem(
        'ResidentialAddress',
        teacherResponse?.ResidentialAddress,
      );
      await setSafeItem('MobileNo', teacherResponse?.MobileNo);
      await setSafeItem('EmpCategory', teacherResponse?.EmpCategory);
      await setSafeItem('Gender', teacherResponse?.Gender);
      await setSafeItem('response', teacherResponse?.response);
      await setSafeItem('Session', teacherResponse?.Session);
      await setSafeItem('image', teacherResponse?.image || 'No');
      await setSafeItem('profil_pic', teacherResponse?.profil_pic);
      await setSafeItem('BranchId', teacherResponse?.BranchId);
      await setSafeItem('branchName', teacherResponse?.branchName);
      await setSafeItem('SectionName', teacherResponse?.SectionName);
      await setSafeItem('SectionId', teacherResponse?.SectionId);
      await setSafeItem('Classid', teacherResponse?.Classid);
      await setSafeItem('ClassName', teacherResponse?.ClassName);
      return true;
    } catch (error) {
      console.log('SAVE UPDATED STORAGE ERROR =>', error);
      return false;
    }
  }, [setSafeItem]);

  const [notificationCount] = useState(0);

  const callUpdateLogin = useCallback(async empCode => {
    try {
      const formData = new FormData();
      formData.append('empcode', empCode);

      const response = await fetch(`${BASE_URL}updatelogin.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const text = await response.text();
      let data = null;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.log('updatelogin.php JSON PARSE ERROR =>', error);
        return;
      }

      if (data?.EmpCode) {
        const saved = await saveTeacherData(data);

        if (saved) {
          setTeacherData({
            name: safeValue(data?.name),
            designation: safeValue(data?.DesignationName),
            branchName: safeValue(data?.branchName),
            empCode: data?.EmpCode || '',
            profilePic: data?.profil_pic || '',
            image: data?.image || 'No',
            sessionName: data?.SessionName || '2023-24',
          });
        }
      }
    } catch (error) {
      console.log('updatelogin.php CALL ERROR =>', error);
    }
  }, [safeValue, saveTeacherData]);

  const loadDashboardData = useCallback(async () => {
    try {
      const teacherDataRaw = await AsyncStorage.getItem('teacherData');
      const name = await AsyncStorage.getItem('name');
      const designation = await AsyncStorage.getItem('DesignationName');
      const branchName = await AsyncStorage.getItem('branchName');
      const empCode = await AsyncStorage.getItem('EmpCode');
      const profilePic = await AsyncStorage.getItem('profil_pic');
      const image = await AsyncStorage.getItem('image');
      const sessionName = await AsyncStorage.getItem('SessionName');

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
        profilePic: parsed?.profil_pic || profilePic || '',
        image: parsed?.image || image || 'No',
        sessionName: parsed?.SessionName || sessionName || '2023-24',
      };

      setTeacherData(finalData);

      if (finalData.empCode) {
        await callUpdateLogin(finalData.empCode);
      }
    } catch (error) {
      console.log('LOAD DASHBOARD ERROR =>', error);
      Alert.alert('Error', 'Dashboard data load failed');
    }
  }, [callUpdateLogin, logout, safeValue]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    closeMenu();

    setTimeout(() => {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Logout failed');
            }
          },
        },
      ]);
    }, 250);
  };

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
        onPress={() => onPressGrid(item)}>
        <Icon size={36} color="#1B98F3" strokeWidth={2.1} />
        <Text style={styles.gridText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const showNetworkImage =
    String(teacherData.image).toLowerCase() === 'yes' &&
    !!teacherData.profilePic;
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
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
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
  style={styles.bellWrapper}
  onPress={() => navigation.navigate('NotificationsScreen')}
>
  <Bell size={24} color="#fff" strokeWidth={2.4} />
  {notificationCount > 0 && (   // optional: show only if count > 0
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
            source={{uri: teacherData.profilePic}}
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
          contentContainerStyle={styles.scrollContent}>
          <Text style={styles.nameText}>{teacherData.name}</Text>
          <Text style={styles.designationText}>{teacherData.designation}</Text>

          <View style={styles.attendanceCard}>
            <View style={styles.attendanceHeader}>
              <Text style={styles.attendanceHeaderText}>Attendance Summary</Text>
              <Text style={styles.attendanceHeaderText}>
                Day: Summer Vacation
              </Text>
            </View>

            <View style={styles.attendanceBody}>
              <View style={styles.attendanceBox}>
                <View style={[styles.labelBox, {backgroundColor: '#FF0D0D'}]}>
                  <Text style={styles.labelText}>A</Text>
                </View>
                <Text style={styles.countText}>0</Text>
              </View>

              <View style={styles.attendanceBox}>
                <View style={[styles.labelBox, {backgroundColor: '#F4BE1F'}]}>
                  <Text style={styles.labelText}>L</Text>
                </View>
                <Text style={styles.countText}>0</Text>
              </View>

              <View style={styles.attendanceBox}>
                <View style={[styles.labelBox, {backgroundColor: '#34B82F'}]}>
                  <Text style={styles.labelText}>P</Text>
                </View>
                <Text style={styles.countText}>205</Text>
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

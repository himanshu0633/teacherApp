import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {
  Menu,
  Bell,
  LogOut,
  UsersRound,
  ClipboardList,
  FileText,
  FolderOpen,
  CalendarDays,
  Wallet,
  ShieldCheck,
  BookOpenCheck,
} from 'lucide-react-native';
import {BASE_URL} from '../utils/constants';

const GRID_ITEMS = [
  {
    id: 1,
    title: 'Task\nManagement',
    icon: UsersRound,
    screen: 'TaskManagementScreen',
  },
  {
    id: 2,
    title: 'Leave\nReport',
    icon: ClipboardList,
    screen: 'LeaveReportScreen',
  },
  {
    id: 3,
    title: 'Employee\nCircular',
    icon: FileText,
    screen: 'EmployeeCircularScreen',
  },
  {
    id: 4,
    title: 'Documents',
    icon: FolderOpen,
    screen: 'DocumentsScreen',
  },
  {
    id: 5,
    title: 'Daily Task\nAgenda',
    icon: CalendarDays,
    screen: 'DailyTaskAgendaScreen',
  },
  {
    id: 6,
    title: 'No Dues',
    icon: Wallet,
    screen: 'NoDuesScreen',
  },
  {
    id: 7,
    title: 'Holistic\nEntry',
    icon: ShieldCheck,
    screen: 'HolisticEntryScreen',
  },
  {
    id: 8,
    title: 'CBO Entry',
    icon: BookOpenCheck,
    screen: 'CBOEntryScreen',
  },
];

export default function DashboardScreen({navigation}) {
  const [teacherData, setTeacherData] = useState({
    name: 'NA',
    designation: 'NA',
    branchName: 'NA',
    empCode: '',
    profilePic: '',
    image: 'No',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const safeValue = value => {
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
  };

const loadDashboardData = async () => {
  try {
    console.log('==============================');
    console.log('DASHBOARD LOAD START');

    const allKeys = await AsyncStorage.getAllKeys();
    console.log('ALL KEYS =>', allKeys);

    const allData = await AsyncStorage.multiGet(allKeys);

    console.log('ALL STORAGE DATA =>');
    allData.forEach(item => {
      console.log(item[0], '=>', item[1]);
    });

    // full object first priority
    const teacherDataRaw = await AsyncStorage.getItem('teacherData');

    let teacherData = {};

    if (teacherDataRaw) {
      try {
        teacherData = JSON.parse(teacherDataRaw);
        console.log('teacherData OBJECT =>', teacherData);
      } catch (error) {
        console.log('teacherData parse error');
      }
    }

    const values = await AsyncStorage.multiGet([
      'EmpCode',
      'EmpID',
      'name',
      'EmpTypeID',
      'JobType',
      'SessionName',
      'DepartmentName',
      'LoginTypeName',
      'DesignationName',
      'DOB',
      'DOJ',
      'ResidentialAddress',
      'MobileNo',
      'EmpCategory',
      'Gender',
      'response',
      'Session',
      'image',
      'profil_pic',
      'BranchId',
      'branchName',
      'SectionName',
      'SectionId',
      'Classid',
      'ClassName',
    ]);

    const map = Object.fromEntries(values);

    const finalData = {
      EmpCode: teacherData?.EmpCode || map.EmpCode || '',
      EmpID: teacherData?.EmpID || map.EmpID || '',
      name: teacherData?.name || map.name || 'NA',
      DesignationName:
        teacherData?.DesignationName ||
        map.DesignationName ||
        'NA',

      DepartmentName:
        teacherData?.DepartmentName ||
        map.DepartmentName ||
        'NA',

      branchName:
        teacherData?.branchName ||
        map.branchName ||
        'NA',

      profilePic:
        teacherData?.profil_pic ||
        map.profil_pic ||
        '',

      image:
        teacherData?.image ||
        map.image ||
        'No',
    };

    console.log('==============================');
    console.log('FINAL DASHBOARD DATA =>');
    console.log(finalData);

    setTeacherData(finalData);

    if (finalData.EmpCode) {
      callUpdateLogin(finalData.EmpCode);
    }
  } catch (error) {
    console.log('LOAD DASHBOARD ERROR =>', error);
  }
};

  const callUpdateLogin = async empCode => {
    try {
      const formData = new FormData();
      formData.append('empcode', empCode);

      await fetch(`${BASE_URL}updatelogin.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
    } catch (error) {
      console.log('updatelogin error', error);
    }
  };

  const onPressGrid = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
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
    teacherData.profilePic;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={['#0A8BE8', '#38D640']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.topSafeSpace} />

        <View style={styles.topBar}>
          <View style={styles.leftSection}>
            <TouchableOpacity activeOpacity={0.7}>
              <Menu size={30} color="#fff" strokeWidth={2.4} />
            </TouchableOpacity>

            <Text style={styles.branchText} numberOfLines={1}>
              {teacherData.branchName === 'NA'
                ? 'HAPS, Hiranagar'
                : teacherData.branchName}
            </Text>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity activeOpacity={0.7} style={styles.bellWrapper}>
              <Bell size={24} color="#fff" strokeWidth={2.4} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>0</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <LogOut size={24} color="#fff" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contentCard}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
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

          <Text style={styles.nameText}>{teacherData.name}</Text>
          <Text style={styles.designationText}>{teacherData.designation}</Text>

          <View style={styles.attendanceCard}>
            <View style={styles.attendanceHeader}>
              <Text style={styles.attendanceHeaderText}>Attendance Summary</Text>
              <Text style={styles.attendanceHeaderText}>Day: Summer Vacation</Text>
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

          <View style={styles.gridWrap}>{GRID_ITEMS.map(renderGridCard)}</View>
        </ScrollView>
      </View>
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
    top: -48,
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
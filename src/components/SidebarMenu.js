import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ScrollView,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  User,
  Link2,
  Images,
  Briefcase,
  NotebookPen,
  ClipboardList,
  Megaphone,
  ShieldAlert,
  MessageSquareMore,
  MessageCircleWarning,
  LogOut,
  ChevronRight,
  CalendarDays,
  UserCheck,
  UploadCloud,
} from 'lucide-react-native';

const MENU_ITEMS = [
  {
    label: 'My Profile',
    icon: User,
    screen: 'ProfileScreen',
    visibility: 'common',
  },
  {
    label: 'Create Link',
    icon: Link2,
    screen: 'CreateLinkScreen',
    visibility: 'common',
  },
  {
    label: 'Gallery',
    icon: Images,
    screen: 'GalleryScreen',
    visibility: 'common',
  },

  {
    label: 'E-PTM SPR',
    icon: Images,
    screen: 'EPTMSPRScreen',
    visibility: 'common',
  },
  {
    label: 'Student Portfolio',
    icon: Briefcase,
    screen: 'StudentPortfolioScreen',
    visibility: 'common',
  },
  {
    label: 'School Diary',
    icon: NotebookPen,
    screen: 'SchoolDiaryScreen',
    visibility: 'common',
  },
  {
    label: 'Academic Calendar',
    icon: CalendarDays,
    screen: 'AcademicCalendarScreen',
    visibility: 'common',
  },
  {
    label: 'Employee Circular',
    icon: Megaphone,
    screen: 'EmployeeCircularScreen',
    visibility: 'common',
  },
  {
    label: 'Student Circular',
    icon: Megaphone,
    screen: 'StudentCircularScreen',
    visibility: 'common',
  },
  {
    label: 'Discipline',
    icon: ShieldAlert,
    screen: 'DisciplineScreen',
    visibility: 'common',
  },
  {
    label: 'E-Complaint Record',
    icon: MessageCircleWarning,
    screen: 'EComplaintRecordScreen',
    visibility: 'common',
  },
  {
    label: 'Task Management',
    icon: ClipboardList,
    screen: 'TaskManagementScreen',
    visibility: 'staff',
  },
  {
    label: 'Hostel Parenting',
    icon: NotebookPen,
    screen: 'HostelParentingScreen',
    visibility: 'staff',
  },
  {
    label: 'School Matter Calendar',
    icon: CalendarDays,
    screen: 'SchoolMatterCalendarScreen',
    visibility: 'staff',
  },
  {
    label: 'Medical Entry',
    icon: NotebookPen,
    screen: 'MedicalEntryScreen',
    visibility: 'staff',
  },
  {
    label: 'Upload Document',
    icon: UploadCloud,
    screen: 'UploadDocumentScreen',
    visibility: 'staff',
  },
  {
    label: 'Daily Activity Log',
    icon: ClipboardList,
    screen: 'EmployeeDalRecordScreen',
    visibility: 'staff',
  },
  {
    label: 'Employee Requests',
    icon: UserCheck,
    screen: 'EmployeeRequestsScreen',
    visibility: 'staff',
  },
  {
    label: 'My Feedback List',
    icon: MessageSquareMore,
    screen: 'MyFeedbackListScreen',
    visibility: 'common',
  },
];

const isPrincipalDesignation = designation =>
  String(designation || '')
    .trim()
    .toLowerCase() === 'principal';

export default function SidebarMenu({
  visible,
  onClose,
  slideAnim,
  teacherData,
  navigation,
  onLogout,
  menuWidth = 300,
}) {
  const handleItemPress = item => {
    onClose();
    setTimeout(() => {
      if (item?.screen) {
        navigation.navigate(item.screen);
      }
    }, 220);
  };

  const showNetworkImage =
    String(teacherData?.image).toLowerCase() === 'yes' &&
    teacherData?.profilePic;
  const isPrincipal = isPrincipalDesignation(teacherData?.designation);
  const visibleMenuItems = MENU_ITEMS.filter(item => {
    if (item.visibility === 'common') {
      return true;
    }

    return isPrincipal
      ? item.visibility === 'principal'
      : item.visibility === 'staff';
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.drawer,
            {
              width: menuWidth,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#0A8BE8', '#0A8BE8', '#2C8A3D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerTopSpace} />

            <View style={styles.profileWrap}>
              {showNetworkImage ? (
                <Image
                  source={{ uri: teacherData.profilePic }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Image
                    source={require('../assets/images/avatar-boy.png')}
                    style={styles.avatarImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              <Text style={styles.nameText}>
                {teacherData?.name || 'VIPAN SHARMA'}
              </Text>
              <Text style={styles.sessionText}>
                Session: {teacherData?.sessionName || '2023-24'}
              </Text>
            </View>
          </LinearGradient>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuList}
          >
            {visibleMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isBlue = item.label === 'Marks Entry';

              return (
                <TouchableOpacity
                  key={`${item.label}-${index}`}
                  activeOpacity={0.8}
                  style={styles.menuItem}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.menuLeft}>
                    <Icon
                      size={20}
                      color={isBlue ? '#1E90FF' : '#222'}
                      strokeWidth={1.9}
                    />
                    <Text
                      style={[styles.menuLabel, isBlue && styles.menuLabelBlue]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  <ChevronRight
                    size={18}
                    color={isBlue ? '#1E90FF' : '#222'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.menuItem, styles.logoutItem]}
              onPress={onLogout}
            >
              <View style={styles.menuLeft}>
                <LogOut size={20} color="#FF1F1F" strokeWidth={2} />
                <Text style={styles.logoutText}>Logout</Text>
              </View>

              <ChevronRight size={18} color="#FF1F1F" strokeWidth={2} />
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  backdrop: {
    flex: 1,
  },

  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#F3F3F3',
    borderTopRightRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },

  header: {
    width: '100%',
    minHeight: 138,
    // paddingHorizontal: 16,
  },

  headerTopSpace: {
    height: Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 24,
  },

  profileWrap: {
    alignItems: 'center',
    marginTop: 2,
    paddingBottom: 18,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E6EEF5',
    marginBottom: 10,
  },

  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E6EEF5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },

  avatarImage: {
    width: 82,
    height: 82,
  },

  nameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },

  sessionText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '400',
  },

  menuList: {
    paddingTop: 6,
    paddingBottom: 24,
    backgroundColor: '#F3F3F3',
  },

  menuItem: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D7D7D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F3F3',
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  menuLabel: {
    fontSize: 15.5,
    color: '#222',
    marginLeft: 14,
    fontWeight: '400',
  },

  menuLabelBlue: {
    color: '#1E90FF',
    fontWeight: '500',
  },

  logoutItem: {
    marginTop: 2,
  },

  logoutText: {
    fontSize: 15.5,
    color: '#FF1F1F',
    marginLeft: 14,
    fontWeight: '500',
  },
});

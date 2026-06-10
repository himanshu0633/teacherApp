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
  X,
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
    visibility: 'staff',
  },
  {
    label: 'Gallery',
    icon: Images,
    screen: 'GalleryScreen',
    visibility: 'staff',
  },

  {
    label: 'E-PTM SPR',
    icon: Images,
    screen: 'EPTMSPRScreen',
    visibility: 'staff',
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
    visibility: 'staff',
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
    visibility: 'common',
  },
  {
    label: 'Hostel Parenting',
    icon: NotebookPen,
    screen: 'HostelParentingScreen',
    visibility: 'common',
  },
  {
    label: 'School Matter Calendar',
    icon: CalendarDays,
    screen: 'SchoolMatterCalendarScreen',
    visibility: 'common',
  },
  {
    label: 'Medical Entry',
    icon: NotebookPen,
    screen: 'MedicalEntryScreen',
    visibility: 'common',
  },
  {
    label: 'Upload Document',
    icon: UploadCloud,
    screen: 'UploadDocumentScreen',
    visibility: 'common',
  },
  {
    label: 'No Due List',
    icon: ClipboardList,
    screen: 'NoDueStudentListScreen',
    visibility: 'common',
  },
  {
    label: 'Daily Activity Log',
    icon: ClipboardList,
    screen: 'EmployeeDalRecordScreen',
    visibility: 'staff',
  },
  {
    label: 'Employee DLA Report',
    icon: ClipboardList,
    screen: 'EmployeeDlaReportScreen',
    visibility: 'principal',
  },
  {
    label: 'Employee Requests',
    icon: UserCheck,
    screen: 'RequestsScreen',
    visibility: 'staff',
  },
  {
    label: 'Employee Requests',
    icon: UserCheck,
    screen: 'EmployeeRequestsScreen',
    visibility: 'principal',
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
            colors={['#0A8BE8', '#38D640']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTopSpace} />

            <View style={styles.headerBar}>
              <Text style={styles.headerTitle}>Menu</Text>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.closeButton}
                onPress={onClose}
              >
                <X size={22} color="#fff" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

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
              <Text style={styles.designationText}>
                {teacherData?.designation || 'Teacher'}
              </Text>
            </View>
          </LinearGradient>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuList}
          >
            <View style={styles.sessionPill}>
              <CalendarDays size={15} color="#168FD8" strokeWidth={2.2} />
              <Text style={styles.sessionText}>
                Session {teacherData?.sessionName || '2023-24'}
              </Text>
            </View>

            {visibleMenuItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <TouchableOpacity
                  key={`${item.label}-${index}`}
                  activeOpacity={0.8}
                  style={styles.menuItem}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.iconCircle}>
                      <Icon size={21} color="#168FD8" strokeWidth={1.9} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>

                  <ChevronRight size={18} color="#383838" strokeWidth={2} />
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.menuItem, styles.logoutItem]}
              onPress={onLogout}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconCircle, styles.logoutIconCircle]}>
                  <LogOut size={21} color="#E83939" strokeWidth={2} />
                </View>
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
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 14,
  },

  header: {
    width: '100%',
    paddingBottom: 20,
  },

  headerTopSpace: {
    height: Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 24,
  },

  headerBar: {
    height: 42,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileWrap: {
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 8,
  },

  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 8,
  },

  avatarImage: {
    width: 70,
    height: 70,
  },

  nameText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },

  designationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12.5,
    marginTop: 3,
    fontWeight: '500',
  },

  sessionPill: {
    alignSelf: 'center',
    minHeight: 32,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: '#EAF7FE',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sessionText: {
    color: '#168FD8',
    fontSize: 12.5,
    marginLeft: 7,
    fontWeight: '600',
  },

  menuList: {
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
  },

  menuItem: {
    minHeight: 54,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    marginBottom: 9,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: '#252525',
    marginLeft: 12,
    fontWeight: '500',
  },

  logoutItem: {
    marginTop: 5,
    backgroundColor: '#FFF1F1',
  },

  logoutIconCircle: {
    backgroundColor: '#FFFFFF',
  },

  logoutText: {
    flex: 1,
    fontSize: 14,
    color: '#E83939',
    marginLeft: 12,
    fontWeight: '600',
  },
});

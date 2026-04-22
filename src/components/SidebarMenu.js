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
  Megaphone,
  GraduationCap,
  ShieldAlert,
  MessageSquareMore,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';


const MENU_ITEMS = [
  {
    label: 'My Profile',
    icon: User,
    screen: 'ProfileScreen',
  },
  {
    label: 'Create Link',
    icon: Link2,
    screen: 'CreateLinkScreen',
  },
  {
    label: 'Gallery',
    icon: Images,
    screen: 'GalleryScreen',
  },
  {
    label: 'Student Portfolio',
    icon: Briefcase,
    screen: 'StudentPortfolioScreen',
  },
  {
    label: 'School Diary',
    icon: NotebookPen,
    screen: 'SchoolDiaryScreen',
  },
  {
    label: 'Employee Circular',
    icon: Megaphone,
    screen: 'EmployeeCircularScreen',
  },
  {
    label: 'Student Circular',
    icon: GraduationCap,
    screen: 'StudentCircularScreen',
  },
  {
    label: 'Discipline',
    icon: ShieldAlert,
    screen: 'DisciplineScreen',
  },
  {
    label: 'My Feedback List',
    icon: MessageSquareMore,
    screen: 'MyFeedbackListScreen',
  },
  {
    label: 'Logout',
    icon: LogOut,
    screen: 'Logout',
  },
];

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
              transform: [{translateX: slideAnim}],
            },
          ]}>
          <LinearGradient
            colors={['#0A8BE8', '#0A8BE8', '#2C8A3D']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.header}>
            <View style={styles.headerTopSpace} />

            <View style={styles.profileWrap}>
              {showNetworkImage ? (
                <Image
                  source={{uri: teacherData.profilePic}}
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
            contentContainerStyle={styles.menuList}>
            {MENU_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isBlue = item.label === 'Marks Entry';

              return (
                <TouchableOpacity
                  key={`${item.label}-${index}`}
                  activeOpacity={0.8}
                  style={styles.menuItem}
                  onPress={() => handleItemPress(item)}>
                  <View style={styles.menuLeft}>
                    <Icon
                      size={20}
                      color={isBlue ? '#1E90FF' : '#222'}
                      strokeWidth={1.9}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        isBlue && {color: '#1E90FF', fontWeight: '500'},
                      ]}>
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
              onPress={onLogout}>
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
    height: 162,
    paddingHorizontal: 16,
  },

  headerTopSpace: {
    height: Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 24,
  },

  profileWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
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
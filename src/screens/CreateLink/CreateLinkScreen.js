import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postForm } from '../../services/teacherApi';
import { API_ENDPOINTS } from '../../utils/constants';

const CommonHeader = ({ title, onBack, backgroundColor, rightIcon }) => (
  <View style={[styles.headerContainer, { backgroundColor }]}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
    {rightIcon ? (
      <View style={styles.rightIconContainer}>{rightIcon}</View>
    ) : (
      <View style={styles.rightIconPlaceholder} />
    )}
  </View>
);

export default function CreateLinkScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const androidTopInset = insets.top || StatusBar.currentHeight || 0;
  const [screen, setScreen] = useState('create');
  const [selectedClass, setSelectedClass] = useState('');
  const [link, setLink] = useState('');
  const [subject, setSubject] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [links, setLinks] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [teacherCtx, setTeacherCtx] = useState(null);

  const handleSelectClass = (className) => {
    setSelectedClass(className);
    setModalVisible(false);
  };

  const getTeacherContext = async () => {
    const raw = await AsyncStorage.getItem('teacherData');
    let parsed = {};

    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch (error) {
      parsed = {};
    }

    const storedBranch = await AsyncStorage.getItem('BranchId');
    const storedSession = await AsyncStorage.getItem('SessionId');

    // Normalize common server key names. Some responses use EmpID, Session, SessionName etc.
    const EmpCode =
      parsed?.EmpCode || parsed?.EmpId || parsed?.EmpID || parsed?.empcode || parsed?.Empcode || parsed?.EmpID || '';
    const BranchId = parsed?.BranchId || parsed?.branchId || parsed?.BranchID || storedBranch || '';
    const SessionId =
      parsed?.SessionId || parsed?.Session || parsed?.SessionName || parsed?.SessionID || storedSession || '';

    return { EmpCode: String(EmpCode), BranchId: String(BranchId), SessionId: String(SessionId) };
  };

  const loadClasses = useCallback(async () => {
    let ctx = teacherCtx || (await getTeacherContext());
    // fallback: try to read BranchId/SessionId/EmpCode individually from AsyncStorage
    if (!ctx.EmpCode || !ctx.BranchId || !ctx.SessionId) {
      const [storedEmp, storedBranch, storedSession] = await Promise.all([
        AsyncStorage.getItem('EmpCode'),
        AsyncStorage.getItem('BranchId'),
        AsyncStorage.getItem('SessionId'),
      ]);

      ctx = {
        EmpCode: ctx.EmpCode || storedEmp || '',
        BranchId: ctx.BranchId || storedBranch || '',
        SessionId: ctx.SessionId || storedSession || '',
      };
    }

  // Even if some context fields are missing, attempt the API call
  // (server often returns results with partial context). Log the ctx for debugging.
  console.log('loadClasses using ctx =>', ctx);

    setLoadingClasses(true);
    try {
      const data = await postForm(API_ENDPOINTS.FILL_CLASS, {
        BranchId: ctx.BranchId,
        SessionId: ctx.SessionId,
        EmpCode: ctx.EmpCode,
      });

      // Log raw response to help debugging when server shapes differ
      console.log('fillclass.php RESPONSE =>', JSON.stringify(data));

      const getListFromResponse = response => {
        try {
          if (typeof response === 'string') {
            response = JSON.parse(response);
          }
        } catch (e) {
          // not JSON, continue
        }

        if (Array.isArray(response)) return response;
        let wrapper = response?.response || response;

        // If wrapper is a JSON string, parse it
        if (typeof wrapper === 'string') {
          try {
            wrapper = JSON.parse(wrapper);
          } catch (e) {
            // ignore
          }
        }

        const candidate = wrapper?.Res || wrapper?.Rest || wrapper?.rest || wrapper?.data || wrapper?.list;
        if (Array.isArray(candidate)) return candidate;

        // Fallback: recursively find first array inside response object
        const findFirstArray = obj => {
          if (!obj || typeof obj !== 'object') return null;
          if (Array.isArray(obj)) return obj;
          for (const key of Object.keys(obj)) {
            try {
              const value = obj[key];
              if (Array.isArray(value)) return value;
              if (value && typeof value === 'object') {
                const found = findFirstArray(value);
                if (found) return found;
              }
            } catch (e) {
              // ignore
            }
          }
          return null;
        };

        const found = findFirstArray(wrapper) || [];
        return found;
      };

      const rows = getListFromResponse(data).map(item => ({
        id: String(item?.Classid || item?.ClassId || item?.id || ''),
        name: item?.ClassName || item?.className || item?.name || item?.Class || '',
      }));

    const filtered = rows.filter(r => r.id && r.name);
    setClassOptions(filtered);
    console.log('PARSED CLASSES =>', JSON.stringify(filtered));

      if (!filtered.length) {
        console.log('fillclass.php parsed rows empty, raw:', data);
        // Inform user in-app if they opened modal and it's empty
        // (do not aggressively alert on background load)
        // If modal already visible, show an alert so user knows
        if (modalVisible) {
          Alert.alert('No classes', 'No classes were found. Please check teacher/branch settings or try again.');
        }
      }
    } catch (error) {
      console.log('fillclass.php CALL ERROR =>', error);
      Alert.alert('Error', 'Failed to load classes');
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadLinks = useCallback(async () => {
    let ctx = teacherCtx || (await getTeacherContext());
    if (!ctx.EmpCode || !ctx.BranchId || !ctx.SessionId) {
      const [storedEmp, storedBranch, storedSession] = await Promise.all([
        AsyncStorage.getItem('EmpCode'),
        AsyncStorage.getItem('BranchId'),
        AsyncStorage.getItem('SessionId'),
      ]);

      ctx = {
        EmpCode: ctx.EmpCode || storedEmp || '',
        BranchId: ctx.BranchId || storedBranch || '',
        SessionId: ctx.SessionId || storedSession || '',
      };
    }

    if (!ctx.EmpCode || !ctx.BranchId || !ctx.SessionId) return;

    setLoadingLinks(true);
    try {
      const data = await postForm(API_ENDPOINTS.LIST_CLASS_LINK, {
        EmpCode: ctx.EmpCode,
        BranchId: ctx.BranchId,
        SessionId: ctx.SessionId,
      });

      const getListFromResponse = response => {
        if (Array.isArray(response)) return response;
        const wrapper = response?.response || response;
        return (
          wrapper?.Res || wrapper?.Rest || wrapper?.rest || wrapper?.data || wrapper?.list || []
        );
      };

      const rows = getListFromResponse(data).map((item, idx) => ({
        id: item?.id || item?.ID || String(idx),
        className: item?.ClassName || item?.className || item?.Class || '',
        subject: item?.subject || item?.Subject || item?.SubjectName || '',
        link: item?.onlinelink || item?.link || item?.OnlineLink || '',
      }));

  setLinks(rows);
    } catch (error) {
      console.log('list-online-link-for-class.php CALL ERROR =>', error);
      Alert.alert('Error', 'Failed to load class links');
    } finally {
      setLoadingLinks(false);
    }
  }, []);

  // load data on mount
  useLoadCreateLinkData(loadClasses, loadLinks, setTeacherCtx);

  // When class options load and we're on create screen, open the modal if no selection
  useEffect(() => {
    if (screen === 'create' && classOptions.length && !selectedClass) {
      setModalVisible(true);
    }
  }, [screen, classOptions, selectedClass]);

  // Refresh classes when switching to create screen
  useEffect(() => {
    if (screen === 'create') {
      loadClasses();
    }
  }, [screen, loadClasses]);

  const handleSubmit = () => {
    if (!selectedClass) {
      Alert.alert('Required', 'Please select a class');
      return;
    }
    if (!link.trim()) {
      Alert.alert('Required', 'Please enter online class link');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Required', 'Please enter subject name');
      return;
    }

    (async () => {
      // Prefer AsyncStorage values for EmpCode/BranchId/SessionId
      const [storedEmp, storedBranch, storedSession] = await Promise.all([
        AsyncStorage.getItem('EmpCode'),
        AsyncStorage.getItem('BranchId'),
        AsyncStorage.getItem('SessionId'),
      ]);

      // Also resolve normalized context from teacherData (handles EmpID/Session names etc.)
      const normalizedCtx = await getTeacherContext();

      const EmpCode = (storedEmp && String(storedEmp)) || (normalizedCtx?.EmpCode) || (teacherCtx?.EmpCode || '');
      const BranchId = (storedBranch && String(storedBranch)) || (normalizedCtx?.BranchId) || (teacherCtx?.BranchId || '');
      const SessionId = (storedSession && String(storedSession)) || (normalizedCtx?.SessionId) || (teacherCtx?.SessionId || '');

      if (!EmpCode || !BranchId || !SessionId) {
        Alert.alert('Error', 'Required EmpCode / BranchId / SessionId not found in storage');
        return;
      }

      try {
        const payload = {
          class: selectedClass?.id || selectedClass,
          onlinelink: link.trim(),
          subject: subject.trim(),
          EmpCode,
          BranchId,
          SessionId,
        };

        console.log('CREATE CLASS LINK PAYLOAD =>', payload);
        const data = await postForm(API_ENDPOINTS.CREATE_CLASS_LINK, payload);
        console.log('CREATE CLASS LINK RAW =>', data);

        // Normalize/unpack response which may be stringified or wrapped under `response` etc.
        let normalized = data;
        try {
          if (typeof normalized === 'string') normalized = JSON.parse(normalized);
        } catch (e) {
          // not JSON — proceed
        }
        if (normalized && normalized.response) {
          normalized = normalized.response;
          try {
            if (typeof normalized === 'string') normalized = JSON.parse(normalized);
          } catch (e) {
            // ignore
          }
        }

        const statusVal = normalized?.status ?? normalized?.Status ?? normalized?.success ?? normalized?.code ?? normalized?.statuscode;
        const msgVal = normalized?.msg ?? normalized?.message ?? normalized?.Message ?? normalized?.msgtext;
        const statusStr = String(statusVal ?? '').toLowerCase();
        const msgStr = String(msgVal ?? '').toLowerCase();

        const isSuccess = (
          statusVal === true ||
          statusVal === 1 ||
          statusStr === 'true' ||
          statusStr === '1' ||
          statusStr === 'success' ||
          msgStr.includes('success')
        );

        console.log('CREATE CLASS LINK NORMALIZED =>', normalized, { statusVal, msgVal, isSuccess });

        if (isSuccess) {
          Alert.alert('Success', msgVal || 'Online class link created successfully');
          setSelectedClass('');
          setLink('');
          setSubject('');
          // refresh list
          await loadLinks();
          return;
        }

        Alert.alert('Error', msgVal || 'Failed to create online class link');
      } catch (error) {
        console.log('CREATE CLASS LINK ERROR =>', error);
        Alert.alert('Error', 'Failed to create online class link');
      }
    })();
  };

  const handleDeleteLink = (id) => {
    Alert.alert(
      'Delete Link',
      'Are you sure you want to delete this link?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setLinks(links.filter(item => item.id !== id)),
        },
      ]
    );
  };

  const EyeIconButton = () => (
    <TouchableOpacity onPress={() => setScreen('list')} activeOpacity={0.7}>
      <Text style={styles.eyeIcon}>👁️</Text>
    </TouchableOpacity>
  );

  const AddIconButton = () => (
    <TouchableOpacity onPress={() => setScreen('create')} activeOpacity={0.7}>
      <Text style={styles.addIcon}>+</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#4B46FF" barStyle="light-content" />
      <SafeAreaView
        style={[
          styles.topSafe,
          Platform.OS === 'android' && {paddingTop: androidTopInset},
        ]}>
        <CommonHeader
          title={screen === 'create' ? 'Create Online Class Link' : 'Class Links List'}
          onBack={() => navigation.goBack()}
          backgroundColor="#4B46FF"
          rightIcon={screen === 'create' ? <EyeIconButton /> : <AddIconButton />}
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        {screen === 'create' ? (
          <ScrollView 
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <Text style={styles.label}>Class <Text style={styles.star}>*</Text></Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.selectBox}
                onPress={() => setModalVisible(true)}
              >
                <Text style={[styles.selectText, !selectedClass && styles.placeholderText]}>
                  {selectedClass?.name || selectedClass || 'Select Class'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Online Class Link <Text style={styles.star}>*</Text></Text>
              <TextInput
                value={link}
                onChangeText={setLink}
                style={styles.input}
                placeholder="https://meet.google.com/..."
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Subject Name <Text style={styles.star}>*</Text></Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                style={styles.input}
                placeholder="e.g., Mathematics, Science"
                placeholderTextColor="#aaa"
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>SUBMIT</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {links.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyText}>No links found</Text>
                <Text style={styles.emptySubText}>Tap + to create a new link</Text>
              </View>
            ) : (
              links.map(item => (
                <View key={item.id} style={styles.linkCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardSubject}>{item.subject}</Text>
                    <TouchableOpacity onPress={() => handleDeleteLink(item.id)}>
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cardClass}>{item.className}</Text>
                  <Text style={styles.cardLink} numberOfLines={1}>{item.link}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Custom Class Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Class</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeModal}>✕</Text>
                </TouchableOpacity>
              </View>

              {loadingClasses ? (
                <View style={{paddingVertical: 24, alignItems: 'center'}}>
                  <ActivityIndicator color="#4B46FF" />
                </View>
              ) : classOptions.length ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {classOptions.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.modalOption}
                      onPress={() => handleSelectClass(c)}
                    >
                      <Text style={styles.modalOptionText}>{c.name}</Text>
                      {selectedClass?.id === c.id && <Text style={styles.checkIcon}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={{paddingVertical: 24, alignItems: 'center'}}>
                  <Text style={styles.emptyText}>No classes available</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// load classes and links on mount
const useLoadCreateLinkData = (loadClassesFn, loadLinksFn, setTeacherCtx) => {
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem('teacherData');
        const parsed = raw ? JSON.parse(raw) : {};
        if (mounted && parsed) {
          setTeacherCtx(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        // ignore
      }

      // call loaders
      await loadClassesFn();
      await loadLinksFn();
    })();

    return () => {
      mounted = false;
    };
  }, [loadClassesFn, loadLinksFn, setTeacherCtx]);
};


const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#4B46FF',
  },
  topSafe: {
    backgroundColor: '#4B46FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  rightIconContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
  rightIconPlaceholder: {
    width: 44,
  },
  eyeIcon: {
    fontSize: 28,
    color: '#fff',
  },
  addIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '600',
  },
  formContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#4B46FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E2F',
    marginBottom: 10,
    marginTop: 6,
  },
  star: {
    color: '#FF5A5F',
  },
  selectBox: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 18,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFE',
  },
  selectText: {
    fontSize: 16,
    color: '#1E1E2F',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  dropdownIcon: {
    fontSize: 18,
    color: '#4B46FF',
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#1E1E2F',
    marginBottom: 24,
    backgroundColor: '#FAFAFE',
  },
  submitBtn: {
    height: 56,
    backgroundColor: '#4B46FF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#4B46FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 120,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#4B5563',
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 8,
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardSubject: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.3,
    flex: 1,
  },
  deleteIcon: {
    fontSize: 20,
    opacity: 0.6,
    padding: 4,
  },
  cardClass: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  cardLink: {
    fontSize: 13,
    color: '#4B46FF',
    fontWeight: '500',
    backgroundColor: '#F3F4FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '85%',
    maxHeight: '70%',
    paddingVertical: 20,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E2F',
  },
  closeModal: {
    fontSize: 24,
    fontWeight: '500',
    color: '#9CA3AF',
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 17,
    color: '#1F2937',
    fontWeight: '500',
  },
  checkIcon: {
    fontSize: 18,
    color: '#4B46FF',
    fontWeight: '700',
  },
});

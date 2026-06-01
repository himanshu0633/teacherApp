import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChevronDown, CircleDot} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

const PURPLE = '#5A33C5';
const BLUE = '#079CEF';
const TEXT = '#252525';
const STATUS_OPTIONS = [
  {id: 'Active', label: 'Active'},
  {id: 'Inactive', label: 'Inactive'},
];

const todayText = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const getTeacherContext = async () => {
  const [saved, branchId, sessionId, session, empCode] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
    AsyncStorage.getItem('EmpCode'),
  ]);
  const parsed = saved ? JSON.parse(saved) : {};

  return {
    BranchId: parsed?.BranchId || branchId || '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
    EmpCode: parsed?.EmpCode || parsed?.empcode || parsed?.Empcode || empCode || '',
  };
};

const rows = data => {
  if (data?.EnrollNo || data?.Name || data?.StudentName) {
    return [data];
  }

  const nextRows =
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.res ||
    data?.response ||
    data?.rest ||
    data?.Rest ||
    [];

  return Array.isArray(nextRows) ? nextRows : [];
};

const isSuccess = data => {
  const status = String(data?.status || '').toLowerCase();
  return data?.status === true || status === 'true' || status === 'success';
};

const normalizeStudent = item => ({
  className: item?.Class || item?.ClassName || item?.classname || '',
  enrollNo: item?.EnrollNo || item?.AdmissionNo || item?.AdmNo || item?.adminno || '',
  name: item?.Name || item?.StudentName || item?.stname || '',
  fatherName: item?.FatherName || item?.Father || item?.fathername || '',
  mobileNo: item?.MobileNo || item?.Phone || item?.PhoneNo || item?.mobile || '',
  address: item?.Address || item?.address || '',
});

const normalizeHostel = item => ({
  id: String(item?.HostelId || item?.HostelID || item?.id || ''),
  label: item?.HostelName || item?.Hostel || item?.Name || '',
});

const normalizeFloor = item => ({
  id: String(item?.FloorID || item?.FloorId || item?.id || ''),
  label: item?.FloorName || item?.Floor || item?.Name || '',
});

const normalizeRoom = item => ({
  id: String(item?.Roomid || item?.RoomId || item?.RoomID || item?.id || ''),
  label: item?.Room || item?.RoomNo || item?.RoomName || '',
});

export default function HostelParentingScreen({navigation}) {
  const [teacher, setTeacher] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [student, setStudent] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [activePicker, setActivePicker] = useState(null);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const date = useMemo(todayText, []);

  useEffect(() => {
    const init = async () => {
      const context = await getTeacherContext();
      setTeacher(context);

      if (!context.BranchId) {
        Alert.alert('Error', 'Branch details not found.');
        return;
      }

      setLoadingLookups(true);
      try {
        const [hostelData, floorData] = await Promise.all([
          postForm(API_ENDPOINTS.HOSTEL_LIST, {BranchId: context.BranchId}),
          postForm(API_ENDPOINTS.FLOOR_LIST, {}),
        ]);

        setHostels(rows(hostelData).map(normalizeHostel).filter(item => item.id));
        setFloors(rows(floorData).map(normalizeFloor).filter(item => item.id));
      } catch (error) {
        console.log('HOSTEL ROOM LOOKUP ERROR =>', error);
        Alert.alert('Error', 'Failed to load hostel or floor list.');
      } finally {
        setLoadingLookups(false);
      }
    };

    init();
  }, []);

  const loadRooms = useCallback(async (hostel, floor) => {
    if (!hostel?.id || !floor?.id) {
      setRooms([]);
      return;
    }

    setLoadingRooms(true);
    try {
      const payload = {HostelId: hostel.id, FloorId: floor.id};
      console.log('HOSTEL ROOM LIST PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.ROOM_LIST, payload);
      console.log('HOSTEL ROOM LIST RESPONSE =>', data);

      setRooms(rows(data).map(normalizeRoom).filter(item => item.id));
    } catch (error) {
      console.log('HOSTEL ROOM LIST ERROR =>', error);
      Alert.alert('Error', 'Room list could not be loaded.');
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    setSelectedRoom(null);
    loadRooms(selectedHostel, selectedFloor);
  }, [loadRooms, selectedFloor, selectedHostel]);

  const pickerConfig = useMemo(
    () => ({
      hostel: {
        title: 'Select Hostel',
        items: hostels,
        loading: loadingLookups,
        onSelect: setSelectedHostel,
      },
      floor: {
        title: 'Select Floor',
        items: floors,
        loading: loadingLookups,
        onSelect: setSelectedFloor,
      },
      room: {
        title: 'Select Room',
        items: rooms,
        loading: loadingRooms,
        onSelect: setSelectedRoom,
      },
      status: {
        title: 'Status',
        items: STATUS_OPTIONS,
        loading: false,
        onSelect: setSelectedStatus,
      },
    }),
    [floors, hostels, loadingLookups, loadingRooms, rooms],
  );

  const handleSearch = async () => {
    const query = searchText.trim();

    if (!query) {
      Alert.alert('Required', 'Please enter student name or admission number.');
      return;
    }

    if (!teacher?.BranchId || !teacher?.SessionId) {
      Alert.alert('Error', 'Branch or session details not found.');
      return;
    }

    setSearching(true);
    try {
      const numericSearch = /^\d+$/.test(query);
      const payload = {
        adminno: numericSearch ? query : '',
        name: numericSearch ? '' : query,
        BranchId: teacher.BranchId,
        SessionId: teacher.SessionId,
      };

      console.log('HOSTEL ROOM STUDENT SEARCH PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.STUDENT_SEARCH, payload);
      console.log('HOSTEL ROOM STUDENT SEARCH RESPONSE =>', data);

      if (!isSuccess(data)) {
        setStudent(null);
        Alert.alert('No Data', data?.msg || 'Student details not found.');
        return;
      }

      const [nextStudent] = rows(data).map(normalizeStudent);

      if (!nextStudent?.enrollNo) {
        setStudent(null);
        Alert.alert('No Data', data?.msg || 'Student details not found.');
        return;
      }

      setStudent(nextStudent);
      setSearchText(nextStudent.enrollNo || query);
    } catch (error) {
      console.log('HOSTEL ROOM SEARCH ERROR =>', error);
      Alert.alert('Error', 'Student search failed.');
    } finally {
      setSearching(false);
    }
  };

  const resetForm = () => {
    setStudent(null);
    setSearchText('');
    setSelectedHostel(null);
    setSelectedFloor(null);
    setSelectedRoom(null);
    setSelectedStatus(null);
    setRooms([]);
  };

  const handleSubmit = async () => {
    if (!student?.enrollNo) {
      Alert.alert('Required', 'Please search and select a student.');
      return;
    }

    if (!selectedHostel || !selectedFloor || !selectedRoom || !selectedStatus) {
      Alert.alert('Required', 'Please select hostel, floor, room and status.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        SessionId: teacher?.SessionId,
        BranchId: teacher?.BranchId,
        EnrollNo: student.enrollNo,
        StudentName: student.name,
        Class: student.className,
        FatherName: student.fatherName,
        MobileNo: student.mobileNo,
        Address: student.address,
        AllocationDate: date,
        HostelId: selectedHostel.id,
        HostelName: selectedHostel.label,
        FloorId: selectedFloor.id,
        FloorName: selectedFloor.label,
        RoomId: selectedRoom.id,
        RoomNo: selectedRoom.label,
        Status: selectedStatus.label,
        EmpCode: teacher?.EmpCode,
      };

      console.log('HOSTEL ROOM ALLOCATION PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.HOSTEL_ROOM_ALLOCATION, payload);
      console.log('HOSTEL ROOM ALLOCATION RESPONSE =>', data);

      if (isSuccess(data)) {
        Alert.alert('Success', data?.message || data?.msg || 'Room allocated.');
        resetForm();
        return;
      }

      Alert.alert('Error', data?.message || data?.msg || 'Room could not be allocated.');
    } catch (error) {
      console.log('HOSTEL ROOM ALLOCATION ERROR =>', error);
      Alert.alert('Error', 'Room could not be allocated.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentPicker = pickerConfig[activePicker];

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Hostel Room Allocation"
        onBack={() => navigation.goBack()}
        safeAreaTop
        rightIcon={
          <View style={styles.headerAction}>
            <CircleDot size={22} color="#F124B8" strokeWidth={2.5} />
          </View>
        }
        rightAction={() => navigation.navigate('HostelParentingListScreen')}
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <SelectBox
            label={
              <>
                Search by Name / Adm No. <Text style={styles.required}>*</Text>
              </>
            }
            onPress={() => {}}
            rightIcon
            renderInput={
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search by Name / Adm No. *"
                placeholderTextColor={TEXT}
                style={styles.searchInput}
              />
            }
          />

          <TouchableOpacity
            activeOpacity={0.84}
            style={[styles.searchButton, searching && styles.disabledButton]}
            disabled={searching}
            onPress={handleSearch}>
            {searching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>

          {student ? <StudentCard student={student} /> : null}

          <DateBox label="Date of Allocation" value={date} required />

          <SelectBox
            label="Select Hostel"
            value={selectedHostel?.label}
            required
            onPress={() => setActivePicker('hostel')}
          />

          <View style={styles.inlineRow}>
            <SelectBox
              label="Select Floor"
              value={selectedFloor?.label}
              required
              style={styles.halfField}
              onPress={() => setActivePicker('floor')}
            />
            <SelectBox
              label="Select Room"
              value={selectedRoom?.label}
              required
              style={styles.halfField}
              onPress={() => {
                if (!selectedHostel || !selectedFloor) {
                  Alert.alert('Required', 'Please select hostel and floor first.');
                  return;
                }
                setActivePicker('room');
              }}
            />
          </View>

          <SelectBox
            label="Status"
            value={selectedStatus?.label}
            onPress={() => setActivePicker('status')}
          />

          <TouchableOpacity
            activeOpacity={0.84}
            style={[styles.submitButton, submitting && styles.disabledButton]}
            disabled={submitting}
            onPress={handleSubmit}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Allocate Room</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <PickerModal
        visible={Boolean(activePicker)}
        title={currentPicker?.title || ''}
        items={currentPicker?.items || []}
        loading={Boolean(currentPicker?.loading)}
        onClose={() => setActivePicker(null)}
        onSelect={item => {
          currentPicker?.onSelect(item);
          setActivePicker(null);
        }}
      />
    </View>
  );
}

function StudentCard({student}) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <Text style={styles.studentTitle}>Student Detail</Text>
      </View>

      <View style={styles.studentBody}>
        <View style={styles.detailRow}>
          <Info label="Class" value={student.className || '-'} />
          <Info label="Student Name" value={student.name || '-'} />
        </View>
        <View style={styles.detailRow}>
          <Info label="Father's Name" value={student.fatherName || '-'} />
          <Info label="Phone no." value={student.mobileNo || '-'} />
        </View>

        <View style={styles.addressBox}>
          <Text style={styles.addressTitle}>Address</Text>
          <Text style={styles.addressText}>{student.address || '-'}</Text>
        </View>
      </View>
    </View>
  );
}

function Info({label, value}) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DateBox({label, value, required}) {
  return (
    <View style={styles.fieldBox}>
      <View>
        <Text style={styles.smallLabel}>
          {label} {required ? <Text style={styles.required}>*</Text> : null}
        </Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </View>
  );
}

function SelectBox({label, value, required, onPress, style, renderInput, rightIcon}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[styles.fieldBox, style]}
      onPress={onPress}>
      {renderInput || (
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || label}
          {!value && required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      )}
      <ChevronDown
        size={18}
        color={TEXT}
        strokeWidth={2}
        style={rightIcon ? styles.searchChevron : null}
      />
    </TouchableOpacity>
  );
}

function PickerModal({visible, title, items, loading, onClose, onSelect}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          {loading ? (
            <ActivityIndicator color={PURPLE} />
          ) : items.length ? (
            <ScrollView>
              {items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => onSelect(item)}>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyModalText}>List is empty.</Text>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: PURPLE},
  page: {flex: 1, backgroundColor: '#fff'},
  content: {paddingHorizontal: 28, paddingTop: 22, paddingBottom: 30},
  headerAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  required: {color: 'red'},
  fieldBox: {
    minHeight: 45,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {flex: 1, padding: 0, color: TEXT, fontSize: 14},
  searchChevron: {marginLeft: 8},
  smallLabel: {fontSize: 10, color: '#777'},
  fieldValue: {fontSize: 14, color: TEXT, marginTop: 2},
  selectText: {flex: 1, color: TEXT, fontSize: 14},
  placeholderText: {color: TEXT},
  searchButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  searchButtonText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  studentCard: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#C8E4F4',
    backgroundColor: '#F4FCFF',
    marginBottom: 18,
    overflow: 'hidden',
  },
  studentHeader: {
    height: 39,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentTitle: {fontSize: 14, color: TEXT, fontWeight: '800'},
  studentBody: {padding: 15},
  detailRow: {flexDirection: 'row', marginBottom: 14},
  infoCell: {flex: 1, paddingRight: 10},
  infoLabel: {fontSize: 12, color: '#777', marginBottom: 6},
  infoValue: {fontSize: 13, color: TEXT, fontWeight: '800'},
  addressBox: {
    minHeight: 70,
    borderRadius: 7,
    backgroundColor: '#DDF2FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addressTitle: {fontSize: 12, color: TEXT, fontWeight: '700', marginBottom: 8},
  addressText: {fontSize: 11, color: TEXT, lineHeight: 17},
  inlineRow: {flexDirection: 'row', justifyContent: 'space-between'},
  halfField: {width: '47%'},
  submitButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  submitButtonText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  disabledButton: {opacity: 0.65},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    maxHeight: '70%',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
  },
  modalTitle: {
    fontSize: 15,
    color: TEXT,
    fontWeight: '800',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  modalItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  modalItemText: {fontSize: 14, color: TEXT},
  emptyModalText: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    fontSize: 13,
    color: '#777',
  },
});

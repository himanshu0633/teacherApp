import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, BASE_URL } from '../../utils/constants';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfDay = date => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const today = startOfDay(new Date());

const formatDisplayDate = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const formatApiDate = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};

const buildCalendarDays = monthDate => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay.getDay() }, () => null);
  const days = Array.from(
    { length: daysInMonth },
    (_, index) => new Date(year, month, index + 1),
  );

  return [...blanks, ...days];
};

const getFirstValue = (source, keys, fallback = '') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }

  return fallback;
};

const getListFromResponse = response => {
  if (Array.isArray(response)) {
    return response;
  }

  const wrapper = response?.response || response;

  return (
    wrapper?.Res ||
    wrapper?.Rest ||
    wrapper?.rest ||
    wrapper?.data ||
    wrapper?.list ||
    []
  );
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

function CountBox({ label, value, color }) {
  return (
    <View style={styles.countCard}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
      <Text style={styles.countText}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || '').toUpperCase();
  const bg =
    normalizedStatus === 'P'
      ? '#2FB52B'
      : normalizedStatus === 'A'
      ? '#FF1212'
      : '#F2B515';

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={styles.statusText}>{normalizedStatus || '-'}</Text>
    </View>
  );
}

function PickerModal({
  title,
  visible,
  items,
  loading,
  emptyText,
  onClose,
  onSelect,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#5A33C5" style={styles.modalLoader} />
          ) : items.length ? (
            <ScrollView style={styles.pickerList}>
              {items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.pickerOption}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.pickerOptionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyModalText}>{emptyText}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function AttendanceDetailsCard({
  attendanceEndpoint = API_ENDPOINTS.VIEW_ATTENDANCE,
}) {
  const [teacher, setTeacher] = useState({});
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendance, setAttendance] = useState(null);

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();

  const loadTeacherContext = useCallback(async () => {
    const raw = await AsyncStorage.getItem('teacherData');
    const parsed = raw ? JSON.parse(raw) : {};
    const [empCode, branchId, sessionId, session] = await Promise.all([
      AsyncStorage.getItem('EmpCode'),
      AsyncStorage.getItem('BranchId'),
      AsyncStorage.getItem('SessionId'),
      AsyncStorage.getItem('Session'),
    ]);

    return {
      ...parsed,
      EmpCode: parsed?.EmpCode || empCode || '',
      BranchId: parsed?.BranchId || branchId || '',
      SessionId:
        parsed?.SessionId || parsed?.Session || sessionId || session || '',
    };
  }, []);

  const normalizeClass = item => ({
    id: getFirstValue(item, ['Classid', 'ClassId', 'classid', 'id']),
    name: getFirstValue(item, ['ClassName', 'Class', 'classname', 'name']),
  });

  const normalizeSection = item => ({
    id: getFirstValue(item, ['SectionId', 'SectionID', 'sectionid', 'id']),
    name: getFirstValue(item, ['SectionName', 'Section', 'section', 'name']),
  });

  const loadClasses = useCallback(async teacherContext => {
    if (
      !teacherContext?.EmpCode ||
      !teacherContext?.BranchId ||
      !teacherContext?.SessionId
    ) {
      return;
    }

    try {
      setLoadingClasses(true);
      const data = await postForm(API_ENDPOINTS.FILL_CLASS, {
        BranchId: teacherContext.BranchId,
        SessionId: teacherContext.SessionId,
        EmpCode: teacherContext.EmpCode,
      });
      const classList = getListFromResponse(data)
        .map(normalizeClass)
        .filter(item => item.id && item.name);

      setClasses(classList);
    } catch (error) {
      console.log('fillclass.php CALL ERROR =>', error);
  Alert.alert('Error', 'Failed to load class list.');
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadSections = useCallback(
    async classItem => {
      if (!classItem?.id || !teacher?.EmpCode) {
        return;
      }

      try {
        setLoadingSections(true);
        const data = await postForm(API_ENDPOINTS.SHOW_SECTION, {
          EmpCode: teacher.EmpCode,
          BranchId: teacher.BranchId,
          ClassId: classItem.id,
          SessionId: teacher.SessionId,
        });
        const sectionList = getListFromResponse(data)
          .map(normalizeSection)
          .filter(item => item.id && item.name);

        setSections(sectionList);
      } catch (error) {
        console.log('show_section.php CALL ERROR =>', error);
  Alert.alert('Error', 'Failed to load section list.');
      } finally {
        setLoadingSections(false);
      }
    },
    [teacher],
  );

  useEffect(() => {
    const init = async () => {
      try {
        const teacherContext = await loadTeacherContext();
        setTeacher(teacherContext);
        await loadClasses(teacherContext);
      } catch (error) {
        console.log('ATTENDANCE INIT ERROR =>', error);
      }
    };

    init();
  }, [loadClasses, loadTeacherContext]);

  const changeMonth = direction => {
    setCalendarMonth(current => {
      const nextMonth = new Date(
        current.getFullYear(),
        current.getMonth() + direction,
        1,
      );

      if (startOfDay(nextMonth) > today) {
        return current;
      }

      return nextMonth;
    });
  };

  const selectDate = date => {
    setSelectedDate(startOfDay(date));
    setCalendarVisible(false);
  };

  const selectClass = classItem => {
    setSelectedClass(classItem);
    setSelectedSection(null);
    setSections([]);
    setAttendance(null);
    setClassModalVisible(false);
    loadSections(classItem);
  };

  const selectSection = sectionItem => {
    setSelectedSection(sectionItem);
    setAttendance(null);
    setSectionModalVisible(false);
  };

  const viewAttendance = async () => {
    if (!selectedDate) {
  Alert.alert('Required', 'Please select a date.');
      return;
    }

    if (!selectedClass?.id) {
  Alert.alert('Required', 'Please select a class.');
      return;
    }

    try {
      setLoadingAttendance(true);
      const data = await postForm(attendanceEndpoint, {
        Date: formatApiDate(selectedDate),
        ClassId: selectedClass.id,
        SectionId: selectedSection?.id || '',
        BranchId: teacher.BranchId,
        SessionId: teacher.SessionId,
      });

      if (!data || data?.status === false || data?.status === 'false') {
  Alert.alert('No Data', data?.msg || 'No attendance data found.');
        setAttendance(null);
        return;
      }

      setAttendance({
        total: getFirstValue(data, ['Total', 'total'], '0'),
        present: getFirstValue(data, ['Present', 'present'], '0'),
        absent: getFirstValue(data, ['Absent', 'absent'], '0'),
        leave: getFirstValue(data, ['Leave', 'leave'], '0'),
        students: getListFromResponse(data),
      });
    } catch (error) {
      console.log(`${attendanceEndpoint} CALL ERROR =>`, error);
  Alert.alert('Error', 'Failed to load attendance.');
    } finally {
      setLoadingAttendance(false);
    }
  };

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.field}>
        <Text style={styles.label}>
          Choose Date <Text style={styles.star}>*</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.selectBox}
          onPress={() => {
            setCalendarMonth(
              new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
            );
            setCalendarVisible(true);
          }}
        >
          <Text style={styles.selectText}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <Text style={styles.selectArrow}>v</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.halfField]}>
          <Text style={styles.label}>
            Class <Text style={styles.star}>*</Text>
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.selectBox}
            onPress={() => setClassModalVisible(true)}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.selectText,
                !selectedClass && styles.placeholderText,
              ]}
            >
              {selectedClass?.name || 'Class'}
            </Text>
            <Text style={styles.selectArrow}>v</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.field, styles.halfField]}>
          <Text style={styles.label}>Section</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.selectBox}
            onPress={() => {
              if (!selectedClass?.id) {
                Alert.alert('Required', 'Please select the class first.');
                return;
              }

              setSectionModalVisible(true);
            }}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.selectText,
                !selectedSection && styles.placeholderText,
              ]}
            >
              {selectedSection?.name || 'Section'}
            </Text>
            <Text style={styles.selectArrow}>v</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.primaryBtn, loadingAttendance && styles.disabledButton]}
        disabled={loadingAttendance}
        onPress={viewAttendance}
      >
        {loadingAttendance ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>View Attendance</Text>
        )}
      </TouchableOpacity>

      {attendance ? (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryHeaderText}>
                Total Students: {attendance.total}
              </Text>
            </View>

            <View style={styles.countRow}>
              <CountBox label="A" value={attendance.absent} color="#FF1212" />
              <CountBox label="L" value={attendance.leave} color="#F2B515" />
              <CountBox label="P" value={attendance.present} color="#2FB52B" />
            </View>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableHeaderText, styles.cellAdm]}>
                Adm No.
              </Text>
              <Text style={[styles.tableHeaderText, styles.cellRoll]}>
                Roll No.
              </Text>
              <Text style={[styles.tableHeaderText, styles.cellName]}>
                Name
              </Text>
              <Text style={[styles.tableHeaderText, styles.cellStatus]}>
                Status
              </Text>
            </View>

            {attendance.students.length ? (
              attendance.students.map((item, index) => (
                <View
                  key={`${item.StudentDetailId || item.EnrollNo || index}`}
                  style={[
                    styles.tableRow,
                    index === attendance.students.length - 1 &&
                      styles.lastTableRow,
                  ]}
                >
                  <Text style={[styles.tableCellText, styles.cellAdm]}>
                    {item.EnrollNo || '-'}
                  </Text>
                  <Text style={[styles.tableCellText, styles.cellRoll]}>
                    {item.RollNo || '-'}
                  </Text>
                  <Text style={[styles.tableCellText, styles.cellName]}>
                    {item.StudentName || '-'}
                  </Text>
                  <View style={[styles.cellStatus, styles.statusCellWrap]}>
                    <StatusBadge status={item.Attendence} />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyTableText}>
                No attendance records found.
              </Text>
            )}
          </View>
        </>
      ) : null}

      <Modal visible={calendarVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.monthButton}
                onPress={() => changeMonth(-1)}
              >
                <Text style={styles.monthButtonText}>{'<'}</Text>
              </TouchableOpacity>

              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]}{' '}
                {calendarMonth.getFullYear()}
              </Text>

              <TouchableOpacity
                style={[
                  styles.monthButton,
                  isCurrentMonth && styles.monthButtonDisabled,
                ]}
                disabled={isCurrentMonth}
                onPress={() => changeMonth(1)}
              >
                <Text style={styles.monthButtonText}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map(day => (
                <Text key={day} style={styles.weekText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((date, index) => {
                if (!date || startOfDay(date) > today) {
                  return <View key={`blank-${index}`} style={styles.dayCell} />;
                }

                const isSelected =
                  startOfDay(date).getTime() === selectedDate.getTime();

                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => selectDate(date)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCalendarVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PickerModal
        title="Select Class"
        visible={classModalVisible}
        items={classes}
        loading={loadingClasses}
        emptyText="No classes found."
        onClose={() => setClassModalVisible(false)}
        onSelect={selectClass}
      />

      <PickerModal
        title="Select Section"
        visible={sectionModalVisible}
        items={sections}
        loading={loadingSections}
        emptyText="No sections found."
        onClose={() => setSectionModalVisible(false)}
        onSelect={selectSection}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 30,
  },
  field: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    width: '47.5%',
  },
  label: {
    position: 'absolute',
    top: 10,
    left: 16,
    zIndex: 2,
    fontSize: 11,
    color: '#777',
    backgroundColor: '#fff',
    paddingHorizontal: 2,
  },
  star: {
    color: '#FF2E2E',
  },
  selectBox: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  placeholderText: {
    color: '#7B7B7B',
  },
  selectArrow: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    marginTop: -2,
  },
  primaryBtn: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#5A33C5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.75,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#0A9AF6',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  summaryHeader: {
    height: 38,
    backgroundColor: '#1097E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryHeaderText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  countCard: {
    width: '29.5%',
    backgroundColor: '#EEF1F3',
    borderRadius: 6,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  countText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '500',
  },
  table: {
    borderWidth: 1,
    borderColor: '#CFCFCF',
    backgroundColor: '#fff',
  },
  tableHeaderRow: {
    backgroundColor: '#F3F3F3',
  },
  tableRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#D9D9D9',
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  tableCellText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  cellAdm: {
    width: '20%',
  },
  cellRoll: {
    width: '20%',
  },
  cellName: {
    width: '40%',
  },
  cellStatus: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCellWrap: {
    flexDirection: 'row',
  },
  statusBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyTableText: {
    padding: 18,
    color: '#777',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonDisabled: {
    backgroundColor: '#CFCFCF',
  },
  monthButtonText: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 24,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
    color: '#777',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  dayCellSelected: {
    backgroundColor: '#5A33C5',
  },
  dayText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#fff',
  },
  cancelButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '700',
  },
  pickerCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '75%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pickerTitle: {
    color: '#222',
    fontSize: 17,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '700',
  },
  modalLoader: {
    paddingVertical: 28,
  },
  pickerList: {
    marginTop: 4,
  },
  pickerOption: {
    minHeight: 46,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#E6E6E6',
  },
  pickerOptionText: {
    color: '#222',
    fontSize: 15,
  },
  emptyModalText: {
    color: '#777',
    fontSize: 15,
    paddingVertical: 28,
    textAlign: 'center',
  },
});

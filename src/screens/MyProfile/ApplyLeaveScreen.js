import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../components/CommonHeader';
import {BASE_URL} from '../../utils/constants';

const postForm = async (endpoint, fields) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value === null || value === undefined ? '' : value);
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
};

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

const formatDate = date => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const parseDate = value => {
  if (!value) {
    return null;
  }

  const [day, month, year] = value.split('-').map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return startOfDay(new Date(year, month - 1, day));
};

const buildCalendarDays = monthDate => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({length: firstDay.getDay()}, () => null);
  const days = Array.from(
    {length: daysInMonth},
    (_, index) => new Date(year, month, index + 1),
  );

  return [...blanks, ...days];
};

export default function ApplyLeaveScreen({navigation}) {
  const [teacher, setTeacher] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveType, setLeaveType] = useState('');
  const [showTypes, setShowTypes] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [calendarField, setCalendarField] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(startOfDay(new Date()));

  useEffect(() => {
    const loadLeaveTypes = async () => {
      const raw = await AsyncStorage.getItem('teacherData');
      const parsed = raw ? JSON.parse(raw) : {};
      setTeacher(parsed);

      try {
        const data = await postForm('leavetype.php', {
          EmpType: parsed?.EmpTypeID,
        });

        setLeaveTypes(data?.response?.rest || []);
      } catch (error) {
        console.log('LEAVE TYPE ERROR =>', error);
      }
    };

    loadLeaveTypes();
  }, []);

  const selectedType = leaveTypes.find(item => item.LeaveTypeId === leaveType);
  const today = startOfDay(new Date());
  const calendarDays = buildCalendarDays(calendarMonth);
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();

  const openCalendar = field => {
    const selectedDate = parseDate(field === 'from' ? fromDate : toDate);
    setCalendarField(field);
    setCalendarMonth(selectedDate || today);
  };

  const selectDate = date => {
    const selected = startOfDay(date);

    if (selected < today) {
      return;
    }

    if (calendarField === 'from') {
      setFromDate(formatDate(selected));

      const currentToDate = parseDate(toDate);
      if (currentToDate && currentToDate < selected) {
        setToDate('');
      }
    }

    if (calendarField === 'to') {
      const currentFromDate = parseDate(fromDate);

      if (currentFromDate && selected < currentFromDate) {
        Alert.alert('Error', 'To date cannot be before from date');
        return;
      }

      setToDate(formatDate(selected));
    }

    setCalendarField(null);
  };

  const changeMonth = offset => {
    setCalendarMonth(current => {
      const nextMonth = new Date(
        current.getFullYear(),
        current.getMonth() + offset,
        1,
      );

      if (
        nextMonth.getFullYear() < today.getFullYear() ||
        (nextMonth.getFullYear() === today.getFullYear() &&
          nextMonth.getMonth() < today.getMonth())
      ) {
        return current;
      }

      return startOfDay(nextMonth);
    });
  };

  const submitLeave = async () => {
    if (!leaveType || !fromDate.trim() || !toDate.trim() || !reason.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const data = await postForm('applyleave.php', {
        EmpCode: teacher?.EmpCode,
        LeaveType: leaveType,
        DateFrom: fromDate.trim(),
        DateTo: toDate.trim(),
        reason: reason.trim(),
      });

      Alert.alert('Success', data?.message || 'Leave applied', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.log('APPLY LEAVE ERROR =>', error);
      Alert.alert('Error', 'Leave apply failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader
          title="Apply Leave"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Input
            label="Leave Type"
            value={selectedType?.LeaveType || ''}
            placeholder="Select leave type"
            isDropdown
            onPress={() => setShowTypes(!showTypes)}
          />

          {showTypes &&
            leaveTypes.map(item => (
              <TouchableOpacity
                key={item.LeaveTypeId}
                style={styles.option}
                onPress={() => {
                  setLeaveType(item.LeaveTypeId);
                  setShowTypes(false);
                }}>
                <Text style={styles.optionText}>{item.LeaveType}</Text>
              </TouchableOpacity>
            ))}

          <Input
            label="From Date"
            value={fromDate}
            placeholder="Select from date"
            isDropdown
            onPress={() => openCalendar('from')}
          />
          <Input
            label="To Date"
            value={toDate}
            placeholder="Select to date"
            isDropdown
            onPress={() => openCalendar('to')}
          />
          <Input
            label="Reason"
            value={reason}
            onChangeText={setReason}
            multiline
            inputStyle={{height: 100, textAlignVertical: 'top'}}
          />

          <TouchableOpacity style={styles.btn} onPress={submitLeave}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Apply Leave</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={!!calendarField} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  style={[
                    styles.monthButton,
                    isCurrentMonth && styles.monthButtonDisabled,
                  ]}
                  disabled={isCurrentMonth}
                  onPress={() => changeMonth(-1)}>
                  <Text style={styles.monthButtonText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.calendarTitle}>
                  {MONTH_NAMES[calendarMonth.getMonth()]}{' '}
                  {calendarMonth.getFullYear()}
                </Text>

                <TouchableOpacity
                  style={styles.monthButton}
                  onPress={() => changeMonth(1)}>
                  <Text style={styles.monthButtonText}>›</Text>
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
                  if (!date) {
                    return <View key={`blank-${index}`} style={styles.dayCell} />;
                  }

                  const disabled = startOfDay(date) < today;
                  const selectedValue =
                    calendarField === 'from' ? fromDate : toDate;
                  const selectedDate = parseDate(selectedValue);
                  const isSelected =
                    selectedDate &&
                    selectedDate.getTime() === startOfDay(date).getTime();

                  return (
                    <TouchableOpacity
                      key={date.toISOString()}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        disabled && styles.dayCellDisabled,
                      ]}
                      disabled={disabled}
                      onPress={() => selectDate(date)}>
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          disabled && styles.dayTextDisabled,
                        ]}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCalendarField(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder = '',
  multiline = false,
  inputStyle = {},
  isDropdown = false,
  onPress,
}) {
  const content = (
    <>
      <Text style={styles.label}>
        {label} <Text style={{color: 'red'}}>*</Text>
      </Text>

      <View style={styles.inputBox}>
        {isDropdown ? (
          <Text style={[styles.input, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
        ) : (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#888"
            multiline={multiline}
            style={[styles.input, inputStyle]}
          />
        )}
        {isDropdown ? <Text style={styles.dropdown}>⌄</Text> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.inputWrap}
        onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.inputWrap}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F3F3F3'},
  content: {
    padding: 22,
  },
  inputWrap: {
    marginBottom: 18,
  },
  label: {
    position: 'absolute',
    left: 14,
    top: 6,
    zIndex: 2,
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 2,
    fontSize: 12,
    color: '#8D8D8D',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    backgroundColor: '#F3F3F3',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 12,
    fontSize: 16,
    color: '#222',
  },
  dropdown: {
    fontSize: 20,
    color: '#444',
    marginTop: 8,
  },
  placeholderText: {
    color: '#888',
  },
  option: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 14,
    marginTop: -10,
    marginBottom: 14,
  },
  optionText: {
    color: '#222',
    fontSize: 15,
  },
  btn: {
    marginTop: 12,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
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
    fontSize: 26,
    lineHeight: 28,
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
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#fff',
  },
  dayTextDisabled: {
    color: '#999',
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
});

import React, {useCallback, useEffect, useState} from 'react';
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
import {ChevronDown, ChevronRight, Eye} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

const PURPLE = '#5A33C5';
const PINK = '#F22BB2';
const TEXT = '#252525';
const DOSE_OPTIONS = ['BD', 'TDS', 'AD', 'OD'];

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

const todayText = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const parseDate = value => {
  const [day, month, year] = String(value || '')
    .split('-')
    .map(Number);

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
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

const formatDisplayDate = value => {
  const raw = String(value || '');
  const [year, month, day] = raw.split('-');

  if (year?.length === 4 && month && day) {
    return `${day}-${month}-${year}`;
  }

  return raw || '-';
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
  const nextRows =
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.Res ||
    data?.response ||
    data?.rest ||
    data?.Rest ||
    [];

  return Array.isArray(nextRows) ? nextRows : [];
};

const firstValue = (source, keys, fallback = '') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return String(value);
    }
  }

  return fallback;
};

const normalizeStudent = item => ({
  name: firstValue(item, ['StudentName', 'studentname', 'Name', 'name', 'stname']),
  enrollNo: firstValue(item, ['EnrollNo', 'adminno', 'AdmissionNo', 'AdmNo']),
  className: firstValue(item, ['ClassName', 'className', 'Class', 'classname']),
  section: firstValue(item, ['SectionName', 'sectionName', 'Section', 'section']),
  fatherName: firstValue(item, ['FatherName', 'fatherName', 'Father']),
  phone: firstValue(item, ['MobileNo', 'mobileNo', 'Phone', 'phone']),
  address: firstValue(item, ['Address', 'address']),
});

const normalizeRecord = item => ({
  enrollNo: item?.enrollNo || item?.EnrollNo || '-',
  studentName: item?.StudentName || '-',
  className: item?.className || item?.ClassName || '-',
  section: item?.section || item?.SectionName || '-',
  allergies: item?.allergies || '-',
  medicalHistory: item?.medicalHistory || '-',
  hospitaldatefrom: formatDisplayDate(item?.hospitaldatefrom),
  hospitaldateto: formatDisplayDate(item?.hospitaldateto),
  date: formatDisplayDate(item?.date),
  temperature: item?.temperature || '-',
  bp: item?.bp || '-',
  diagnosis: item?.diagnosis || '-',
  medicine: item?.medicine || '-',
  days: item?.days || '-',
  dose: item?.dose || '-',
  rate: item?.rate || '-',
  doseqty: item?.doseqty || '-',
});

const success = data => {
  const status = String(data?.status || '').toLowerCase();
  return status === 'success' || status === 'true';
};

export function MedicalEntryScreen({navigation}) {
  const today = startOfDay(new Date());
  const [adminNo, setAdminNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [student, setStudent] = useState(null);
  const [admitted, setAdmitted] = useState(true);
  const [hospitalFrom, setHospitalFrom] = useState(todayText());
  const [hospitalTo, setHospitalTo] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [checkDate, setCheckDate] = useState(todayText());
  const [temperature, setTemperature] = useState('');
  const [bp, setBp] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicine, setMedicine] = useState('');
  const [days, setDays] = useState('');
  const [dose, setDose] = useState('');
  const [rate, setRate] = useState('');
  const [doseQty, setDoseQty] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calendarField, setCalendarField] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [dosePickerVisible, setDosePickerVisible] = useState(false);

  const openCalendar = field => {
    const values = {
      hospitalFrom,
      hospitalTo,
      checkDate,
    };
    setCalendarMonth(parseDate(values[field]) || today);
    setCalendarField(field);
  };

  const changeMonth = offset => {
    setCalendarMonth(current => {
      const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);

      if (
        next.getFullYear() < today.getFullYear() ||
        (next.getFullYear() === today.getFullYear() &&
          next.getMonth() < today.getMonth())
      ) {
        return current;
      }

      return startOfDay(next);
    });
  };

  const selectCalendarDate = nextDate => {
    const selected = startOfDay(nextDate);
    const day = String(selected.getDate()).padStart(2, '0');
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const year = selected.getFullYear();
    const value = `${day}-${month}-${year}`;

    if (selected < today) {
      return;
    }

    if (calendarField === 'hospitalFrom') {
      setHospitalFrom(value);
    } else if (calendarField === 'hospitalTo') {
      setHospitalTo(value);
    } else if (calendarField === 'checkDate') {
      setCheckDate(value);
    }

    setCalendarField(null);
  };

  const searchStudent = async () => {
    const queryAdminNo = adminNo.trim();
    const queryName = studentName.trim();

    if (!queryAdminNo && !queryName) {
      Alert.alert('Required', 'Please enter admission number or student name.');
      return;
    }

    setSearching(true);
    try {
      const context = await getTeacherContext();
      const data = await postForm(API_ENDPOINTS.STUDENT_SEARCH, {
        adminno: queryAdminNo,
        name: queryAdminNo ? '' : queryName,
        BranchId: context.BranchId,
        SessionId: context.SessionId,
      });

      if (data?.status !== 'true') {
        setStudent(null);
        Alert.alert('No Data', data?.msg || 'Student details not found.');
        return;
      }

      const nextStudent = normalizeStudent(data);
      setStudent(nextStudent);
      setAdminNo(nextStudent.enrollNo || queryAdminNo);
      setStudentName(nextStudent.name || queryName);
    } catch (error) {
      console.log('MEDICAL STUDENT SEARCH ERROR =>', error);
      Alert.alert('Error', 'Student search failed.');
    } finally {
      setSearching(false);
    }
  };

  const addPrescription = () => {
    if (!checkDate || !medicine.trim() || !days.trim() || !dose.trim()) {
      Alert.alert('Required', 'Please enter date, medicine, days and dose.');
      return;
    }

    setPrescriptions(current => [
      ...current,
      {
        id: String(Date.now()),
        date: checkDate,
        medicine: medicine.trim(),
        days: days.trim(),
        dose: dose.trim(),
        rate: rate.trim(),
        doseQty: doseQty.trim(),
      },
    ]);
    setMedicine('');
    setDays('');
    setDose('');
    setRate('');
    setDoseQty('');
  };

  const handleSubmit = async () => {
    if (!student?.enrollNo) {
      Alert.alert('Required', 'Please search and select a student.');
      return;
    }

    const firstPrescription = prescriptions[0] || {
      medicine: medicine.trim(),
      days: days.trim(),
      dose: dose.trim(),
      rate: rate.trim(),
      doseQty: doseQty.trim(),
    };

    if (!firstPrescription.medicine || !firstPrescription.days || !firstPrescription.dose) {
      Alert.alert('Required', 'Please add prescription details.');
      return;
    }

    setSubmitting(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        adminno: student.enrollNo,
        allergies: admitted ? allergies.trim() : '',
        medicalHistory: admitted ? medicalHistory.trim() : '',
        hospitaldatefrom: admitted ? hospitalFrom : '',
        hospitaldateto: admitted ? hospitalTo : '',
        temperature: temperature.trim(),
        bp: bp.trim(),
        diagnosis: diagnosis.trim(),
        admittedinhospital: admitted ? 'TRUE' : 'FALSE',
        adate: admitted ? hospitalFrom : '',
        medicine: firstPrescription.medicine,
        days: firstPrescription.days,
        dose: firstPrescription.dose,
        rate: firstPrescription.rate,
        doseqty: firstPrescription.doseQty,
        empcode: context.EmpCode,
        SessionID: context.SessionId,
        date: checkDate,
      };

      console.log('MEDICAL ENTRY PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.MEDICAL_ENTRIES, payload);
      console.log('MEDICAL ENTRY RESPONSE =>', data);

      if (success(data)) {
        Alert.alert('Success', data?.message || data?.msg || 'Medical entry saved.');
        setPrescriptions([]);
        return;
      }

      Alert.alert('Error', data?.message || data?.msg || 'Medical entry could not be saved.');
    } catch (error) {
      console.log('MEDICAL ENTRY ERROR =>', error);
      Alert.alert('Error', 'Medical entry could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Medical Entry"
        onBack={() => navigation.goBack()}
        safeAreaTop
        rightIcon={<Eye size={22} color="#fff" />}
        rightAction={() => navigation.navigate('MedicalEntryListScreen')}
      />

      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input placeholder="Search by Admission No *" value={adminNo} onChangeText={setAdminNo} />
          <Text style={styles.orText}>OR</Text>
          <Input
            placeholder="Search by Student Name *"
            value={studentName}
            onChangeText={setStudentName}
          />
          <TouchableOpacity
            style={[styles.searchButton, searching && styles.disabledButton]}
            disabled={searching}
            onPress={searchStudent}>
            {searching ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Search</Text>}
          </TouchableOpacity>

          {student ? <StudentCard student={student} /> : null}

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAdmitted(!admitted)}>
            <View style={[styles.checkbox, admitted && styles.checkboxActive]}>
              {admitted ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <Text style={styles.checkboxText}>Admitted to Hospital?</Text>
          </TouchableOpacity>

          {admitted ? (
            <>
              <View style={styles.twoCol}>
                <DateInput
                  label="Date From *"
                  value={hospitalFrom}
                  onPress={() => openCalendar('hospitalFrom')}
                  small
                />
                <DateInput
                  label="Date To *"
                  value={hospitalTo}
                  onPress={() => openCalendar('hospitalTo')}
                  small
                />
              </View>
              <Input placeholder="Medical Allergies" value={allergies} onChangeText={setAllergies} />
              <Input
                placeholder="Medical History"
                value={medicalHistory}
                onChangeText={setMedicalHistory}
                multiline
              />
            </>
          ) : null}

          <View style={styles.checkupCard}>
            <Text style={styles.sectionHead}>Student Checkup Details</Text>
            <View style={styles.checkupBody}>
              <DateInput
                label="Date *"
                value={checkDate}
                onPress={() => openCalendar('checkDate')}
              />
              <View style={styles.twoCol}>
                <Input placeholder="Temperature" value={temperature} onChangeText={setTemperature} small />
                <Input placeholder="BP" value={bp} onChangeText={setBp} small />
              </View>
              <Input label="Diagnosis *" value={diagnosis} onChangeText={setDiagnosis} />
              <Input label="Prescription *" value={medicine} onChangeText={setMedicine} />
              <View style={styles.twoCol}>
                <DateInput
                  label="Dose *"
                  value={dose}
                  onPress={() => setDosePickerVisible(true)}
                  small
                  rightIcon
                />
                <Input label="Days *" value={days} onChangeText={setDays} small />
              </View>
              <View style={styles.twoCol}>
                <Input label="Dose Qty *" value={doseQty} onChangeText={setDoseQty} small />
                <Input label="Rate *" value={rate} onChangeText={setRate} small />
              </View>
              <TouchableOpacity style={styles.addButton} onPress={addPrescription}>
                <Text style={styles.addButtonText}>Add Prescription</Text>
              </TouchableOpacity>
            </View>
          </View>

          <PrescriptionTable rows={prescriptions} />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            disabled={submitting}
            onPress={handleSubmit}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit</Text>}
          </TouchableOpacity>
        </ScrollView>

        <CalendarModal
          visible={Boolean(calendarField)}
          calendarMonth={calendarMonth}
          selectedDate={
            calendarField === 'hospitalFrom'
              ? parseDate(hospitalFrom)
              : calendarField === 'hospitalTo'
              ? parseDate(hospitalTo)
              : parseDate(checkDate)
          }
          today={today}
          onClose={() => setCalendarField(null)}
          onChangeMonth={changeMonth}
          onSelectDate={selectCalendarDate}
        />

        <DoseModal
          visible={dosePickerVisible}
          selected={dose}
          onClose={() => setDosePickerVisible(false)}
          onSelect={value => {
            setDose(value);
            setDosePickerVisible(false);
          }}
        />
      </SafeAreaView>
    </View>
  );
}

export function MedicalEntryListScreen({navigation}) {
  const [records, setRecords] = useState([]);
  const [expandedId, setExpandedId] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        EmpCode: context.EmpCode,
        SessionId: context.SessionId,
        BranchId: context.BranchId,
      };

      console.log('MEDICAL LIST PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.MEDICAL_LEAVES, payload);
      console.log('MEDICAL LIST RESPONSE =>', data);

      if (String(data?.status || '').toLowerCase() === 'success') {
        setRecords(rows(data).map(normalizeRecord));
        return;
      }

      setRecords([]);
    } catch (error) {
      console.log('MEDICAL LIST ERROR =>', error);
      Alert.alert('Error', 'Medical entry list could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadRecords);
    return unsubscribe;
  }, [loadRecords, navigation]);

  return (
    <View style={styles.wrapper}>
      <CommonHeader title="Medical Entry List" onBack={() => navigation.goBack()} safeAreaTop />
      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.mutedText}>Loading records...</Text>
            </View>
          ) : records.length ? (
            records.map((record, index) => {
              const id = `${record.enrollNo}-${index}`;
              const expanded = expandedId === id || index === 0;

              return (
                <MedicalRecordCard
                  key={id}
                  record={record}
                  expanded={expanded}
                  onPress={() => setExpandedId(expanded ? '' : id)}
                />
              );
            })
          ) : (
            <Text style={styles.emptyText}>No medical entries found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Input({label, placeholder, value, onChangeText, multiline, small, rightIcon}) {
  return (
    <View style={[styles.inputBox, multiline && styles.textArea, small && styles.smallInput]}>
      {label ? <Text style={styles.floatLabel}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TEXT}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.textInput, multiline && styles.textAreaInput]}
      />
      {rightIcon ? <ChevronDown size={18} color={TEXT} style={styles.inputIcon} /> : null}
    </View>
  );
}

function DateInput({label, value, onPress, small, rightIcon}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.inputBox, small && styles.smallInput]}
      onPress={onPress}>
      {label ? <Text style={styles.floatLabel}>{label}</Text> : null}
      <Text style={[styles.dateInputText, !value && styles.placeholderText]}>
        {value || label || 'Select'}
      </Text>
      {rightIcon ? <ChevronDown size={18} color={TEXT} style={styles.inputIcon} /> : null}
    </TouchableOpacity>
  );
}

function CalendarModal({
  visible,
  calendarMonth,
  selectedDate,
  today,
  onClose,
  onChangeMonth,
  onSelectDate,
}) {
  const calendarDays = buildCalendarDays(calendarMonth);
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={[
                styles.monthButton,
                isCurrentMonth && styles.monthButtonDisabled,
              ]}
              disabled={isCurrentMonth}
              onPress={() => onChangeMonth(-1)}>
              <Text style={styles.monthButtonText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.calendarTitle}>
              {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
            </Text>

            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => onChangeMonth(1)}>
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
            {calendarDays.map((item, index) => {
              if (!item) {
                return <View key={`blank-${index}`} style={styles.dayCell} />;
              }

              const normalizedDate = startOfDay(item);
              const disabled = normalizedDate < today;
              const selected =
                selectedDate && selectedDate.getTime() === normalizedDate.getTime();

              return (
                <TouchableOpacity
                  key={item.toISOString()}
                  style={[
                    styles.dayCell,
                    selected && styles.dayCellSelected,
                    disabled && styles.dayCellDisabled,
                  ]}
                  disabled={disabled}
                  onPress={() => onSelectDate(item)}>
                  <Text
                    style={[
                      styles.dayText,
                      selected && styles.dayTextSelected,
                      disabled && styles.dayTextDisabled,
                    ]}>
                    {item.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function DoseModal({visible, selected, onClose, onSelect}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.doseCard}>
          <Text style={styles.doseTitle}>Select Dose</Text>
          {DOSE_OPTIONS.map(item => (
            <TouchableOpacity
              key={item}
              style={styles.doseOption}
              onPress={() => onSelect(item)}>
              <Text
                style={[
                  styles.doseOptionText,
                  selected === item && styles.doseOptionTextActive,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function StudentCard({student}) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <Text style={styles.studentHeaderText}>Student Detail</Text>
      </View>
      <View style={styles.studentGrid}>
        <Info label="Class" value={student.className || '-'} />
        <Info label="Student Name" value={student.name || '-'} />
        <Info label="Father’s Name" value={student.fatherName || '-'} />
        <Info label="Phone no." value={student.phone || '-'} />
      </View>
      <View style={styles.addressBox}>
        <Text style={styles.infoLabel}>Address</Text>
        <Text style={styles.addressText}>{student.address || '-'}</Text>
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

function PrescriptionTable({rows: tableRows}) {
  if (!tableRows.length) {
    return null;
  }

  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHead]}>
        <Text style={styles.tableHeadText}>Date</Text>
        <Text style={styles.tableHeadText}>Medicine</Text>
        <Text style={styles.tableHeadText}>Days</Text>
        <Text style={styles.tableHeadText}>Dose</Text>
      </View>
      {tableRows.map(item => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={styles.tableCell}>{item.date}</Text>
          <Text style={styles.tableCell}>{item.medicine}</Text>
          <Text style={styles.tableCell}>{item.days}</Text>
          <Text style={styles.tableCell}>{item.dose}</Text>
        </View>
      ))}
    </View>
  );
}

function MedicalRecordCard({record, expanded, onPress}) {
  return (
    <View style={styles.recordCard}>
      <TouchableOpacity style={styles.recordHeader} onPress={onPress}>
        <View>
          <Text style={styles.recordTitle}>
            {record.studentName} ({record.className} - {record.section})
          </Text>
          <Text style={styles.recordSub}>Admission No: {record.enrollNo}</Text>
        </View>
        {expanded ? <ChevronDown size={20} color={TEXT} /> : <ChevronRight size={20} color={TEXT} />}
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.recordBody}>
          <Detail label="Medical Allergies" value={record.allergies} />
          <Detail label="Medical History" value={record.medicalHistory} />
          <Text style={styles.blueTitle}>Student Checkup Details</Text>
          <Detail label="Temperature" value={record.temperature} />
          <Detail label="Blood Pressure" value={record.bp} />
          <Detail label="Diagnosis" value={record.diagnosis} />
          <PrescriptionTable
            rows={[
              {
                id: `${record.enrollNo}-${record.date}`,
                date: record.date,
                medicine: record.medicine,
                days: record.days,
                dose: record.dose,
              },
            ]}
          />
          <Text style={styles.blueTitle}>Admitted to Hospital</Text>
          <Detail label="From Date" value={record.hospitaldatefrom} />
          <Detail label="To Date" value={record.hospitaldateto} />
        </View>
      ) : null}
    </View>
  );
}

function Detail({label, value}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: PURPLE},
  page: {flex: 1, backgroundColor: '#fff'},
  content: {paddingHorizontal: 20, paddingTop: 26, paddingBottom: 32},
  inputBox: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 14,
  },
  textInput: {fontSize: 14, color: TEXT, padding: 0},
  dateInputText: {fontSize: 14, color: TEXT},
  placeholderText: {color: '#777'},
  textArea: {minHeight: 86, paddingTop: 11, justifyContent: 'flex-start'},
  textAreaInput: {minHeight: 62},
  smallInput: {flex: 1},
  floatLabel: {fontSize: 10, color: '#777', marginBottom: 2},
  inputIcon: {position: 'absolute', right: 12},
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
    color: TEXT,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonDisabled: {backgroundColor: '#CFCFCF'},
  monthButtonText: {color: '#fff', fontSize: 26, lineHeight: 28},
  weekRow: {flexDirection: 'row', marginBottom: 8},
  weekText: {
    flex: 1,
    textAlign: 'center',
    color: '#777',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  dayCellSelected: {backgroundColor: PURPLE},
  dayCellDisabled: {opacity: 0.35},
  dayText: {color: TEXT, fontSize: 15, fontWeight: '600'},
  dayTextSelected: {color: '#fff'},
  dayTextDisabled: {color: '#999'},
  cancelButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {color: '#333', fontSize: 15, fontWeight: '700'},
  doseCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  doseTitle: {
    fontSize: 15,
    color: TEXT,
    fontWeight: '800',
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  doseOption: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  doseOptionText: {fontSize: 14, color: TEXT},
  doseOptionTextActive: {color: PURPLE, fontWeight: '900'},
  orText: {fontSize: 10, color: TEXT, textAlign: 'center', marginTop: -5, marginBottom: 10},
  searchButton: {
    height: 45,
    backgroundColor: PURPLE,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  submitButton: {
    height: 45,
    backgroundColor: PURPLE,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: '800'},
  disabledButton: {opacity: 0.65},
  studentCard: {
    borderWidth: 1,
    borderColor: '#C8E4F4',
    borderRadius: 7,
    backgroundColor: '#EFFAFF',
    marginBottom: 18,
    overflow: 'hidden',
  },
  studentHeader: {
    minHeight: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E4F4',
  },
  studentHeaderText: {fontSize: 14, color: TEXT, fontWeight: '800'},
  studentGrid: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, paddingTop: 15},
  infoCell: {width: '50%', marginBottom: 13},
  infoLabel: {fontSize: 12, color: '#777', marginBottom: 5},
  infoValue: {fontSize: 13, color: TEXT, fontWeight: '800'},
  addressBox: {
    minHeight: 70,
    borderRadius: 7,
    backgroundColor: '#DDF2FF',
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addressText: {fontSize: 12, color: TEXT, lineHeight: 18},
  checkboxRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 14},
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {backgroundColor: PINK, borderColor: PINK},
  checkMark: {color: '#fff', fontSize: 12, fontWeight: '900'},
  checkboxText: {fontSize: 14, color: TEXT, fontWeight: '800'},
  twoCol: {flexDirection: 'row', gap: 15},
  checkupCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 7,
    marginTop: 6,
    marginBottom: 22,
    overflow: 'hidden',
  },
  sectionHead: {
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 13,
    color: TEXT,
    fontWeight: '800',
  },
  checkupBody: {paddingHorizontal: 17, paddingTop: 16, paddingBottom: 20},
  addButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  addButtonText: {color: '#fff', fontSize: 16, fontWeight: '800'},
  table: {borderWidth: 1, borderColor: '#D0D0D0', marginTop: 6},
  tableRow: {minHeight: 39, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#D0D0D0'},
  tableHead: {backgroundColor: '#F1F1F1', borderTopWidth: 0},
  tableHeadText: {flex: 1, textAlign: 'center', paddingVertical: 12, fontSize: 12, color: TEXT, fontWeight: '800'},
  tableCell: {flex: 1, textAlign: 'center', paddingVertical: 12, fontSize: 11, color: TEXT},
  centerBox: {minHeight: 180, alignItems: 'center', justifyContent: 'center'},
  mutedText: {marginTop: 10, color: '#777', fontSize: 13},
  emptyText: {marginTop: 55, textAlign: 'center', color: '#777', fontSize: 14},
  recordCard: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 16,
  },
  recordHeader: {
    minHeight: 53,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordTitle: {fontSize: 13, color: TEXT, fontWeight: '800'},
  recordSub: {fontSize: 11, color: '#777', marginTop: 3},
  recordBody: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16},
  detailRow: {flexDirection: 'row', marginBottom: 12},
  detailLabel: {width: '50%', color: TEXT, fontSize: 13, fontWeight: '800'},
  detailValue: {flex: 1, color: '#777', fontSize: 13},
  blueTitle: {
    color: '#0098EE',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#0098EE',
    paddingBottom: 8,
    marginTop: 10,
    marginBottom: 12,
  },
});

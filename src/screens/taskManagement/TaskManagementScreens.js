import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {
  AlertTriangle,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  HelpCircle,
  Image as ImageIcon,
  ListChecks,
  MessageCircle,
  Plus,
  Send,
  Share2,
  UserRound,
} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import { API_ENDPOINTS, BASE_URL } from '../../utils/constants';

const PURPLE = '#5A33C5';
const BLUE = '#079CEF';
const CARD_BLUE = '#EFFAFF';
const SOFT_BLUE = '#EAF8FF';
const TEXT = '#252525';
const priorityOptions = ['Low', 'Medium', 'High'];
const commentTypes = ['Query', 'Progess'];
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

const pad2 = value => String(value).padStart(2, '0');

const startOfDay = date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const formatDate = date => {
  return `${pad2(date.getDate())}-${pad2(
    date.getMonth() + 1,
  )}-${date.getFullYear()}`;
};

const formatApiDate = value => {
  const date = parseDate(value);

  if (!date) {
    return '';
  }

  return `${pad2(date.getDate())}/${pad2(
    date.getMonth() + 1,
  )}/${date.getFullYear()}`;
};

const parseDate = value => {
  const [day, month, year] = String(value || '')
    .split('-')
    .map(Number);

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildCalendarDays = monthDate => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let index = 0; index < firstDay; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
};

const getTeacherRows = data => {
  const rows = data?.response?.rest || data?.rest || data?.response || [];
  return Array.isArray(rows) ? rows : [];
};

const getTaskRows = data => {
  const rows = data?.response?.rest || data?.rest || data?.response || [];
  return Array.isArray(rows) ? rows : [];
};

const getCommentRows = data => {
  const rows = data?.response?.rest || data?.rest || data?.response || [];
  return Array.isArray(rows) ? rows : [];
};

const normalizeTeacher = item => {
  const code = String(item?.EmpCode || item?.empcode || '').trim();
  const name = String(item?.EmpName || item?.name || '').trim();

  if (!code || !name) {
    return null;
  }

  return {
    code,
    name,
    label: `${name} (${code})`,
  };
};

const normalizeTask = item => {
  return {
    id: String(item?.id || Math.random()),
    title: item?.taskname || 'Name of the Task',
    status: item?.taskstatus || 'Pending',
    assignedTo: item?.assignto || 'NA',
    assignedBy: item?.assignedby || 'NA',
    priority: item?.priority || 'Low',
    dateFrom: item?.datefrom || 'NA',
    deadline: item?.deadline || 'NA',
    description: item?.des || '',
    attachment: item?.attachment || 'No',
    image: item?.image || '',
    pdf: item?.pdf || '',
    type: item?.type || '',
  };
};

const normalizeComment = (item, index) => {
  return {
    id: `${index}-${item?.loginname || ''}-${item?.msg || ''}`,
    type: item?.type || 'Query',
    message: item?.msg || '',
    author: item?.loginname || 'NA',
    pic: item?.Pic || item?.pic || '',
  };
};

const menuItems = [
  {
    title: 'Assign Task',
    icon: ClipboardCheck,
    screen: 'AssignTaskScreen',
  },
  {
    title: 'Task Assigned to Me',
    icon: CalendarDays,
    screen: 'TaskAssignedToMeScreen',
  },
  {
    title: 'Tasks Assigned by Me',
    icon: ClipboardList,
    screen: 'TaskAssignedByMeScreen',
  },
];

const tasks = [
  {
    id: '1',
    status: 'Inprogrss',
    assignedTo: 'Meena Kumari',
    assignedBy: 'Himanshu Sharma',
    priority: 'Medium',
  },
  {
    id: '2',
    status: 'Pending',
    assignedTo: 'Meena Kumari',
    assignedBy: 'Himanshu Sharma',
    priority: 'High',
  },
  {
    id: '3',
    status: 'Complete',
    assignedTo: 'Vipan Sharma',
    assignedBy: 'Himanshu Sharma',
    priority: 'Low',
  },
];

const filters = [
  { label: 'All', color: '#079CEF', Icon: ListChecks },
  { label: 'Complete', color: '#25B83D', Icon: CheckSquare },
  { label: 'Pending', color: '#FF4B4B', Icon: HelpCircle },
  { label: 'Inprogrss', color: '#FFBF21', Icon: CalendarDays },
];

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}) {
  return (
    <View style={[styles.inputBox, multiline && styles.textArea]}>
      <Text style={styles.floatingLabel}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#222"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        style={[styles.fieldInput, multiline && styles.textAreaInput]}
      />
    </View>
  );
}

function MultiSelectModal({
  visible,
  title,
  options,
  selected,
  search,
  loading,
  onSearch,
  onToggle,
  onClose,
}) {
  const normalizedSearch = search.trim().toLowerCase();
  const visibleOptions = options.filter(option => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      option.name.toLowerCase().includes(normalizedSearch) ||
      option.code.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.selectSheet}>
          <View style={styles.selectHeader}>
            <Text style={styles.selectTitle}>{title}</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={search}
            onChangeText={onSearch}
            placeholder="Search staff"
            placeholderTextColor="#777"
            style={styles.searchInput}
          />

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading staff...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.selectList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {visibleOptions.length ? (
                visibleOptions.map(option => {
                  const checked = selected.some(
                    item => item.code === option.code,
                  );
                  return (
                    <TouchableOpacity
                      key={`${option.code}-${option.name}`}
                      activeOpacity={0.8}
                      style={styles.selectOption}
                      onPress={() => onToggle(option)}
                    >
                      <View
                        style={[
                          styles.checkBox,
                          checked && styles.checkBoxActive,
                        ]}
                      >
                        {checked ? (
                          <Text style={styles.checkText}>✓</Text>
                        ) : null}
                      </View>
                      <Text style={styles.selectOptionText} numberOfLines={2}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.noOptionsText}>No staff found</Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function CalendarModal({ visible, value, onSelect, onClose }) {
  const selectedDate = parseDate(value);
  const today = startOfDay(new Date());
  const [calendarMonth, setCalendarMonth] = useState(
    selectedDate || new Date(),
  );
  const days = buildCalendarDays(calendarMonth);

  useEffect(() => {
    if (visible) {
      setCalendarMonth(parseDate(value) || new Date());
    }
  }, [value, visible]);

  const monthTitle = calendarMonth.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const changeMonth = offset => {
    setCalendarMonth(current => {
      return new Date(current.getFullYear(), current.getMonth() + offset, 1);
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.calendarSheet}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <ChevronRight
                size={24}
                color={TEXT}
                strokeWidth={2.2}
                style={styles.prevIcon}
              />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{monthTitle}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <ChevronRight size={24} color={TEXT} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {weekDays.map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, index) => {
              const isPast = day ? startOfDay(day) < today : false;
              const selected =
                day &&
                selectedDate &&
                formatDate(day) === formatDate(selectedDate);
              return (
                <TouchableOpacity
                  key={day ? formatDate(day) : `empty-${index}`}
                  disabled={!day || isPast}
                  activeOpacity={0.75}
                  style={[
                    styles.dayCell,
                    isPast && styles.disabledDayCell,
                    selected && styles.selectedDayCell,
                  ]}
                  onPress={() => {
                    onSelect(formatDate(day));
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isPast && styles.disabledDayText,
                      selected && styles.selectedDayText,
                    ]}
                  >
                    {day ? day.getDate() : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.calendarClose}
            onPress={onClose}
          >
            <Text style={styles.calendarCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SelectField({ label, value, placeholder, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.fieldBox}
      onPress={onPress}
    >
      <View style={styles.selectValueWrap}>
        <Text style={styles.floatingLabel}>
          {label} <Text style={styles.required}>*</Text>
        </Text>
        <Text style={[styles.fieldValue, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
      </View>
      <ChevronDown size={20} color="#222" strokeWidth={2} />
    </TouchableOpacity>
  );
}

function DateField({ label, value, placeholder, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.fieldBox}
      onPress={onPress}
    >
      <View style={styles.selectValueWrap}>
        <Text style={styles.floatingLabel}>
          {label} <Text style={styles.required}>*</Text>
        </Text>
        <Text style={[styles.fieldValue, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
      </View>
      <CalendarDays size={19} color="#222" strokeWidth={2} />
    </TouchableOpacity>
  );
}

function PriorityRow({ value, onChange }) {
  return (
    <View style={styles.priorityWrap}>
      <Text style={styles.priorityTitle}>
        Priority <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.radioRow}>
        {priorityOptions.map(item => {
          const selected = item === value;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              style={styles.radioItem}
              onPress={() => onChange(item)}
            >
              <View style={[styles.radioOuter, selected && styles.radioActive]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.radioText}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function TaskFormScreen({ navigation, title, assigneeLabel }) {
  const [form, setForm] = useState({
    taskName: '',
    description: '',
    assignDate: formatDate(new Date()),
    deadline: '',
    assignees: [],
    intimations: [],
    priority: 'Low',
    attachment: '',
  });
  const [selectType, setSelectType] = useState(null);
  const [calendarField, setCalendarField] = useState(null);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    const loadTeachers = async () => {
      setTeacherLoading(true);
      try {
        const empcode = await AsyncStorage.getItem('EmpCode');
        const data = await postForm(API_ENDPOINTS.TEACHERS_LIST, { empcode });
        const nextTeachers = getTeacherRows(data)
          .map(normalizeTeacher)
          .filter(Boolean);

        setTeacherOptions(nextTeachers);
      } catch (error) {
        console.log('TASK TEACHERS LIST ERROR =>', error);
        Alert.alert('Error', 'Failed to load teachers list.');
        setTeacherOptions([]);
      } finally {
        setTeacherLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const toggleTeacher = teacher => {
    const field = selectType === 'assignees' ? 'assignees' : 'intimations';

    setForm(current => {
      const selected = current[field] || [];
      const exists = selected.some(item => item.code === teacher.code);

      return {
        ...current,
        [field]: exists
          ? selected.filter(item => item.code !== teacher.code)
          : [...selected, teacher],
      };
    });
  };

  const formatSelectedTeachers = selected => {
    if (!selected.length) {
      return '';
    }

    if (selected.length === 1) {
      return selected[0].name;
    }

    return `${selected.length} Staff Selected`;
  };

  const openTeacherSelect = type => {
    setTeacherSearch('');
    setSelectType(type);
  };

  const openCalendar = field => {
    setCalendarField(field);
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    const missing = [
      ['taskName', 'Task Name'],
      ['description', 'Task Description'],
      ['assignDate', 'Assign Task On'],
      ['deadline', 'Deadline'],
    ].find(([field]) => !String(form[field]).trim());

    if (missing) {
      Alert.alert('Required', `Please fill ${missing[1]}.`);
      return;
    }

    if (!form.assignees.length) {
      Alert.alert('Required', `Please select ${assigneeLabel}.`);
      return;
    }

    if (!form.intimations.length) {
      Alert.alert('Required', 'Please select Intimation.');
      return;
    }

    setSubmitting(true);
    try {
      const [assignedby, BranchId, SessionId] = await Promise.all([
        AsyncStorage.getItem('EmpCode'),
        AsyncStorage.getItem('BranchId'),
        AsyncStorage.getItem('SessionId'),
      ]);

      if (!assignedby) {
        Alert.alert('Error', 'EmpCode not found.');
        return;
      }

      const payload = {
        taskname: form.taskName.trim(),
        description: form.description.trim(),
        fromdate: formatApiDate(form.assignDate),
        deadline: formatApiDate(form.deadline),
        priority: form.priority,
        assignto: form.assignees.map(item => item.code).join(','),
        intimation: form.intimations.map(item => item.code).join(','),
        assignedby,
        BranchId: BranchId || '',
        SessionId: SessionId || '',
      };

      const data = await postForm(API_ENDPOINTS.ASSIGN_TASK, payload);

      if (data?.status === 'SUCCESS') {
        Alert.alert('Success', data?.message || 'task Assigned', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      Alert.alert('Error', data?.message || `${title} failed.`);
    } catch (error) {
      console.log('ASSIGN TASK ERROR =>', error);
      Alert.alert('Error', `${title} failed.`);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTeachers =
    selectType === 'assignees' ? form.assignees : form.intimations;

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title={title}
        onBack={() => navigation.goBack()}
        safeAreaTop
      />
      <SafeAreaView style={styles.page}>
        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FormInput
              label="Task Name"
              value={form.taskName}
              onChangeText={value => updateField('taskName', value)}
              placeholder="Name of the task"
            />
            <FormInput
              label="Task Description"
              value={form.description}
              onChangeText={value => updateField('description', value)}
              placeholder="write here..."
              multiline
            />
            <DateField
              label="Assign Task On"
              value={form.assignDate}
              placeholder="12-07-2023"
              onPress={() => openCalendar('assignDate')}
            />
            <DateField
              label="Deadline"
              value={form.deadline}
              placeholder="12-07-2023"
              onPress={() => openCalendar('deadline')}
            />
            <SelectField
              label={assigneeLabel}
              value={formatSelectedTeachers(form.assignees)}
              placeholder={assigneeLabel}
              onPress={() => openTeacherSelect('assignees')}
            />
            <SelectField
              label="Intimation"
              value={formatSelectedTeachers(form.intimations)}
              placeholder="Intimation"
              onPress={() => openTeacherSelect('intimations')}
            />

            <View style={styles.uploadBox}>
              <Text
                style={[styles.uploadText, form.attachment && styles.fileText]}
                numberOfLines={1}
              >
                {form.attachment || 'Upload doc/image'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.uploadButton}
                onPress={() =>
                  updateField('attachment', 'document_selected.jpg')
                }
              >
                <Plus size={44} color="#FF0000" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            <PriorityRow
              value={form.priority}
              onChange={value => updateField('priority', value)}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.submitButton, submitting && styles.disabledButton]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
        <MultiSelectModal
          visible={!!selectType}
          title={selectType === 'assignees' ? assigneeLabel : 'Intimation'}
          options={teacherOptions}
          selected={selectedTeachers}
          search={teacherSearch}
          loading={teacherLoading}
          onSearch={setTeacherSearch}
          onToggle={toggleTeacher}
          onClose={() => setSelectType(null)}
        />
        <CalendarModal
          visible={!!calendarField}
          value={calendarField ? form[calendarField] : ''}
          onSelect={value => updateField(calendarField, value)}
          onClose={() => setCalendarField(null)}
        />
      </SafeAreaView>
    </View>
  );
}

function ForwardTaskFormScreen({ navigation, route }) {
  const task = route?.params?.task || {};
  const [form, setForm] = useState({
    assignees: [],
    intimations: [],
    attachment: '',
  });
  const [selectType, setSelectType] = useState(null);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTeachers = async () => {
      setTeacherLoading(true);
      try {
        const empcode = await AsyncStorage.getItem('EmpCode');
        const data = await postForm(API_ENDPOINTS.TEACHERS_LIST, { empcode });
        const nextTeachers = getTeacherRows(data)
          .map(normalizeTeacher)
          .filter(Boolean);

        setTeacherOptions(nextTeachers);
      } catch (error) {
        console.log('FORWARD TASK TEACHERS LIST ERROR =>', error);
        Alert.alert('Error', 'Failed to load teachers list.');
        setTeacherOptions([]);
      } finally {
        setTeacherLoading(false);
      }
    };

    loadTeachers();
  }, []);

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const toggleTeacher = teacher => {
    const field = selectType === 'assignees' ? 'assignees' : 'intimations';

    setForm(current => {
      const selected = current[field] || [];
      const exists = selected.some(item => item.code === teacher.code);

      return {
        ...current,
        [field]: exists
          ? selected.filter(item => item.code !== teacher.code)
          : [...selected, teacher],
      };
    });
  };

  const formatSelectedTeachers = selected => {
    if (!selected.length) {
      return '';
    }

    if (selected.length === 1) {
      return selected[0].name;
    }

    return `${selected.length} Staff Selected`;
  };

  const openTeacherSelect = type => {
    setTeacherSearch('');
    setSelectType(type);
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!task.id) {
      Alert.alert('Error', 'Task id not found.');
      return;
    }

    if (!form.assignees.length) {
      Alert.alert('Required', 'Please select Forward To.');
      return;
    }

    if (!form.intimations.length) {
      Alert.alert('Required', 'Please select Intimation.');
      return;
    }

    setSubmitting(true);
    try {
      const assignedby = await AsyncStorage.getItem('EmpCode');

      if (!assignedby) {
        Alert.alert('Error', 'EmpCode not found.');
        return;
      }

      const payload = {
        assignedby,
        taskid: task.id,
        assignto: form.assignees.map(item => item.code).join(','),
        intimation: form.intimations.map(item => item.code).join(','),
        Photo: form.attachment || '',
      };

      const data = await postForm(API_ENDPOINTS.FORWARD_TASK, payload);

      if (data?.status === 'SUCCESS') {
        Alert.alert('Success', data?.message || 'task Assigned', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      Alert.alert('Error', data?.message || 'Forward Task failed.');
    } catch (error) {
      console.log('FORWARD TASK ERROR =>', error);
      Alert.alert('Error', 'Forward Task failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTeachers =
    selectType === 'assignees' ? form.assignees : form.intimations;

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Forward Task"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.forwardTaskBox}>
            <Text style={styles.descriptionTitle}>{task.title}</Text>
            <Text style={styles.descriptionText}>
              {task.description || 'No description available'}
            </Text>
          </View>

          <SelectField
            label="Forward To"
            value={formatSelectedTeachers(form.assignees)}
            placeholder="Forward To"
            onPress={() => openTeacherSelect('assignees')}
          />
          <SelectField
            label="Intimation"
            value={formatSelectedTeachers(form.intimations)}
            placeholder="Intimation"
            onPress={() => openTeacherSelect('intimations')}
          />

          <View style={styles.uploadBox}>
            <Text
              style={[styles.uploadText, form.attachment && styles.fileText]}
              numberOfLines={1}
            >
              {form.attachment || 'Upload doc/image'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.uploadButton}
              onPress={() => updateField('attachment', 'document_selected.jpg')}
            >
              <Plus size={44} color="#FF0000" strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitButton, submitting && styles.disabledButton]}
            disabled={submitting}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <MultiSelectModal
          visible={!!selectType}
          title={selectType === 'assignees' ? 'Forward To' : 'Intimation'}
          options={teacherOptions}
          selected={selectedTeachers}
          search={teacherSearch}
          loading={teacherLoading}
          onSearch={setTeacherSearch}
          onToggle={toggleTeacher}
          onClose={() => setSelectType(null)}
        />
      </SafeAreaView>
    </View>
  );
}

function FilterButton({ item, active, onPress }) {
  const Icon = item.Icon;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.filterButton,
        { backgroundColor: item.color },
        active && styles.activeFilterButton,
      ]}
      onPress={onPress}
    >
      <View style={styles.filterIconCircle}>
        <Icon size={20} color="#fff" strokeWidth={2.2} />
      </View>
      <Text style={styles.filterText}>{item.label}</Text>
    </TouchableOpacity>
  );
}

function InfoPair({ label, value, Icon }) {
  return (
    <View style={styles.infoPair}>
      <View style={styles.infoLabelRow}>
        <Icon size={13} color="#35B64B" strokeWidth={2} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function TaskCard({ task, showForward, navigation }) {
  const status = String(task.status || '').trim();
  const normalizedStatus = status.toLowerCase();
  const isPending = normalizedStatus === 'pending';
  const isComplete = normalizedStatus === 'complete';
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskHeaderText}>Task Detail</Text>
        <View
          style={[
            styles.statusPill,
            isPending && styles.pendingPill,
            isComplete && styles.completePill,
          ]}
        >
          <Text style={styles.statusText}>{status || 'Pending'}</Text>
        </View>
      </View>

      <View style={styles.taskBody}>
        <View style={styles.infoGrid}>
          <InfoPair
            label="Assigned date"
            value={task.dateFrom || 'NA'}
            Icon={Clock3}
          />
          <InfoPair
            label="Deadline"
            value={task.deadline || 'NA'}
            Icon={Clock3}
          />
          <InfoPair
            label="Assigned To"
            value={task.assignedTo || 'NA'}
            Icon={UserRound}
          />
          <InfoPair
            label="Assigned By"
            value={task.assignedBy || 'NA'}
            Icon={UserRound}
          />
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionTitle}>{task.title}</Text>
          <Text style={styles.descriptionText}>
            {task.description || 'No description available'}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.priorityPill}>
            <View style={styles.priorityIcon}>
              <AlertTriangle size={17} color={BLUE} strokeWidth={2} />
            </View>
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.commentButton}
            onPress={() => navigation.navigate('TaskCommentsScreen', { task })}
          >
            <View style={styles.whiteIconCircle}>
              <MessageCircle size={17} color="#EC2DB8" strokeWidth={2.2} />
            </View>
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          {showForward ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.forwardButton}
              onPress={() => navigation.navigate('ForwardTaskScreen', { task })}
            >
              <View style={styles.whiteIconCircle}>
                <Share2 size={17} color={BLUE} strokeWidth={2.2} />
              </View>
              <Text style={styles.actionText}>Forward</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function TaskListScreen({
  navigation,
  title,
  showForward,
  loadAssignedToMe,
  loadAssignedByMe,
}) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [apiTasks, setApiTasks] = useState([]);
  const shouldLoadTasks = loadAssignedToMe || loadAssignedByMe;
  const [loadingTasks, setLoadingTasks] = useState(shouldLoadTasks);
  const [taskError, setTaskError] = useState('');
  const taskSource = shouldLoadTasks ? apiTasks : tasks.slice(0, 2);
  const visibleTasks = taskSource.filter(task => {
    const taskStatus = String(task.status || '')
      .trim()
      .toLowerCase();

    if (activeFilter === 'All') {
      return true;
    }

    if (activeFilter === 'Inprogrss') {
      return (
        taskStatus === 'inprogrss' ||
        taskStatus === 'inprogress' ||
        taskStatus === 'in progress' ||
        taskStatus === 'progress'
      );
    }

    return taskStatus === activeFilter.toLowerCase();
  });

  useEffect(() => {
    if (!shouldLoadTasks) {
      return;
    }

    const loadTasks = async () => {
      setLoadingTasks(true);
      setTaskError('');

      try {
        const [empcode, BranchId, SessionId] = await Promise.all([
          AsyncStorage.getItem('EmpCode'),
          AsyncStorage.getItem('BranchId'),
          AsyncStorage.getItem('SessionId'),
        ]);

        if (!empcode) {
          setTaskError('EmpCode not found.');
          setApiTasks([]);
          return;
        }

        const endpoint = loadAssignedByMe
          ? API_ENDPOINTS.TASK_ASSIGNED_BY_ALL_TASKS
          : API_ENDPOINTS.VIEW_TASK;
        const payload = loadAssignedByMe
          ? {
              EmpCode: empcode,
              SessionId: SessionId || '',
              BranchId: BranchId || '',
            }
          : {
              empcode,
              BranchId: BranchId || '',
              SessionId: SessionId || '',
            };

        const data = await postForm(endpoint, payload);

        if (data?.status === 'SUCCESS') {
          setApiTasks(getTaskRows(data).map(normalizeTask));
          return;
        }

        setTaskError(data?.message || 'Failed to load tasks.');
        setApiTasks([]);
      } catch (error) {
        console.log('VIEW TASK ERROR =>', error);
        setTaskError('Failed to load tasks.');
        setApiTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    loadTasks();
  }, [loadAssignedByMe, shouldLoadTasks]);

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title={title}
        onBack={() => navigation.goBack()}
        safeAreaTop
      />
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {filters.map(item => (
              <FilterButton
                key={item.label}
                item={item}
                active={activeFilter === item.label}
                onPress={() => setActiveFilter(item.label)}
              />
            ))}
          </ScrollView>

          {loadingTasks ? (
            <View style={styles.listLoadingBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : taskError ? (
            <Text style={styles.emptyText}>{taskError}</Text>
          ) : visibleTasks.length ? (
            visibleTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                showForward={showForward}
                navigation={navigation}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No tasks found</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function CommentCard({ type, message, author, pic }) {
  const isQuery = type === 'Query';
  return (
    <View style={styles.commentCard}>
      {message ? <Text style={styles.commentTitle}>{message}</Text> : null}
      {pic ? <Image source={{ uri: pic }} style={styles.commentImage} /> : null}
      <View style={styles.commentDivider} />
      <View style={styles.commentMetaRow}>
        <Text style={[styles.commentType, isQuery && styles.queryText]}>
          {type}
        </Text>
        <Text style={styles.commentBy}>{author}</Text>
      </View>
    </View>
  );
}

export function TaskManagementScreen({ navigation }) {
  const [teacher, setTeacher] = useState({
    name: 'VIPAN SHARMA',
    designation: 'IT- Teacher',
    profilePic: '',
  });

  useEffect(() => {
    const loadTeacher = async () => {
      const raw = await AsyncStorage.getItem('teacherData');
      const name = await AsyncStorage.getItem('name');
      const designation = await AsyncStorage.getItem('DesignationName');
      const profilePic = await AsyncStorage.getItem('profil_pic');
      const profilePicAlt = await AsyncStorage.getItem('profile_pic');

      let parsed = {};
      try {
        parsed = raw ? JSON.parse(raw) : {};
      } catch (error) {
        parsed = {};
      }

      setTeacher({
        name: parsed?.name || name || 'VIPAN SHARMA',
        designation: parsed?.DesignationName || designation || 'IT- Teacher',
        profilePic:
          parsed?.profile_pic ||
          parsed?.profil_pic ||
          profilePicAlt ||
          profilePic ||
          '',
      });
    };

    loadTeacher();
  }, []);

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#1597D1" barStyle="light-content" />
      <LinearGradient
        colors={['#0A8BE8', '#3BDB3D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.managementHeader}
      >
        <SafeAreaView>
          <View style={styles.managementTop}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.goBack()}
              style={styles.backHit}
            >
              <Text style={styles.headerBack}>←</Text>
            </TouchableOpacity>
            <Text style={styles.managementTitle}>Task Management</Text>
          </View>
        </SafeAreaView>
        <View pointerEvents="none" style={styles.headerCurve} />
      </LinearGradient>

      <View style={styles.managementPage}>
        <View style={styles.profileBlock}>
          <View style={styles.profileAvatar}>
            {teacher.profilePic ? (
              <Image
                source={{ uri: teacher.profilePic }}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={require('../../assets/images/avatar-boy.png')}
                style={styles.fallbackProfile}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={styles.profileName} numberOfLines={2}>
            {String(teacher.name).toUpperCase()}
          </Text>
          <Text style={styles.profileDesignation} numberOfLines={1}>
            {teacher.designation}
          </Text>
        </View>

        <View style={styles.menuCardList}>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.title}
                activeOpacity={0.85}
                style={styles.taskMenuItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.menuIconCircle}>
                  <Icon size={30} color="#222" strokeWidth={1.8} />
                </View>
                <Text style={styles.taskMenuText}>{item.title}</Text>
                <ChevronRight size={23} color="#222" strokeWidth={2.1} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function AssignTaskScreen({ navigation }) {
  return (
    <TaskFormScreen
      navigation={navigation}
      title="Assign Task"
      assigneeLabel="Assign To"
    />
  );
}

export function ForwardTaskScreen({ navigation, route }) {
  return <ForwardTaskFormScreen navigation={navigation} route={route} />;
}

export function TaskAssignedToMeScreen({ navigation }) {
  return (
    <TaskListScreen
      navigation={navigation}
      title="Task Assigned to Me"
      loadAssignedToMe
      showForward
    />
  );
}

export function TaskAssignedByMeScreen({ navigation }) {
  return (
    <TaskListScreen
      navigation={navigation}
      title="Task Assigned by Me"
      loadAssignedByMe
      showForward={false}
    />
  );
}

export function TaskCommentsScreen({ navigation, route }) {
  const task = route?.params?.task || {};
  const [commentType, setCommentType] = useState('Query');
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      if (!task.id) {
        setCommentsError('Task id not found.');
        setLoadingComments(false);
        return;
      }

      setLoadingComments(true);
      setCommentsError('');

      try {
        const data = await postForm(API_ENDPOINTS.SHOW_TASK_COMMENTS, {
          task_id: task.id,
        });

        if (data?.status === 'SUCCESS') {
          setComments(getCommentRows(data).map(normalizeComment));
          return;
        }

        setComments([]);
        setCommentsError(data?.message || 'Failed to load comments.');
      } catch (error) {
        console.log('SHOW TASK COMMENTS ERROR =>', error);
        setComments([]);
        setCommentsError('Failed to load comments.');
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
  }, [task.id]);

  const handleSend = async () => {
    if (sendingComment) {
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      Alert.alert('Required', 'Please enter your message.');
      return;
    }

    if (!task.id) {
      Alert.alert('Error', 'Task id not found.');
      return;
    }

    setSendingComment(true);
    try {
      const empcode = await AsyncStorage.getItem('EmpCode');
      const loginname = await AsyncStorage.getItem('name');

      if (!empcode) {
        Alert.alert('Error', 'EmpCode not found.');
        return;
      }

      const data = await postForm(API_ENDPOINTS.SAVE_TASK_COMMUNICATIONS, {
        empcode,
        task_id: task.id,
        msg: trimmedMessage,
        type: commentType,
        status: 'Inprogrss',
      });

      if (data?.status === 'SUCCESS') {
        setComments(current => [
          ...current,
          {
            id: String(Date.now()),
            type: commentType,
            message: trimmedMessage,
            author: loginname || 'You',
            pic: '',
          },
        ]);
        setMessage('');
        return;
      }

      Alert.alert('Error', data?.message || 'Comment send failed.');
    } catch (error) {
      console.log('SAVE TASK COMMUNICATIONS ERROR =>', error);
      Alert.alert('Error', 'Comment send failed.');
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Comments"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />
      <SafeAreaView style={styles.commentsPage}>
        <ScrollView
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.commentTaskBox}>
            <View style={styles.commentTaskTop}>
              <Text style={styles.commentTaskTitle}>
                {task.title || 'Name of the task'}
              </Text>
              <View style={styles.commentStatusPill}>
                <Text style={styles.statusText}>
                  {task.status || 'Inprogrss'}
                </Text>
              </View>
            </View>
            <View style={styles.commentRadioRow}>
              {commentTypes.map(item => {
                const selected = item === commentType;
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.8}
                    style={styles.commentRadioItem}
                    onPress={() => setCommentType(item)}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioActive,
                      ]}
                    >
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <Text style={styles.radioText}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {loadingComments ? (
            <View style={styles.listLoadingBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : commentsError ? (
            <Text style={styles.emptyText}>{commentsError}</Text>
          ) : comments.length ? (
            comments.map(item => (
              <CommentCard
                key={item.id}
                type={item.type}
                message={item.message}
                author={item.author}
                pic={item.pic}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No comments found</Text>
          )}
        </ScrollView>

        <View style={styles.messageBar}>
          <TouchableOpacity style={styles.imageButton} activeOpacity={0.8}>
            <ImageIcon size={30} color="#009DFF" strokeWidth={1.8} />
          </TouchableOpacity>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Enter your message"
            placeholderTextColor="#555"
          />
          <TouchableOpacity
            style={[styles.sendButton, sendingComment && styles.disabledButton]}
            activeOpacity={0.8}
            disabled={sendingComment}
            onPress={handleSend}
          >
            <Send size={26} color="#009DFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  managementHeader: {
    height: 210,
    overflow: 'hidden',
  },
  managementTop: {
    height: 94,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backHit: {
    width: 32,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerBack: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '400',
  },
  managementTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  headerCurve: {
    position: 'absolute',
    left: -46,
    right: -46,
    bottom: -78,
    height: 126,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: '#fff',
  },
  managementPage: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -88,
    paddingHorizontal: 27,
  },
  profileBlock: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  fallbackProfile: {
    width: 84,
    height: 84,
  },
  profileName: {
    marginTop: 16,
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 21,
  },
  profileDesignation: {
    marginTop: 4,
    color: '#555',
    fontSize: 13,
  },
  menuCardList: {
    marginTop: 38,
    gap: 12,
  },
  taskMenuItem: {
    minHeight: 59,
    borderRadius: 7,
    backgroundColor: '#F1F1F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 21,
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskMenuText: {
    flex: 1,
    marginLeft: 18,
    color: TEXT,
    fontSize: 15,
  },
  formContent: {
    paddingHorizontal: 28,
    paddingTop: 27,
    paddingBottom: 30,
  },
  keyboardWrap: {
    flex: 1,
  },
  inputBox: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 4,
    marginBottom: 16,
    justifyContent: 'center',
  },
  fieldBox: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textArea: {
    minHeight: 95,
    alignItems: 'flex-start',
  },
  floatingLabel: {
    color: '#777',
    fontSize: 10,
  },
  required: {
    color: '#FF0000',
  },
  fieldValue: {
    color: TEXT,
    fontSize: 15,
    marginTop: 1,
  },
  fieldInput: {
    minHeight: 27,
    color: TEXT,
    fontSize: 15,
    padding: 0,
    margin: 0,
  },
  textAreaInput: {
    minHeight: 68,
    paddingTop: 2,
  },
  selectValueWrap: {
    flex: 1,
    paddingRight: 12,
  },
  placeholderText: {
    color: '#222',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  selectSheet: {
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    maxHeight: '78%',
  },
  selectHeader: {
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
  },
  selectTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 17,
    fontWeight: '700',
  },
  doneText: {
    color: PURPLE,
    fontSize: 15,
    fontWeight: '700',
  },
  searchInput: {
    height: 42,
    marginHorizontal: 14,
    marginVertical: 12,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    paddingHorizontal: 13,
    color: TEXT,
    fontSize: 14,
  },
  selectList: {
    maxHeight: 360,
  },
  loadingBox: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#777',
    fontSize: 13,
    marginTop: 8,
  },
  selectOption: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B9B9B9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkBoxActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  checkText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  selectOptionText: {
    flex: 1,
    color: TEXT,
    fontSize: 15,
  },
  noOptionsText: {
    color: '#777',
    textAlign: 'center',
    paddingVertical: 24,
  },
  calendarSheet: {
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  calendarHeader: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prevIcon: {
    transform: [{ rotate: '180deg' }],
  },
  calendarTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  weekText: {
    width: `${100 / 7}%`,
    color: '#777',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  selectedDayCell: {
    backgroundColor: PURPLE,
  },
  disabledDayCell: {
    opacity: 0.35,
  },
  dayText: {
    color: TEXT,
    fontSize: 14,
  },
  disabledDayText: {
    color: '#999',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  calendarClose: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 4,
  },
  calendarCloseText: {
    color: PURPLE,
    fontSize: 15,
    fontWeight: '700',
  },
  uploadBox: {
    height: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  uploadText: {
    color: TEXT,
    fontSize: 15,
    flex: 1,
    paddingRight: 12,
  },
  fileText: {
    color: BLUE,
    fontWeight: '600',
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FF0000',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityWrap: {
    marginBottom: 36,
  },
  priorityTitle: {
    color: TEXT,
    fontSize: 14,
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioActive: {
    borderColor: PURPLE,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PURPLE,
  },
  radioText: {
    color: TEXT,
    fontSize: 14,
  },
  submitButton: {
    height: 44,
    borderRadius: 7,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 24,
    paddingBottom: 26,
  },
  filterRow: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 7,
  },
  filterButton: {
    height: 40,
    borderRadius: 7,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeFilterButton: {
    borderColor: '#222',
  },
  filterIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 50,
  },
  listLoadingBox: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCard: {
    marginHorizontal: 19,
    marginBottom: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#C8E4F4',
    backgroundColor: CARD_BLUE,
    overflow: 'hidden',
  },
  taskHeader: {
    height: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E4F4',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskHeaderText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  statusPill: {
    minWidth: 72,
    height: 21,
    borderRadius: 12,
    backgroundColor: '#FFBF21',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  pendingPill: {
    backgroundColor: '#FF4B4B',
  },
  completePill: {
    backgroundColor: '#25B83D',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
  },
  taskBody: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoPair: {
    width: '50%',
    marginBottom: 16,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    color: '#777',
    fontSize: 12,
    marginLeft: 4,
  },
  infoValue: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    paddingLeft: 16,
  },
  descriptionBox: {
    backgroundColor: '#DDF1FC',
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 19,
  },
  forwardTaskBox: {
    backgroundColor: '#DDF1FC',
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  descriptionTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },
  descriptionText: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 16,
  },
  actionRow: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  priorityPill: {
    height: 31,
    borderRadius: 16,
    backgroundColor: '#DDF1FC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 15,
  },
  priorityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  priorityText: {
    color: TEXT,
    fontSize: 13,
  },
  commentButton: {
    height: 31,
    borderRadius: 16,
    backgroundColor: '#EC2DB8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 12,
  },
  forwardButton: {
    height: 31,
    borderRadius: 16,
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 12,
  },
  whiteIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
  },
  commentsPage: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentsContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },
  commentTaskBox: {
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 34,
  },
  commentTaskTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentTaskTitle: {
    color: TEXT,
    fontSize: 14,
  },
  commentStatusPill: {
    height: 21,
    borderRadius: 12,
    backgroundColor: '#FFBF21',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  commentRadioRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  commentRadioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  commentCard: {
    backgroundColor: SOFT_BLUE,
    borderRadius: 7,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  commentTitle: {
    color: TEXT,
    fontSize: 14,
    marginBottom: 10,
  },
  commentImage: {
    width: '100%',
    height: 140,
    borderRadius: 7,
    backgroundColor: '#DDECF4',
    marginBottom: 10,
  },
  commentDivider: {
    height: 1,
    backgroundColor: '#C8E4F4',
    marginBottom: 7,
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentType: {
    color: '#FFBF21',
    fontSize: 10,
  },
  queryText: {
    color: '#FF0000',
  },
  commentBy: {
    color: '#555',
    fontSize: 10,
  },
  messageBar: {
    height: 120,
    backgroundColor: '#DFF3FC',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  imageButton: {
    width: 38,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInput: {
    flex: 1,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginHorizontal: 10,
    color: TEXT,
    fontSize: 12,
  },
  sendButton: {
    width: 38,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

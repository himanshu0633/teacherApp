import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import { ChevronDown, CircleCheck, Plus } from 'lucide-react-native';
import { CircularHeader, CircularTabs } from './CircularComponents';
import { TEXT, circularStyles as styles } from './circularStyles';
import { postForm } from '../../services/teacherApi';
import { API_ENDPOINTS } from '../../utils/constants';

const EMPLOYEE_TYPES = ['All', 'Teaching', 'NonTeaching'];

const parseMaybeJson = value => {
  if (!value || typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const safeMultiGet = async keys => {
  const values = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
  return keys.map((key, index) => [key, values[index]]);
};

const normalizeBranch = item => {
  const id =
    item?.BranchId ||
    item?.branchId ||
    item?.BranchID ||
    item?.id ||
    item?.Id ||
    '';
  const name =
    item?.branchName ||
    item?.BranchName ||
    item?.name ||
    item?.Name ||
    item?.SchoolName ||
    id;

  return {
    ...item,
    id: String(id),
    name: String(name || ''),
    label: name && name !== id ? String(name) : `Branch ${id}`,
  };
};

const findBranchRows = data => {
  if (Array.isArray(data)) {
    return data;
  }

  const rows =
    data?.BranchList ||
    data?.branchList ||
    data?.Branches ||
    data?.branches ||
    data?.Branch ||
    data?.branch ||
    data?.data ||
    data?.Data ||
    [];

  return Array.isArray(rows) ? rows : rows ? [rows] : [];
};

const parseTeacherData = async () => {
  const raw = await AsyncStorage.getItem('teacherData');
  let parsed = {};

  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (error) {
    parsed = {};
  }

  const [
    empCode,
    branchId,
    branchIdAlt,
    branchIdLower,
    branchIdUpper,
    branchName,
    branchNameAlt,
    sessionId,
    session,
    branchList,
    branches,
    allBranches,
  ] = await safeMultiGet([
    'EmpCode',
    'BranchId',
    'branchId',
    'branchid',
    'BranchID',
    'branchName',
    'BranchName',
    'SessionId',
    'Session',
    'BranchList',
    'branches',
    'allBranches',
  ]);

  const currentBranch = normalizeBranch({
    BranchId:
      parsed?.BranchId ||
      parsed?.branchId ||
      parsed?.branchid ||
      parsed?.BranchID ||
      branchId?.[1] ||
      branchIdAlt?.[1] ||
      branchIdLower?.[1] ||
      branchIdUpper?.[1] ||
      '',
    branchName:
      parsed?.branchName ||
      parsed?.BranchName ||
      branchName?.[1] ||
      branchNameAlt?.[1] ||
      '',
  });

  const parsedBranchRows = [
    ...findBranchRows(parsed),
    ...findBranchRows(parseMaybeJson(branchList?.[1])),
    ...findBranchRows(parseMaybeJson(branches?.[1])),
    ...findBranchRows(parseMaybeJson(allBranches?.[1])),
  ];

  const branchRows = parsedBranchRows.length
    ? parsedBranchRows
    : [currentBranch];
  const branchMap = new Map();

  branchRows
    .map(normalizeBranch)
    .filter(branch => branch.id)
    .forEach(branch => {
      branchMap.set(branch.id, branch);
    });

  if (currentBranch.id && !branchMap.has(currentBranch.id)) {
    branchMap.set(currentBranch.id, currentBranch);
  }

  return {
    EmpCode: parsed?.EmpCode || empCode?.[1] || '',
    BranchId: currentBranch.id,
    branchName: currentBranch.name,
    branches: Array.from(branchMap.values()),
    currentBranch,
    SessionId:
      parsed?.SessionId ||
      parsed?.Session ||
      sessionId?.[1] ||
      session?.[1] ||
      '',
  };
};

const success = data =>
  data?.status === true ||
  String(data?.status || '').toLowerCase() === 'true' ||
  String(data?.response || '').toLowerCase() === 'success';

const getRows = data => {
  if (Array.isArray(data)) {
    return data;
  }

  const rows =
    data?.data ||
    data?.Data ||
    data?.list ||
    data?.List ||
    data?.result ||
    data?.Result ||
    data?.staff ||
    data?.Staff ||
    data?.response?.rest ||
    data?.response?.Rest ||
    data?.response?.Res ||
    data?.response?.data ||
    data?.Response?.rest ||
    data?.Response?.Rest ||
    data?.Response?.Res ||
    data?.Response?.data ||
    [];

  if (Array.isArray(rows)) {
    return rows;
  }

  return rows ? [rows] : [];
};

const normalizeStaff = item => {
  const code =
    item?.EmpCode ||
    item?.empcode ||
    item?.EmployeeCode ||
    item?.EmployeeId ||
    item?.id ||
    '';
  const name =
    item?.EmpName ||
    item?.EmployeeName ||
    item?.StaffName ||
    item?.name ||
    item?.Name ||
    code;

  return {
    ...item,
    code: String(code),
    name: String(name || ''),
    label: code ? `${name} (${code})` : String(name || ''),
  };
};

function RequiredLabel({ children }) {
  return (
    <Text>
      {children}
      <Text style={styles.required}>*</Text>
    </Text>
  );
}

function SelectField({ placeholder, value, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={styles.field}
      activeOpacity={0.75}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.fieldText, !value && styles.disabledText]}>
        {value || <RequiredLabel>{placeholder}</RequiredLabel>}
      </Text>
      {!disabled ? (
        <ChevronDown size={19} color={TEXT} strokeWidth={2} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function EmployeeCircularScreen({ navigation }) {
  const [teacher, setTeacher] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [employeeType, setEmployeeType] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [branchPickerVisible, setBranchPickerVisible] = useState(false);
  const [staffPickerVisible, setStaffPickerVisible] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    parseTeacherData()
      .then(context => {
        setTeacher(context);
        setBranchList(context.branches || []);
        setSelectedBranch(
          context.currentBranch || context.branches?.[0] || null,
        );
      })
      .catch(error => {
        console.log('EMPLOYEE CIRCULAR STORAGE ERROR =>', error);
        setTeacher({});
      });
  }, []);

  const selectedStaffCodes = selectedStaff.map(staff => staff.code);
  const branchOptions =
    branchList.length || !selectedBranch?.id ? branchList : [selectedBranch];
  const selectedStaffValue =
    selectedStaff.length === 1
      ? selectedStaff[0].label
      : selectedStaff.length
      ? `${selectedStaff.length} Staff Selected`
      : '';

  const loadStaff = async type => {
    const context = teacher || (await parseTeacherData());
    const branchId = selectedBranch?.id || context.BranchId;

    if (!branchId || !context.EmpCode || !type) {
      setStaffList([]);
      return;
    }

    setStaffLoading(true);
    try {
      const payload = {
        BranchId: branchId,
        EmpCategory: type,
        EmpCode: context.EmpCode,
      };

      console.log('EMPLOYEE CIRCULAR STAFF LIST PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.TEACHER_LIST_FILTER, payload);
      console.log('EMPLOYEE CIRCULAR STAFF LIST RESPONSE =>', data);

      const nextStaff = getRows(data)
        .map(normalizeStaff)
        .filter(item => item.code);
      console.log('EMPLOYEE CIRCULAR STAFF LIST NORMALIZED =>', nextStaff);
      setStaffList(nextStaff);
    } catch (error) {
      console.log('EMPLOYEE CIRCULAR STAFF LIST ERROR =>', error);
  Alert.alert('Error', 'Failed to load staff list.');
      setStaffList([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const openStaffPicker = async () => {
    if (!employeeType) {
  Alert.alert('Required', 'Please select employee type.');
      return;
    }

    if (!selectedBranch?.id) {
  Alert.alert('Required', 'Please select a branch.');
      return;
    }

    setStaffPickerVisible(true);
    await loadStaff(employeeType);
  };

  const openBranchPicker = async () => {
    if (!branchOptions.length) {
      const context = await parseTeacherData();
      const nextBranches = context.branches || [];

      console.log('EMPLOYEE CIRCULAR BRANCH CONTEXT =>', context);
      setTeacher(context);
      setBranchList(nextBranches);
      setSelectedBranch(context.currentBranch || nextBranches[0] || null);
    }

    setBranchPickerVisible(true);
  };

  const toggleStaff = staff => {
    setSelectedStaff(current => {
      const exists = current.some(item => item.code === staff.code);

      if (exists) {
        return current.filter(item => item.code !== staff.code);
      }

      return [...current, staff];
    });
  };

  const pickFile = async () => {
    try {
      const [file] = await pick({
        type: [
          types.images,
          types.pdf,
          types.doc,
          types.docx,
          types.xls,
          types.xlsx,
          types.plainText,
        ],
        allowMultiSelection: false,
      });

      if (!file?.uri) {
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name || 'employee-circular-file',
        type: file.type || 'application/octet-stream',
      });
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }

      console.log('EMPLOYEE CIRCULAR FILE PICK ERROR =>', error);
  Alert.alert('Error', 'File selection failed.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
  Alert.alert('Required', 'Please enter circular name.');
      return;
    }

    if (!employeeType) {
  Alert.alert('Required', 'Please select employee type.');
      return;
    }

    if (!selectedBranch?.id) {
  Alert.alert('Required', 'Please select a branch.');
      return;
    }

    if (!selectedStaffCodes.length) {
  Alert.alert('Required', 'Please select staff.');
      return;
    }

    if (!description.trim()) {
  Alert.alert('Required', 'Please enter a description.');
      return;
    }

    setSubmitting(true);
    try {
      const context = teacher || (await parseTeacherData());

      if (!context.EmpCode || !context.SessionId) {
  Alert.alert('Error', 'Employee or session details not found.');
        return;
      }

      const payload = {
        EmpCode: context.EmpCode,
        title: title.trim(),
        staff: selectedStaffCodes.join(','),
        description: description.trim(),
        SessionId: context.SessionId,
        EmpCategory: employeeType,
        BranchId: selectedBranch.id,
        ...(selectedFile ? { file: selectedFile } : {}),
      };

      console.log('EMPLOYEE CIRCULAR SAVE PAYLOAD =>', payload);
      const data = await postForm(API_ENDPOINTS.STAFF_CIRCULAR, payload);
      console.log('EMPLOYEE CIRCULAR SAVE RESPONSE =>', data);

      if (success(data)) {
        Alert.alert('Success', data?.msg || data?.message || 'Circular saved.');
        setTitle('');
        setDescription('');
        setEmployeeType('');
        setSelectedStaff([]);
        setStaffList([]);
        setSelectedFile(null);
        return;
      }

      Alert.alert(
        'Error',
  data?.msg || data?.message || 'Failed to save circular.',
      );
    } catch (error) {
      console.log('EMPLOYEE CIRCULAR SAVE ERROR =>', error);
  Alert.alert('Error', 'Failed to save circular.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <CircularHeader
        title="Employee Circular"
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.page}>
        <CircularTabs
          active="create"
          onCreate={() => {}}
          onList={() =>
            navigation.navigate('MyCircularListScreen', {
              circularType: 'employee',
            })
          }
        />

        <ScrollView
          contentContainerStyle={styles.createContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.field}
            placeholder="Circular Name *"
            placeholderTextColor={TEXT}
            value={title}
            onChangeText={setTitle}
          />

          <SelectField
            placeholder="Employee Type "
            value={employeeType}
            onPress={() => setTypePickerVisible(true)}
          />
          <SelectField
            placeholder="Select Branch "
            value={selectedBranch?.label || ''}
            onPress={openBranchPicker}
          />
          <SelectField
            placeholder={staffLoading ? 'Loading Staff ' : 'Choose Staff '}
            value={selectedStaffValue}
            disabled={!employeeType || !selectedBranch?.id || staffLoading}
            onPress={openStaffPicker}
          />

          <TextInput
            style={styles.messageBox}
            placeholder="Description *"
            placeholderTextColor={TEXT}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.uploadField}>
            <Text style={styles.uploadText} numberOfLines={1}>
              {selectedFile?.name || 'Upload File'}
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickFile}
              activeOpacity={0.75}
            >
              <Plus size={42} color="#FF0712" strokeWidth={1.9} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.82}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={typePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setTypePickerVisible(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Employee Type</Text>
            {EMPLOYEE_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={styles.modalOption}
                onPress={() => {
                  setEmployeeType(type);
                  setSelectedStaff([]);
                  setStaffList([]);
                  setTypePickerVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={branchPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBranchPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setBranchPickerVisible(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Branch</Text>
            {branchOptions.length ? (
              branchOptions.map(branch => (
                <TouchableOpacity
                  key={branch.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedBranch(branch);
                    setSelectedStaff([]);
                    setStaffList([]);
                    setBranchPickerVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{branch.label}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.modalOption}>
                <Text style={styles.modalOptionText}>No branch found</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={staffPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStaffPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setStaffPickerVisible(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Choose Staff</Text>
            {staffList.length ? (
              staffList.map(staff => (
                <TouchableOpacity
                  key={`${staff.code}-${staff.name}`}
                  style={styles.multiOption}
                  onPress={() => toggleStaff(staff)}
                >
                  <Text style={styles.modalOptionText}>{staff.label}</Text>
                  <CircleCheck
                    size={20}
                    color={
                      selectedStaffCodes.includes(staff.code)
                        ? '#22B63A'
                        : '#C9CDD4'
                    }
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.modalOption}>
                <Text style={styles.modalOptionText}>
                  {staffLoading ? 'Loading staff...' : 'No staff found'}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setStaffPickerVisible(false)}
              activeOpacity={0.82}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

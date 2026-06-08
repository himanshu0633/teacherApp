import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {errorCodes, isErrorWithCode, pick, types} from '@react-native-documents/picker';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

const CATEGORY_OPTIONS = [
  {id: '1180', label: 'Participation'},
  {id: '1181', label: 'Achievement'},
];

const emptyStudent = {
  className: '',
  enrollNo: '',
  name: '',
  fatherName: '',
  mobileNo: '',
  address: '',
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

const normalizeStudent = data => ({
  className: data?.Class || data?.classname || '',
  enrollNo: data?.EnrollNo || data?.adminno || '',
  name: data?.Name || data?.stname || '',
  fatherName: data?.FatherName || '',
  mobileNo: data?.MobileNo || '',
  address: data?.Address || '',
});

const normalizeOption = (item, labelKeys) => ({
  id: String(item?.Id || item?.id || ''),
  label: labelKeys.map(key => item?.[key]).find(Boolean) || '',
});

export default function SportsEntryScreen({
  navigation,
  title = 'Sports Entry',
  listRoute = 'SportsEntryListScreen',
  firstLabel = 'Sports Name',
  awardLabel = 'Award/Participate',
  entryType = 'sports',
}) {
  const [teacher, setTeacher] = useState(null);
  const [adminNo, setAdminNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [student, setStudent] = useState(emptyStudent);
  const [entries, setEntries] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [year, setYear] = useState('');
  const [prizeWon, setPrizeWon] = useState('');
  const [description, setDescription] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [activePicker, setActivePicker] = useState(null);

  useEffect(() => {
    const init = async () => {
      const context = await getTeacherContext();
      setTeacher(context);
      setLoadingLookups(true);

      try {
        const [entryData, levelData] = await Promise.all([
          postForm(
            entryType === 'activity'
              ? API_ENDPOINTS.ACTIVITY_LIST
              : API_ENDPOINTS.SPORTS_LIST,
            {},
          ),
          postForm(API_ENDPOINTS.LEVEL_LIST, {}),
        ]);

        setEntries(
          (entryData?.response?.Rest || [])
            .map(item => normalizeOption(item, ['SportsName', 'Activity', 'Name']))
            .filter(item => item.id && item.label),
        );
        setLevels(
          (levelData?.response?.Rest || [])
            .map(item => normalizeOption(item, ['LevelName', 'Name']))
            .filter(item => item.id && item.label),
        );
      } catch (error) {
        console.log('PORTFOLIO LOOKUP ERROR =>', error);
  Alert.alert('Error', `Failed to load ${firstLabel} or level list.`);
      } finally {
        setLoadingLookups(false);
      }
    };

    init();
  }, [entryType, firstLabel]);

  const pickerConfig = useMemo(
    () => ({
      entry: {
        title: firstLabel,
        items: entries,
        loading: loadingLookups,
        onSelect: setSelectedEntry,
      },
      level: {
        title: 'Level',
        items: levels,
        loading: loadingLookups,
        onSelect: setSelectedLevel,
      },
      category: {
        title: 'Category',
        items: CATEGORY_OPTIONS,
        loading: false,
        onSelect: setSelectedCategory,
      },
    }),
    [entries, firstLabel, levels, loadingLookups],
  );

  const searchStudent = async () => {
    const queryAdminNo = adminNo.trim();
    const queryName = studentName.trim();

    if (!queryAdminNo && !queryName) {
  Alert.alert('Required', 'Please enter admission number or student name.');
      return;
    }

    if (!teacher?.BranchId || !teacher?.SessionId) {
  Alert.alert('Error', 'Branch or session details not found.');
      return;
    }

    setLoadingSearch(true);
    try {
      const data = await postForm(API_ENDPOINTS.STUDENT_SEARCH, {
        adminno: queryAdminNo,
        name: queryAdminNo ? '' : queryName,
        BranchId: teacher.BranchId,
        SessionId: teacher.SessionId,
      });

      if (data?.status !== 'true') {
        setStudent(emptyStudent);
  Alert.alert('No Data', data?.msg || 'Student details not found.');
        return;
      }

      const nextStudent = normalizeStudent(data);
      setStudent(nextStudent);
      setAdminNo(nextStudent.enrollNo || queryAdminNo);
      setStudentName(nextStudent.name || queryName);
    } catch (error) {
      console.log('STUDENT SEARCH ERROR =>', error);
  Alert.alert('Error', 'Student search failed.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const resetForm = () => {
    setSelectedEntry(null);
    setSelectedLevel(null);
    setSelectedCategory(null);
    setSelectedFile(null);
    setYear('');
    setPrizeWon('');
    setDescription('');
  };

  const saveEntry = async () => {
    if (!student.enrollNo || !student.name || !student.className) {
  Alert.alert('Required', 'Please search the student first and fill the details.');
      return;
    }

    if (!selectedEntry || !selectedLevel || !selectedCategory || !year.trim()) {
  Alert.alert('Required', `Please select ${firstLabel}, level, category and year.`);
      return;
    }

    const isActivity = entryType === 'activity';
    const payload = isActivity
      ? {
          Enollno: student.enrollNo,
          Enrollno: student.enrollNo,
          stname: student.name,
          classname: student.className,
          BranchId: teacher?.BranchId,
          SessionId: teacher?.SessionId,
          Activity: selectedEntry.id,
          Year: year.trim(),
          Level: selectedLevel.id,
          PrizeWon: prizeWon.trim(),
          des: description.trim(),
          category: selectedCategory.label,
          empcode: teacher?.EmpCode,
          ...(selectedFile ? {file: selectedFile} : {}),
        }
      : {
          Enrollno: student.enrollNo,
          stname: student.name,
          classname: student.className,
          BranchId: teacher?.BranchId,
          SessionId: teacher?.SessionId,
          SportsId: selectedEntry.id,
          Year: year.trim(),
          Level: selectedLevel.id,
          PrizeWon: prizeWon.trim(),
          des: description.trim(),
          category: selectedCategory.id,
          empcode: teacher?.EmpCode,
          ...(selectedFile ? {file: selectedFile} : {}),
        };

    setLoadingSubmit(true);
    try {
      const endpoint = isActivity
        ? API_ENDPOINTS.SAVE_ACTIVITY_ENTRY
        : API_ENDPOINTS.SAVE_SPORTS_ENTRY;

      console.log('PORTFOLIO SAVE TYPE =>', entryType);
      console.log('PORTFOLIO SAVE ENDPOINT =>', endpoint);
      console.log('PORTFOLIO SAVE PAYLOAD =>', payload);

      const data = await postForm(endpoint, payload);
      console.log('PORTFOLIO SAVE RESPONSE =>', data);

      const saved =
        String(data?.status).toLowerCase() === 'true' ||
        String(data?.status).toLowerCase() === 'success';

      if (saved) {
  Alert.alert(
          'Success',
          data?.msg ||
            data?.message ||
            `${isActivity ? 'Activity' : 'Sports'} entry saved successfully.`,
        );
        resetForm();
        return;
      }

      Alert.alert(
        'Error',
        data?.msg ||
          data?.message ||
          `${isActivity ? 'Activity' : 'Sports'} entry save failed.`,
      );
    } catch (error) {
      console.log('SAVE PORTFOLIO ENTRY ERROR =>', error);
  Alert.alert('Error', `${isActivity ? 'Activity' : 'Sports'} entry save failed.`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const pickAttachment = async () => {
    try {
      const [file] = await pick({
        type: [types.images, types.pdf],
      });

      if (file) {
        setSelectedFile({
          uri: file.uri,
          name: file.name || 'attachment',
          type: file.type || 'application/octet-stream',
        });
      }
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }

      console.log('PORTFOLIO FILE PICK ERROR =>', error);
  Alert.alert('Error', 'File selection failed.');
    }
  };

  const currentPicker = pickerConfig[activePicker];

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title={title}
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
          rightIcon={
            <TouchableOpacity onPress={() => navigation.navigate(listRoute)}>
              <Text style={styles.eyeIcon}>◎</Text>
            </TouchableOpacity>
          }
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <SearchBox
            adminNo={adminNo}
            studentName={studentName}
            loading={loadingSearch}
            onAdminNoChange={setAdminNo}
            onStudentNameChange={setStudentName}
            onSearch={searchStudent}
          />

          <StudentDetail student={student} />

          <AddDetail
            firstLabel={firstLabel}
            awardLabel={awardLabel}
            selectedEntry={selectedEntry}
            selectedLevel={selectedLevel}
            selectedCategory={selectedCategory}
            selectedFile={selectedFile}
            year={year}
            prizeWon={prizeWon}
            description={description}
            loadingSubmit={loadingSubmit}
            onEntryPress={() => setActivePicker('entry')}
            onLevelPress={() => setActivePicker('level')}
            onCategoryPress={() => setActivePicker('category')}
            onYearChange={setYear}
            onPrizeWonChange={setPrizeWon}
            onDescriptionChange={setDescription}
            onUploadPress={pickAttachment}
            onSubmit={saveEntry}
          />
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

function SearchBox({
  adminNo,
  studentName,
  loading,
  onAdminNoChange,
  onStudentNameChange,
  onSearch,
}) {
  return (
    <>
      <View style={styles.inputBox}>
        <Text style={styles.smallLabel}>Admission No</Text>
        <TextInput
          value={adminNo}
          onChangeText={onAdminNoChange}
          placeholder="Admission No"
          placeholderTextColor="#777"
          style={styles.input}
        />
      </View>

      <Text style={styles.orText}>OR</Text>

      <View style={styles.inputBox}>
        <TextInput
          value={studentName}
          onChangeText={onStudentNameChange}
          placeholder="Student Name"
          placeholderTextColor="#222"
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={[styles.searchBtn, loading && styles.disabledBtn]}
        disabled={loading}
        onPress={onSearch}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Search</Text>}
      </TouchableOpacity>
    </>
  );
}

function StudentDetail({student}) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Student Detail</Text>
      </View>

      <View style={styles.detailBody}>
        <View style={styles.row}>
          <Info label="Class" value={student.className || '-'} />
          <Info label="Student Name" value={student.name || '-'} />
        </View>

        <View style={styles.row}>
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
    <View style={styles.infoCol}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function AddDetail({
  firstLabel,
  awardLabel,
  selectedEntry,
  selectedLevel,
  selectedCategory,
  selectedFile,
  year,
  prizeWon,
  description,
  loadingSubmit,
  onEntryPress,
  onLevelPress,
  onCategoryPress,
  onYearChange,
  onPrizeWonChange,
  onDescriptionChange,
  onUploadPress,
  onSubmit,
}) {
  return (
    <View style={styles.addCard}>
      <View style={styles.addHead}>
        <Text style={styles.sectionTitle}>Add Detail</Text>
      </View>

      <View style={styles.addBody}>
        <SelectBox
          label={firstLabel}
          value={selectedEntry?.label}
          onPress={onEntryPress}
        />
        <SelectBox label="Level" value={selectedLevel?.label} onPress={onLevelPress} />
        <InputBox
          label="Year"
          value={year}
          keyboardType="number-pad"
          maxLength={4}
          onChangeText={onYearChange}
        />
        <InputBox label={awardLabel} value={prizeWon} onChangeText={onPrizeWonChange} />
        <DescriptionBox value={description} onChangeText={onDescriptionChange} />
        <SelectBox
          label="Category"
          value={selectedCategory?.label}
          onPress={onCategoryPress}
        />

        <TouchableOpacity style={styles.uploadBox} onPress={onUploadPress}>
          <Text style={styles.uploadText}>
            {selectedFile?.name || 'Upload doc/image'}
          </Text>
          <View style={styles.plusBox}>
            <Text style={styles.plus}>+</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loadingSubmit && styles.disabledBtn]}
          disabled={loadingSubmit}
          onPress={onSubmit}>
          {loadingSubmit ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SelectBox({label, value, onPress}) {
  return (
    <TouchableOpacity style={styles.fieldBox} onPress={onPress}>
      <Text style={[styles.fieldText, !value && styles.placeholderText]}>
        {value || label}
      </Text>
      <Text style={styles.down}>⌄</Text>
    </TouchableOpacity>
  );
}

function InputBox({label, value, onChangeText, keyboardType, maxLength}) {
  return (
    <View style={styles.fieldBox}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#222"
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={styles.fieldInput}
      />
    </View>
  );
}

function DescriptionBox({value, onChangeText}) {
  return (
    <View style={styles.descBox}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Description"
        placeholderTextColor="#222"
        multiline
        style={styles.descInput}
      />
    </View>
  );
}

function PickerModal({visible, title, items, loading, onClose, onSelect}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          {loading ? (
            <ActivityIndicator color="#5A33C5" />
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
            <Text style={styles.emptyModalText}>No records found.</Text>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {paddingHorizontal: 20, paddingTop: 27, paddingBottom: 34},
  eyeIcon: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#fff',
    color: '#F124B8',
    fontSize: 25,
    textAlign: 'center',
    lineHeight: 30,
  },
  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  smallLabel: {fontSize: 9, color: '#777'},
  input: {padding: 0, fontSize: 14, color: '#222'},
  orText: {textAlign: 'center', fontSize: 10, color: '#222', marginVertical: 10},
  searchBtn: {
    height: 45,
    backgroundColor: '#5A33C5',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 21,
    marginBottom: 27,
  },
  btnText: {color: '#fff', fontSize: 16, fontWeight: '800'},
  disabledBtn: {opacity: 0.65},
  studentCard: {
    borderWidth: 1,
    borderColor: '#BFE3F9',
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#F4FCFF',
    marginBottom: 24,
  },
  sectionHead: {
    height: 39,
    borderBottomWidth: 1,
    borderBottomColor: '#D8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {fontSize: 14, fontWeight: '800', color: '#222'},
  detailBody: {padding: 15},
  row: {flexDirection: 'row', marginBottom: 14},
  infoCol: {flex: 1, paddingRight: 8},
  infoLabel: {fontSize: 12, color: '#777', marginBottom: 6},
  infoValue: {fontSize: 14, color: '#222', fontWeight: '800'},
  addressBox: {
    backgroundColor: '#DFF2FC',
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  addressTitle: {fontSize: 12, color: '#222', fontWeight: '700', marginBottom: 8},
  addressText: {fontSize: 11, color: '#222'},
  addCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  addHead: {
    height: 34,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBody: {paddingHorizontal: 13, paddingTop: 21, paddingBottom: 18},
  fieldBox: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldText: {flex: 1, fontSize: 14, color: '#222', paddingVertical: 12},
  placeholderText: {color: '#222'},
  fieldInput: {flex: 1, padding: 0, fontSize: 14, color: '#222'},
  down: {fontSize: 22, color: '#222', marginTop: -5},
  descBox: {
    height: 100,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  descInput: {padding: 0, fontSize: 14, color: '#222', textAlignVertical: 'top'},
  uploadBox: {
    height: 77,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 7,
    marginBottom: 33,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadText: {flex: 1, fontSize: 14, color: '#222'},
  plusBox: {
    width: 60,
    height: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'red',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {fontSize: 42, color: 'red', lineHeight: 42},
  submitBtn: {
    height: 45,
    backgroundColor: '#5A33C5',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    color: '#222',
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
  modalItemText: {fontSize: 14, color: '#222'},
  emptyModalText: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    fontSize: 13,
    color: '#777',
  },
});

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
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
import {errorCodes, isErrorWithCode, pick, types} from '@react-native-documents/picker';
import {
  ChevronDown,
  Clock,
  Eye,
  Link2,
  Plus,
  Search,
  UploadCloud,
  UserRound,
} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';
import {postForm} from '../../services/teacherApi';
import {API_ENDPOINTS} from '../../utils/constants';

const PURPLE = '#5A33C5';
const TEXT = '#202124';
const GREEN = '#23B935';
const RED = '#FF0000';

const todayText = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const rows = data => {
  const nextRows =
    data?.response?.Rest ||
    data?.response?.rest ||
    data?.response ||
    data?.Rest ||
    data?.rest ||
    [];

  return Array.isArray(nextRows) ? nextRows : [];
};

const stripHtml = value =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\\\//g, '/')
    .replace(/\s+/g, ' ')
    .trim();

const firstValue = (source, keys, fallback = '-') => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && value !== '') {
      return stripHtml(value);
    }
  }

  return fallback;
};

const isSuccess = data => {
  const status = String(data?.status || '').toLowerCase();
  return data?.status === true || status === 'true' || status === 'success';
};

const isImageUrl = value => /\.(jpg|jpeg|png|gif|webp)$/i.test(String(value || '').split('?')[0]);

const getTeacherContext = async () => {
  const [saved, empCode, branchId, sessionId, session] = await Promise.all([
    AsyncStorage.getItem('teacherData'),
    AsyncStorage.getItem('EmpCode'),
    AsyncStorage.getItem('BranchId'),
    AsyncStorage.getItem('SessionId'),
    AsyncStorage.getItem('Session'),
  ]);
  const parsed = saved ? JSON.parse(saved) : {};

  return {
    EmpCode: parsed?.EmpCode || parsed?.empcode || parsed?.Empcode || empCode || '',
    BranchId: parsed?.BranchId || branchId || '',
    SessionId: parsed?.SessionId || parsed?.Session || sessionId || session || '',
  };
};

const normalizeTeacher = item => ({
  id: String(item?.EmpCode || item?.empcode || item?.id || ''),
  name: stripHtml(item?.EmpName || item?.name || item?.Name || ''),
});

const normalizeDocument = item => ({
  id: firstValue(item, ['id', 'Id', 'ID'], ''),
  title: firstValue(item, ['title', 'Title', 'DocumentTitle', 'document_title'], 'Title of the Document'),
  date: firstValue(item, ['date', 'Date', 'assigned_date', 'AssignedDate']),
  assignedTo: firstValue(item, ['AssignedTo', 'assignedTo', 'EmpName', 'staff', 'StaffName']),
  attachment: firstValue(item, ['ExtraFile', 'extraFile', 'file', 'File'], ''),
  fileType: firstValue(item, ['FileType', 'fileType', 'type'], ''),
});

function TabButton({active, icon: Icon, title, onPress}) {
  return (
    <TouchableOpacity
      activeOpacity={0.84}
      style={[styles.tabButton, active && styles.activeTab]}
      onPress={onPress}>
      <Icon size={19} color={active ? '#fff' : TEXT} strokeWidth={2.1} />
      <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );
}

function DetailCell({Icon, label, value}) {
  return (
    <View style={styles.detailCell}>
      <View style={styles.labelRow}>
        <Icon size={12} color={GREEN} strokeWidth={2} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function DocumentCard({document}) {
  const openAttachment = async () => {
    if (!document.attachment || document.attachment === '-') {
      Alert.alert('No File', 'Attachment is not available.');
      return;
    }

    try {
      await Linking.openURL(document.attachment);
    } catch (error) {
      console.log('UPLOAD DOCUMENT ATTACHMENT ERROR =>', error);
      Alert.alert('Error', 'Attachment could not be opened.');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{document.title}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <DetailCell Icon={Clock} label="Assigned date" value={document.date} />
          <DetailCell Icon={UserRound} label="Assigned To" value={document.assignedTo} />
        </View>

        {document.attachment && document.attachment !== '-' ? (
          isImageUrl(document.attachment) || String(document.fileType).toLowerCase() === 'image' ? (
            <TouchableOpacity activeOpacity={0.8} onPress={openAttachment}>
              <Text style={styles.imageTitle}>Image/PDF</Text>
              <Image source={{uri: document.attachment}} style={styles.thumb} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={0.75} style={styles.attachmentRow} onPress={openAttachment}>
              <View style={styles.attachmentIcon}>
                <Link2 size={20} color="#222" strokeWidth={2.1} />
              </View>
              <Text style={styles.attachmentText}>View Attachment</Text>
            </TouchableOpacity>
          )
        ) : null}
      </View>
    </View>
  );
}

function TeacherModal({
  visible,
  teachers,
  selectedIds,
  searchText,
  onSearchText,
  onToggle,
  onSelectAll,
  onClose,
}) {
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredTeachers = teachers.filter(item => {
    if (!normalizedSearch) {
      return true;
    }

    return `${item.id}.${item.name}`.toLowerCase().includes(normalizedSearch);
  });
  const allSelected = teachers.length > 0 && teachers.every(item => selectedIds.includes(item.id));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Teacher List</Text>

          <View style={styles.teacherSearchBox}>
            <Search size={22} color="#6D7179" strokeWidth={1.9} />
            <TextInput
              value={searchText}
              onChangeText={onSearchText}
              placeholder="Enter Name or ID"
              placeholderTextColor="#777"
              style={styles.teacherSearchInput}
            />
          </View>

          <ScrollView style={styles.teacherList} showsVerticalScrollIndicator={false}>
            <TouchableOpacity activeOpacity={0.75} style={styles.teacherRow} onPress={onSelectAll}>
              <Text style={styles.teacherText}>Select All</Text>
              <View style={[styles.checkBox, allSelected && styles.checkedBox]} />
            </TouchableOpacity>

            {filteredTeachers.map(item => {
              const checked = selectedIds.includes(item.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.75}
                  style={styles.teacherRow}
                  onPress={() => onToggle(item.id)}>
                  <Text style={styles.teacherText}>{item.id}.{item.name}</Text>
                  <View style={[styles.checkBox, checked && styles.checkedBox]} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity activeOpacity={0.84} style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.84} style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function UploadDocumentScreen({navigation}) {
  const [mode, setMode] = useState('upload');
  const [date, setDate] = useState(todayText);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('Image');
  const [selectedFile, setSelectedFile] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedStaffText = useMemo(() => {
    if (!selectedStaff.length) {
      return '';
    }

    if (selectedStaff.length === teachers.length) {
      return 'All Teachers';
    }

    return `${selectedStaff.length} selected`;
  }, [selectedStaff.length, teachers.length]);

  const loadTeachers = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      const context = await getTeacherContext();
      const data = await postForm(API_ENDPOINTS.TEACHERS_LIST, {empcode: context.EmpCode});
      console.log('UPLOAD DOCUMENT TEACHERS RESPONSE =>', data);
      setTeachers(rows(data).map(normalizeTeacher).filter(item => item.id && item.name));
    } catch (error) {
      console.log('UPLOAD DOCUMENT TEACHERS ERROR =>', error);
      Alert.alert('Error', 'Teacher list could not be loaded.');
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        SessionId: context.SessionId,
        BranchId: context.BranchId,
        login_user: context.EmpCode,
      };
      const data = await postForm(API_ENDPOINTS.UPLOAD_BY_ME, payload);
      console.log('UPLOAD BY ME PAYLOAD =>', payload);
      console.log('UPLOAD BY ME RESPONSE =>', data);
      setDocuments(rows(data).map(normalizeDocument));
    } catch (error) {
      console.log('UPLOAD BY ME ERROR =>', error);
      Alert.alert('Error', 'Uploaded document list could not be loaded.');
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  const openViewMode = () => {
    setMode('view');
    loadDocuments();
  };

  const toggleTeacher = id => {
    setSelectedStaff(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedStaff(current =>
      teachers.length > 0 && teachers.every(item => current.includes(item.id))
        ? []
        : teachers.map(item => item.id),
    );
  };

  const pickFile = async () => {
    try {
      const [file] = await pick({
        type: documentType === 'Image' ? [types.images] : [types.pdf, types.doc, types.docx],
        allowMultiSelection: false,
      });

      if (!file?.uri) {
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name || 'upload-document-file',
        type: file.type || 'application/octet-stream',
      });
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }

      console.log('UPLOAD DOCUMENT FILE PICK ERROR =>', error);
      Alert.alert('Error', 'File selection failed.');
    }
  };

  const handleSubmit = async () => {
    if (!date.trim() || !title.trim() || !selectedStaff.length || !selectedFile) {
      Alert.alert('Required', 'Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const context = await getTeacherContext();
      const payload = {
        EmpCode: context.EmpCode,
        date: date.trim(),
        title: title.trim(),
        SessionId: context.SessionId,
        BranchId: context.BranchId,
        stafflist: selectedStaff.join(','),
        DocumentType: documentType,
        file: selectedFile,
      };
      const data = await postForm(API_ENDPOINTS.UPLOAD_DOCUMENT, payload);
      console.log('UPLOAD DOCUMENT PAYLOAD =>', payload);
      console.log('UPLOAD DOCUMENT RESPONSE =>', data);

      if (isSuccess(data)) {
        Alert.alert('Success', data?.msg || data?.message || 'Document uploaded.');
        setTitle('');
        setSelectedStaff([]);
        setSelectedFile(null);
        openViewMode();
        return;
      }

      Alert.alert('Error', data?.msg || data?.message || 'Document could not be uploaded.');
    } catch (error) {
      console.log('UPLOAD DOCUMENT ERROR =>', error);
      Alert.alert('Error', 'Document could not be uploaded.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title={mode === 'upload' ? 'Upload Document' : 'Documents Uploaded By Me'}
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.tabRow}>
            <TabButton active={mode === 'upload'} icon={UploadCloud} title="Upload Document" onPress={() => setMode('upload')} />
            <TabButton active={mode === 'view'} icon={Eye} title="View Document" onPress={openViewMode} />
          </View>

          {mode === 'upload' ? (
            <>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>
                  Date<Text style={styles.required}>*</Text>
                </Text>
                <TextInput value={date} onChangeText={setDate} style={styles.input} />
              </View>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Title *"
                placeholderTextColor={TEXT}
                style={styles.singleInput}
              />

              <TouchableOpacity
                activeOpacity={0.84}
                style={styles.assignBox}
                onPress={() => setTeacherModalVisible(true)}>
                <Text style={[styles.assignText, selectedStaffText && styles.assignSelected]}>
                  {loadingTeachers ? 'Loading teachers...' : selectedStaffText || 'Assign To *'}
                </Text>
                <ChevronDown size={19} color={TEXT} strokeWidth={2} />
              </TouchableOpacity>

              <Text style={styles.documentTypeLabel}>
                Document Type <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.radioRow}>
                {['Image', 'File'].map(item => {
                  const active = documentType === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.8}
                      style={styles.radioOption}
                      onPress={() => {
                        setDocumentType(item);
                        setSelectedFile(null);
                      }}>
                      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                        {active ? <View style={styles.radioInner} /> : null}
                      </View>
                      <Text style={styles.radioText}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity activeOpacity={0.84} style={styles.uploadBox} onPress={pickFile}>
                <Text style={styles.uploadText} numberOfLines={1}>
                  {selectedFile?.name || 'Upload doc/image'}
                </Text>
                <View style={styles.plusBox}>
                  <Plus size={35} color={RED} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.84}
                disabled={submitting}
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={handleSubmit}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {loadingDocs ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color={PURPLE} />
                  <Text style={styles.loadingText}>Loading documents...</Text>
                </View>
              ) : documents.length ? (
                documents.map(document => (
                  <DocumentCard key={document.id || `${document.title}-${document.date}`} document={document} />
                ))
              ) : (
                <Text style={styles.emptyText}>No uploaded document found.</Text>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <TeacherModal
        visible={teacherModalVisible}
        teachers={teachers}
        selectedIds={selectedStaff}
        searchText={teacherSearch}
        onSearchText={setTeacherSearch}
        onToggle={toggleTeacher}
        onSelectAll={toggleSelectAll}
        onClose={() => setTeacherModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#FFFFFF'},
  page: {flex: 1, backgroundColor: '#FFFFFF'},
  content: {paddingHorizontal: 17, paddingTop: 23, paddingBottom: 36},
  tabRow: {flexDirection: 'row', marginBottom: 33},
  tabButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  activeTab: {backgroundColor: '#0798EA', borderColor: '#0798EA'},
  tabText: {color: TEXT, fontSize: 14, fontWeight: '700', marginLeft: 8},
  activeTabText: {color: '#FFFFFF'},
  inputBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginHorizontal: 11,
    marginBottom: 16,
  },
  inputLabel: {color: '#6D7179', fontSize: 11},
  required: {color: RED},
  input: {height: 22, padding: 0, color: TEXT, fontSize: 14},
  singleInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    color: TEXT,
    fontSize: 14,
    paddingHorizontal: 15,
    marginHorizontal: 11,
    marginBottom: 16,
  },
  assignBox: {
    height: 45,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginHorizontal: 11,
    marginBottom: 20,
  },
  assignText: {color: TEXT, fontSize: 14},
  assignSelected: {fontWeight: '700'},
  documentTypeLabel: {color: TEXT, fontSize: 14, marginHorizontal: 11, marginBottom: 12},
  radioRow: {flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 26},
  radioOption: {flexDirection: 'row', alignItems: 'center', marginRight: 28},
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  radioOuterActive: {borderColor: PURPLE},
  radioInner: {width: 10, height: 10, borderRadius: 5, backgroundColor: PURPLE},
  radioText: {color: TEXT, fontSize: 14},
  uploadBox: {
    height: 78,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 24,
    marginHorizontal: 11,
    marginBottom: 36,
  },
  uploadText: {flex: 1, color: TEXT, fontSize: 14, marginRight: 14},
  plusBox: {
    width: 62,
    height: 58,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: RED,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    height: 45,
    borderRadius: 7,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 11,
  },
  submitText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  disabledButton: {opacity: 0.65},
  card: {
    borderWidth: 1,
    borderColor: '#E0E4EA',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
    marginBottom: 15,
    overflow: 'hidden',
  },
  cardHeader: {
    minHeight: 34,
    backgroundColor: '#F1F1F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {color: TEXT, fontSize: 13, fontWeight: '700'},
  cardBody: {paddingHorizontal: 15, paddingTop: 17, paddingBottom: 16},
  detailRow: {flexDirection: 'row', marginBottom: 20},
  detailCell: {flex: 1},
  labelRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 7},
  detailLabel: {color: '#6D7179', fontSize: 12, marginLeft: 4},
  detailValue: {color: TEXT, fontSize: 13, fontWeight: '700', paddingLeft: 16},
  attachmentRow: {flexDirection: 'row', alignItems: 'center'},
  attachmentIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2F2F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  attachmentText: {color: TEXT, fontSize: 13, fontWeight: '700'},
  imageTitle: {color: TEXT, fontSize: 13, fontWeight: '700', marginBottom: 10},
  thumb: {width: 130, height: 96, borderRadius: 7, backgroundColor: '#F1F1F2'},
  centerBox: {minHeight: 180, alignItems: 'center', justifyContent: 'center'},
  loadingText: {color: '#777', fontSize: 13, marginTop: 10},
  emptyText: {color: '#777', fontSize: 14, marginTop: 50, textAlign: 'center'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {height: '84%', borderRadius: 10, backgroundColor: '#FFFFFF', padding: 18},
  modalTitle: {color: TEXT, fontSize: 14, fontWeight: '700', marginBottom: 15},
  teacherSearchBox: {
    height: 47,
    borderRadius: 8,
    backgroundColor: '#F1F1F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    marginBottom: 12,
  },
  teacherSearchInput: {flex: 1, color: TEXT, fontSize: 14, marginLeft: 12, paddingVertical: 0},
  teacherList: {flex: 1},
  teacherRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teacherText: {flex: 1, color: TEXT, fontSize: 12, marginRight: 10},
  checkBox: {width: 14, height: 14, borderWidth: 1, borderColor: TEXT, borderRadius: 3},
  checkedBox: {backgroundColor: PURPLE, borderColor: PURPLE},
  modalActions: {flexDirection: 'row', justifyContent: 'center', paddingTop: 16},
  modalButton: {
    width: 107,
    height: 46,
    borderRadius: 7,
    backgroundColor: '#F228B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  modalButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '800'},
});

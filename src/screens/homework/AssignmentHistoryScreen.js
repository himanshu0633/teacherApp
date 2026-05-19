import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../components/CommonHeader';
import { API_ENDPOINTS, BASE_URL } from '../../utils/constants';

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

const normalizeClass = item => ({
  id: getFirstValue(item, ['Classid', 'ClassId', 'classid', 'id']),
  name: getFirstValue(item, ['ClassName', 'Class', 'classname', 'name']),
});

const normalizeHomework = item => ({
  className: getFirstValue(item, ['ClassName', 'className']),
  sectionName: getFirstValue(item, ['SectionName', 'sectionName']),
  subjectName: getFirstValue(item, ['SubjectName', 'subjectName']),
  dueDate: getFirstValue(item, ['due_date', 'DueDate', 'dueDate']),
  description: getFirstValue(item, ['desp', 'Description', 'description']),
  imageUrl: getFirstValue(item, [
    'imgpath',
    'imagepath',
    'imagePath',
    'ImagePath',
  ]),
  fileType: getFirstValue(item, ['filetype', 'fileType', 'FileType']),
});

const normalizeClassName = value =>
  String(value || '')
    .trim()
    .replace(/^0+/, '');

async function loadTeacherContext() {
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
}

function PickerModal({ visible, items, loading, onClose, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Filter Class</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#5A33C5" style={styles.modalLoader} />
          ) : (
            <ScrollView style={styles.pickerList}>
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={() => onSelect(null)}
              >
                <Text style={styles.pickerOptionText}>All Classes</Text>
              </TouchableOpacity>

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
          )}
        </View>
      </View>
    </Modal>
  );
}

function ImagePreviewModal({ imageUrl, onClose }) {
  return (
    <Modal
      visible={Boolean(imageUrl)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.imageModalOverlay}>
        <TouchableOpacity style={styles.imageModalClose} onPress={onClose}>
          <Text style={styles.imageModalCloseText}>X</Text>
        </TouchableOpacity>

        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </Modal>
  );
}

export default function AssignmentHistoryScreen({ navigation, route }) {
  const type = route?.params?.type || 'assignment';
  const isHomework = type === 'homework';
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [homeworkList, setHomeworkList] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const filteredList = useMemo(() => {
    if (!selectedClass?.name) {
      return homeworkList;
    }

    return homeworkList.filter(
      item =>
        normalizeClassName(item.className) ===
        normalizeClassName(selectedClass.name),
    );
  }, [homeworkList, selectedClass]);

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
      Alert.alert('Error', 'Class list load nahi ho payi.');
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadHomeworkList = useCallback(async teacherContext => {
    if (
      !teacherContext?.EmpCode ||
      !teacherContext?.BranchId ||
      !teacherContext?.SessionId
    ) {
      return;
    }

    try {
      setLoadingList(true);
      const data = await postForm(API_ENDPOINTS.ASSIGNMENT_LIST, {
        empcode: teacherContext.EmpCode,
        branchid: teacherContext.BranchId,
        sessionid: teacherContext.SessionId,
      });
      const list = getListFromResponse(data).map(normalizeHomework);

      setHomeworkList(list);
    } catch (error) {
      console.log('homeworklist.php CALL ERROR =>', error);
      Alert.alert('Error', 'Homework history load nahi ho payi.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const teacherContext = await loadTeacherContext();
        await Promise.all([
          loadClasses(teacherContext),
          loadHomeworkList(teacherContext),
        ]);
      } catch (error) {
        console.log('HOMEWORK HISTORY INIT ERROR =>', error);
      }
    };

    init();
  }, [loadClasses, loadHomeworkList]);

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title={isHomework ? 'Homework History' : 'Assignment History'}
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={styles.filterBox}
            onPress={() => setClassModalVisible(true)}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.filterText,
                !selectedClass && styles.placeholderText,
              ]}
            >
              {selectedClass?.name || 'All Classes'}
            </Text>
            <Text style={styles.arrow}>v</Text>
          </TouchableOpacity>

          {loadingList ? (
            <ActivityIndicator color="#5A33C5" style={styles.loader} />
          ) : filteredList.length ? (
            filteredList.map((item, index) => (
              <HistoryCard
                key={`${item.dueDate}-${index}`}
                item={item}
                onOpenImage={setPreviewImageUrl}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Homework history empty hai.</Text>
          )}
        </ScrollView>
      </SafeAreaView>

      <PickerModal
        visible={classModalVisible}
        items={classes}
        loading={loadingClasses}
        onClose={() => setClassModalVisible(false)}
        onSelect={item => {
          setSelectedClass(item);
          setClassModalVisible(false);
        }}
      />

      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl('')}
      />
    </View>
  );
}

function HistoryCard({ item, onOpenImage }) {
  const hasImage = Boolean(item.imageUrl);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View />
        <View style={styles.dueBadge}>
          <Text style={styles.dueText}>Due Date: {item.dueDate || '-'}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>Class/Section</Text>
          <Text style={styles.value}>
            {item.className || '-'} / {item.sectionName || '-'}
          </Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.label}>Subject</Text>
          <Text style={styles.value}>{item.subjectName || '-'}</Text>
        </View>
      </View>

      <View style={styles.descBox}>
        <Text style={styles.descTitle}>Description</Text>
        <Text style={styles.descText}>{item.description || '-'}</Text>
      </View>

      {hasImage ? (
        <View style={styles.attachmentBox}>
          <Text style={styles.descTitle}>Attachment</Text>
          <TouchableOpacity onPress={() => onOpenImage(item.imageUrl)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.attachmentImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#5A33C5',
  },
  topSafe: {
    backgroundColor: '#5A33C5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  filterBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
  placeholderText: {
    color: '#777',
  },
  arrow: {
    fontSize: 16,
    color: '#222',
    marginLeft: 8,
  },
  loader: {
    marginTop: 30,
  },
  emptyText: {
    marginTop: 30,
    color: '#777',
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardTop: {
    height: 34,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingRight: 18,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dueBadge: {
    backgroundColor: '#039BE5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  dueText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 18,
  },
  infoCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: '#222',
  },
  descBox: {
    marginHorizontal: 15,
    backgroundColor: '#F0F0F4',
    borderWidth: 1,
    borderColor: '#E0E0E6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
  },
  descTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#222',
    marginBottom: 6,
  },
  descText: {
    fontSize: 12,
    color: '#777',
    lineHeight: 18,
  },
  attachmentBox: {
    marginHorizontal: 15,
    marginBottom: 14,
  },
  attachmentImage: {
    width: '100%',
    height: 190,
    borderRadius: 8,
    backgroundColor: '#E8E8EE',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  imageModalClose: {
    position: 'absolute',
    top: 44,
    right: 20,
    zIndex: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalCloseText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '800',
  },
  fullImage: {
    width: '100%',
    height: '86%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
});

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function MarkEntryScreen({navigation}) {
  const [showStudents, setShowStudents] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [students, setStudents] = useState([
    {id: 1, name: 'Rohini Thakur', roll: '123', adm: '123456', marks: '10', status: 'P'},
    {id: 2, name: 'Abhilasha Chaturvedi', roll: '123', adm: '123456', marks: '0', status: 'A'},
    {id: 3, name: 'Kumar Mangalam', roll: '123', adm: '123456', marks: '0', status: 'M'},
    {id: 4, name: 'Ravneet Bittu', roll: '123', adm: '123456', marks: '0', status: 'E'},
    {id: 5, name: 'Sukwinder Sukhu', roll: '123', adm: '123456', marks: '9', status: 'P'},
    {id: 6, name: 'Bhagwant Maan', roll: '123', adm: '123456', marks: '8', status: 'P', disabled: true},
  ]);

  const updateMarks = (id, marks) => {
    setStudents(prev =>
      prev.map(item => (item.id === id ? {...item, marks} : item)),
    );
  };

  const openStatus = id => {
    setSelectedStudentId(id);
    setStatusModal(true);
  };

  const updateStatus = status => {
    setStudents(prev =>
      prev.map(item =>
        item.id === selectedStudentId ? {...item, status} : item,
      ),
    );
    setStatusModal(false);
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title="Marks Entry"
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        {!showStudents ? (
          <ScrollView contentContainerStyle={styles.formContent}>
            <SelectBox label="Class" value="10th - Rose" smallLabel />
            <SelectBox label="Exam Head" />
            <SelectBox label="Exam Type" />
            <SelectBox label="Exam Test" />
            <SelectBox label="Type" />
            <SelectBox label="Subject" />
            <SelectBox label="Maximum Marks" />
            <SelectBox label="Exam Date" />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.showBtn}
              onPress={() => setShowStudents(true)}>
              <Text style={styles.showText}>Show</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.studentScreen}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.studentContent}>
              <Text style={styles.classTitle}>10th - Rose</Text>
              <Text style={styles.examInfo}>
                Class Test - MCQ - Th - Computer Science - Max Marks 10
              </Text>

              <View style={styles.totalBox}>
                <Text style={styles.totalIcon}>🎓</Text>
                <Text style={styles.totalLabel}>Total Students</Text>
                <Text style={styles.totalCount}>38</Text>
              </View>

              {students.map(item => (
                <StudentCard
                  key={item.id}
                  item={item}
                  onMarksChange={updateMarks}
                  onStatusPress={openStatus}
                />
              ))}
            </ScrollView>

            <View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.bottomBtnText}>Save Marks</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.lockBtn}>
                <Text style={styles.bottomBtnText}>Lock Marks</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Modal visible={statusModal} transparent animationType="fade">
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={() => setStatusModal(false)}>
            <View style={styles.statusPanel}>
              <StatusButton
                title="Present"
                style={styles.presentBtn}
                onPress={() => updateStatus('P')}
              />
              <StatusButton
                title="Absent"
                style={styles.absentBtn}
                onPress={() => updateStatus('A')}
              />
              <StatusButton
                title="Medical"
                style={styles.medicalBtn}
                onPress={() => updateStatus('M')}
              />
              <StatusButton
                title="Exempted"
                style={styles.exemptedBtn}
                onPress={() => updateStatus('E')}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

function SelectBox({label, value, smallLabel}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.selectBox}>
      <View>
        {smallLabel && (
          <Text style={styles.smallSelectLabel}>
            {label} <Text style={styles.star}>*</Text>
          </Text>
        )}

        <Text style={styles.selectText}>
          {smallLabel ? value : label} <Text style={styles.star}>*</Text>
        </Text>
      </View>

      <Text style={styles.arrow}>⌄</Text>
    </TouchableOpacity>
  );
}

function StudentCard({item, onMarksChange, onStatusPress}) {
  const statusStyle =
    item.status === 'P'
      ? styles.statusPresent
      : item.status === 'A'
      ? styles.statusAbsent
      : item.status === 'M'
      ? styles.statusMedical
      : styles.statusExempted;

  return (
    <View style={[styles.studentCard, item.disabled && styles.disabledCard]}>
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, item.disabled && styles.disabledText]}>
          {item.name}
        </Text>
        <Text style={[styles.studentMeta, item.disabled && styles.disabledText]}>
          Roll No: {item.roll}
        </Text>
        <Text style={[styles.studentMeta, item.disabled && styles.disabledText]}>
          Adm No: {item.adm}
        </Text>
      </View>

      <TextInput
        value={item.marks}
        editable={!item.disabled}
        keyboardType="numeric"
        onChangeText={text => onMarksChange(item.id, text)}
        style={[styles.marksInput, item.disabled && styles.disabledText]}
      />

      <TouchableOpacity
        disabled={item.disabled}
        activeOpacity={0.8}
        style={[styles.statusCircle, statusStyle]}
        onPress={() => onStatusPress(item.id)}>
        <Text style={styles.statusText}>{item.status}</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatusButton({title, style, onPress}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.statusBtn, style]} onPress={onPress}>
      <Text style={styles.statusBtnText}>{title}</Text>
    </TouchableOpacity>
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

  formContent: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 30,
  },
  selectBox: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallSelectLabel: {
    fontSize: 9,
    color: '#777',
    marginBottom: 2,
  },
  selectText: {
    fontSize: 14,
    color: '#222',
  },
  star: {
    color: 'red',
  },
  arrow: {
    fontSize: 22,
    color: '#222',
    marginTop: -6,
  },
  showBtn: {
    height: 45,
    borderRadius: 8,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  showText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  studentScreen: {
    flex: 1,
  },
  studentContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 100,
  },
  classTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
  },
  examInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  totalBox: {
    height: 45,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#BFE3F9',
    backgroundColor: '#F3FCFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 26,
  },
  totalIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  totalLabel: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    fontWeight: '800',
  },
  totalCount: {
    fontSize: 14,
    color: '#009BEF',
    fontWeight: '900',
  },
  studentCard: {
    minHeight: 68,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#BFE3F9',
    backgroundColor: '#fff',
    paddingHorizontal: 13,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledCard: {
    opacity: 0.35,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#222',
    marginBottom: 2,
  },
  studentMeta: {
    fontSize: 10,
    color: '#666',
    lineHeight: 14,
  },
  marksInput: {
    width: 38,
    height: 32,
    padding: 0,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    textAlign: 'center',
    fontSize: 14,
    color: '#222',
  },
  statusCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPresent: {
    backgroundColor: '#CBF7C8',
  },
  statusAbsent: {
    backgroundColor: '#FFD1D1',
  },
  statusMedical: {
    backgroundColor: '#CBEFFF',
  },
  statusExempted: {
    backgroundColor: '#FFD1F0',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15A2EF',
  },

  bottomButtons: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveBtn: {
    width: '45%',
    height: 44,
    borderRadius: 7,
    backgroundColor: '#5A33C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtn: {
    width: '45%',
    height: 44,
    borderRadius: 7,
    backgroundColor: '#039BE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  statusPanel: {
    marginTop: 60,
  },
  statusBtn: {
    height: 45,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  presentBtn: {
    backgroundColor: '#2FC82D',
  },
  absentBtn: {
    backgroundColor: '#FF494F',
  },
  medicalBtn: {
    backgroundColor: '#129CE5',
  },
  exemptedBtn: {
    backgroundColor: '#F124B8',
  },
  statusBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
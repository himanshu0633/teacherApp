import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {ChevronDown, CircleCheck, Plus} from 'lucide-react-native';
import {CircularHeader, CircularTabs} from './CircularComponents';
import {TEXT, circularStyles as baseStyles} from './circularStyles';

const students = [
  {
    id: '1',
    name: 'Malvika Sharma',
    admissionNo: '113245',
    className: 'UKG',
    section: 'Rose',
    rollNo: '123',
    selected: true,
  },
  {
    id: '2',
    name: 'Malvika Sharma',
    admissionNo: '113245',
    className: 'UKG',
    section: 'Rose',
    rollNo: '123',
    selected: false,
  },
];

function RequiredText({children}) {
  return (
    <Text>
      {children}
      <Text style={baseStyles.required}>*</Text>
    </Text>
  );
}

function SelectField({placeholder}) {
  return (
    <TouchableOpacity style={baseStyles.field} activeOpacity={0.75}>
      <Text style={baseStyles.fieldText}>
        <RequiredText>{placeholder}</RequiredText>
      </Text>
      <ChevronDown size={19} color={TEXT} strokeWidth={2} />
    </TouchableOpacity>
  );
}

function StudentCard({student}) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <Text style={styles.studentName}>{student.name}</Text>
        <CircleCheck
          size={20}
          color={student.selected ? '#22B63A' : '#CFEAF8'}
          strokeWidth={2}
        />
      </View>

      <View style={styles.studentGrid}>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Admission No.</Text>
          <Text style={styles.studentValue}>{student.admissionNo}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Class</Text>
          <Text style={styles.studentValue}>{student.className}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Section</Text>
          <Text style={styles.studentValue}>{student.section}</Text>
        </View>
        <View style={styles.studentCell}>
          <Text style={styles.studentLabel}>Roll No.</Text>
          <Text style={styles.studentValue}>{student.rollNo}</Text>
        </View>
      </View>
    </View>
  );
}

export default function StudentCircularScreen({navigation}) {
  const handleSubmit = () => {
    Alert.alert('Success', 'Student circular submitted successfully.');
  };

  return (
    <View style={baseStyles.wrapper}>
      <CircularHeader
        title="Student Circular"
        onBack={() => navigation.goBack()}
      />

      <SafeAreaView style={baseStyles.page}>
        <CircularTabs
          active="create"
          onCreate={() => {}}
          onList={() => navigation.navigate('MyCircularListScreen')}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={[baseStyles.field, baseStyles.dateField]}>
            <Text style={baseStyles.dateLabel}>
              Date <Text style={baseStyles.required}>*</Text>
            </Text>
            <Text style={baseStyles.dateValue}>31-07-2023</Text>
          </View>

          <TextInput
            style={baseStyles.field}
            placeholder="Circular Title *"
            placeholderTextColor={TEXT}
          />

          <SelectField placeholder="Student Type " />
          <SelectField placeholder="Select Group " />
          <SelectField placeholder="Select Class " />

          {students.map(student => (
            <StudentCard key={student.id} student={student} />
          ))}

          <TextInput
            style={styles.messageBox}
            placeholder="Message *"
            placeholderTextColor={TEXT}
            multiline
            textAlignVertical="top"
          />

          <View style={baseStyles.uploadField}>
            <Text style={baseStyles.uploadText}>Upload File</Text>
            <TouchableOpacity style={baseStyles.uploadButton} activeOpacity={0.75}>
              <Plus size={42} color="#FF0712" strokeWidth={1.9} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={baseStyles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.82}>
            <Text style={baseStyles.submitText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 28,
    paddingTop: 17,
    paddingBottom: 44,
  },
  studentCard: {
    borderWidth: 1,
    borderColor: '#BDE6FA',
    borderRadius: 7,
    backgroundColor: '#F4FCFF',
    marginBottom: 15,
    overflow: 'hidden',
  },
  studentHeader: {
    height: 38,
    borderBottomWidth: 1,
    borderBottomColor: '#D4E7F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  studentName: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 2,
  },
  studentCell: {
    width: '50%',
    marginBottom: 14,
  },
  studentLabel: {
    color: '#6D7179',
    fontSize: 12,
    marginBottom: 5,
  },
  studentValue: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  messageBox: {
    minHeight: 98,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    color: TEXT,
    fontSize: 14,
    paddingHorizontal: 15,
    paddingTop: 14,
    marginTop: 2,
    marginBottom: 18,
  },
});

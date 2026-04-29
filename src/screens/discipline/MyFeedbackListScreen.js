import React, {useState} from 'react';
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Frown, Smile} from 'lucide-react-native';
import DisciplineHeader from './DisciplineHeader';
import {BLUE, TEXT, disciplineStyles as baseStyles} from './DisciplineStyles';
import {StyleSheet} from 'react-native';

const feedbackItems = [
  {
    id: '1',
    name: 'Malvika Sharma',
    date: '31-07-2023 11:40 AM',
    admissionNo: '113245',
    className: 'UKG',
    section: 'Rose',
    rollNo: '123',
    remarks: 'Full Attendance for the month',
  },
  {
    id: '2',
    name: 'Malvika Sharma',
    date: '31-07-2023 11:40 AM',
    admissionNo: '113245',
    className: 'UKG',
    section: 'Rose',
    rollNo: '123',
    remarks: 'Full Attendance for the month',
  },
];

function TypeTab({active, label, Icon, onPress}) {
  return (
    <TouchableOpacity
      style={[styles.typeTab, active && styles.activeTypeTab]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Icon size={19} color={active ? '#FFFFFF' : TEXT} strokeWidth={2} />
      <Text style={[styles.typeTabText, active && styles.activeTypeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FeedbackCard({item}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.studentName}>{item.name}</Text>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.studentGrid}>
          <View style={styles.studentCell}>
            <Text style={styles.studentLabel}>Admission No.</Text>
            <Text style={styles.studentValue}>{item.admissionNo}</Text>
          </View>
          <View style={styles.studentCell}>
            <Text style={styles.studentLabel}>Class</Text>
            <Text style={styles.studentValue}>{item.className}</Text>
          </View>
          <View style={styles.studentCell}>
            <Text style={styles.studentLabel}>Section</Text>
            <Text style={styles.studentValue}>{item.section}</Text>
          </View>
          <View style={styles.studentCell}>
            <Text style={styles.studentLabel}>Roll No.</Text>
            <Text style={styles.studentValue}>{item.rollNo}</Text>
          </View>
        </View>

        <View style={styles.remarksBox}>
          <Text style={styles.remarksTitle}>Remarks</Text>
          <Text style={styles.remarksText}>{item.remarks}</Text>
        </View>
      </View>
    </View>
  );
}

export default function MyFeedbackListScreen({navigation}) {
  const [type, setType] = useState('Smiley');

  return (
    <View style={baseStyles.wrapper}>
      <DisciplineHeader
        title="My Feedback List"
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={baseStyles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.tabs}>
            <TypeTab
              active={type === 'Smiley'}
              label="Smiley"
              Icon={Smile}
              onPress={() => setType('Smiley')}
            />
            <TypeTab
              active={type === 'Frowny'}
              label="Frowny"
              Icon={Frown}
              onPress={() => setType('Frowny')}
            />
          </View>

          {feedbackItems.map(item => (
            <FeedbackCard key={`${type}-${item.id}`} item={item} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 36,
  },
  tabs: {
    flexDirection: 'row',
    gap: 13,
    paddingHorizontal: 23,
    marginBottom: 34,
  },
  typeTab: {
    flex: 1,
    height: 39,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  activeTypeTab: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  typeTabText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  activeTypeTabText: {
    color: '#FFFFFF',
  },
  card: {
    borderWidth: 1,
    borderColor: '#B9DFF2',
    borderRadius: 7,
    backgroundColor: '#F1FBFF',
    marginBottom: 21,
    overflow: 'hidden',
  },
  cardHeader: {
    minHeight: 39,
    borderBottomWidth: 1,
    borderBottomColor: '#D7E5EC',
    paddingLeft: 17,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  datePill: {
    height: 20,
    borderRadius: 10,
    backgroundColor: BLUE,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 17,
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  studentCell: {
    width: '50%',
    marginBottom: 12,
  },
  studentLabel: {
    color: '#6F737B',
    fontSize: 12,
    marginBottom: 5,
  },
  studentValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  remarksBox: {
    minHeight: 64,
    borderRadius: 7,
    backgroundColor: '#D9EFFB',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  remarksTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  remarksText: {
    color: TEXT,
    fontSize: 12,
  },
});

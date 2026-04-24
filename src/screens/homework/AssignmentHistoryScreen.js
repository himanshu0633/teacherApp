import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function AssignmentHistoryScreen({navigation, route}) {
  const type = route?.params?.type || 'assignment';
  const isHomework = type === 'homework';

  const data = isHomework
    ? [
        {
          dueDate: '12-08-2023',
          classSection: '9th - Tulip',
          subject: 'Computer Science',
          description:
            '1. What is HTML?\n2. Write the full form of CPU.',
          hasAttachment: false,
        },
        {
          dueDate: '12-08-2023',
          classSection: '9th - Tulip',
          subject: 'Computer Science',
          description:
            '1. Define computer.\n2. Write any four input devices.',
          hasAttachment: false,
        },
      ]
    : [
        {
          dueDate: '12-08-2023',
          classSection: '9th - Tulip',
          subject: 'Computer Science',
          description:
            '1. What do you understand by micro computers?\n2. Explain the four types of computer.',
          hasAttachment: true,
        },
        {
          dueDate: '12-08-2023',
          classSection: '9th - Tulip',
          subject: 'Computer Science',
          description:
            '1. What do you understand by micro computers?\n2. Explain the four types of computer.',
          hasAttachment: true,
        },
      ];

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
          {data.map((item, index) => (
            <HistoryCard key={index} item={item} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HistoryCard({item}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View />
        <View style={styles.dueBadge}>
          <Text style={styles.dueText}>Due Date: {item.dueDate}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>Class/Section</Text>
          <Text style={styles.value}>{item.classSection}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.label}>Subject</Text>
          <Text style={styles.value}>{item.subject}</Text>
        </View>
      </View>

      <View style={styles.descBox}>
        <Text style={styles.descTitle}>Description</Text>
        <Text style={styles.descText}>{item.description}</Text>
      </View>

      {item.hasAttachment && (
        <TouchableOpacity style={styles.attachmentRow}>
          <View style={styles.attachIconBox}>
            <Text style={styles.attachIcon}>🔗</Text>
          </View>
          <Text style={styles.attachText}>View Attachment</Text>
        </TouchableOpacity>
      )}
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
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 18,
  },
  attachIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attachIcon: {
    fontSize: 17,
  },
  attachText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#222',
  },
});
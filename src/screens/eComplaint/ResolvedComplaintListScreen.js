import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import {ComplaintCard} from './ComplaintListComponents';
import {complaintRecords} from './complaintData';

export default function ResolvedComplaintListScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="Resolved Complaint List"
        onBack={() => navigation.goBack()}
      />

      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {complaintRecords.map(record => (
            <ComplaintCard key={record.id} record={record} status="Resolved" />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
  },
});

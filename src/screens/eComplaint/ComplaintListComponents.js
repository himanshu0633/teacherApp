import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Clock, Send, UserRound} from 'lucide-react-native';

const TEXT = '#202124';
const GREEN = '#23B935';
const RED = '#FF4148';

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

export function ComplaintCard({record, status}) {
  const isResolved = status === 'Resolved';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complaint Detail</Text>
        <View style={[styles.statusPill, isResolved ? styles.resolvedPill : styles.pendingPill]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.detailsGrid}>
          <DetailCell Icon={Clock} label="Complain Date" value={record.date} />
          <DetailCell Icon={Send} label="Location" value={record.location} />
          <DetailCell Icon={UserRound} label="Complaint By" value={record.complaintBy} />
          <DetailCell Icon={UserRound} label="Complaint To" value={record.complaintTo} />
        </View>

        <View style={styles.complaintBox}>
          <Text style={styles.boxTitle}>Complaint</Text>
          <Text style={styles.boxText}>{record.complaint}</Text>
        </View>

        {isResolved && (
          <View style={styles.resolvedBox}>
            <Text style={styles.boxTitle}>Resolved Description</Text>
            <Text style={styles.boxText}>{record.resolvedDescription}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#E1E5EC',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginBottom: 17,
    overflow: 'hidden',
  },
  header: {
    minHeight: 33,
    backgroundColor: '#F1F1F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
  statusPill: {
    minWidth: 72,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pendingPill: {
    backgroundColor: RED,
  },
  resolvedPill: {
    backgroundColor: GREEN,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 18,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 13,
  },
  detailCell: {
    width: '50%',
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  detailLabel: {
    color: '#6D7179',
    fontSize: 12,
    marginLeft: 4,
  },
  detailValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
    paddingLeft: 16,
  },
  complaintBox: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 8,
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 13,
  },
  resolvedBox: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#BCEFC3',
    borderRadius: 8,
    backgroundColor: '#EEFFF0',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 13,
    marginTop: 14,
  },
  boxTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  boxText: {
    color: '#666A70',
    fontSize: 12,
    lineHeight: 18,
  },
});

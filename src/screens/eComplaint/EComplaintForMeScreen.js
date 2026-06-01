import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import {ComplaintCard} from './ComplaintListComponents';
import {
  fetchForMeComplaints,
  getTeacherContext,
  isSuccess,
  resolveComplaint,
} from './complaintApi';

const PURPLE = '#5A33C5';
const TEXT = '#202124';

export default function EComplaintForMeScreen({navigation}) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [reason, setReason] = useState('');

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const context = await getTeacherContext();
      const records = await fetchForMeComplaints(context.EmpCode);
      setComplaints(records);
    } catch (error) {
      console.log('FOR ME COMPLAINT LIST ERROR =>', error);
      Alert.alert('Error', 'E-Complaint for me list could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadComplaints);
    return unsubscribe;
  }, [loadComplaints, navigation]);

  const closeResolveModal = () => {
    setSelectedComplaint(null);
    setReason('');
  };

  const handleResolve = async () => {
    if (!selectedComplaint?.id) {
      Alert.alert('Error', 'Complaint id not found.');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Required', 'Please enter resolved description.');
      return;
    }

    setResolving(true);
    try {
      const data = await resolveComplaint({
        id: selectedComplaint.id,
        reason: reason.trim(),
      });

      if (isSuccess(data) || String(data?.status || '').toUpperCase() === 'SUCCESS') {
        Alert.alert('Success', data?.message || data?.msg || 'Complaint resolved.');
        closeResolveModal();
        loadComplaints();
        return;
      }

      Alert.alert('Error', data?.message || data?.msg || 'Complaint could not be resolved.');
    } catch (error) {
      console.log('E-COMPLAINT RESOLVE ERROR =>', error);
      Alert.alert('Error', 'Complaint could not be resolved.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        title="E-Complaint For Me"
        onBack={() => navigation.goBack()}
        safeAreaTop
      />

      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={PURPLE} />
              <Text style={styles.loadingText}>Loading records...</Text>
            </View>
          ) : complaints.length ? (
            complaints.map(record => (
              <ComplaintCard
                key={record.id}
                record={record}
                status="Pending"
                personLabel="Complaint By"
                actionLabel="Resolve"
                onAction={() => setSelectedComplaint(record)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No complaint assigned to you.</Text>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={Boolean(selectedComplaint)}
        transparent
        animationType="fade"
        onRequestClose={closeResolveModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Resolve Complaint</Text>
            <View style={styles.reasonBox}>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Resolved description *"
                placeholderTextColor={TEXT}
                multiline
                textAlignVertical="top"
                style={styles.reasonInput}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.84}
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeResolveModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.84}
                disabled={resolving}
                style={[styles.modalButton, styles.resolveButton, resolving && styles.disabledButton]}
                onPress={handleResolve}>
                {resolving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.resolveText}>Resolve</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: PURPLE},
  page: {flex: 1, backgroundColor: '#fff'},
  content: {paddingHorizontal: 20, paddingTop: 28, paddingBottom: 36},
  centerBox: {minHeight: 180, alignItems: 'center', justifyContent: 'center'},
  loadingText: {color: '#777', fontSize: 13, marginTop: 10},
  emptyText: {color: '#777', fontSize: 14, marginTop: 50, textAlign: 'center'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 16,
  },
  modalTitle: {fontSize: 16, color: TEXT, fontWeight: '800', marginBottom: 14},
  reasonBox: {
    minHeight: 110,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    paddingHorizontal: 13,
    paddingTop: 11,
  },
  reasonInput: {minHeight: 88, padding: 0, color: TEXT, fontSize: 14},
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    width: '48%',
    height: 42,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {backgroundColor: '#F1F1F2'},
  resolveButton: {backgroundColor: PURPLE},
  cancelText: {color: TEXT, fontSize: 14, fontWeight: '800'},
  resolveText: {color: '#fff', fontSize: 14, fontWeight: '800'},
  disabledButton: {opacity: 0.65},
});

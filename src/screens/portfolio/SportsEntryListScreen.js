import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonHeader from '../../components/CommonHeader';
import {API_ENDPOINTS} from '../../utils/constants';
import {postForm} from '../../services/teacherApi';

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

const categoryLabel = value => {
  if (String(value) === '1180') {
    return 'Participation';
  }
  if (String(value) === '1181') {
    return 'Achievement';
  }
  return value || '-';
};

const isImageFile = url => /\.(png|jpe?g|gif|webp|jfif)$/i.test(url || '');

export default function SportsEntryListScreen({navigation}) {
  return (
    <EntryListScreen
      navigation={navigation}
      title="Sports Entry List"
      awardLabel="Achievement/Award"
      activityLabel="Sports"
    />
  );
}

export function EntryListScreen({navigation, title, awardLabel, activityLabel}) {
  const [entries, setEntries] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const context = teacher || (await getTeacherContext());
      setTeacher(context);
      console.log('SPORTS ENTRY LIST CONTEXT =>', context);

      if (!context.BranchId || !context.SessionId || !context.EmpCode) {
        console.log('SPORTS ENTRY LIST MISSING CONTEXT =>', context);
  Alert.alert('Error', 'Branch, session or employee details not found.');
        return;
      }

      const payload = {
        BranchId: context.BranchId,
        SessionId: context.SessionId,
        empcode: context.EmpCode,
      };
      console.log('SPORTS ENTRY LIST PAYLOAD =>', payload);

      const data = await postForm(API_ENDPOINTS.SPORTS_ENTRY_LIST, payload);
      console.log('SPORTS ENTRY LIST RESPONSE =>', data);

      if (data?.status === 'true') {
        const list = data?.response?.Rest || [];
        console.log('SPORTS ENTRY LIST COUNT =>', list.length);
        setEntries(list);
      } else {
        setEntries([]);
  Alert.alert('No Data', data?.msg || 'No sports entries found.');
      }
    } catch (error) {
      console.log('SPORTS ENTRY LIST ERROR =>', error);
  Alert.alert('Error', 'Failed to load sports entries list.');
    } finally {
      setLoading(false);
    }
  }, [teacher]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadEntries);
    return unsubscribe;
  }, [loadEntries, navigation]);

  const deleteEntry = entry => {
    Alert.alert('Delete Entry', 'Kya aap ye sports entry delete karna chahte hain?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(entry.Id);
          try {
            const payload = {
              id: entry.Id,
            };
            console.log('SPORTS ENTRY DELETE PAYLOAD =>', payload);

            const data = await postForm(API_ENDPOINTS.SPORTS_ENTRY_DELETE, payload);
            console.log('SPORTS ENTRY DELETE RESPONSE =>', data);

            if (data?.status === 'true') {
              setEntries(prev => prev.filter(item => item.Id !== entry.Id));
              Alert.alert('Success', data?.msg || 'Sports entry deleted successfully.');
            } else {
              Alert.alert('Error', data?.msg || 'Failed to delete sports entry.');
            }
          } catch (error) {
            console.log('SPORTS ENTRY DELETE ERROR =>', error);
            Alert.alert('Error', 'Failed to delete sports entry.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor="#5A33C5" barStyle="light-content" />

      <SafeAreaView style={styles.topSafe}>
        <CommonHeader
          title={title}
          onBack={() => navigation.goBack()}
          backgroundColor="#5A33C5"
        />
      </SafeAreaView>

      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color="#5A33C5" />
            </View>
          ) : entries.length ? (
            entries.map(entry => (
              <EntryCard
                key={entry.Id}
                entry={entry}
                awardLabel={awardLabel}
                activityLabel={activityLabel}
                deleting={deletingId === entry.Id}
                onDelete={() => deleteEntry(entry)}
              />
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Sports entry list empty hai.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function EntryCard({entry, awardLabel, activityLabel, deleting, onDelete}) {
  const fileUrl = entry?.file || '';

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.name}>{entry?.stname || '-'}</Text>
        <TouchableOpacity disabled={deleting} onPress={onDelete}>
          {deleting ? (
            <ActivityIndicator color="#E83939" size="small" />
          ) : (
            <Text style={styles.delete}>×</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Info label="Adm No." value={entry?.adminno || '-'} />
        <Info label="Class" value={entry?.classname || '-'} />
        <Info label="Year" value={entry?.Year || '-'} />
        <Info label={awardLabel} value={entry?.PrizeWon || '-'} />
        <Info label="Level" value={entry?.Level || '-'} />
        <Info label="Category" value={categoryLabel(entry?.category)} />
        <Info label={activityLabel} value={entry?.SportsName || '-'} />

        <Text style={styles.descTitle}>Description</Text>
        <Text style={styles.descText}>{entry?.des || '-'}</Text>

        {fileUrl ? (
          <>
            <Text style={styles.imageTitle}>Attachment</Text>
            {isImageFile(fileUrl) ? (
              <TouchableOpacity onPress={() => Linking.openURL(fileUrl)}>
                <Image source={{uri: fileUrl}} style={styles.thumb} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.fileBtn}
                onPress={() => Linking.openURL(fileUrl)}>
                <Text style={styles.fileBtnText}>Open File</Text>
              </TouchableOpacity>
            )}
          </>
        ) : null}
      </View>
    </View>
  );
}

function Info({label, value}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#5A33C5'},
  topSafe: {backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  content: {paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30},
  centerBox: {paddingVertical: 40, alignItems: 'center'},
  emptyBox: {
    minHeight: 110,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {fontSize: 13, color: '#777', textAlign: 'center'},
  card: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  cardHead: {
    minHeight: 34,
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {flex: 1, fontSize: 14, color: '#0098EE', fontWeight: '800'},
  delete: {
    width: 24,
    height: 24,
    borderRadius: 12,
    color: '#E83939',
    fontSize: 24,
    lineHeight: 23,
    textAlign: 'center',
  },
  body: {paddingHorizontal: 15, paddingTop: 16, paddingBottom: 16},
  infoRow: {flexDirection: 'row', marginBottom: 10},
  label: {width: '54%', fontSize: 13, color: '#222', fontWeight: '800'},
  value: {flex: 1, fontSize: 13, color: '#777'},
  descTitle: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
    color: '#222',
    fontWeight: '800',
  },
  descText: {fontSize: 12, color: '#777', lineHeight: 16, marginBottom: 15},
  imageTitle: {fontSize: 13, color: '#222', fontWeight: '800', marginBottom: 10},
  thumb: {width: 66, height: 50, borderRadius: 7, resizeMode: 'cover'},
  fileBtn: {
    height: 36,
    alignSelf: 'flex-start',
    borderRadius: 7,
    backgroundColor: '#5A33C5',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  fileBtnText: {fontSize: 13, color: '#fff', fontWeight: '800'},
});

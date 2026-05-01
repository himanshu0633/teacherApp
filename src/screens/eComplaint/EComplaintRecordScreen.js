import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Clock, FileCheck, TriangleAlert} from 'lucide-react-native';
import CommonHeader from '../../components/CommonHeader';

const BLUE = '#0798EA';
const TEXT = '#202124';

function TypeCard({type, Icon, iconColor, onPress}) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.typeCard} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Icon size={47} color={iconColor} strokeWidth={1.9} />
        {type === 'Pending' && (
          <View style={styles.clockBadge}>
            <Clock size={20} color="#111" strokeWidth={2} />
          </View>
        )}
      </View>
      <Text style={styles.typeText}>{type}</Text>
    </TouchableOpacity>
  );
}

export default function EComplaintRecordScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <CommonHeader title="E-Complaint Record" onBack={() => navigation.goBack()} />

      <SafeAreaView style={styles.page}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Choose Complaint Type</Text>

          <View style={styles.typeRow}>
            <TypeCard
              type="Resolved"
              Icon={FileCheck}
              iconColor="#111111"
              onPress={() => navigation.navigate('ResolvedComplaintListScreen')}
            />
            <TypeCard
              type="Pending"
              Icon={TriangleAlert}
              iconColor="#FDBB1C"
              onPress={() => navigation.navigate('PendingComplaintListScreen')}
            />
          </View>
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
    paddingHorizontal: 23,
    paddingTop: 34,
    paddingBottom: 36,
  },
  heading: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 23,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '45.5%',
    height: 120,
    borderRadius: 7,
    backgroundColor: '#F1F1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 62,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  clockBadge: {
    position: 'absolute',
    right: 1,
    bottom: 3,
    width: 29,
    height: 29,
    borderRadius: 14.5,
    borderWidth: 2,
    borderColor: '#00C8B7',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
  },
});

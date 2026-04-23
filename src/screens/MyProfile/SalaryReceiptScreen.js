import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';

export default function SalaryReceiptScreen({navigation}) {
  const downloadIcon = <Text style={{fontSize: 20, color: '#5A33C5'}}>⤓</Text>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader
          title="Salary Receipt"
          onBack={() => navigation.goBack()}
          rightIcon={<View style={styles.downloadCircle}>{downloadIcon}</View>}
        />

        <ScrollView contentContainerStyle={styles.content}>
          <Image
            source={require('../../assets/images/logoAndroid.png')}
            style={styles.logo}
          />

          <Text style={styles.schoolName}>
            Him Academy Public School, Hiranagar
          </Text>
          <Text style={styles.monthText}>Pay Slip for the Month of June 2023</Text>

          <SectionCard title="Employee Detail" titleColor="#1693E7">
            <Row label="Employee Code" value="307" />
            <Row label="Job Type" value="Regular" />
            <Row label="Name" value="Vipan Sharma" />
            <Row label="No. of Days" value="30" />
            <Row label="Designation" value="IT - Teacher" />
            <Row label="No. of Presents" value="30.00" />
            <Row label="Account No." value="502839402735" />
            <Row label="Extra Days" value="8.00" />
            <Row label="UAN No." value="10046372894" />
          </SectionCard>

          <SectionCard title="Earning Detail" redTitle>
            <Row label="Basic Pay" value="13840.00" />
            <Row label="Grade Pay" value="3800.00" />
            <Row label="Holidays Pay" value="9408.00" />
            <Row label="DA" value="17640.00" />
            <Row label="Practice Allowance" value="0.00" />
            <Row label="Allowance" value="0.00" />
            <Row label="Coaching Allowance" value="2200.00" />
            <Row label="Study Hours" value="0.00" />
            <Row label="Responsibility Allowance" value="0.00" />
            <TotalRow value="46888.00" />
          </SectionCard>

          <SectionCard title="Deductions" redTitle>
            <Row label="EPF" value="1800.00" />
            <Row label="Advance Salary" value="0.00" />
            <Row label="TDS" value="0.00" />
            <TotalRow value="1800.00" />
          </SectionCard>

          <SectionCard title="Net Salary" redTitle>
            <Row label="Earnings" value="46888.00" />
            <Row label="Deductions" value="1800.00" />
            <TotalRow value="45088.00" />
          </SectionCard>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SectionCard({title, children, redTitle = false, titleColor}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text
          style={[
            styles.cardTitle,
            redTitle && {color: 'red'},
            titleColor && {color: titleColor},
          ]}>
          {title}
        </Text>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function Row({label, value}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function TotalRow({value}) {
  return (
    <View style={[styles.row, styles.totalRow]}>
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#5A33C5'},
  container: {flex: 1, backgroundColor: '#F3F3F3'},
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  downloadCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 85,
    height: 85,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  schoolName: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginTop: 8,
  },
  monthText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'red',
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
  cardBody: {
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  rowLabel: {
    flex: 1,
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  rowValue: {
    color: '#6B6B6B',
    fontSize: 14,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    paddingTop: 10,
    marginTop: 6,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '400',
    color: 'red',
  },
});
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import {BASE_URL} from '../../utils/constants';

const postForm = async (endpoint, fields) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value === null || value === undefined ? '' : value);
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
};

export default function SalaryReceiptScreen({navigation, route}) {
  const salaryId = route?.params?.item?.SalaryID;
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceipt = async () => {
      try {
        const data = await postForm('GenerateSalary.php', {
          SalaryID: salaryId,
        });

        setReceipt(data);
      } catch (error) {
        console.log('SALARY RECEIPT ERROR =>', error);
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [salaryId]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CommonHeader title="Salary Receipt" onBack={() => navigation.goBack()} />

        {loading ? (
          <ActivityIndicator style={styles.loader} color="#5A33C5" />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.schoolName}>Salary Receipt</Text>
            <Text style={styles.monthText}>
              Pay Slip for the Month of {receipt?.month || '-'}{' '}
              {receipt?.year || ''}
            </Text>

            <SectionCard title="Employee Detail" titleColor="#1693E7">
              <Row label="Employee Code" value={receipt?.EmpCode} />
              <Row label="Job Type" value={receipt?.EmployeeTypeName} />
              <Row label="Name" value={receipt?.EmpName} />
              <Row label="No. of Days" value={receipt?.TotalWorkingDays} />
              <Row label="Designation" value={receipt?.DesignationName} />
              <Row label="No. of Presents" value={receipt?.TotalPresentDays} />
              <Row label="Account No." value={receipt?.ACCNO} />
              <Row label="Extra Days" value={receipt?.ExtraDays} />
              <Row label="UAN No." value={receipt?.UANNo} />
            </SectionCard>

            <SectionCard title="Earning Detail" redTitle>
              <Row label="Basic Pay" value={receipt?.ActualBasicSalary} />
              <Row label="Grade Pay" value={receipt?.GradePay} />
              <Row label="Extra Days Pay" value={receipt?.ExtraDaysPay} />
              {(receipt?.earnings || []).map(item => (
                <Row key={item.name} label={item.name} value={item.value} />
              ))}
              <TotalRow value={receipt?.GrossPay} />
            </SectionCard>

            <SectionCard title="Deductions" redTitle>
              <Row label="EPF" value={receipt?.EPF} />
              <Row label="Advance Salary" value={receipt?.['Adv Salary']} />
              <Row label="TDS" value={receipt?.TDS} />
              <Row label="ESI" value={receipt?.ESI} />
              <TotalRow value={receipt?.TotalDeductions} />
            </SectionCard>

            <SectionCard title="Net Salary" redTitle>
              <Row label="Earnings" value={receipt?.GrossPay} />
              <Row label="Deductions" value={receipt?.TotalDeductions} />
              <TotalRow value={receipt?.NetSalary} />
            </SectionCard>
          </ScrollView>
        )}
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
      <Text style={styles.rowValue}>{value || '-'}</Text>
    </View>
  );
}

function TotalRow({value}) {
  return (
    <View style={[styles.row, styles.totalRow]}>
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalValue}>{value || '-'}</Text>
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
  loader: {
    marginTop: 40,
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

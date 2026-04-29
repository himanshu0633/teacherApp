import React from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {AttachmentButton, CircularHeader} from './CircularComponents';
import {teacherCirculars} from './circularData';
import {circularStyles as styles} from './circularStyles';

export default function ViewCircularScreen({navigation, route}) {
  const circular = route?.params?.circular || teacherCirculars[0];

  return (
    <View style={styles.wrapper}>
      <CircularHeader
        title="View Circular"
        onBack={() => navigation.goBack()}
        rightAction={() => navigation.navigate('CircularReadStatusScreen')}
      />
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.detailContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.detailCard}>
            <View style={styles.cardTitleBar}>
              <Text style={styles.cardTitle}>{circular.title}</Text>
            </View>
            <View style={styles.detailBody}>
              <View style={styles.detailGrid}>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Circular Date</Text>
                  <Text style={styles.detailValue}>{circular.date}</Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Circular By</Text>
                  <Text style={styles.detailValue}>{circular.by}</Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Employee Type</Text>
                  <Text style={styles.detailValue}>
                    {circular.employeeType}
                  </Text>
                </View>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Branch</Text>
                  <Text style={styles.detailValue}>{circular.branch}</Text>
                </View>
              </View>

              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {circular.description}
                </Text>
              </View>

              <AttachmentButton />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

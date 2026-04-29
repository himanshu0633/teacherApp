import React from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {CircularHeader} from './CircularComponents';
import {circularReadStatus} from './circularData';
import {circularStyles as styles} from './circularStyles';

export default function CircularReadStatusScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <CircularHeader
        title="Circular Read Status"
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.statusContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.statusCard}>
            {circularReadStatus.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.statusRow,
                  index === circularReadStatus.length - 1 &&
                    styles.lastStatusRow,
                ]}>
                <View>
                  <Text style={styles.personName}>{item.name}</Text>
                  <Text style={styles.personCode}>Emp Code - {item.code}</Text>
                </View>
                <View style={styles.readBadge}>
                  <View
                    style={[
                      styles.readDot,
                      {backgroundColor: item.read ? '#27B43E' : '#FF0D12'},
                    ]}
                  />
                  <Text
                    style={[
                      styles.readText,
                      {color: item.read ? '#27B43E' : '#FF0D12'},
                    ]}>
                    {item.read ? 'Read' : 'Unread'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

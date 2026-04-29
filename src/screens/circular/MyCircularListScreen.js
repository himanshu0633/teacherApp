import React from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {
  CircularCard,
  CircularHeader,
  CircularTabs,
} from './CircularComponents';
import {teacherCirculars} from './circularData';
import {circularStyles as styles} from './circularStyles';

export default function MyCircularListScreen({navigation}) {
  return (
    <View style={styles.wrapper}>
      <CircularHeader
        title="My Circular List"
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.page}>
        <CircularTabs
          active="list"
          onCreate={() => navigation.navigate('EmployeeCircularScreen')}
          onList={() => {}}
        />

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          {teacherCirculars.map(item => (
            <CircularCard
              key={item.id}
              item={item}
              onPress={() =>
                navigation.navigate('ViewCircularScreen', {circular: item})
              }
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

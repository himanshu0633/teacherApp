import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CircularHeader, CircularTabs } from './CircularComponents';
import { circularStyles as styles } from './circularStyles';

export default function MyCircularListScreen({ navigation, route }) {
  const circularType = route?.params?.circularType || 'employee';
  const createScreen =
    circularType === 'student'
      ? 'StudentCircularScreen'
      : 'EmployeeCircularScreen';

  return (
    <View style={styles.wrapper}>
      <CircularHeader
        title="View Circulars"
        onBack={() => navigation.goBack()}
      />
      <SafeAreaView style={styles.page}>
        <CircularTabs
          active="list"
          onCreate={() => navigation.navigate(createScreen)}
          onList={() => {}}
        />

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.sendByMeButton}
            onPress={() =>
              navigation.navigate('SendByMeCircularListScreen', {
                circularType,
              })
            }
            activeOpacity={0.82}
          >
            <Text style={styles.sendByMeButtonText}>
              Send By Me Circular List
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

import React from 'react';
import {Platform, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft} from 'lucide-react-native';
import {PURPLE, disciplineStyles as styles} from './DisciplineStyles';

export default function DisciplineHeader({title, onBack}) {
  const insets = useSafeAreaInsets();
  const topInset =
    Platform.OS === 'android'
      ? insets.top || StatusBar.currentHeight || 0
      : insets.top;

  return (
    <View style={[styles.headerSafe, {paddingTop: topInset}]}>
      <StatusBar backgroundColor={PURPLE} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onBack}
          style={styles.headerButton}
          activeOpacity={0.75}>
          <ArrowLeft size={22} color="#fff" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerButton} />
      </View>
    </View>
  );
}

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function CommonHeader({
  title,
  onBack,
  rightIcon = null,
  rightAction,
  backgroundColor = '#5A33C5',
  showBack = true,
  safeAreaTop = false,
}) {
  const insets = useSafeAreaInsets();
  const androidTopInset = insets.top || StatusBar.currentHeight || 0;
  const topInset =
    safeAreaTop || Platform.OS === 'android'
      ? Platform.OS === 'android'
        ? androidTopInset
        : insets.top
      : 0;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor,
          paddingTop: topInset,
        },
      ]}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle="light-content"
      />

      <TouchableOpacity
        onPress={() => {
          if (showBack && onBack) {
            onBack();
          }
        }}
        style={styles.sideBtn}
        disabled={!showBack}>
        {showBack ? <Text style={styles.backIcon}>←</Text> : <View />}
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity onPress={rightAction} style={styles.sideBtn}>
        {rightIcon}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    minHeight: 56,
  },
  sideBtn: {
    width: 36,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 28 / 1.6,
    fontWeight: '700',
    marginLeft: 10,
  },
});

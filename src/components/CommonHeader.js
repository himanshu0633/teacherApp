import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function CommonHeader({
  title,
  onBack,
  rightIcon = null,
  rightAction,
  backgroundColor = '#5A33C5',
  showBack = true,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor,
          paddingTop: insets.top,
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

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  onMove: (dx: number, dy: number) => void;
};

export default function DirectionControls({ onMove }: Props) {
  return (
    <View style={styles.pad}>
      <Pressable accessibilityLabel="위로 이동" style={styles.button} onPress={() => onMove(0, -18)}>
        <Text style={styles.text}>↑</Text>
      </Pressable>
      <View style={styles.row}>
        <Pressable accessibilityLabel="왼쪽으로 이동" style={styles.button} onPress={() => onMove(-18, 0)}>
          <Text style={styles.text}>←</Text>
        </Pressable>
        <View style={styles.center}>
          <Text style={styles.centerText}>move</Text>
        </View>
        <Pressable accessibilityLabel="오른쪽으로 이동" style={styles.button} onPress={() => onMove(18, 0)}>
          <Text style={styles.text}>→</Text>
        </Pressable>
      </View>
      <Pressable accessibilityLabel="아래로 이동" style={styles.button} onPress={() => onMove(0, 18)}>
        <Text style={styles.text}>↓</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    alignItems: 'center',
    gap: 6
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center'
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.tiny
  },
  center: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.roomWall,
    borderWidth: 1,
    borderColor: colors.border
  },
  centerText: {
    color: colors.textSub,
    fontSize: 9,
    fontWeight: '900'
  },
  text: {
    fontSize: 24,
    color: colors.accentBrown,
    fontWeight: '900'
  }
});

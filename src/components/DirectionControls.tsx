import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        <View style={styles.center} />
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ead5db'
  },
  center: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f7e5e9'
  },
  text: {
    fontSize: 24,
    color: '#51313a',
    fontWeight: '800'
  }
});

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  visible: boolean;
  onPress: () => void;
};

export default function InteractionButton({ visible, onPress }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>안아주기</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    borderRadius: 24,
    backgroundColor: '#51313a',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  text: {
    color: '#ffffff',
    fontWeight: '800'
  }
});

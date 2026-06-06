import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Point } from '../types/models';

type Props = {
  nickname: string;
  position: Point;
  variant: 'me' | 'partner';
  online?: boolean;
};

export default function Character({ nickname, position, variant, online = true }: Props) {
  return (
    <View style={[styles.wrap, { left: position.x - 28, top: position.y - 34 }]}>
      <View style={[styles.body, variant === 'me' ? styles.me : styles.partner]}>
        <View style={styles.face}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
      </View>
      <View style={styles.nameRow}>
        <View style={[styles.dot, online ? styles.online : styles.offline]} />
        <Text numberOfLines={1} style={styles.name}>
          {nickname}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 74,
    alignItems: 'center'
  },
  body: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#51313a',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  me: {
    backgroundColor: '#f2a6b8'
  },
  partner: {
    backgroundColor: '#8fcfd0'
  },
  face: {
    width: 30,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  eye: {
    width: 5,
    height: 8,
    borderRadius: 3,
    backgroundColor: '#422d33'
  },
  nameRow: {
    marginTop: 4,
    maxWidth: 74,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4
  },
  online: {
    backgroundColor: '#58a66d'
  },
  offline: {
    backgroundColor: '#b9aeb1'
  },
  name: {
    maxWidth: 54,
    fontSize: 11,
    color: '#3b2d32',
    fontWeight: '700'
  }
});

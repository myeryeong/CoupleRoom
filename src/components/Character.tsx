import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Point } from '../types/models';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

type Props = {
  nickname: string;
  position: Point;
  variant: 'me' | 'partner';
  online?: boolean;
};

export default function Character({ nickname, position, variant, online = true }: Props) {
  return (
    <View style={[styles.wrap, { left: position.x - 32, top: position.y - 40 }]}>
      <View style={[styles.body, variant === 'me' ? styles.me : styles.partner]}>
        <View style={styles.hair} />
        <View style={styles.face}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
        <View style={styles.smile} />
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
    width: 82,
    alignItems: 'center'
  },
  body: {
    width: 62,
    height: 66,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.soft
  },
  me: {
    backgroundColor: colors.accentPink
  },
  partner: {
    backgroundColor: '#E2C199'
  },
  hair: {
    position: 'absolute',
    top: 7,
    width: 34,
    height: 12,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: colors.accentBrown,
    opacity: 0.5
  },
  face: {
    width: 30,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  eye: {
    width: 5,
    height: 8,
    borderRadius: 3,
    backgroundColor: colors.textMain
  },
  smile: {
    width: 14,
    height: 7,
    marginTop: 7,
    borderBottomWidth: 2,
    borderBottomColor: colors.textMain,
    borderRadius: 8
  },
  nameRow: {
    marginTop: 5,
    maxWidth: 82,
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(255,248,239,0.94)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  online: {
    backgroundColor: colors.success
  },
  offline: {
    backgroundColor: '#BCA997'
  },
  name: {
    maxWidth: 58,
    fontSize: 11,
    color: colors.textMain,
    fontWeight: '800'
  }
});

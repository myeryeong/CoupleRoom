import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>CR</Text>
      </View>
      <Text style={styles.title}>CoupleRoom</Text>
      <Text style={styles.subtitle}>둘만의 작은 방을 준비하고 있어요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7f8'
  },
  mark: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#51313a'
  },
  markText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900'
  },
  title: {
    marginTop: 18,
    color: '#3b2d32',
    fontSize: 30,
    fontWeight: '900'
  },
  subtitle: {
    marginTop: 8,
    color: '#8d6270',
    fontSize: 15
  }
});

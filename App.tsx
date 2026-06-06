import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import CoupleLinkScreen from './src/screens/CoupleLinkScreen';
import CoupleRoomScreen from './src/screens/CoupleRoomScreen';
import { useAuthStore } from './src/stores/authStore';

type RouteName = 'splash' | 'login' | 'signup' | 'link' | 'room';

export default function App() {
  const [route, setRoute] = useState<RouteName>('splash');
  const { session, profile, bootstrap } = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!session) {
        setRoute('login');
      } else if (!profile?.couple_id) {
        setRoute('link');
      } else {
        setRoute('room');
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [session, profile?.couple_id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {route === 'splash' && <SplashScreen />}
      {route === 'login' && <LoginScreen onSignup={() => setRoute('signup')} />}
      {route === 'signup' && <SignupScreen onLogin={() => setRoute('login')} />}
      {route === 'link' && <CoupleLinkScreen onLinked={() => setRoute('room')} />}
      {route === 'room' && <CoupleRoomScreen onUnlinked={() => setRoute('link')} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff7f8'
  }
});

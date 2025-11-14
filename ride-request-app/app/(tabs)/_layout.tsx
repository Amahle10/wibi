// app/(tabs)/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import AuthGuard from './AuthGuard';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AuthGuard>
        <Slot />
      </AuthGuard>
    </KeyboardAvoidingView>
  );
}

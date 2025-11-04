// app/(tabs)/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import AuthGuard from './AuthGuard';

export default function TabsLayout() {
  return (
    <AuthGuard>
      <Slot />
    </AuthGuard>
  );
}

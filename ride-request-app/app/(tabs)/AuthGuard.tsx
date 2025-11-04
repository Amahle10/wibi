// app/(tabs)/AuthGuard.tsx
import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { userToken, loading } = useAuth();

  useEffect(() => {
    if (!loading && !userToken) {
      router.replace('/(auth)/login');
    }
  }, [userToken, loading]);

  // While loading token, render nothing or a splash
  if (loading || !userToken) return null;

  return <>{children}</>;
}

// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Login() {
  const { login, register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async () => {
    setError(''); // reset error
    let success = false;

    if (isRegister) {
      if (!name) {
        setError('Please enter your name');
        return;
      }
      success = await register(name, email, password);
      if (!success) {
        setError('Registration failed. Try again.');
        return;
      }
      // After successful registration, switch to login
      setIsRegister(false);
      setPassword('');
      return;
    }

    // Login
    success = await login(email, password);
    if (success) {
      // Navigate to home / tabs index
      router.replace('/(tabs)'); // <- make sure this file exists
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {isRegister && (
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
        />
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, marginBottom: 10 }}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={{ flex: 1, padding: 8 }}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingHorizontal: 10 }}>
          <Text>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

      <Button title={isRegister ? 'Register' : 'Login'} onPress={handleAuth} />

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={{ marginTop: 10 }}>
        <Text style={{ color: 'blue', textAlign: 'center' }}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LogoutScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: implement actual logout logic
    alert('You have been logged out.');
    router.replace('/login'); // redirect to login screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logout</Text>
      <Text style={styles.subtitle}>Are you sure you want to logout?</Text>
      <Button title="Confirm Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});

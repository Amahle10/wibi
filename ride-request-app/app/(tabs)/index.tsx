import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchPlaceSuggestions } from '../../services/geocodeService';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { logout } = useAuth();
  const [region, setRegion] = useState<any>(null);
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const fetchSuggestions = async (text: string) => {
    setDestination(text);
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }
    const results: any = await fetchPlaceSuggestions(text);
    setSuggestions(results || []);
  };

  const handleSelectSuggestion = (item: any) => {
    setDestination(item.description);
    setSuggestions([]);
    setSelectedLocation({
      latitude: item.latitude,
      longitude: item.longitude,
    });
    setRegion({
      ...region,
      latitude: item.latitude,
      longitude: item.longitude,
    });
  };

  if (!region) return <Text style={{ padding: 20 }}>Loading map...</Text>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <MapView style={{ flex: 1 }} region={region}>
            <Marker coordinate={region} title="You are here" />
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                pinColor="green"
                title="Destination"
              />
            )}
          </MapView>

          <View style={styles.overlay}>
            <TextInput
              style={styles.input}
              placeholder="Enter destination..."
              value={destination}
              onChangeText={fetchSuggestions}
            />

            {/* Autocomplete suggestions */}
            {suggestions.length > 0 && (
              <View style={styles.suggestionBox}>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <Text>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <Button title="Logout" onPress={logout} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  suggestionBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 150,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});

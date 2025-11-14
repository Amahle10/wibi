import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchPlaceSuggestions } from '../../services/geocodeService';

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (destination.length < 3) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestionsAsync = async () => {
      const res = await fetchPlaceSuggestions(destination);
      setSuggestions(res);
    };
    fetchSuggestionsAsync();
  }, [destination]);

  const handleSelectDestination = (item: any) => {
    setSelectedDestination({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
    setDestination(item.display_name);
    setSuggestions([]);
  };

  const handleConfirmRide = () => {
    alert(`Ride confirmed to: ${destination}`);
    setDestination('');
    setSelectedDestination(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          
          {currentLocation && (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker coordinate={currentLocation} title="You are here" />
              {selectedDestination && (
                <Marker coordinate={selectedDestination} title="Destination" pinColor="blue" />
              )}
            </MapView>
          )}

          {/* Bottom Panel now moves when keyboard opens */}
          <View style={styles.bottomPanel}>
            <TextInput
              placeholder="Enter destination"
              value={destination}
              onChangeText={setDestination}
              style={styles.input}
            />

            {suggestions.length > 0 && (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectDestination(item)}
                    style={styles.suggestion}
                  >
                    <Text>{item.display_name}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 150 }}
              />
            )}

            <Button
              title="Confirm Ride"
              onPress={handleConfirmRide}
              disabled={!selectedDestination}
            />
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bottomPanel: {
    position: 'absolute',
    bottom: 10,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  suggestion: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

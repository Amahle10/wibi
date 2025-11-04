import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchPlaceSuggestions, fetchRoute } from '../../services/geocodeService';
import { calculateFare } from '../utils/calculatorFare';

interface Suggestion {
  name: string;
  latitude: number;
  longitude: number;
}

export default function RideRequest() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Suggestion | null>(null);
  const [fare, setFare] = useState<number | null>(null);

  // Request user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (!destination) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const results: Suggestion[] = await fetchPlaceSuggestions(destination);
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching suggestions', err);
      }
    };

    fetchSuggestions();
  }, [destination]);

  const handleSelectDestination = async (place: Suggestion) => {
    setSelectedDestination(place);
    setDestination(place.name);
    setSuggestions([]);

    if (location) {
      const distance = await fetchRoute(location, place); // placeholder for route fetching
      const calculatedFare = calculateFare(distance);
      setFare(calculatedFare);
    }
  };

  const handleConfirmRide = () => {
    if (!selectedDestination) return;
    console.log('Ride confirmed to:', selectedDestination, 'Fare:', fare);
    alert(`Ride confirmed! Fare: R${fare}`);
  };

  return (
    <View style={{ flex: 1 }}>
      {location && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} title="You are here" />
          {selectedDestination && <Marker coordinate={selectedDestination} title="Destination" />}
        </MapView>
      )}

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
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectDestination(item)} style={styles.suggestion}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {fare !== null && <Text style={styles.fareText}>Estimated fare: R{fare}</Text>}

        <Button title="Confirm Ride" onPress={handleConfirmRide} disabled={!selectedDestination} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 5,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fareText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

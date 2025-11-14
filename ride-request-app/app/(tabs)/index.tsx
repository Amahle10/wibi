import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchPlaceSuggestions } from '../../services/geocodeService';
import { useAuth } from '../../context/AuthContext';
import { Menu, Provider, IconButton } from 'react-native-paper';

export default function Home() {
  const { logout, user } = useAuth();
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [region, setRegion] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // Fetch user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // Fetch autocomplete suggestions
  const handleDestinationChange = async (text: string) => {
    setDestination(text);
    if (text.length > 2) {
      const results = await fetchPlaceSuggestions(text);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <Provider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* Top-left menu */}
          <View style={styles.menuContainer}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="menu"
                  size={28}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={() => alert('Go to Profile')} title="Profile" />
              <Menu.Item onPress={logout} title="Logout" />
            </Menu>
          </View>

          {/* Map */}
          {region && (
            <MapView
              style={{ flex: 1 }}
              initialRegion={region}
              showsUserLocation={true}
            >
              {location && (
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="You are here"
                />
              )}
            </MapView>
          )}

          {/* Destination Input */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter destination"
              value={destination}
              onChangeText={handleDestinationChange}
              style={styles.input}
            />

            {/* Suggestions List */}
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setDestination(item.description);
                    setSuggestions([]);
                  }}
                >
                  <Text style={{ padding: 10 }}>{item.description}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 150 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 10,
    zIndex: 1000,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
});

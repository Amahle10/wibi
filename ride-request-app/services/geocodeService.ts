interface Suggestion {
  name: string;
  latitude: number;
  longitude: number;
}

// Simulate API for place suggestions
export const fetchPlaceSuggestions = async (query: string): Promise<Suggestion[]> => {
  // Replace this with real API later
  return [
    { name: query + ' Street', latitude: -26.2, longitude: 28.0 },
    { name: query + ' Avenue', latitude: -26.3, longitude: 28.1 },
  ];
};

// Simulate fetching distance for fare calculation
export const fetchRoute = async (
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number }
): Promise<number> => {
  // In km
  const dx = start.latitude - end.latitude;
  const dy = start.longitude - end.longitude;
  return Math.sqrt(dx * dx + dy * dy) * 111; // rough approximation
};

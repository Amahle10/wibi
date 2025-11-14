import axios from 'axios';

export interface PlacePrediction {
  description: string;
  place_id: string;
}

interface PhotonFeature {
  properties: {
    osm_id: number;
    name: string;
    city?: string;
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

/**
 * Fetch place suggestions using Photon (OpenStreetMap)
 */
export const fetchPlaceSuggestions = async (
  input: string
): Promise<PlacePrediction[]> => {
  if (!input.trim()) return [];

  try {
    const res = await axios.get<PhotonResponse>('https://photon.komoot.io/api/', {
      params: {
        q: input,
        limit: 6,
        lang: 'en',
      },
      headers: {
        'User-Agent': 'WibiApp/1.0 (contact@example.com)', // required by Nominatim rules
      },
    });

    return res.data.features.map((feature) => ({
      description:
        feature.properties.name +
        (feature.properties.city ? `, ${feature.properties.city}` : ''),
      place_id: feature.properties.osm_id.toString(),
    }));
  } catch (error) {
    console.error('Photon autocomplete error:', error);
    return [];
  }
};

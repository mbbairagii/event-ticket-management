import { useState, useEffect, useCallback } from 'react';

// Known hubs coordinates for instant matching & distance calculations
const CITY_COORDINATES = {
  'delhi': { lat: 28.6139, lon: 77.2090, label: 'Delhi NCR, IN' },
  'new delhi': { lat: 28.6139, lon: 77.2090, label: 'New Delhi, IN' },
  'noida': { lat: 28.5355, lon: 77.3910, label: 'Noida, IN' },
  'greater noida': { lat: 28.4744, lon: 77.5040, label: 'Greater Noida, IN' },
  'gurugram': { lat: 28.4595, lon: 77.0266, label: 'Gurugram, IN' },
  'gurgaon': { lat: 28.4595, lon: 77.0266, label: 'Gurgaon, IN' },
  'ghaziabad': { lat: 28.6692, lon: 77.4538, label: 'Ghaziabad, IN' },
  'faridabad': { lat: 28.4089, lon: 77.3178, label: 'Faridabad, IN' },
  'mumbai': { lat: 19.0760, lon: 72.8777, label: 'Mumbai, IN' },
  'goa': { lat: 15.2993, lon: 74.1240, label: 'Goa, IN' },
  'bengaluru': { lat: 12.9716, lon: 77.5946, label: 'Bengaluru, IN' },
  'bangalore': { lat: 12.9716, lon: 77.5946, label: 'Bengaluru, IN' },
  'pune': { lat: 18.5204, lon: 73.8567, label: 'Pune, IN' },
  'hyderabad': { lat: 17.3850, lon: 78.4867, label: 'Hyderabad, IN' },
  'kolkata': { lat: 22.5726, lon: 88.3639, label: 'Kolkata, IN' },
  'chennai': { lat: 13.0827, lon: 80.2707, label: 'Chennai, IN' },
  'jaipur': { lat: 26.9124, lon: 75.7873, label: 'Jaipur, IN' },
  'chandigarh': { lat: 30.7333, lon: 76.7794, label: 'Chandigarh, IN' },
  'amsterdam': { lat: 52.3676, lon: 4.9041, label: 'Amsterdam, NL' },
  'london': { lat: 51.5074, lon: -0.1278, label: 'London, UK' },
  'berlin': { lat: 52.5200, lon: 13.4050, label: 'Berlin, DE' },
  'paris': { lat: 48.8566, lon: 2.3522, label: 'Paris, FR' },
  'ibiza': { lat: 38.9067, lon: 1.4206, label: 'Ibiza, ES' },
  'new york': { lat: 40.7128, lon: -74.0060, label: 'New York, US' },
  'tokyo': { lat: 35.6762, lon: 139.6503, label: 'Tokyo, JP' },
};

// Haversine distance calculator in kilometers
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Find closest known city by coordinates
function findClosestCity(lat, lon) {
  let closest = null;
  let minDistance = Infinity;

  for (const [, coords] of Object.entries(CITY_COORDINATES)) {
    const dist = calculateDistance(lat, lon, coords.lat, coords.lon);
    if (dist !== null && dist < minDistance) {
      minDistance = dist;
      closest = { city: coords.label.split(',')[0], full: coords.label, distance: dist };
    }
  }

  return closest;
}

export function useUserLocation() {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('user_location_cache');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedCity = 'Nearby';
        let detectedCountry = '';

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            detectedCity = data.city || data.locality || data.principalSubdivision || 'Nearby';
            detectedCountry = data.countryName || data.countryCode || '';
          }
        } catch {
          const closest = findClosestCity(latitude, longitude);
          if (closest && closest.distance < 150) {
            detectedCity = closest.city;
          }
        }

        const locationData = {
          city: detectedCity,
          country: detectedCountry,
          lat: latitude,
          lon: longitude,
          isDetected: true,
          timestamp: Date.now()
        };

        setLocation(locationData);
        try {
          localStorage.setItem('user_location_cache', JSON.stringify(locationData));
        } catch (e) {
          console.warn('Could not cache location', e);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError(err.message || 'Unable to retrieve location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Auto-detect on first mount if not already cached
  useEffect(() => {
    if (!location) {
      detectLocation();
    }
  }, [detectLocation, location]);

  const setManualCity = (cityName) => {
    const key = cityName.toLowerCase().trim();
    const cityData = CITY_COORDINATES[key];
    const newLocation = {
      city: cityName,
      country: cityData ? cityData.label.split(',')[1]?.trim() : '',
      lat: cityData ? cityData.lat : null,
      lon: cityData ? cityData.lon : null,
      isDetected: false,
      isManual: true,
      timestamp: Date.now()
    };
    setLocation(newLocation);
    try {
      localStorage.setItem('user_location_cache', JSON.stringify(newLocation));
    } catch {}
  };

  const getDistanceToEvent = (eventCity) => {
    if (!location?.lat || !location?.lon || !eventCity) return null;
    const cleanCity = eventCity.toLowerCase().trim();
    
    // Direct match
    let cityCoords = CITY_COORDINATES[cleanCity];
    
    // Fuzzy substring match if not direct
    if (!cityCoords) {
      for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
        if (cleanCity.includes(key) || key.includes(cleanCity)) {
          cityCoords = coords;
          break;
        }
      }
    }

    if (!cityCoords) return null;
    return calculateDistance(location.lat, location.lon, cityCoords.lat, cityCoords.lon);
  };

  return {
    location,
    loading,
    error,
    detectLocation,
    setManualCity,
    getDistanceToEvent
  };
}

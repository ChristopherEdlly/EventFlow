import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Navigation, X, Loader2 } from 'lucide-react';

// Fix for default marker icon in Leaflet with bundlers
const markerIcon2x = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

// @ts-expect-error - Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  location: string;
  latitude?: number;
  longitude?: number;
  onLocationChange: (location: string, lat?: number, lng?: number) => void;
  error?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Component to handle map click events
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to recenter map when position changes
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LocationPicker({
  location,
  latitude,
  longitude,
  onLocationChange,
  error,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>([
    latitude || -23.5505, // São Paulo default
    longitude || -46.6333,
  ]);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`,
        {
          headers: {
            'Accept-Language': 'pt-BR',
          },
        }
      );
      const data: NominatimResult[] = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error searching address:', err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: NominatimResult) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setMarkerPosition([lat, lng]);
    setMapPosition([lat, lng]);
    onLocationChange(suggestion.display_name, lat, lng);
  };

  // Handle map click - reverse geocoding
  const handleMapClick = async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'pt-BR',
          },
        }
      );
      const data = await response.json();
      if (data.display_name) {
        onLocationChange(data.display_name, lat, lng);
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
      onLocationChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng);
    } finally {
      setIsSearching(false);
    }
  };

  // Use current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada pelo seu navegador');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setMarkerPosition([lat, lng]);
        setMapPosition([lat, lng]);
        
        // Reverse geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
              headers: {
                'Accept-Language': 'pt-BR',
              },
            }
          );
          const data = await response.json();
          if (data.display_name) {
            onLocationChange(data.display_name, lat, lng);
          }
        } catch (err) {
          onLocationChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng);
        }
        
        setIsLoadingLocation(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        alert('Não foi possível obter sua localização');
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Clear location
  const handleClear = () => {
    setSearchQuery('');
    setMarkerPosition(null);
    onLocationChange('', undefined, undefined);
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700">
        Local do Evento <span className="text-red-500">*</span>
      </label>

      {/* Search Input */}
      <div className="relative z-[1000]">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Buscar endereço..."
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            className="px-4 py-3 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
            title="Usar minha localização"
          >
            {isLoadingLocation ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Minha localização</span>
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-[1001] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 transition-colors"
              >
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 line-clamp-2">
                  {suggestion.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100" style={{ height: '250px' }}>
        <MapContainer
          center={mapPosition}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {markerPosition && (
            <>
              <Marker position={markerPosition} icon={customIcon} />
              <MapRecenter lat={markerPosition[0]} lng={markerPosition[1]} />
            </>
          )}
        </MapContainer>
        
        {/* Map hint overlay */}
        {!markerPosition && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
            <div className="bg-white/95 px-4 py-2 rounded-lg shadow-lg text-sm text-gray-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              Clique no mapa ou busque um endereço
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {location && (
        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">Local selecionado</p>
            <p className="text-sm text-green-700 line-clamp-2">{location}</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-green-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

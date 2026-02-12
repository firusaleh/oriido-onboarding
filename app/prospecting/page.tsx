'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, MarkerClusterer, InfoWindow } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import RestaurantBottomSheet from '@/components/RestaurantBottomSheet';
import ProspectingFilters from '@/components/ProspectingFilters';
import RestaurantListCard from '@/components/RestaurantListCard';
import ProspectingStats from '@/components/ProspectingStats';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const libraries: ("places")[] = ["places"];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a9a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a38" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6a6a7a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e1a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const mapContainerStyle = {
  width: '100%',
  height: '55vh'
};

const defaultCenter = {
  lat: 49.5897,
  lng: 11.0078
};

interface Restaurant {
  placeId: string;
  name: string;
  adresse: string;
  lat: number;
  lng: number;
  status?: string;
  bewertung?: number;
  anzahlBewertungen?: number;
  telefon?: string;
  crmId?: string;
  entfernung?: number;
  art?: string;
}

export default function ProspectingPage() {
  const router = useRouter();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showSearchInArea, setShowSearchInArea] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, leads: 0, gewonnen: 0 });
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedForRoute, setSelectedForRoute] = useState<string[]>([]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setCenter(location);
        },
        () => {
          toast.error('Standort konnte nicht ermittelt werden');
        }
      );
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        lat: center.lat.toString(),
        lng: center.lng.toString(),
        radius: '2000'
      });

      const res = await fetch(`/api/prospecting/search?${params}`);
      if (!res.ok) throw new Error('Suche fehlgeschlagen');
      
      const data = await res.json();
      setRestaurants(data.restaurants || []);
      updateStats(data.restaurants || []);
      
      if (data.restaurants?.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        data.restaurants.forEach((r: Restaurant) => {
          bounds.extend({ lat: r.lat, lng: r.lng });
        });
        map?.fitBounds(bounds);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Suche fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInArea = async () => {
    if (!map) return;
    
    const bounds = map.getBounds();
    if (!bounds) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        neLat: bounds.getNorthEast().lat().toString(),
        neLng: bounds.getNorthEast().lng().toString(),
        swLat: bounds.getSouthWest().lat().toString(),
        swLng: bounds.getSouthWest().lng().toString()
      });

      const res = await fetch(`/api/prospecting/nearby?${params}`);
      if (!res.ok) throw new Error('Suche fehlgeschlagen');
      
      const data = await res.json();
      setRestaurants(data.restaurants || []);
      updateStats(data.restaurants || []);
      setShowSearchInArea(false);
    } catch (error) {
      console.error('Area search error:', error);
      toast.error('Bereichssuche fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (restaurantsList: Restaurant[]) => {
    const total = restaurantsList.length;
    const leads = restaurantsList.filter(r => r.status === 'lead').length;
    const gewonnen = restaurantsList.filter(r => r.status === 'gewonnen').length;
    setStats({ total, leads, gewonnen });
  };

  const handleMarkerClick = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    
    if (!restaurant.telefon) {
      try {
        const res = await fetch(`/api/prospecting/details/${restaurant.placeId}`);
        if (res.ok) {
          const details = await res.json();
          setSelectedRestaurant({ ...restaurant, ...details });
        }
      } catch (error) {
        console.error('Error loading details:', error);
      }
    }
    
    setBottomSheetOpen(true);
  };

  const handleAddToPipeline = async (restaurant: Restaurant, notiz?: string) => {
    try {
      const res = await fetch('/api/prospecting/add-to-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: restaurant.placeId, notiz })
      });

      if (!res.ok) throw new Error('Fehler beim Hinzufügen');

      const data = await res.json();
      
      setRestaurants(prev => prev.map(r => 
        r.placeId === restaurant.placeId 
          ? { ...r, status: 'lead', crmId: data.crmId }
          : r
      ));
      
      toast.success(`${restaurant.name} zur Pipeline hinzugefügt`);
      setBottomSheetOpen(false);
    } catch (error) {
      console.error('Error adding to pipeline:', error);
      toast.error('Fehler beim Hinzufügen zur Pipeline');
    }
  };

  const getMarkerColor = (status?: string) => {
    switch(status) {
      case 'lead': return '#3B82F6';
      case 'kontaktiert':
      case 'termin':
      case 'angebot': return '#FF6B35';
      case 'gewonnen': return '#22C55E';
      case 'verloren': return '#EF4444';
      default: return '#8A8A9A';
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    switch(filter) {
      case 'nicht_besucht': return !r.status || r.status === 'lead';
      case 'in_pipeline': return r.status && r.status !== 'gewonnen' && r.status !== 'verloren';
      case 'gewonnen': return r.status === 'gewonnen';
      case 'verloren': return r.status === 'verloren';
      default: return true;
    }
  });

  const handleBuildRoute = () => {
    if (selectedForRoute.length < 2) {
      toast.error('Bitte mindestens 2 Restaurants auswählen');
      return;
    }

    const waypoints = selectedForRoute
      .map(id => {
        const r = restaurants.find(rest => rest.placeId === id);
        return r ? `${r.lat},${r.lng}` : null;
      })
      .filter(Boolean)
      .join('/');

    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : waypoints.split('/')[0];
    const url = `https://www.google.com/maps/dir/${origin}/${waypoints}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        libraries={libraries}
      >
        <div className="sticky top-0 z-20 bg-background border-b border-border">
          <ProspectingFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            filter={filter}
            setFilter={setFilter}
            onLocationClick={getCurrentLocation}
          />
        </div>

        {viewMode === 'map' ? (
          <div className="relative">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={14}
              onLoad={onMapLoad}
              options={{
                styles: darkMapStyle,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false
              }}
              onDragEnd={() => setShowSearchInArea(true)}
            >
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#3B82F6',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                  }}
                />
              )}

              <MarkerClusterer>
                {(clusterer) =>
                  filteredRestaurants.map((restaurant) => (
                    <Marker
                      key={restaurant.placeId}
                      position={{ lat: restaurant.lat, lng: restaurant.lng }}
                      clusterer={clusterer}
                      onClick={() => handleMarkerClick(restaurant)}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: getMarkerColor(restaurant.status),
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                      }}
                    />
                  ))
                }
              </MarkerClusterer>
            </GoogleMap>

            <ProspectingStats stats={stats} />

            {showSearchInArea && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <button
                  onClick={handleSearchInArea}
                  className="px-4 py-2 bg-accent text-white rounded-lg shadow-lg hover:bg-accent-hover transition-colors"
                >
                  🔄 In diesem Bereich suchen
                </button>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex justify-center gap-2 p-3 border-b border-border">
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'map' 
                ? 'bg-accent text-white' 
                : 'bg-surface text-secondary hover:bg-surface-hover'
            }`}
          >
            🗺️ Karte
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-accent text-white' 
                : 'bg-surface text-secondary hover:bg-surface-hover'
            }`}
          >
            📋 Liste
          </button>
        </div>

        <div className={`${viewMode === 'map' ? 'h-[35vh]' : 'h-[calc(100vh-200px)]'} overflow-y-auto`}>
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center py-8 text-secondary">
                {searchQuery ? 'Keine Restaurants gefunden' : 'Suche nach Restaurants in deiner Nähe'}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-secondary">
                    {filteredRestaurants.length} Restaurants gefunden
                  </p>
                  {selectedForRoute.length > 0 && (
                    <button
                      onClick={handleBuildRoute}
                      className="px-3 py-1 bg-accent text-white rounded-lg text-sm"
                    >
                      🗺️ Route ({selectedForRoute.length})
                    </button>
                  )}
                </div>
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantListCard
                    key={restaurant.placeId}
                    restaurant={restaurant}
                    onClick={() => handleMarkerClick(restaurant)}
                    onAddToPipeline={() => handleAddToPipeline(restaurant)}
                    selected={selectedForRoute.includes(restaurant.placeId)}
                    onSelectForRoute={(id) => {
                      setSelectedForRoute(prev =>
                        prev.includes(id)
                          ? prev.filter(i => i !== id)
                          : [...prev, id]
                      );
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {bottomSheetOpen && selectedRestaurant && (
            <RestaurantBottomSheet
              restaurant={selectedRestaurant}
              onClose={() => {
                setBottomSheetOpen(false);
                setSelectedRestaurant(null);
              }}
              onAddToPipeline={handleAddToPipeline}
            />
          )}
        </AnimatePresence>

        <button
          className="fixed bottom-20 right-4 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center hover:bg-accent-hover transition-colors z-30"
          onClick={() => router.push('/prospecting/quick-add')}
        >
          <span className="text-2xl">+</span>
        </button>
      </LoadScript>
    </div>
  );
}
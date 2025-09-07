import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Plus, Navigation, Search, Filter, Users, Compass, Home, Clock, UserPlus, Settings, Map, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Pin {
  id: string;
  x: number;
  y: number;
  image: string;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: number;
  author: string;
  authorAvatar: string;
  timestamp: number;
  isStory?: boolean;
}

interface MapViewProps {
  onCameraClick: () => void;
  pins: Pin[];
  onPinClick: (pin: Pin) => void;
  userStreak?: number;
  onSettingsClick?: () => void;
}

interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  location: { x: number; y: number };
  isOnline: boolean;
  lastSeen: string;
  activity: string;
  badge?: string;
}

interface Place {
  id: string;
  name: string;
  category: string;
  location: { x: number; y: number };
  rating?: number;
  isTopPick?: boolean;
}

// Google Maps configuration
const GOOGLE_MAPS_CONFIG = {
  center: { lat: 12.9716, lng: 77.5946 }, // Bangalore coordinates
  zoom: 13,
  styles: [
    {
      "featureType": "all",
      "elementType": "geometry",
      "stylers": [{ "color": "#1e2124" }]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{ "gamma": 0.01 }, { "lightness": 20 }, { "weight": "1.39" }, { "color": "#ffffff" }]
    },
    {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [{ "weight": "0.96" }, { "saturation": "9" }, { "visibility": "on" }, { "color": "#000000" }]
    },
    {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{ "lightness": 30 }, { "color": "#1a1a2e" }]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{ "saturation": 20 }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{ "lightness": 20 }, { "saturation": -20 }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "lightness": 10 }, { "saturation": -30 }]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#2d3748" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{ "saturation": 25 }, { "lightness": 25 }, { "weight": "0.01" }]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [{ "lightness": -20 }, { "color": "#1e3a8a" }]
    }
  ]
};

export function MapView({ onCameraClick, pins, onPinClick, userStreak = 0, onSettingsClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [activeTab, setActiveTab] = useState<'memories' | 'visited' | 'popular' | 'favorites'>('memories');
  const [mapLoaded, setMapLoaded] = useState(false);

  const [friends] = useState<Friend[]>([
    {
      id: '1',
      username: 'alexandra_dreams',
      displayName: 'Alexandra',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      location: { x: 35, y: 25 },
      isOnline: true,
      lastSeen: '2m ago',
      activity: 'Downtown Coffee',
      badge: 'Top Pick'
    },
    {
      id: '2',
      username: 'cosmic_wanderer',
      displayName: 'Cosmic',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      location: { x: 70, y: 60 },
      isOnline: false,
      lastSeen: '1h ago',
      activity: 'Sunset Hills'
    },
    {
      id: '3',
      username: 'urban_explorer',
      displayName: 'Street Artist',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      location: { x: 65, y: 80 },
      isOnline: true,
      lastSeen: 'now',
      activity: 'Art District',
      badge: 'Top Pick'
    }
  ]);

  const [places] = useState<Place[]>([
    {
      id: '1',
      name: 'Meghana Foods',
      category: 'Restaurant',
      location: { x: 20, y: 55 },
      isTopPick: true
    },
    {
      id: '2',
      name: 'MS Ecity Mall',
      category: 'Shopping',
      location: { x: 75, y: 65 },
      isTopPick: true
    },
    {
      id: '3',
      name: 'ES University',
      category: 'Education',
      location: { x: 55, y: 45 },
      isTopPick: true
    },
    {
      id: '4',
      name: 'Frozen Bean',
      category: 'Cafe',
      location: { x: 40, y: 70 }
    },
    {
      id: '5',
      name: 'Polar Bear',
      category: 'Restaurant',
      location: { x: 25, y: 75 },
      isTopPick: true
    }
  ]);

  // Load Google Maps with proper async loading and error handling
  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if Google Maps is already loaded
      if (typeof window !== 'undefined' && window.google?.maps) {
        initializeMap();
        return;
      }

      // For demo purposes, we'll use the fallback implementation
      // In production, you would replace 'DEMO_MODE' with your actual Google Maps API key
      const API_KEY = 'DEMO_MODE'; // Replace with your actual API key
      
      if (API_KEY === 'DEMO_MODE' || !API_KEY) {
        console.log('Demo mode: Using fallback map implementation');
        createMockGoogleMaps();
        return;
      }

      try {
        // Create script element with proper async loading
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker,places&loading=async&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        
        // Set up global callback
        (window as any).initGoogleMaps = () => {
          initializeMap();
          delete (window as any).initGoogleMaps;
        };
        
        script.onerror = () => {
          console.log('Google Maps API failed to load, using fallback implementation');
          createMockGoogleMaps();
          delete (window as any).initGoogleMaps;
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.log('Error loading Google Maps, using fallback implementation');
        createMockGoogleMaps();
      }
    };

    loadGoogleMaps();
  }, []);

  const createMockGoogleMaps = () => {
    // Create a mock Google Maps implementation for demo
    setMapLoaded(true);
  };

  const initializeMap = () => {
    if (mapRef.current && window.google?.maps) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: GOOGLE_MAPS_CONFIG.center,
        zoom: GOOGLE_MAPS_CONFIG.zoom,
        styles: GOOGLE_MAPS_CONFIG.styles,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: 'DEMO_MAP_ID' // Required for Advanced Markers
      });

      setMapLoaded(true);
      addMarkersToMap();
    }
  };

  const addMarkersToMap = () => {
    if (!googleMapRef.current || !window.google?.maps?.marker) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    // Add pin markers using AdvancedMarkerElement
    pins.forEach((pin, index) => {
      const lat = GOOGLE_MAPS_CONFIG.center.lat + (pin.y - 50) * 0.01;
      const lng = GOOGLE_MAPS_CONFIG.center.lng + (pin.x - 50) * 0.01;

      // Create custom marker content
      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <div style="
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          overflow: hidden;
        ">
          <img 
            src="${pin.image}" 
            alt="${pin.caption}"
            style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              object-fit: cover;
            "
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
          />
          <div style="
            position: absolute;
            width: 16px;
            height: 16px;
            background: #fff;
            border-radius: 50%;
            top: -2px;
            right: -2px;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          ">📸</div>
        </div>
      `;

      try {
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: googleMapRef.current,
          position: { lat, lng },
          content: markerContent,
          title: pin.caption
        });

        marker.addListener('click', () => {
          setSelectedPin(pin);
          onPinClick(pin);
        });

        markersRef.current.push(marker);
      } catch (error) {
        console.log('Advanced markers not available, using fallback');
        // Fallback to basic marker if AdvancedMarkerElement fails
        if (window.google.maps.Marker) {
          const fallbackMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map: googleMapRef.current,
            title: pin.caption
          });

          fallbackMarker.addListener('click', () => {
            setSelectedPin(pin);
            onPinClick(pin);
          });
        }
      }
    });
  };

  useEffect(() => {
    if (mapLoaded) {
      addMarkersToMap();
    }
  }, [pins, mapLoaded]);

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    onPinClick(pin);
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Google Maps Container */}
      <div 
        ref={mapRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          background: !mapLoaded ? `
            radial-gradient(circle at 20% 80%, rgba(120, 62, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 100%)
          ` : undefined
        }}
      />

      {/* Loading Indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-white font-medium">Loading Map...</span>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Map Overlay for Demo (when Google Maps fails to load) */}
      {(!window.google?.maps || !mapLoaded) && (
        <div className="absolute inset-0">
          {/* Mock satellite view */}
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="satellite" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                      <rect width="400" height="400" fill="#1a2e1a"/>
                      <path d="M0,200 L400,200" stroke="#4a5568" stroke-width="4" opacity="0.9"/>
                      <path d="M200,0 L200,400" stroke="#4a5568" stroke-width="3" opacity="0.8"/>
                      <path d="M0,100 L400,100" stroke="#3a4555" stroke-width="2" opacity="0.7"/>
                      <path d="M0,300 L400,300" stroke="#3a4555" stroke-width="2" opacity="0.7"/>
                      <path d="M100,0 L100,400" stroke="#3a4555" stroke-width="1.5" opacity="0.6"/>
                      <path d="M300,0 L300,400" stroke="#3a4555" stroke-width="1.5" opacity="0.6"/>
                      <g opacity="0.8">
                        <rect x="50" y="50" width="80" height="60" fill="#2d3748" stroke="#4a5568" stroke-width="0.5"/>
                        <rect x="220" y="80" width="70" height="80" fill="#2d3748" stroke="#4a5568" stroke-width="0.5"/>
                        <rect x="320" y="250" width="60" height="70" fill="#2d3748" stroke="#4a5568" stroke-width="0.5"/>
                      </g>
                      <g opacity="0.7">
                        <ellipse cx="150" cy="150" rx="35" ry="30" fill="#2f5233"/>
                        <ellipse cx="320" cy="80" rx="25" ry="20" fill="#2f5233"/>
                      </g>
                      <g opacity="0.8">
                        <ellipse cx="250" cy="320" rx="40" ry="20" fill="#1e3a8a"/>
                      </g>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#satellite)"/>
                </svg>
              `)})`,
            }}
          />

          {/* Demo pins overlay for fallback */}
          {pins.map((pin, index) => {
            const pinTypes = [
              { color: 'from-orange-500 to-red-500', icon: '🔥' },
              { color: 'from-yellow-400 to-orange-500', icon: '⭐' },
              { color: 'from-blue-500 to-purple-500', icon: '🤝' },
              { color: 'from-green-500 to-blue-500', icon: '📸' },
            ];
            const pinType = pinTypes[index % pinTypes.length];
            
            return (
              <motion.div
                key={pin.id}
                className="absolute z-10 cursor-pointer"
                style={{ 
                  left: `${pin.x}%`, 
                  top: `${pin.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  y: [0, -3, 0], 
                  opacity: 1 
                }}
                transition={{ 
                  scale: { delay: 0.3 + index * 0.1, type: "spring" },
                  opacity: { delay: 0.3 + index * 0.1 },
                  y: { 
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.2
                  }
                }}
                whileHover={{ 
                  scale: 1.2,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePinClick(pin)}
              >
                <div className="relative">
                  <motion.div 
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${pinType.color} p-1 shadow-xl border-2 border-white/30`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={pin.image}
                        alt={pin.caption}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <span className="text-sm">{pinType.icon}</span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Floating Top Banner */}
      <div className="absolute top-4 left-4 right-4 z-30">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-white font-medium text-sm">Bangalore, India</span>
              </div>
              <div className="text-white/60 text-sm">•</div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl">☀️</span>
                <span className="text-white font-medium text-sm">28°C</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="text-white hover:bg-white/10 rounded-full w-8 h-8"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side Floating Controls */}
      <div className="absolute right-4 top-1/3 transform -translate-y-1/2 z-30 flex flex-col space-y-3">
        {/* Layer Toggle */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 bg-black/70 backdrop-blur-md text-white hover:bg-white/10 rounded-full shadow-xl border border-white/10"
          >
            <Layers className="w-5 h-5" />
          </Button>
        </motion.div>
        
        {/* Location Center */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (googleMapRef.current) {
                googleMapRef.current.panTo(GOOGLE_MAPS_CONFIG.center);
                googleMapRef.current.setZoom(GOOGLE_MAPS_CONFIG.zoom);
              }
            }}
            className="w-12 h-12 bg-black/70 backdrop-blur-md text-white hover:bg-white/10 rounded-full shadow-xl border border-white/10"
          >
            <Navigation className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>

      {/* Floating Weather Cards */}
      <div className="absolute top-20 right-4 z-20">
        <motion.div
          className="bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-white">
            <span className="text-xl">⛅</span>
            <div>
              <p className="text-sm font-medium">Partly Cloudy</p>
              <p className="text-xs text-white/60">28°C</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chip Selector Row */}
      <div className="absolute bottom-24 left-0 right-0 z-30 px-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-xl">
            {['Memories', 'Visited', 'Popular', 'Favorites'].map((tab, index) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.toLowerCase()
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab === 'Memories' && <Clock className="w-4 h-4" />}
                {tab === 'Visited' && <MapPin className="w-4 h-4" />}
                {tab === 'Popular' && <Users className="w-4 h-4" />}
                {tab === 'Favorites' && <span className={activeTab === tab.toLowerCase() ? "text-red-500" : "text-red-400"}>♥</span>}
                <span>{tab}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Camera Button */}
      <div className="absolute bottom-20 right-6 z-30">
        <motion.button
          onClick={onCameraClick}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.5 }}
        >
          <Camera className="w-8 h-8 text-black" />
        </motion.button>
      </div>

      {/* Pin Details Modal */}
      <AnimatePresence>
        {selectedPin && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-end z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPin(null)}
          >
            <motion.div
              className="w-full bg-black/90 backdrop-blur-md rounded-t-3xl p-6 max-h-80"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src={selectedPin.image}
                    alt={selectedPin.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <ImageWithFallback
                      src={selectedPin.authorAvatar}
                      alt={selectedPin.author}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white font-medium">{selectedPin.author}</span>
                    <span className="text-gray-400 text-sm">• {formatTimeAgo(selectedPin.timestamp)}</span>
                  </div>
                  
                  <p className="text-gray-300 mb-3">{selectedPin.caption}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedPin.hashtags.map((tag) => (
                      <span key={tag} className="text-blue-400 text-sm">#{tag}</span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-400 text-sm">
                    <span>❤️ {selectedPin.likes}</span>
                    <span>💬 {selectedPin.comments}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center mt-4">
                <div className="w-12 h-1 bg-gray-600 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
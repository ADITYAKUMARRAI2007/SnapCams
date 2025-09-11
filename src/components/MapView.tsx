import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Plus, Navigation, Search, Filter, Users, Compass, Home, Clock, UserPlus, Settings, Map, Layers, X, Heart, MessageCircle, Share } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Extend the Window interface to include google.maps
declare global {
  interface Window {
    google?: any;
    initGoogleMaps?: () => void;
  }
}

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
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeTab, setActiveTab] = useState('memories');
  const [mapLoaded, setMapLoaded] = useState(false);

  const [showFriendStories, setShowFriendStories] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isStoryPlaying, setIsStoryPlaying] = useState(false);

  // Mock story posts for each friend
  const friendStories = {
    '1': [
      {
        id: '1-1',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbnxlbnwwfHx8fDE3NTcxMDM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
        caption: 'Morning hike vibes 🏔️✨',
        timestamp: '2h ago',
        location: 'Mountain Peak'
      },
      {
        id: '1-2',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3R8ZW58MHx8fHwxNzU3MTAzNDI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        caption: 'Lost in the forest 🌲',
        timestamp: '4h ago',
        location: 'Forest Trail'
      },
      {
        id: '1-3',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXR8ZW58MHx8fHwxNzU3MTAzNDI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        caption: 'Golden hour magic ✨',
        timestamp: '6h ago',
        location: 'Sunset Point'
      }
    ],
    '2': [
      {
        id: '2-1',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5fGVufDB8fHx8MTc1NzEwMzQyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
        caption: 'City lights never sleep 🌃',
        timestamp: '1h ago',
        location: 'Downtown'
      },
      {
        id: '2-2',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZl8ZW58MHx8fHwxNzU3MTAzNDI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        caption: 'Coffee and creativity ☕',
        timestamp: '3h ago',
        location: 'Local Cafe'
      }
    ],
    '3': [
      {
        id: '3-1',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaHxlbnwwfHx8fDE3NTcxMDM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
        caption: 'Beach day vibes 🏖️',
        timestamp: '30m ago',
        location: 'Sandy Beach'
      },
      {
        id: '3-2',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcnxlbnwwfHx8fDE3NTcxMDM0Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
        caption: 'Ocean waves therapy 🌊',
        timestamp: '2h ago',
        location: 'Ocean View'
      },
      {
        id: '3-3',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXR8ZW58MHx8fHwxNzU3MTAzNDI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        caption: 'Sunset meditation 🧘‍♀️',
        timestamp: '5h ago',
        location: 'Beach Pier'
      }
    ]
  };

  const [friends] = useState([
    {
      id: '1',
      username: 'alexandra_dreams',
      displayName: 'Alexandra',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
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
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      location: { x: 70, y: 60 },
      isOnline: false,
      lastSeen: '1h ago',
      activity: 'Sunset Hills'
    },
    {
      id: '3',
      username: 'urban_explorer',
      displayName: 'Street Artist',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      location: { x: 65, y: 80 },
      isOnline: true,
      lastSeen: 'now',
      activity: 'Art District',
      badge: 'Top Pick'
    },
    {
      id: '4',
      username: 'nature_lover',
      displayName: 'Emma',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      location: { x: 20, y: 70 },
      isOnline: true,
      lastSeen: '5m ago',
      activity: 'Central Park',
      badge: 'New Story'
    },
    {
      id: '5',
      username: 'city_photographer',
      displayName: 'Marcus',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      location: { x: 80, y: 30 },
      isOnline: false,
      lastSeen: '3h ago',
      activity: 'Skyline View'
    }
  ]);

  const [places] = useState([
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

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log('Google Maps script already loading');
        // If script is already loading, set up callback anyway
        (window as any).initGoogleMaps = () => {
          console.log('Google Maps callback triggered (existing script)');
          initializeMap();
          delete (window as any).initGoogleMaps;
        };
        return;
      }

      // Get Google Maps API key from environment or use demo mode
      const API_KEY: string = 'AIzaSyBl6C1l-LqgdLmLYswhBa5FZWuEHjDHC18';
      
      console.log('Google Maps API Key:', API_KEY ? 'Present' : 'Missing');
      
      if (!API_KEY || API_KEY === 'DEMO_MODE') {
        console.log('Demo mode: Using fallback map implementation');
        createMockGoogleMaps();
        return;
      }

      try {
        // Use a simple, static callback name
        const callbackName = 'initGoogleMaps';
        
        // Set up global callback BEFORE creating the script
        (window as any)[callbackName] = () => {
          console.log('Google Maps callback triggered');
          initializeMap();
          // Don't delete immediately, let cleanup handle it
        };
        
        // Create script element with proper async loading
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&loading=async&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        
        // Ensure callback is attached to window before script loads
        script.onload = () => {
          console.log('Google Maps script loaded successfully');
          // Double-check that callback is still available
          if ((window as any)[callbackName]) {
            console.log('Callback function is available');
          } else {
            console.log('Callback function missing, setting up again');
            (window as any)[callbackName] = () => {
              console.log('Google Maps callback triggered (onload)');
          initializeMap();
              delete (window as any)[callbackName];
            };
          }
        };
        
        script.onerror = (error) => {
          console.error('Google Maps API failed to load:', error);
          createMockGoogleMaps();
          delete (window as any)[callbackName];
        };
        
        document.head.appendChild(script);
        
        // Fallback timeout in case callback never fires
        setTimeout(() => {
          if (!mapLoaded) {
            console.log('Google Maps loading timeout, using fallback');
            createMockGoogleMaps();
            // Don't delete callback here, let cleanup handle it
          }
        }, 10000); // 10 second timeout
        
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        createMockGoogleMaps();
      }
    };

    loadGoogleMaps();

    // Cleanup function
    return () => {
      // Clean up global callback
      if ((window as any).initGoogleMaps) {
        delete (window as any).initGoogleMaps;
      }
    };
  }, []);

  // Auto-play stories with slow transitions
  useEffect(() => {
    if (showFriendStories && selectedFriend && isStoryPlaying) {
      const stories = friendStories[selectedFriend.id as keyof typeof friendStories] || [];
      if (stories.length > 0) {
        const timer = setTimeout(() => {
          setCurrentStoryIndex((prev) => {
            const nextIndex = prev + 1;
            if (nextIndex >= stories.length) {
              setIsStoryPlaying(false);
              setShowFriendStories(false);
              return 0;
            }
            return nextIndex;
          });
        }, 4000); // 4 seconds per story for slow, aesthetic feel

        return () => clearTimeout(timer);
      }
    }
  }, [showFriendStories, selectedFriend, currentStoryIndex, isStoryPlaying]);

  const handleStoryNext = () => {
    if (selectedFriend) {
      const stories = friendStories[selectedFriend.id as keyof typeof friendStories] || [];
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        setShowFriendStories(false);
        setIsStoryPlaying(false);
      }
    }
  };

  const handleStoryPrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const createMockGoogleMaps = () => {
    // Create a mock Google Maps implementation for demo
    setMapLoaded(true);
  };

  const initializeMap = () => {
    try {
    if (mapRef.current && window.google?.maps) {
        console.log('Initializing Google Map...');
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: GOOGLE_MAPS_CONFIG.center,
        zoom: GOOGLE_MAPS_CONFIG.zoom,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
          fullscreenControl: false
      });

        console.log('Google Map initialized successfully');
      setMapLoaded(true);
      addMarkersToMap();
      } else {
        console.error('Map ref or Google Maps not available');
        createMockGoogleMaps();
      }
    } catch (error) {
      console.error('Error initializing Google Map:', error);
      createMockGoogleMaps();
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

      // Use regular markers instead of Advanced Markers to avoid API issues
      if (window.google.maps.Marker) {
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: googleMapRef.current,
          title: pin.caption,
          icon: {
            url: pin.image,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          }
        });

        marker.addListener('click', () => {
          setSelectedPin(pin);
          onPinClick(pin);
        });

        markersRef.current.push(marker);
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

          {/* Friend location markers - Snapchat style */}
          {friends.map((friend, index) => (
            <motion.div
              key={friend.id}
              className="absolute z-20 cursor-pointer"
              style={{ 
                left: `${friend.location.x}%`, 
                top: `${friend.location.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                y: [0, -2, 0], 
                opacity: 1 
              }}
              transition={{ 
                scale: { delay: 0.5 + index * 0.1, type: "spring" },
                opacity: { delay: 0.5 + index * 0.1 },
                y: { 
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.3
                }
              }}
              whileHover={{ 
                scale: 1.3,
                y: -8,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelectedFriend(friend);
                setCurrentStoryIndex(0);
                setIsStoryPlaying(true);
                setShowFriendStories(true);
              }}
            >
              <div className="relative">
                {/* Friend avatar with online indicator */}
                <motion.div 
                  className={`w-10 h-10 rounded-full p-0.5 shadow-lg border-2 ${
                    friend.isOnline 
                      ? 'border-green-400 bg-green-400' 
                      : 'border-gray-400 bg-gray-400'
                  }`}
                  animate={friend.isOnline ? {
                    boxShadow: [
                      '0 0 0 0 rgba(34, 197, 94, 0.7)',
                      '0 0 0 10px rgba(34, 197, 94, 0)',
                      '0 0 0 0 rgba(34, 197, 94, 0)'
                    ]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <ImageWithFallback
                      src={friend.avatar}
                      alt={friend.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
                
                {/* Story indicator */}
                {friend.badge && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    <span className="text-xs">📸</span>
                  </motion.div>
                )}
                
                {/* Friend name tooltip */}
                <motion.div 
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 pointer-events-none"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {friend.displayName}
                  {friend.isOnline && <span className="text-green-400 ml-1">●</span>}
                </motion.div>
              </div>
            </motion.div>
          ))}
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

      {/* Instagram-style Friend Stories Modal */}
      <AnimatePresence>
        {showFriendStories && selectedFriend && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowFriendStories(false);
              setIsStoryPlaying(false);
            }}
          >
            <motion.div
              className="w-full h-full max-w-md max-h-[90vh] bg-black rounded-2xl overflow-hidden relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const stories = friendStories[selectedFriend.id as keyof typeof friendStories] || [];
                const currentStory = stories[currentStoryIndex];
                
                if (!currentStory) return null;

                return (
                  <>
                    {/* Story Header */}
                    <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                            <ImageWithFallback
                              src={selectedFriend.avatar}
                              alt={selectedFriend.displayName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm">{selectedFriend.displayName}</h3>
                            <p className="text-gray-300 text-xs">{currentStory.timestamp}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowFriendStories(false);
                            setIsStoryPlaying(false);
                          }}
                          className="text-white hover:bg-white/20 w-8 h-8"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      {/* Story Progress Bar */}
                      <div className="mt-3 flex space-x-1">
                        {stories.map((_, index) => (
                          <motion.div
                            key={index}
                            className="h-1 rounded-full bg-white/30"
                            style={{ flex: 1 }}
                            initial={{ scaleX: 0 }}
                            animate={{ 
                              scaleX: index <= currentStoryIndex ? 1 : 0,
                              backgroundColor: index === currentStoryIndex ? '#ffffff' : index < currentStoryIndex ? '#ffffff' : 'rgba(255,255,255,0.3)'
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Story Image with Slow Transition */}
                    <motion.div
                      className="w-full h-full relative"
                      key={currentStory.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <ImageWithFallback
                        src={currentStory.image}
                        alt={currentStory.caption}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </motion.div>

                    {/* Story Caption */}
                    <motion.div
                      className="absolute bottom-20 left-0 right-0 p-4 z-10"
                      key={`caption-${currentStory.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4">
                        <p className="text-white text-lg font-medium mb-2">{currentStory.caption}</p>
                        <div className="flex items-center space-x-2 text-gray-300 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{currentStory.location}</span>
                          <span>•</span>
                          <span>{currentStory.timestamp}</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Story Actions */}
                    <motion.div
                      className="absolute bottom-4 left-0 right-0 p-4 z-10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    >
                      <div className="flex items-center justify-center space-x-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                        >
                          <Heart className="w-6 h-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                        >
                          <MessageCircle className="w-6 h-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                        >
                          <Share className="w-6 h-6" />
                        </Button>
                      </div>
                    </motion.div>

                    {/* Navigation Areas */}
                    <div className="absolute inset-0 flex">
                      <div 
                        className="w-1/2 h-full cursor-pointer"
                        onClick={handleStoryPrev}
                      />
                      <div 
                        className="w-1/2 h-full cursor-pointer"
                        onClick={handleStoryNext}
                      />
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
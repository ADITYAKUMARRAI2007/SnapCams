import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import realTimeMapService from '../services/realTimeMapService';
import { apiService } from '../services/api';
import dataSyncService from '../services/dataSyncService';
import ConnectionStatus from './ConnectionStatus';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token - try with a public token first
mapboxgl.accessToken = 'pk.eyJ1IjoiYWRpMDQwMTIwMDciLCJhIjoiY21mZGRoanpuMDBiNTJ3b2VldnNxZnEzMiJ9.SrfTVnTgfGo9zel0MDLNIg';

console.log('🗺️ Mapbox token set:', mapboxgl.accessToken.substring(0, 20) + '...');
console.log('🗺️ Mapbox version:', mapboxgl.version);

// Realistic mutual friends/followers data with multiple posts each
const mockFriends = [
  {
    id: '1',
    name: 'Alex Chen',
    username: 'alexchen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: { lat: 20.5937, lng: 78.9629 }, // Mumbai, India
    isOnline: true,
    lastSeen: 'Active now',
    posts: [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
        caption: 'Beautiful sunset at Gateway of India! 🌅 #Mumbai #Sunset',
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        likes: 24,
        comments: 8
      },
      {
        id: '2',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
        caption: 'Street food adventure in Colaba! 🍜 #Foodie #Mumbai',
        timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
        likes: 18,
        comments: 12
      },
      {
        id: '3',
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=600&fit=crop',
        caption: 'Morning jog at Marine Drive! 🏃‍♂️ #Fitness #Mumbai',
        timestamp: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
        likes: 31,
        comments: 5
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    username: 'sarahj',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    location: { lat: 51.5074, lng: -0.1278 }, // London, UK
    isOnline: false,
    lastSeen: '2 hours ago',
    posts: [
      {
        id: '4',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=600&fit=crop',
        caption: 'Big Ben looking majestic today! 🇬🇧 #London #BigBen',
        timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
        likes: 42,
        comments: 15
      },
      {
        id: '5',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop',
        caption: 'Tea time at Covent Garden! ☕ #TeaTime #London',
        timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
        likes: 28,
        comments: 9
      }
    ]
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    username: 'mikerod',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: { lat: 40.7128, lng: -74.0060 }, // New York, USA
    isOnline: true,
    lastSeen: 'Active now',
    posts: [
      {
        id: '6',
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=600&fit=crop',
        caption: 'NYC skyline from Brooklyn Bridge! 🗽 #NYC #BrooklynBridge',
        timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
        likes: 67,
        comments: 23
      },
      {
        id: '7',
        image: 'https://images.unsplash.com/photo-1555992336-03a23b1a2b5c?w=400&h=600&fit=crop',
        caption: 'Central Park vibes! 🌳 #CentralPark #NYC',
        timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
        likes: 35,
        comments: 11
      },
      {
        id: '8',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=600&fit=crop',
        caption: 'Times Square at night! 🌃 #TimesSquare #NYC',
        timestamp: Date.now() - 7 * 60 * 60 * 1000, // 7 hours ago
        likes: 89,
        comments: 34
      }
    ]
  },
  {
    id: '4',
    name: 'Emma Tanaka',
    username: 'emmat',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: { lat: 35.6762, lng: 139.6503 }, // Tokyo, Japan
    isOnline: false,
    lastSeen: '1 day ago',
    posts: [
      {
        id: '9',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=600&fit=crop',
        caption: 'Sakura season in Tokyo! 🌸 #Sakura #Tokyo #Spring',
        timestamp: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
        likes: 156,
        comments: 45
      },
      {
        id: '10',
        image: 'https://images.unsplash.com/photo-1542640244-a10b6e5d1e2b?w=400&h=600&fit=crop',
        caption: 'Sushi dinner in Shibuya! 🍣 #Sushi #Tokyo #Food',
        timestamp: Date.now() - 15 * 60 * 60 * 1000, // 15 hours ago
        likes: 73,
        comments: 28
      }
    ]
  },
  {
    id: '5',
    name: 'David Kim',
    username: 'davidk',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: { lat: -33.8688, lng: 151.2093 }, // Sydney, Australia
    isOnline: true,
    lastSeen: 'Active now',
    posts: [
      {
        id: '11',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
        caption: 'Sydney Opera House at sunset! 🎭 #Sydney #OperaHouse',
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        likes: 94,
        comments: 19
      },
      {
        id: '12',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
        caption: 'Bondi Beach vibes! 🏄‍♂️ #BondiBeach #Sydney',
        timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
        likes: 52,
        comments: 16
      },
      {
        id: '13',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
        caption: 'Harbour Bridge climb! 🌉 #HarbourBridge #Sydney',
        timestamp: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
        likes: 78,
        comments: 22
      }
    ]
  },
  {
    id: '6',
    name: 'Lisa Dubois',
    username: 'lisad',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    location: { lat: 48.8566, lng: 2.3522 }, // Paris, France
    isOnline: false,
    lastSeen: '3 hours ago',
    posts: [
      {
        id: '14',
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=600&fit=crop',
        caption: 'Eiffel Tower from Trocadéro! 🗼 #Paris #EiffelTower',
        timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
        likes: 128,
        comments: 37
      },
      {
        id: '15',
        image: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400&h=600&fit=crop',
        caption: 'Café culture in Montmartre! ☕ #Paris #Montmartre',
        timestamp: Date.now() - 7 * 60 * 60 * 1000, // 7 hours ago
        likes: 65,
        comments: 21
      },
      {
        id: '16',
        image: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400&h=600&fit=crop',
        caption: 'Louvre Pyramid at golden hour! 🏛️ #Louvre #Paris',
        timestamp: Date.now() - 10 * 60 * 60 * 1000, // 10 hours ago
        likes: 91,
        comments: 29
      }
    ]
  }
];

interface MapboxMapViewProps {
  onClose: () => void;
}

const MapboxMapView = ({ onClose }: MapboxMapViewProps) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showFriendStories, setShowFriendStories] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isStoryPlaying, setIsStoryPlaying] = useState(false);
  const [friends, setFriends] = useState([]);
  const [mapType, setMapType] = useState('satellite'); // 'satellite' or 'heatmap'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConvertToStory, setShowConvertToStory] = useState(false);

  // Wrapper that converts current user's posts into a story
  const convertPostsToStory = async () => {
    const currentUserId = 'current_user';
    await convertPostsToStoryForUser(currentUserId);
    setShowConvertToStory(false);
  };

  // Auto-advance stories
  useEffect(() => {
    if (isStoryPlaying && selectedFriend && selectedFriend.stories) {
      const timer = setTimeout(() => {
        if (currentStoryIndex < selectedFriend.stories.length - 1) {
          setCurrentStoryIndex(prev => prev + 1);
        } else {
          // End of stories - close modal
          handleCloseStories();
        }
      }, 3000); // 3 seconds per story

      return () => clearTimeout(timer);
    }
  }, [isStoryPlaying, currentStoryIndex, selectedFriend]);

  // Data synchronization integration
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const initializeDataSync = async () => {
      try {
        // Initialize data sync service
        await dataSyncService.initialize();
        
        // Set up data sync listener
        const unsubscribe = dataSyncService.addListener((event, data) => {
          if (event === 'friends_updated') {
            console.log('🔄 Friends data updated:', data.length);
            setFriends(data);
            setIsLoading(false);
          }
        });

        // Get initial data
        const initialFriends = dataSyncService.getCachedData('friends');
        if (initialFriends) {
          setFriends(initialFriends);
          setIsLoading(false);
        } else {
          // Trigger initial sync
          await dataSyncService.syncAllData();
        }

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing data sync:', error);
        setError('Failed to connect to backend. Please check your connection.');
        setIsLoading(false);
        return null;
      }
    };

    initializeDataSync();

    return () => {
      dataSyncService.destroy();
    };
  }, []);

  // Convert all posts by a user into a story (server-side aggregation)
  const convertPostsToStoryForUser = async (userId: string) => {
    if (isConverting) return;
    setIsConverting(true);
    try {
      const posts = (window as any)._mockPostsByUser?.(userId) || [];
      if (!posts.length) {
        console.log('No posts to convert for user', userId);
        return;
      }
      // Prepare minimal story payload; backend will accept image + metadata per frame
      const storyPayload = {
        caption: `Highlights from @${userId}`,
        hashtags: ['highlights', 'memories', 'map', 'snapcap'],
        frames: posts.map((p: any) => ({ imageUrl: p.image, caption: p.caption }))
      };
      const firstImageUrl = posts[0].image;
      // Fetch image as blob and send as file for thumbnail/first frame
      const res = await fetch(firstImageUrl);
      const blob = await res.blob();
      const file = new File([blob], 'story.jpg', { type: blob.type || 'image/jpeg' });
      const story = await apiService.createStory(storyPayload, file);
      console.log('✅ Story created from posts:', story);
    } catch (e) {
      console.error('❌ Failed converting posts to story', e);
    } finally {
      setIsConverting(false);
    }
  };

  // Update markers when friends data changes
  useEffect(() => {
    if (mapRef.current && friends.length > 0) {
      console.log('📍 Updating markers with real-time data:', friends.length);
      // Clear existing markers
      markersRef.current.forEach(markerData => {
        if (markerData.marker && markerData.marker.element) {
          markerData.marker.element.remove();
        }
      });
      markersRef.current = [];
      
      // Add new markers
      addFriendMarkers(mapRef.current);
    }
  }, [friends.length]); // Only depend on length to prevent infinite loops

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Mapbox map with error handling
    try {
      console.log('🗺️ Initializing Mapbox map...');
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        },
        center: [0, 0], // Global view
        zoom: 2,
        pitch: 0,
        bearing: 0
      });

      mapRef.current = map;

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Wait for map to load
      map.on('load', () => {
        setMapLoaded(true);
        console.log('✅ Mapbox map loaded successfully');

        // Add friend markers
        addFriendMarkers(mapRef.current);
      });

      // Handle map errors
      map.on('error', (e) => {
        console.error('❌ Mapbox error:', e);
        setMapLoaded(true); // Still show the container
      });

      // Handle style load errors
      map.on('style.load', () => {
        console.log('✅ Mapbox style loaded');
      });

    } catch (error) {
      console.error('❌ Failed to initialize Mapbox:', error);
      setMapLoaded(true);
    }

    // Handle map resize
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      // Clean up SNAPCHAT-STYLE markers
      markersRef.current.forEach(markerData => {
        if (markerData.marker && markerData.marker.element) {
          markerData.marker.element.remove();
        }
      });
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const addFriendMarkers = (map) => {
    // Only add markers if they don't already exist
    if (markersRef.current.length > 0) {
      console.log('📍 Markers already exist, skipping creation');
      return;
    }
    
    console.log('📍 Creating SNAPCHAT-STYLE markers (HTML overlay approach)...');

    friends.forEach((friend) => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'friend-marker';
      markerElement.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        background-image: url('${friend.avatar}');
        background-size: cover;
        background-position: center;
        position: relative;
        transition: transform 0.2s ease;
      `;

      // Add hover effect
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.1)';
      });
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      // SNAPCHAT-STYLE: Use HTML overlay instead of Mapbox markers
      // This prevents the "running away" issue completely
      const marker = {
        element: markerElement,
        position: { lng: friend.location.lng, lat: friend.location.lat },
        updatePosition: () => {
          const point = map.project([friend.location.lng, friend.location.lat]);
          markerElement.style.position = 'absolute';
          markerElement.style.left = `${point.x - 30}px`;
          markerElement.style.top = `${point.y - 30}px`;
          markerElement.style.zIndex = '1000';
        }
      };
      
      // Add marker to map container directly
      map.getContainer().appendChild(markerElement);
      marker.updatePosition();
      
      console.log(`📍 Created marker for ${friend.name} at:`, friend.location.lng, friend.location.lat);

      // Store marker reference with original position
      const markerData = {
        marker: marker,
        originalPosition: { lng: friend.location.lng, lat: friend.location.lat },
        friend: friend
      };
      markersRef.current.push(markerData);

      // Add click handler - SIMPLE with SNAPCHAT-STYLE markers
      markerElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🎯 SNAPCHAT-STYLE marker clicked for:', friend.name);
        
        // Convert posts to stories format
        const friendWithStories = {
          ...friend,
          stories: friend.posts || []
        };
        
        // Ensure we have stories to show
        if (friendWithStories.stories.length === 0) {
          console.warn('⚠️ No stories found for', friend.name);
          return;
        }
        
        // Show story modal - NO MAP LOCKING NEEDED
        setSelectedFriend(friendWithStories);
        setShowFriendStories(true);
        setCurrentStoryIndex(0);
        setIsStoryPlaying(true);
        
        console.log('🎬 Story modal opened with', friendWithStories.stories.length, 'stories');
      });

      // Add name label
      const labelElement = document.createElement('div');
      labelElement.className = 'friend-label';
      labelElement.textContent = friend.name;
      labelElement.style.cssText = `
        position: absolute;
        top: 65px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        pointer-events: none;
        z-index: 1;
      `;

      markerElement.appendChild(labelElement);
      markersRef.current.push(marker);
    });

    // Add position update listeners for SNAPCHAT-STYLE positioning
    const updateAllMarkerPositions = () => {
      markersRef.current.forEach(markerData => {
        if (markerData.marker && markerData.marker.updatePosition) {
          markerData.marker.updatePosition();
        }
      });
    };

    // Update positions on map events
    map.on('move', updateAllMarkerPositions);
    map.on('zoom', updateAllMarkerPositions);
    map.on('rotate', updateAllMarkerPositions);
    map.on('pitch', updateAllMarkerPositions);

    console.log('✅ SNAPCHAT-STYLE markers created - NO MORE RUNNING AWAY!');
  };

  // Auto-play stories with slow transitions
  useEffect(() => {
    if (showFriendStories && selectedFriend && isStoryPlaying) {
      const timer = setTimeout(() => {
        if (currentStoryIndex < selectedFriend.stories.length - 1) {
          setCurrentStoryIndex(prev => prev + 1);
        } else {
          setIsStoryPlaying(false);
        }
      }, 4000); // 4 seconds per story

      return () => clearTimeout(timer);
    }
  }, [showFriendStories, selectedFriend, isStoryPlaying, currentStoryIndex]);

  const handleStoryNext = () => {
    if (selectedFriend && currentStoryIndex < selectedFriend.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    }
  };

  const handleStoryPrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const handleCloseStories = () => {
    setShowFriendStories(false);
    setSelectedFriend(null);
    setCurrentStoryIndex(0);
    setIsStoryPlaying(false);
    
    console.log('🎬 Story modal closed - SNAPCHAT-STYLE markers remain stable');
  };

  const toggleMapType = () => {
    if (!mapRef.current) return;
    
    const newMapType = mapType === 'satellite' ? 'heatmap' : 'satellite';
    setMapType(newMapType);
    
    console.log('🔄 Switching to:', newMapType);
    
    // Switch map style with proper error handling
    if (newMapType === 'satellite') {
      // Use Mapbox satellite style
      mapRef.current.setStyle('mapbox://styles/mapbox/satellite-v9');
      console.log('✅ Switched to satellite view');
    } else {
      // Use Mapbox light style for heatmap view
      mapRef.current.setStyle('mapbox://styles/mapbox/light-v11');
      console.log('✅ Switched to heatmap view');
    }

    // Re-add markers after style change
    mapRef.current.once('style.load', () => {
      console.log('🎨 Style loaded, re-adding markers...');
      // Clear existing SNAPCHAT-STYLE markers
      markersRef.current.forEach(markerData => {
        if (markerData.marker && markerData.marker.element) {
          markerData.marker.element.remove();
        }
      });
      markersRef.current = [];
      // Re-add markers
      addFriendMarkers(mapRef.current);
    });
  };

  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [0, 0],
        zoom: 2,
        pitch: 0,
        bearing: 0
      });
    }
  };

  return (
    <div className="w-full h-full bg-black flex flex-col overflow-hidden">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading friends on map...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-6 text-center max-w-md">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <p className="text-white text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <ConnectionStatus />

      {/* Map Container - Fully Responsive */}
      <div className="flex-1 relative min-h-0">
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ 
            minHeight: '300px',
            width: '100%',
            height: '100%'
          }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-2 sm:mb-4"></div>
              <p className="text-white text-sm sm:text-base">Loading Mapbox Map...</p>
            </div>
          </div>
        )}

        {/* Map Controls - Top Right */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          <button 
            onClick={() => setShowConvertToStory(true)}
            className="w-10 h-10 bg-purple-600/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
            title="Convert posts to story"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button 
            onClick={toggleMapType}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            title={`Switch to ${mapType === 'satellite' ? 'heatmap' : 'satellite'} view`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button 
            onClick={resetMapView}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            title="Reset map view"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Floating Action Buttons - Right Side */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2 z-10">
          <button 
            onClick={() => {
              // Add friend functionality
              console.log('Add friend clicked');
            }}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Add friend"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button 
            onClick={() => {
              // Share location functionality
              console.log('Share location clicked');
            }}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Share location"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>

        {/* Location/Center Button - Like in the image */}
        <button 
          onClick={resetMapView}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-10"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        {/* Camera Button - Responsive */}
        <button 
          onClick={() => {
            // Camera functionality
            console.log('Camera clicked');
          }}
          className="absolute bottom-16 sm:bottom-20 right-2 sm:right-4 w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-10"
          title="Take photo"
        >
          <svg className="w-5 h-5 sm:w-7 sm:h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Friend Stories Modal - Horizontal Snapchat-style bar */}
      <AnimatePresence>
        {showFriendStories && selectedFriend && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50"
            style={{ zIndex: 9999 }}
          >
            <div className="relative h-23 bg-black/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Progress bars */}
              <div className="absolute top-2 left-2 right-2 flex space-x-1 z-10">
                {selectedFriend.stories.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index < currentStoryIndex
                        ? 'bg-white'
                        : index === currentStoryIndex
                        ? 'bg-white/60'
                        : 'bg-white/20'
                    }`}
                    style={{ width: `${100 / selectedFriend.stories.length}%` }}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={handleCloseStories}
                className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Story content - Horizontal layout */}
              <div className="flex items-center h-full pt-6 px-4">
                {/* Current story image */}
                <div className="w-60 h-50 rounded-xl overflow-hidden border-2 border-white flex-shrink-0">
                  {selectedFriend.stories[currentStoryIndex] && (
                    <img
                      src={selectedFriend.stories[currentStoryIndex].image}
                      alt={selectedFriend.stories[currentStoryIndex].caption}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Story info */}
                <div className="flex-1 ml-4 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white">
                      <img
                        src={selectedFriend.avatar}
                        alt={selectedFriend.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white text-2xl font-semibold">{selectedFriend.name}</span>
                    <span className="text-white/60 text-xl">{selectedFriend.lastSeen}</span>
                  </div>
                  
                  {selectedFriend.stories[currentStoryIndex] && (
                    <p className="text-white/90 text-2xl leading-relaxed truncate">
                      {selectedFriend.stories[currentStoryIndex].caption}
                    </p>
                  )}
                  
                  {/* Story counter */}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-white/60 text-xl">
                      {currentStoryIndex + 1} of {selectedFriend.stories.length}
                    </span>
                    <div className="flex space-x-1">
                      {selectedFriend.stories.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1 h-1 rounded-full ${
                            index === currentStoryIndex ? 'bg-white' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Navigation arrows */}
                <div className="flex space-x-2">
                  <button
                    onClick={handleStoryPrev}
                    disabled={currentStoryIndex === 0}
                    className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleStoryNext}
                    disabled={currentStoryIndex === selectedFriend.stories.length - 1}
                    className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Convert Posts to Story Modal */}
        <AnimatePresence>
          {showConvertToStory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 mx-4 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Convert Posts to Story</h3>
                <p className="text-gray-600 mb-6">
                  This will convert all your recent posts into a story that will be visible for 24 hours.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConvertToStory(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={convertPostsToStory}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Convert to Story
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};

export default MapboxMapView; 
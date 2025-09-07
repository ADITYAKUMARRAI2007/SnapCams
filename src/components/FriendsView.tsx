import React, { useState } from 'react';
import { Search, UserPlus, MessageCircle, Heart, MapPin, Users, Settings, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LiquidEtherBackground } from './LiquidEtherBackground';

interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isFollowing: boolean;
  isFollowingBack: boolean;
  mutualFriends: number;
  lastSeen: string;
  streak: number;
  location?: string;
  status: 'online' | 'offline' | 'away';
  snapScore: number;
  bestFriends: boolean;
}

interface FriendRequest {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mutualFriends: number;
  timeAgo: string;
}

interface SuggestedFriend {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mutualFriends: number;
  reason: string;
}

interface FriendsViewProps {
  onAddFriend: (friendId: string) => void;
  onMessageFriend: (friendId: string) => void;
}

export function FriendsView({ onAddFriend, onMessageFriend }: FriendsViewProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  const [friends] = useState<Friend[]>([
    {
      id: '1',
      username: 'alexandra_dreams',
      displayName: 'Alexandra ✨',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      isFollowing: true,
      isFollowingBack: true,
      mutualFriends: 12,
      lastSeen: '2m ago',
      streak: 15,
      location: 'Downtown Coffee',
      status: 'online',
      snapScore: 2847,
      bestFriends: true
    },
    {
      id: '2',
      username: 'cosmic_wanderer',
      displayName: 'Cosmic Soul 🌙',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      isFollowing: true,
      isFollowingBack: true,
      mutualFriends: 8,
      lastSeen: '1h ago',
      streak: 23,
      location: 'Sunset Hills',
      status: 'away',
      snapScore: 1956,
      bestFriends: true
    },
    {
      id: '3',
      username: 'urban_explorer',
      displayName: 'Street Artist 🎨',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      isFollowing: true,
      isFollowingBack: false,
      mutualFriends: 15,
      lastSeen: '3h ago',
      streak: 8,
      status: 'offline',
      snapScore: 3421,
      bestFriends: false
    },
    {
      id: '4',
      username: 'mountain_soul',
      displayName: 'Adventure Seeker ⛰️',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      isFollowing: true,
      isFollowingBack: true,
      mutualFriends: 6,
      lastSeen: '1d ago',
      streak: 67,
      location: 'Rocky Mountains',
      status: 'offline',
      snapScore: 4892,
      bestFriends: false
    }
  ]);

  const [friendRequests] = useState<FriendRequest[]>([
    {
      id: '1',
      username: 'photo_enthusiast',
      displayName: 'Maya Photography 📷',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      mutualFriends: 3,
      timeAgo: '2h'
    },
    {
      id: '2',
      username: 'city_explorer',
      displayName: 'Urban Nomad 🏙️',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      mutualFriends: 7,
      timeAgo: '1d'
    }
  ]);

  const [suggestedFriends] = useState<SuggestedFriend[]>([
    {
      id: '1',
      username: 'travel_diary',
      displayName: 'Wanderlust Soul ✈️',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      mutualFriends: 5,
      reason: 'Friends with alexandra_dreams'
    },
    {
      id: '2',
      username: 'food_artist',
      displayName: 'Culinary Creator 🍽️',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      mutualFriends: 12,
      reason: 'Popular in your area'
    },
    {
      id: '3',
      username: 'night_photographer',
      displayName: 'Neon Dreams 🌃',
      avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
      mutualFriends: 8,
      reason: 'Similar interests'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-400';
      case 'away': return 'bg-amber-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full relative overflow-hidden" style={{
      WebkitOverflowScrolling: 'touch',
      touchAction: 'pan-y pinch-zoom'
    }}>
      {/* Liquid Ether Background */}
      <LiquidEtherBackground variant="profile" />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <motion.div
          className="p-6 pb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Friends
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline" 
                size="icon"
                className="glass border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline" 
                size="icon"
                className="glass border-white/20 text-white hover:bg-white/20"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-white/20 text-white placeholder-white/60"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-1">
            {[
              { id: 'friends', label: 'Friends', count: friends.length },
              { id: 'requests', label: 'Requests', count: friendRequests.length },
              { id: 'discover', label: 'Discover', count: suggestedFriends.length }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <motion.span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {tab.count}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="h-full overflow-y-auto scrollbar-hide px-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Friends Tab */}
              {activeTab === 'friends' && (
                <div className="space-y-4 pb-6">
                  {/* Best Friends Section */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      <span className="text-amber-400 mr-2">⭐</span>
                      Best Friends
                    </h3>
                    <div className="space-y-3">
                      {friends.filter(friend => friend.bestFriends).map((friend, index) => (
                        <motion.div
                          key={friend.id}
                          className="bg-black/30 backdrop-blur-md border border-amber-400/30 rounded-xl p-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <ImageWithFallback
                                src={friend.avatar}
                                alt={friend.displayName}
                                className="w-14 h-14 rounded-full object-cover"
                              />
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${getStatusColor(friend.status)}`} />
                              {friend.streak > 0 && (
                                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full w-6 h-6 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{friend.streak}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-white font-semibold">{friend.displayName}</h4>
                                <span className="text-amber-400">⭐</span>
                              </div>
                              <p className="text-white/60 text-sm">@{friend.username}</p>
                              <div className="flex items-center space-x-3 text-xs text-white/50 mt-1">
                                {friend.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{friend.location}</span>
                                  </div>
                                )}
                                <span>Score: {friend.snapScore.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/20"
                                onClick={() => onMessageFriend(friend.id)}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* All Friends */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-400" />
                      All Friends ({filteredFriends.length})
                    </h3>
                    <div className="space-y-3">
                      {filteredFriends.map((friend, index) => (
                        <motion.div
                          key={friend.id}
                          className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <ImageWithFallback
                                src={friend.avatar}
                                alt={friend.displayName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${getStatusColor(friend.status)}`} />
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{friend.displayName}</h4>
                              <p className="text-white/60 text-sm">@{friend.username}</p>
                              <div className="flex items-center space-x-3 text-xs text-white/50">
                                <span>{friend.mutualFriends} mutual</span>
                                <span>•</span>
                                <span>Active {friend.lastSeen}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/20 p-2"
                                onClick={() => onMessageFriend(friend.id)}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              <div className="text-right">
                                <div className="flex items-center space-x-1 justify-end mb-1">
                                  {friend.streak > 0 && (
                                    <>
                                      <span className="text-orange-400">🔥</span>
                                      <span className="text-white text-sm">{friend.streak}</span>
                                    </>
                                  )}
                                </div>
                                <p className="text-xs text-white/40">{friend.snapScore.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Friend Requests Tab */}
              {activeTab === 'requests' && (
                <div className="space-y-4 pb-6">
                  {friendRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      className="glass rounded-xl p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <ImageWithFallback
                          src={request.avatar}
                          alt={request.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{request.displayName}</h4>
                          <p className="text-white/60 text-sm">@{request.username}</p>
                          <p className="text-white/40 text-xs">{request.mutualFriends} mutual friends • {request.timeAgo} ago</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600"
                            onClick={() => onAddFriend(request.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-red-500/20"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Discover Tab */}
              {activeTab === 'discover' && (
                <div className="space-y-4 pb-6">
                  {suggestedFriends.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.id}
                      className="glass rounded-xl p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <ImageWithFallback
                          src={suggestion.avatar}
                          alt={suggestion.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{suggestion.displayName}</h4>
                          <p className="text-white/60 text-sm">@{suggestion.username}</p>
                          <p className="text-white/40 text-xs">{suggestion.reason}</p>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-400/50 text-blue-300 hover:bg-blue-500/20"
                          onClick={() => onAddFriend(suggestion.id)}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, UserPlus, UserMinus, Share, MoreVertical, MapPin, Calendar, Users, Heart, Eye, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Pin {
  id: string;
  image: string;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: number;
  timestamp: number;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  isOnline: boolean;
  joinDate: string;
  location?: string;
  website?: string;
  isFollowing: boolean;
  isPrivate: boolean;
  mutualFriends: number;
  lastSeen?: string;
}

interface UserStats {
  posts: number;
  followers: number;
  following: number;
  streakDays: number;
  totalLikes: number;
}

interface OtherProfileViewProps {
  user: User;
  stats: UserStats;
  posts: Pin[];
  onBack: () => void;
  onMessage: (userId: string) => void;
  onFollow: (userId: string) => void;
  onShare: (userId: string) => void;
}

export function OtherProfileView({ 
  user, 
  stats, 
  posts, 
  onBack, 
  onMessage, 
  onFollow, 
  onShare 
}: OtherProfileViewProps) {
  const [selectedTab, setSelectedTab] = useState('posts');
  const [showMoreActions, setShowMoreActions] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    return `${months}mo`;
  };

  const getGridCols = (count: number): string => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <div className="w-full h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-white text-xl font-semibold">{user.displayName}</h1>
              <p className="text-white/60 text-sm">@{user.username}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
              onClick={() => onShare(user.id)}
            >
              <Share className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
              onClick={() => setShowMoreActions(!showMoreActions)}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* More Actions Menu */}
      <AnimatePresence>
        {showMoreActions && (
          <motion.div
            className="absolute top-16 right-4 z-30 bg-white/10 backdrop-blur-md rounded-2xl p-3 min-w-[200px]"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
          >
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                Block User
              </button>
              <button className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                Report
              </button>
              <button className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                Copy Profile Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20">
              <ImageWithFallback
                src={user.avatar}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-black" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-white text-2xl font-bold">{user.displayName}</h2>
              {user.isPrivate && (
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>
              )}
            </div>
            
            <p className="text-white/60 text-lg mb-1">@{user.username}</p>
            
            {user.location && (
              <div className="flex items-center space-x-1 text-white/50 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1 text-white/50 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Joined {user.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-white/80 mb-4 leading-relaxed">{user.bio}</p>
        )}

        {/* Mutual Friends */}
        {user.mutualFriends > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm">
              {user.mutualFriends} mutual {user.mutualFriends === 1 ? 'friend' : 'friends'}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-white text-xl font-bold">{formatNumber(stats.posts)}</p>
            <p className="text-white/60 text-sm">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{formatNumber(stats.followers)}</p>
            <p className="text-white/60 text-sm">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{formatNumber(stats.following)}</p>
            <p className="text-white/60 text-sm">Following</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{stats.streakDays}</p>
            <p className="text-white/60 text-sm">
              <span className="text-orange-400">🔥</span> Streak
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mb-6">
          <Button
            onClick={() => onFollow(user.id)}
            className={`flex-1 rounded-2xl ${
              user.isFollowing
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {user.isFollowing ? (
              <>
                <UserMinus className="w-4 h-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Follow
              </>
            )}
          </Button>
          
          <Button
            onClick={() => onMessage(user.id)}
            variant="outline"
            className="flex-1 rounded-2xl border-white/20 text-white hover:bg-white/10"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 rounded-2xl p-1">
            <TabsTrigger 
              value="posts" 
              className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
            >
              <Camera className="w-4 h-4 mr-2" />
              Posts ({stats.posts})
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="rounded-xl data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
            >
              <Users className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {user.isPrivate && !user.isFollowing ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-full" />
                  </div>
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">This Account is Private</h3>
                <p className="text-white/60 mb-4">Follow to see their posts and memories</p>
                <Button
                  onClick={() => onFollow(user.id)}
                  className="bg-blue-500 text-white hover:bg-blue-600 rounded-2xl"
                >
                  Follow {user.displayName}
                </Button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">No Posts Yet</h3>
                <p className="text-white/60">
                  {user.displayName} hasn't shared any memories yet
                </p>
              </div>
            ) : (
              <div className={`grid ${getGridCols(posts.length)} gap-1`}>
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ImageWithFallback
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex items-center space-x-4 text-white">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-5 h-5 fill-white" />
                          <span className="font-semibold">{formatNumber(post.likes)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-5 h-5 fill-white" />
                          <span className="font-semibold">{formatNumber(post.comments)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Time indicator */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {formatTimeAgo(post.timestamp)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="space-y-6">
              {/* Activity Stats */}
              <div className="bg-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold mb-4">Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{formatNumber(stats.totalLikes)}</p>
                      <p className="text-white/60 text-sm">Total Likes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <span className="text-orange-500">🔥</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{stats.streakDays} days</p>
                      <p className="text-white/60 text-sm">Current Streak</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-white/5 rounded-2xl p-4">
                <h3 className="text-white font-semibold mb-4">Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white text-sm">Joined {user.joinDate}</p>
                    </div>
                  </div>
                  {user.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-white text-sm">{user.location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white text-sm">
                        {user.isOnline ? 'Active now' : user.lastSeen || 'Last seen recently'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mutual Friends Preview */}
              {user.mutualFriends > 0 && (
                <div className="bg-white/5 rounded-2xl p-4">
                  <h3 className="text-white font-semibold mb-4">
                    Mutual Friends ({user.mutualFriends})
                  </h3>
                  <div className="flex items-center space-x-2">
                    {/* Show sample mutual friends avatars */}
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-black" />
                      ))}
                    </div>
                    <p className="text-white/60 text-sm">
                      and {user.mutualFriends - 3 > 0 ? `${user.mutualFriends - 3} others` : 'others'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
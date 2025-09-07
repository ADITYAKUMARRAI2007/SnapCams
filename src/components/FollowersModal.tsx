import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LiquidEtherBackground } from './LiquidEtherBackground';

interface Follower {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isFollowing: boolean;
  mutualFriends: number;
  bio?: string;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  title: string;
  followers: Follower[];
  onFollowUser: (userId: string) => void;
  onMessageUser: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

export function FollowersModal({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  followers, 
  onFollowUser, 
  onMessageUser, 
  onViewProfile 
}: FollowersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [followingStates, setFollowingStates] = useState<{ [key: string]: boolean }>({});

  const filteredFollowers = followers.filter(follower =>
    follower.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    follower.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollowToggle = (userId: string) => {
    setFollowingStates(prev => ({ ...prev, [userId]: !prev[userId] }));
    onFollowUser(userId);
  };

  const isFollowingUser = (userId: string) => {
    return followingStates[userId] ?? followers.find(f => f.id === userId)?.isFollowing;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 h-[80vh] max-h-[600px] bg-black/95 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          initial={{ y: 300, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 300, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Background Animation */}
          <div className="absolute inset-0 opacity-20">
            <LiquidEtherBackground variant="profile" />
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-white font-semibold text-lg">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative z-10 p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/50 rounded-xl"
              />
            </div>
          </div>

          {/* Followers List */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {filteredFollowers.map((follower, index) => (
                <motion.div
                  key={follower.id}
                  className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <button 
                      onClick={() => onViewProfile(follower.id)}
                      className="relative flex-shrink-0"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 hover:border-purple-400 transition-colors">
                        <ImageWithFallback
                          src={follower.avatar}
                          alt={follower.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <button 
                        onClick={() => onViewProfile(follower.id)}
                        className="block text-left w-full"
                      >
                        <h3 className="text-white font-medium truncate">{follower.displayName}</h3>
                        <p className="text-white/60 text-sm truncate">@{follower.username}</p>
                        {follower.mutualFriends > 0 && (
                          <p className="text-white/40 text-xs">
                            {follower.mutualFriends} mutual friend{follower.mutualFriends !== 1 ? 's' : ''}
                          </p>
                        )}
                      </button>
                      {follower.bio && (
                        <p className="text-white/50 text-xs mt-1 line-clamp-1">{follower.bio}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMessageUser(follower.id)}
                        className="border-white/20 text-white hover:bg-white/10 p-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>

                      {type === 'followers' && (
                        <Button
                          size="sm"
                          onClick={() => handleFollowToggle(follower.id)}
                          className={`px-4 ${
                            isFollowingUser(follower.id)
                              ? 'bg-white/10 text-white hover:bg-white/20'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                          }`}
                        >
                          {isFollowingUser(follower.id) ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-1" />
                              Follow
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredFollowers.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white/30" />
                  </div>
                  <h3 className="text-white font-medium mb-1">No results found</h3>
                  <p className="text-white/50 text-sm">
                    {searchQuery ? 'Try adjusting your search' : `No ${type} to show`}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
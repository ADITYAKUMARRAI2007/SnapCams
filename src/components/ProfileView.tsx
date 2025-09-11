import React, { useState } from 'react';
import { Camera, Heart, MessageCircle, Users, Share2, Settings, Grid3X3, MoreHorizontal, Edit, Bookmark, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfileStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  followers: number;
  following: number;
}

interface ProfileViewProps {
  stats: ProfileStats;
  posts: any[];
  savedPosts: any[];
  onCameraClick: () => void;
  onLogout: () => void;
  onProfilePicChange: (imageUrl: string) => void;
  onEditProfile: () => void;
  onShareProfile?: () => void;
  onViewFollowers?: () => void;
  onViewFollowing?: () => void;
}

export function ProfileView({ stats, posts, savedPosts, onCameraClick, onLogout, onProfilePicChange, onEditProfile, onShareProfile, onViewFollowers, onViewFollowing }: ProfileViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [currentTab, setCurrentTab] = useState('posts');
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080');
  
  // File input ref for custom upload
  const fileInputRef = React.useRef(null);

  const sampleProfilePictures = [
    'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8ZW58MHx8fHwxNzU3MTAzNDI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8ZW58MHx8fHwxNzU3MTAzNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8ZW58MHx8fHwxNzU3MTAzNDY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1494790108755-2616b612b002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8ZW58MHx8fHwxNzU3MTAzNDg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8ZW58MHx8fHwxNzU3MTAzNTA3fDA&ixlib=rb-4.1.0&q=80&w=1080'
  ];

  const handleProfilePicChange = (imageUrl: string) => {
    setProfilePic(imageUrl);
    onProfilePicChange(imageUrl);
    setShowProfilePicModal(false);
  };

  const handleCustomUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
      onProfilePicChange(imageUrl);
      setShowProfilePicModal(false);
    }
  };

  return (
    <div className="w-full h-full bg-black overflow-y-auto scrollbar-hide">
      {/* Hidden file input for custom upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-xl font-semibold">Profile</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onCameraClick}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-white hover:text-gray-300 transition-colors relative"
            >
              <MoreHorizontal className="w-6 h-6" />
              {showMenu && (
                <div className="absolute right-0 top-8 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 py-2 min-w-[140px] z-50">
                  <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors">
                    Settings
                  </button>
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="relative">
            <button
              onClick={() => setShowProfilePicModal(true)}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 p-0.5 hover:scale-105 transition-transform"
            >
              <ImageWithFallback
                src={profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </button>
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="text-center">
                <div className="text-white font-semibold">{stats.totalPosts}</div>
                <div className="text-gray-400 text-sm">posts</div>
              </div>
              <button 
                onClick={onViewFollowers}
                className="text-center hover:bg-white/5 rounded-lg p-2 transition-colors"
              >
                <div className="text-white font-semibold">{(stats.followers ?? 0).toLocaleString()}</div>
                <div className="text-gray-400 text-sm">followers</div>
              </button>
              <button 
                onClick={onViewFollowing}
                className="text-center hover:bg-white/5 rounded-lg p-2 transition-colors"
              >
                <div className="text-white font-semibold">{(stats.following ?? 0).toLocaleString()}</div>
                <div className="text-gray-400 text-sm">following</div>
              </button>
            </div>
          </div>
        </div>

        {/* Username and Bio */}
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-1">Your Username</h2>
          <p className="text-gray-300 text-sm">
            Capturing life's moments ✨<br />
            Join me on this creative journey 📸
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={() => setShowEditProfileModal(true)}
            className="flex-1 bg-white/10 text-white py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            <Edit className="w-4 h-4 inline mr-2" />
            Edit profile
          </button>
          <button 
            onClick={onShareProfile}
            className="flex-1 bg-white/10 text-white py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Share profile
          </button>
        </div>

        {/* Posts/Saved Tabs */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <button 
              onClick={() => setCurrentTab('posts')}
              className={`flex items-center space-x-1 pb-2 ${
                currentTab === 'posts' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-gray-400 hover:text-white'
              } transition-colors`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm">POSTS</span>
            </button>
            <button 
              onClick={() => setCurrentTab('saved')}
              className={`flex items-center space-x-1 pb-2 ${
                currentTab === 'saved' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-gray-400 hover:text-white'
              } transition-colors`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-sm">SAVED</span>
            </button>
          </div>

          {/* Content Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentTab === 'posts' ? (
                posts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                    {posts.map((post) => (
                      <div key={post.id} className="aspect-square relative">
                        <ImageWithFallback
                          src={post.image}
                          alt={post.caption}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-white" />
                          <span className="text-white text-xs">{post.likes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">Share photos and videos</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      When you share photos and videos, they'll appear on your profile.
                    </p>
                    <button 
                      onClick={onCameraClick}
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Share your first photo
                    </button>
                  </div>
                )
              ) : (
                savedPosts && savedPosts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                    {savedPosts.map((post) => (
                      <div key={post.id} className="aspect-square relative">
                        <ImageWithFallback
                          src={post.image}
                          alt={post.caption}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Bookmark className="w-4 h-4 text-white fill-white" />
                        </div>
                        <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-white" />
                          <span className="text-white text-xs">{post.likes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No saved posts yet</h3>
                    <p className="text-gray-400 text-sm">
                      Posts you save will appear here.
                    </p>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Profile Picture Modal */}
      <AnimatePresence>
        {showProfilePicModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black/90 backdrop-blur-md rounded-2xl p-6 m-4 max-w-md w-full border border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Choose Profile Picture</h3>
                <button
                  onClick={() => setShowProfilePicModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {sampleProfilePictures.map((pic, index) => (
                  <button
                    key={index}
                    onClick={() => handleProfilePicChange(pic)}
                    className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform border-2 border-transparent hover:border-blue-400"
                  >
                    <ImageWithFallback
                      src={pic}
                      alt={`Profile option ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCustomUpload}
                  className="flex-1 bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Custom</span>
                </button>
                <button
                  onClick={onCameraClick}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-semibold">Edit Profile</h2>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue="ADI"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Bio</label>
                  <textarea
                    defaultValue="Living life to the fullest! 📸✨"
                    rows={3}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    defaultValue="New York, NY"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    defaultValue="https://example.com"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Here you would save the profile changes
                    setShowEditProfileModal(false);
                    // You could add a toast notification here
                  }}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
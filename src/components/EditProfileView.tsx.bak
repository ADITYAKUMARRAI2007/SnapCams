import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Camera, Save, User, MapPin, Link, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LiquidEtherBackground } from './LiquidEtherBackground';

interface EditProfileViewProps {
  onBack: () => void;
  onSave: (profileData: ProfileData) => void;
  currentProfile: ProfileData;
}

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  email: string;
  phone: string;
}

export function EditProfileView({ onBack, onSave, currentProfile }: EditProfileViewProps) {
  const [formData, setFormData] = useState(currentProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
    
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`http://snapcap-backend.onrender.com/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          avatar: formData.avatar
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Profile updated successfully:', result);
        // update local user cache
        localStorage.setItem('user', JSON.stringify({
          ...user,
          id: result.id || user.id,
          username: result.username || user.username,
          displayName: result.displayName,
          avatar: result.avatar,
          bio: result.bio,
          location: result.location,
          website: result.website
        }));
        onSave({
          ...formData,
          displayName: result.displayName,
          bio: result.bio,
          location: result.location,
          website: result.website,
          avatar: result.avatar
        });
      } else {
        console.error('❌ Failed to update profile:', response.status);
        // Still call onSave for local state update
        onSave(formData);
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      // Still call onSave for local state update
      onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewAvatar = async () => {
    setIsLoading(true);
    try {
      // Generate avatar based on username or display name
      const avatarOptions = [
        'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080'
      ];
      const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
      handleInputChange('avatar', randomAvatar);
    } catch (error) {
      console.error('Failed to generate avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const avatarOptions = [
    'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080'
  ];

  return (
    <motion.div
      className="absolute inset-0 z-50 overflow-hidden"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Liquid Ether Background */}
      <LiquidEtherBackground variant="profile" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white font-semibold">Edit Profile</h1>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
          >
            {isLoading ? (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="absolute top-16 left-0 right-0 bottom-0 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                <ImageWithFallback
                  src={formData.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                size="icon"
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>

            {showAvatarOptions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
              >
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-medium mb-3">Choose Avatar</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {avatarOptions.map((url, index) => (
                      <motion.button
                        key={index}
                        onClick={() => {
                          handleInputChange('avatar', url);
                          setShowAvatarOptions(false);
                        }}
                        className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 hover:border-purple-400 transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ImageWithFallback
                          src={url}
                          alt="Avatar option"
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                  <Button
                    onClick={generateNewAvatar}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Generate New Avatar
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4 max-w-md mx-auto">
            {/* Username */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <Input
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
                className="bg-white/5 border-white/10 text-white placeholder-white/50"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Display Name
              </label>
              <Input
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter display name"
                className="bg-white/5 border-white/10 text-white placeholder-white/50"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell people about yourself..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-white/50 resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Where are you based?"
                className="bg-white/5 border-white/10 text-white placeholder-white/50"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                <Link className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://your-website.com"
                className="bg-white/5 border-white/10 text-white placeholder-white/50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="bg-white/5 border-white/10 text-white placeholder-white/50"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Phone
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="bg-white/5 border-white/10 text-white placeholder-white/50"
              />
            </div>
          </div>

          {/* Bottom spacing for safe area */}
          <div className="h-20" />
        </div>
      </div>
    </motion.div>
  );
}
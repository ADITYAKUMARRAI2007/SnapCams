import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Trophy, 
  Share2, 
  Download, 
  Database, 
  HelpCircle, 
  Info,
  Settings,
  Camera,
  Lock,
  Eye,
  UserX,
  Smartphone,
  Moon,
  Sun,
  Instagram,
  Twitter,
  MessageSquare,
  Trash2,
  FileText,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

interface SettingsViewProps {
  onBack: () => void;
  onLogout: () => void;
}

interface SettingSection {
  id: string;
  title: string;
  icon: any;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  type: 'toggle' | 'select' | 'action' | 'info';
  icon?: any;
  value?: boolean | string;
  options?: string[];
  action?: () => void;
  showChevron?: boolean;
}

export function SettingsView({ onBack, onLogout }: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState(null);
  const [settings, setSettings] = useState({
    // Account
    username: 'you',
    bio: 'Living my best life ✨',
    email: 'you@example.com',
    phone: '+1 (555) 123-4567',
    
    // Privacy & Security
    duetPermissions: 'friends',
    mapVisibility: 'friends',
    profileVisibility: 'public',
    twoFactor: false,
    loginAlerts: true,
    
    // Notifications
    pushNotifications: true,
    streakReminders: true,
    duetAlerts: true,
    storyReminders: true,
    mapAlerts: false,
    
    // Theme
    darkMode: true,
    colorTheme: 'purple',
    animatedIcons: true,
    
    // Streak & Gamification
    showStreak: true,
    dailyChallenges: true,
    levelUpAnimations: true,
    
    // Social Links
    instagram: '',
    twitter: '',
    tiktok: '',
    whatsapp: '',
    autoExport: false,
    
    // Download & Sharing
    savePhotosLocally: true,
    watermarkSharedPosts: false
  });

  const settingSections: SettingSection[] = [
    {
      id: 'account',
      title: 'Account',
      icon: <User className="w-5 h-5" />,
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          description: 'Update username, bio, profile picture',
          type: 'action',
          icon: <Camera className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'email-phone',
          title: 'Email & Phone',
          description: 'Change contact information',
          type: 'action',
          icon: <Smartphone className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'password-settings',
          title: 'Password & Login',
          description: 'Update password and login preferences',
          type: 'action',
          icon: <Lock className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'connected-accounts',
          title: 'Connected Accounts',
          description: 'Manage Google, Apple, and other accounts',
          type: 'action',
          icon: <Share2 className="w-4 h-4" />,
          showChevron: true
        }
      ]
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          id: 'duet-permissions',
          title: 'Who can duet/reply',
          description: 'Control who can respond to your posts',
          type: 'select',
          value: settings.duetPermissions,
          options: ['everyone', 'friends', 'none']
        },
        {
          id: 'map-visibility',
          title: 'Map Pin Visibility',
          description: 'Who can see your location pins',
          type: 'select',
          value: settings.mapVisibility,
          options: ['everyone', 'friends', 'none']
        },
        {
          id: 'profile-visibility',
          title: 'Profile Visibility',
          description: 'Public or private profile',
          type: 'select',
          value: settings.profileVisibility,
          options: ['public', 'private']
        },
        {
          id: 'blocked-users',
          title: 'Blocked Users',
          description: 'Manage blocked accounts',
          type: 'action',
          icon: <UserX className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'two-factor',
          title: '2FA Authentication',
          description: 'Extra security for your account',
          type: 'toggle',
          value: settings.twoFactor
        },
        {
          id: 'login-alerts',
          title: 'Login Alerts',
          description: 'Get notified of new logins',
          type: 'toggle',
          value: settings.loginAlerts
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      items: [
        {
          id: 'push-notifications',
          title: 'Push Notifications',
          description: 'Enable all notifications',
          type: 'toggle',
          value: settings.pushNotifications
        },
        {
          id: 'streak-reminders',
          title: 'Streak Reminders 🔥',
          description: 'Daily streak maintenance alerts',
          type: 'toggle',
          value: settings.streakReminders
        },
        {
          id: 'duet-alerts',
          title: 'Duet Reply Alerts 🤝',
          description: 'When someone responds to your posts',
          type: 'toggle',
          value: settings.duetAlerts
        },
        {
          id: 'story-reminders',
          title: 'Story Recap Reminders',
          description: 'Weekly story compilation notifications',
          type: 'toggle',
          value: settings.storyReminders
        },
        {
          id: 'map-alerts',
          title: 'Map Activity Alerts',
          description: 'Friends activity on the map',
          type: 'toggle',
          value: settings.mapAlerts
        }
      ]
    },
    {
      id: 'theme',
      title: 'Theme Settings',
      icon: <Palette className="w-5 h-5" />,
      items: [
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          description: 'Switch between light and dark themes',
          type: 'toggle',
          value: settings.darkMode,
          icon: settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />
        },
        {
          id: 'color-theme',
          title: 'Color Theme',
          description: 'Choose your accent colors',
          type: 'select',
          value: settings.colorTheme,
          options: ['purple', 'blue', 'green', 'orange', 'pink']
        },
        {
          id: 'animated-icons',
          title: 'Animated Icons',
          description: 'Enable fun icon animations',
          type: 'toggle',
          value: settings.animatedIcons
        }
      ]
    },
    {
      id: 'gamification',
      title: 'Streak & Gamification',
      icon: <Trophy className="w-5 h-5" />,
      items: [
        {
          id: 'show-streak',
          title: 'Show Streak Counter 🔥',
          description: 'Display your daily streak',
          type: 'toggle',
          value: settings.showStreak
        },
        {
          id: 'daily-challenges',
          title: 'Daily Challenges',
          description: 'Receive daily photo challenges',
          type: 'toggle',
          value: settings.dailyChallenges
        },
        {
          id: 'level-up-animations',
          title: 'Level-up Animations',
          description: 'Celebrate achievements with animations',
          type: 'toggle',
          value: settings.levelUpAnimations
        }
      ]
    },
    {
      id: 'social-sharing',
      title: 'Social & Sharing',
      icon: <Share2 className="w-5 h-5" />,
      items: [
        {
          id: 'connect-instagram',
          title: 'Connect Instagram',
          description: 'Link your Instagram account',
          type: 'action',
          icon: <Instagram className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'connect-twitter',
          title: 'Connect Twitter/X',
          description: 'Link your Twitter account',
          type: 'action',
          icon: <Twitter className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'connect-whatsapp',
          title: 'Connect WhatsApp',
          description: 'Enable WhatsApp sharing',
          type: 'action',
          icon: <MessageSquare className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'auto-export',
          title: 'Auto-export Stories',
          description: 'Create shareable story cards',
          type: 'toggle',
          value: settings.autoExport
        }
      ]
    },
    {
      id: 'download-sharing',
      title: 'Download & Sharing',
      icon: <Download className="w-5 h-5" />,
      items: [
        {
          id: 'save-locally',
          title: 'Save Photos Locally',
          description: 'Automatically save photos to device',
          type: 'toggle',
          value: settings.savePhotosLocally
        },
        {
          id: 'watermark-toggle',
          title: 'Watermark Shared Posts',
          description: 'Add SnapCap watermark to shared content',
          type: 'toggle',
          value: settings.watermarkSharedPosts
        }
      ]
    },
    {
      id: 'data-storage',
      title: 'Data & Storage',
      icon: <Database className="w-5 h-5" />,
      items: [
        {
          id: 'manage-cache',
          title: 'Manage Cached Media',
          description: 'Clear app cache and temporary files',
          type: 'action',
          icon: <Trash2 className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'clear-storage',
          title: 'Clear Local Storage',
          description: 'Remove all offline data',
          type: 'action',
          icon: <Trash2 className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'download-data',
          title: 'Download Account Data',
          description: 'Export your account information',
          type: 'action',
          icon: <Download className="w-4 h-4" />,
          showChevron: true
        }
      ]
    },
    {
      id: 'help-feedback',
      title: 'Help & Feedback',
      icon: <HelpCircle className="w-5 h-5" />,
      items: [
        {
          id: 'report-problem',
          title: 'Report a Problem',
          description: 'Send feedback about issues',
          type: 'action',
          showChevron: true
        },
        {
          id: 'suggest-feature',
          title: 'Suggest a Feature',
          description: 'Share ideas for improvements',
          type: 'action',
          showChevron: true
        },
        {
          id: 'faq-tutorials',
          title: 'FAQ & Tutorials',
          description: 'Get help using SnapCap',
          type: 'action',
          showChevron: true
        }
      ]
    },
    {
      id: 'about',
      title: 'About',
      icon: <Info className="w-5 h-5" />,
      items: [
        {
          id: 'app-version',
          title: 'App Version',
          description: 'v2.1.0 (Latest)',
          type: 'info'
        },
        {
          id: 'terms-privacy',
          title: 'Terms & Privacy Policy',
          description: 'Read our terms and privacy policy',
          type: 'action',
          icon: <FileText className="w-4 h-4" />,
          showChevron: true
        },
        {
          id: 'open-source',
          title: 'Open-source Licenses',
          description: 'View third-party licenses',
          type: 'action',
          showChevron: true
        }
      ]
    }
  ];

  const handleSettingChange = (id: string, value: any) => {
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleAction = (id: string) => {
    switch (id) {
      case 'logout':
        onLogout();
        break;
      default:
        console.log('Action:', id);
    }
  };

  const renderSettingItem = (item: SettingItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3 flex-1">
              {item.icon && (
                <div className="text-white/60">{item.icon}</div>
              )}
              <div>
                <p className="text-white font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-white/60 text-sm">{item.description}</p>
                )}
              </div>
            </div>
            <Switch
              checked={item.value as boolean}
              onCheckedChange={(checked) => handleSettingChange(item.id, checked)}
            />
          </div>
        );

      case 'select':
        return (
          <div className="py-3">
            <div className="flex items-center space-x-3 mb-2">
              {item.icon && (
                <div className="text-white/60">{item.icon}</div>
              )}
              <div>
                <p className="text-white font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-white/60 text-sm">{item.description}</p>
                )}
              </div>
            </div>
            <Select
              value={item.value as string}
              onValueChange={(value) => handleSettingChange(item.id, value)}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {item.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'action':
        return (
          <button
            onClick={() => handleAction(item.id)}
            className="flex items-center justify-between w-full py-3 hover:bg-white/5 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              {item.icon && (
                <div className="text-white/60">{item.icon}</div>
              )}
              <div className="text-left">
                <p className="text-white font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-white/60 text-sm">{item.description}</p>
                )}
              </div>
            </div>
            {item.showChevron && (
              <ChevronRight className="w-5 h-5 text-white/40" />
            )}
          </button>
        );

      case 'info':
        return (
          <div className="py-3">
            <div className="flex items-center space-x-3">
              {item.icon && (
                <div className="text-white/60">{item.icon}</div>
              )}
              <div>
                <p className="text-white font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-white/60 text-sm">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (activeSection) {
    const section = settingSections.find(s => s.id === activeSection);
    if (!section) return null;

    return (
      <motion.div
        className="absolute inset-0 bg-black z-50 overflow-hidden"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveSection(null)}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              {section.icon}
              <h2 className="text-white font-semibold">{section.title}</h2>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="flex-1 overflow-auto px-4 py-2">
          {section.items.map((item, index) => (
            <div key={item.id}>
              {renderSettingItem(item)}
              {index < section.items.length - 1 && (
                <Separator className="bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 bg-black z-50 overflow-hidden"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-white" />
            <h1 className="text-white font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="flex-1 overflow-auto">
        {/* Core Essentials */}
        <div className="px-4 py-3">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">🔑</span>
            <h3 className="text-white font-medium">Core Essentials</h3>
          </div>
          
          {settingSections.slice(0, 3).map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center justify-between w-full p-3 hover:bg-white/5 rounded-lg transition-colors mb-2"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60">{section.icon}</div>
                <span className="text-white font-medium">{section.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>
          ))}
        </div>

        <Separator className="bg-white/10" />

        {/* Personalization */}
        <div className="px-4 py-3">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">🎨</span>
            <h3 className="text-white font-medium">Personalization</h3>
          </div>
          
          {settingSections.slice(3, 5).map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center justify-between w-full p-3 hover:bg-white/5 rounded-lg transition-colors mb-2"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60">{section.icon}</div>
                <span className="text-white font-medium">{section.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>
          ))}
        </div>

        <Separator className="bg-white/10" />

        {/* Social & Sharing */}
        <div className="px-4 py-3">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">🌍</span>
            <h3 className="text-white font-medium">Social & Sharing</h3>
          </div>
          
          {settingSections.slice(5, 7).map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center justify-between w-full p-3 hover:bg-white/5 rounded-lg transition-colors mb-2"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60">{section.icon}</div>
                <span className="text-white font-medium">{section.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>
          ))}
        </div>

        <Separator className="bg-white/10" />

        {/* App & Support */}
        <div className="px-4 py-3">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">📊</span>
            <h3 className="text-white font-medium">App & Support</h3>
          </div>
          
          {settingSections.slice(7).map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center justify-between w-full p-3 hover:bg-white/5 rounded-lg transition-colors mb-2"
            >
              <div className="flex items-center space-x-3">
                <div className="text-white/60">{section.icon}</div>
                <span className="text-white font-medium">{section.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="px-4 py-6">
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
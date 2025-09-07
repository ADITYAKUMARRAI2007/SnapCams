import React, { useState, useEffect } from "react";
import { MapView } from "./components/MapView";
import { CameraView } from "./components/CameraView";
import { FeedView } from "./components/FeedView";
import { DuetView } from "./components/DuetView";
import { StoriesView } from "./components/StoriesView";
import { FriendsView } from "./components/FriendsView";
import { ProfileView } from "./components/ProfileView";
import { ChatView } from "./components/ChatView";
import { IndividualChatView } from "./components/IndividualChatView";
import { OtherProfileView } from "./components/OtherProfileView";
import { CommentModal } from "./components/CommentModal";
import { BottomNavigation } from "./components/BottomNavigation";
import { AuthView } from "./components/AuthView";
import { SettingsView } from "./components/SettingsView";
import { EditProfileView } from "./components/EditProfileView";
import { ShareModal } from "./components/ShareModal";
import { StoryUploadView } from "./components/StoryUploadView";
import { FollowersModal } from "./components/FollowersModal";
import { LiquidEtherBackground } from "./components/LiquidEtherBackground";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Settings } from "lucide-react";

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
  streak?: number;
  timestamp: number;
}

interface Story {
  id: string;
  author: string;
  authorAvatar: string;
  content: Pin[];
  streak: number;
  lastUpdated: number;
  isViewed: boolean;
}

interface User {
  id: string;
  email: string;
  username: string;
}

interface AppUser {
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
  email?: string;
  phone?: string;
}

interface StoryData {
  id: string;
  author: string;
  authorAvatar: string;
  image: string;
  caption: string;
  music?: {
    title: string;
    artist: string;
    preview: string;
    duration: number;
  };
  textOverlay?: {
    text: string;
    color: string;
    position: { x: number; y: number };
    size: "small" | "medium" | "large";
  };
  timestamp: number;
  isViewed: boolean;
}

interface ShareContent {
  type: "post" | "profile" | "story";
  id: string;
  title: string;
  image?: string;
  author?: string;
  description?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState("feed");
  const [showCamera, setShowCamera] = useState(false);
  const [showDuets, setShowDuets] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showIndividualChat, setShowIndividualChat] = useState(false);
  const [showOtherProfile, setShowOtherProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<"followers" | "following">("followers");
  const [shareContent, setShareContent] = useState<ShareContent | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<AppUser | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<AppUser | null>(null);
  const [previousModal, setPreviousModal] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser>({
    id: "you",
    username: "you",
    displayName: "You",
    avatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
    bio: "Living my best life ✨",
    isOnline: true,
    joinDate: "January 2024",
    location: "San Francisco, CA",
    website: "https://snapcap.app",
    isFollowing: false,
    isPrivate: false,
    mutualFriends: 0,
    email: "you@example.com",
    phone: "+1 (555) 123-4567",
  });
  const [selectedPostForDuet, setSelectedPostForDuet] = useState<string | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [userStreak, setUserStreak] = useState(7);
  const [savedPosts, setSavedPosts] = useState<Pin[]>([]);
  const [userProfilePic, setUserProfilePic] = useState(
    "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
  );

  const [pins, setPins] = useState<Pin[]>([
    {
      id: "1",
      x: 25,
      y: 30,
      image: "https://images.unsplash.com/photo-1613228097818-386b8d5f2a08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwbW9tZW50fGVufDF8fHx8MTc1NjkwMTQ5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Morning rituals that spark magic ✨ The steam rises like dreams taking flight, each sip a moment of pure inspiration 🌅",
      hashtags: ["morningvibes", "coffee", "inspiration", "mindfulness"],
      likes: 1247,
      comments: 89,
      author: "alexandra_dreams",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      streak: 12,
      timestamp: Date.now() - 7200000,
    },
    {
      id: "2",
      x: 70,
      y: 60,
      image: "https://images.unsplash.com/photo-1613477581401-c40e1ad085d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzU2OTAxNDk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Every sunset whispers secrets of the universe 🌅 Nature's daily masterpiece reminds us that endings can be the most beautiful beginnings",
      hashtags: ["sunset", "nature", "beauty", "reflection", "golden"],
      likes: 2134,
      comments: 156,
      author: "cosmic_wanderer",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      streak: 23,
      timestamp: Date.now() - 18000000,
    },
    {
      id: "3",
      x: 45,
      y: 25,
      image: "https://images.unsplash.com/photo-1745814132532-1c8bd029f1e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMHN0cmVldCUyMGFydCUyMGNvbG9yZnVsfGVufDF8fHx8MTc1NjkyOTc4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Colors bleeding into existence 🎨 Found this incredible mural that speaks to the soul - art is everywhere if you just look up! Street culture at its finest 🔥",
      hashtags: ["streetart", "urban", "colors", "inspiration", "culture"],
      likes: 892,
      comments: 67,
      author: "urban_explorer",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      streak: 8,
      timestamp: Date.now() - 3600000,
    },
    {
      id: "4",
      x: 60,
      y: 75,
      image: "https://images.unsplash.com/photo-1612192666336-561178b9cbfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwcGhvdG9ncmFwaHklMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzU2OTI4MzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Culinary poetry in motion 🍽️ Every dish tells a story, every flavor a memory waiting to be made. Tonight we feast with our eyes first! 👨‍🍳✨",
      hashtags: ["foodie", "aesthetic", "culinary", "art", "delicious"],
      likes: 1567,
      comments: 234,
      author: "chef_aesthetics",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      streak: 45,
      timestamp: Date.now() - 14400000,
    },
    {
      id: "5",
      x: 35,
      y: 50,
      image: "https://images.unsplash.com/photo-1593168098026-10d982cb9055?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBtb3VudGFpbnN8ZW58MXx8fHwxNzU2ODI1MjUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Peak moments, literally and figuratively 🏔️ Sometimes you have to climb higher to see the bigger picture. Adventure calls and I must go! 🎒",
      hashtags: ["adventure", "mountains", "travel", "nature", "explore"],
      likes: 3421,
      comments: 412,
      author: "mountain_soul",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      streak: 67,
      timestamp: Date.now() - 21600000,
    },
    {
      id: "6",
      x: 80,
      y: 40,
      image: "https://images.unsplash.com/photo-1686548814818-fac48b347b75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcG9ydHJhaXQlMjBzdHlsZXxlbnwxfHx8fDE3NTY4OTMyNDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Style is a way to say who you are without speaking 💫 Today's mood: confident, bold, and unapologetically me. Fashion is my armor ⚡",
      hashtags: ["fashion", "style", "confidence", "mood", "aesthetic"],
      likes: 2876,
      comments: 189,
      author: "style_maven",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      streak: 29,
      timestamp: Date.now() - 10800000,
    },
    {
      id: "7",
      x: 20,
      y: 65,
      image: "https://images.unsplash.com/photo-1559321987-c98064686fb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMGNpdHklMjBsaWdodHMlMjB1cmJhbnxlbnwxfHx8fDE3NTY5Mjk3OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "City nights and neon dreams 🌃 The urban jungle comes alive after dark - every light tells a story, every shadow holds a secret ✨",
      hashtags: ["citylife", "neon", "nightphotography", "urban", "lights"],
      likes: 1834,
      comments: 98,
      author: "neon_nights",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      streak: 15,
      timestamp: Date.now() - 25200000,
    },
    {
      id: "8",
      x: 55,
      y: 80,
      image: "https://images.unsplash.com/photo-1526673945462-bbebcd9f24f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXRzJTIwYW5pbWFscyUyMGN1dGV8ZW58MXx8fHwxNzU2ODQ2MzI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Pure joy captured in a moment 🐕 Sometimes happiness has four paws and a wagging tail. My furry friend reminding me what matters most 💕",
      hashtags: ["pets", "joy", "friendship", "love", "happiness"],
      likes: 4567,
      comments: 567,
      author: "pet_parent",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      streak: 34,
      timestamp: Date.now() - 28800000,
    },
  ]);

  const [stories, setStories] = useState<Story[]>([
    {
      id: "story1",
      author: "alexandra_dreams",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      content: [pins[0]],
      streak: 12,
      lastUpdated: Date.now() - 3600000,
      isViewed: false,
    },
    {
      id: "story2",
      author: "cosmic_wanderer",
      authorAvatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      content: [pins[1]],
      streak: 23,
      lastUpdated: Date.now() - 7200000,
      isViewed: true,
    },
  ]);

  // Auto-convert daily posts to stories at end of day
  useEffect(() => {
    const checkDailyStoryConversion = () => {
      const now = new Date();
      const isEndOfDay = now.getHours() === 23 && now.getMinutes() === 59;

      if (isEndOfDay) {
        const today = new Date().toDateString();
        const todaysPosts = pins.filter((pin) => {
          const postDate = new Date(pin.timestamp).toDateString();
          return postDate === today && pin.author === "you";
        });

        if (todaysPosts.length > 0) {
          const dailyStory: Story = {
            id: `daily-${Date.now()}`,
            author: "you",
            authorAvatar: userProfile.avatar,
            content: todaysPosts,
            streak: userStreak,
            lastUpdated: Date.now(),
            isViewed: false,
          };

          setStories((prev) => [dailyStory, ...prev]);
        }
      }
    };

    const interval = setInterval(checkDailyStoryConversion, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [pins, userProfile.avatar, userStreak]);

  // Generate sample followers data
  const generateSampleFollowers = () => {
    const followers = [
      {
        id: "alexandra_dreams",
        username: "alexandra_dreams",
        displayName: "Alexandra ✨",
        avatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
        isFollowing: true,
        mutualFriends: 12,
        bio: "Coffee lover and dream chaser ✨",
      },
      {
        id: "cosmic_wanderer",
        username: "cosmic_wanderer",
        displayName: "Cosmic Soul 🌙",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
        isFollowing: false,
        mutualFriends: 8,
        bio: "Nature photographer and sunset lover 🌅",
      },
      {
        id: "urban_explorer",
        username: "urban_explorer",
        displayName: "Street Artist 🎨",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
        isFollowing: true,
        mutualFriends: 15,
        bio: "Street art enthusiast and urban explorer",
      },
      {
        id: "mountain_soul",
        username: "mountain_soul",
        displayName: "Adventure Seeker ⛰️",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
        isFollowing: false,
        mutualFriends: 6,
        bio: "Mountain climber and adventure seeker 🏔️",
      },
      {
        id: "chef_aesthetics",
        username: "chef_aesthetics",
        displayName: "Culinary Artist 👨‍🍳",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
        isFollowing: true,
        mutualFriends: 23,
        bio: "Creating culinary masterpieces 🍽️",
      },
    ];
    return followers;
  };

  const [sampleFollowers] = useState(generateSampleFollowers());

  // Sample users for profiles and chats
  const [sampleUsers] = useState<AppUser[]>([
    {
      id: "alexandra_dreams",
      username: "alexandra_dreams",
      displayName: "Alexandra ✨",
      avatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Capturing life's magical moments ✨ Coffee enthusiast ☕ Sunrise chaser 🌅 Spreading positivity one snap at a time 📸",
      isOnline: true,
      joinDate: "March 2023",
      location: "San Francisco, CA",
      isFollowing: false,
      isPrivate: false,
      mutualFriends: 12,
      lastSeen: "2m ago",
    },
    {
      id: "cosmic_wanderer",
      username: "cosmic_wanderer",
      displayName: "Cosmic Soul 🌙",
      avatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Nature lover 🌿 Sunset photographer 📷 Mindful traveler ✈️ Finding beauty in everyday moments",
      isOnline: false,
      joinDate: "January 2023",
      location: "Portland, OR",
      isFollowing: true,
      isPrivate: false,
      mutualFriends: 8,
      lastSeen: "1h ago",
    },
    {
      id: "urban_explorer",
      username: "urban_explorer",
      displayName: "Street Artist 🎨",
      avatar: "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Street art enthusiast 🎭 Urban photographer 📸 Culture seeker 🏙️ Making the city my canvas",
      isOnline: true,
      joinDate: "June 2023",
      location: "New York, NY",
      isFollowing: false,
      isPrivate: true,
      mutualFriends: 5,
      lastSeen: "now",
    },
  ]);

  // Convert pins to feed posts format
  const feedPosts = pins.map((pin) => ({
    id: pin.id,
    author: pin.author,
    authorAvatar: pin.authorAvatar,
    image: pin.image,
    caption: pin.caption,
    hashtags: pin.hashtags,
    likes: pin.likes,
    comments: pin.comments,
    shares: Math.floor(pin.likes * 0.15),
    isLiked: Math.random() > 0.5,
    streak: pin.streak || Math.floor(Math.random() * 15) + 1,
    duets: Math.floor(pin.comments * 0.4),
    location: pin.author.includes("alexandra") ? "☕ Downtown Brew" : "🌅 Sunset Hills",
    timeAgo: formatTimeAgo(pin.timestamp),
  }));

  const sampleDuets =
    pins.length > 0
      ? [
          {
            id: "1",
            originalPost: {
              id: pins[0].id,
              author: pins[0].author,
              authorAvatar: pins[0].authorAvatar,
              image: pins[0].image,
              caption: pins[0].caption,
              hashtags: pins[0].hashtags,
            },
            response:
              "🌅 In porcelain vessels, dreams take flight,\nSteam spirals dance in morning light,\nEach golden drop, a story told,\nOf moments new and hearts made bold.\n\n✨ Your coffee speaks in whispered hues,\nOf sunrise hopes and morning muse... 🎭",
            author: "verse_alchemist",
            authorAvatar: pins[0].authorAvatar,
            likes: 234,
            isLiked: true,
            timeAgo: "45m",
          },
        ]
      : [];

  function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "now";
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  const handleTabChange = (tab: string) => {
    if (tab === "camera") {
      setShowCamera(true);
    } else {
      setCurrentTab(tab);
    }
  };

  const handleCameraCapture = (photo: {
    image: string;
    caption: string;
    hashtags: string[];
  }) => {
    const newPin: Pin = {
      id: Date.now().toString(),
      x: Math.random() * 70 + 15,
      y: Math.random() * 70 + 15,
      image: photo.image,
      caption: photo.caption,
      hashtags: photo.hashtags,
      likes: 0,
      comments: 0,
      author: "you",
      authorAvatar:
        "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      streak: userStreak + 1,
      timestamp: Date.now(),
    };

    setPins((prevPins) => [newPin, ...prevPins]);
    setUserStreak((prev) => prev + 1);
    setShowCamera(false);
    setCurrentTab("map");
  };

  const handleCameraStoryUpload = (photo: {
    image: string;
    caption: string;
    hashtags: string[];
  }) => {
    const newStory: Story = {
      id: Date.now().toString(),
      author: "you",
      authorAvatar: userProfile.avatar,
      content: [
        {
          id: Date.now().toString(),
          x: 50,
          y: 50,
          image: photo.image,
          caption: photo.caption,
          hashtags: photo.hashtags,
          likes: 0,
          comments: 0,
          author: "you",
          authorAvatar: userProfile.avatar,
          timestamp: Date.now(),
        },
      ],
      streak: userStreak,
      lastUpdated: Date.now(),
      isViewed: false,
    };

    setStories((prev) => [newStory, ...prev]);
    setShowCamera(false);
    setCurrentTab("feed");
  };

  const handleLike = (postId: string) => {
    setPins((prevPins) =>
      prevPins.map((pin) =>
        pin.id === postId ? { ...pin, likes: pin.likes + 1 } : pin,
      ),
    );
  };

  const handleComment = (postId: string) => {
    setSelectedPostForComments(postId);
    setShowCommentModal(true);
  };

  const handleDuet = (postId: string) => {
    setSelectedPostForDuet(postId);
    setShowDuets(true);
  };

  const handleCreateDuet = (postId: string, response: string) => {
    console.log("Created duet for post:", postId, "Response:", response);
    setSelectedPostForDuet(null);
    setShowDuets(false);
  };

  const handlePinClick = (pin: Pin) => {
    setCurrentTab("feed");
  };

  // Sample comments data
  const generateCommentsForPost = (postId: string) => {
    const sampleComments = [
      {
        id: "1",
        author: "aesthetic_soul",
        authorAvatar:
          "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        content: "This is absolutely stunning! 😍 Your photography skills are incredible!",
        likes: 23,
        isLiked: false,
        timeAgo: "2h",
        isPinned: true,
        replies: [
          {
            id: "1-1",
            author: "photo_enthusiast",
            authorAvatar:
              "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
            content: "Totally agree! The composition is perfect 📸",
            likes: 5,
            isLiked: true,
            timeAgo: "1h",
          },
        ],
      },
      {
        id: "2",
        author: "wanderlust_vibes",
        authorAvatar:
          "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        content: "This gives me so much inspiration for my next adventure! 🌟",
        likes: 12,
        isLiked: false,
        timeAgo: "3h",
      },
      {
        id: "3",
        author: "creative_minds",
        authorAvatar:
          "https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        content: "Love the mood and atmosphere in this shot! Keep creating! 🎨",
        likes: 8,
        isLiked: true,
        timeAgo: "5h",
      },
    ];
    return sampleComments;
  };

  const handleAddFriend = (friendId: string) => {
    console.log("Adding friend:", friendId);
  };

  const handleMessageFriend = (friendId: string) => {
    const chatUser = sampleUsers.find((u) => u.id === friendId);
    if (chatUser) {
      // Track which modal was open before opening chat
      if (showFollowersModal) {
        setPreviousModal('followers');
      } else if (showOtherProfile) {
        setPreviousModal('profile');
      } else {
        setPreviousModal(null);
      }
      
      // Close any open modals first with a small delay for smooth transition
      setShowFollowersModal(false);
      setShowOtherProfile(false);
      
      // Small delay to allow modal close animation before opening chat
      setTimeout(() => {
        setSelectedChatUser(chatUser);
        setShowIndividualChat(true);
      }, 150);
    }
  };

  const handleViewProfile = (userId: string) => {
    const profileUser = sampleUsers.find((u) => u.id === userId);
    if (profileUser) {
      // Close followers modal if open with smooth transition
      setShowFollowersModal(false);
      
      // Small delay to allow modal close animation before opening profile
      setTimeout(() => {
        setSelectedProfileUser(profileUser);
        setShowOtherProfile(true);
      }, 150);
    }
  };

  const handleFollowUser = (userId: string) => {
    console.log("Following user:", userId);
    // Update the selected profile user's follow status
    if (selectedProfileUser && selectedProfileUser.id === userId) {
      setSelectedProfileUser(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
    }
  };

  const handleShareProfile = (userId: string) => {
    const profileUser = sampleUsers.find((u) => u.id === userId) || userProfile;
    setShareContent({
      type: "profile",
      id: userId,
      title: `${profileUser.displayName}'s Profile`,
      image: profileUser.avatar,
      author: profileUser.displayName,
      description: profileUser.bio,
    });
    setShowShareModal(true);
  };

  const handleFollow = (userId: string) => {
    console.log("Following user:", userId);
    // In a real app, this would update the backend
    // For now, just log the action
  };

  const handleSavePost = (postId: string) => {
    const postToSave = pins.find((pin) => pin.id === postId);
    if (postToSave && !savedPosts.find((saved) => saved.id === postId)) {
      setSavedPosts((prev) => [...prev, postToSave]);
      console.log("Saved post:", postId);
    }
  };

  const handleSharePost = (postId: string) => {
    const post = pins.find((pin) => pin.id === postId);
    if (post) {
      setShareContent({
        type: "post",
        id: postId,
        title: post.caption,
        image: post.image,
        author: post.author,
        description: post.caption,
      });
      setShowShareModal(true);
    }
  };

  const handleAddComment = (content: string) => {
    console.log("Adding comment:", content);
  };

  const handleLikeComment = (commentId: string) => {
    console.log("Liking comment:", commentId);
  };

  const handleReplyToComment = (commentId: string, content: string) => {
    console.log("Replying to comment:", commentId, content);
  };

  const handleProfilePicChange = (imageUrl: string) => {
    setUserProfilePic(imageUrl);
    console.log("Profile picture changed:", imageUrl);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentTab("feed");
    setUserStreak(7);
    setPins(pins.filter((p) => p.author !== "you"));
    setSavedPosts([]);
    setShowSettings(false);
    setShowEditProfile(false);
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleSaveProfile = (profileData: any) => {
    setUserProfile((prev) => ({ ...prev, ...profileData }));
    setUserProfilePic(profileData.avatar);
    setShowEditProfile(false);
  };

  const handleViewFollowers = () => {
    setFollowersModalType("followers");
    setShowFollowersModal(true);
  };

  const handleViewFollowing = () => {
    setFollowersModalType("following");
    setShowFollowersModal(true);
  };

  const handleShareProfileButton = () => {
    setShareContent({
      type: "profile",
      id: "you",
      title: `${userProfile.displayName}'s Profile`,
      image: userProfile.avatar,
      author: userProfile.displayName,
      description: userProfile.bio,
    });
    setShowShareModal(true);
  };

  const handleStoryUpload = (story: any) => {
    const newStory: Story = {
      id: story.id,
      author: "you",
      authorAvatar: userProfile.avatar,
      content: [
        {
          id: story.id,
          x: 50,
          y: 50,
          image: story.image,
          caption: story.caption,
          hashtags: [],
          likes: 0,
          comments: 0,
          author: "you",
          authorAvatar: userProfile.avatar,
          timestamp: story.timestamp,
        },
      ],
      streak: userStreak,
      lastUpdated: story.timestamp,
      isViewed: false,
    };

    setStories((prev) => [newStory, ...prev]);
    setShowStoryUpload(false);
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case "feed":
        return (
          <FeedView
            posts={feedPosts}
            onLike={handleLike}
            onComment={handleComment}
            onDuet={handleDuet}
            onFollow={handleFollow}
            onSavePost={handleSavePost}
            onSharePost={handleSharePost}
            onViewProfile={handleViewProfile}
            stories={stories}
            onStoryClick={() => setShowStories(true)}
          />
        );
      case "map":
        return (
          <MapView
            onCameraClick={() => setShowCamera(true)}
            pins={pins}
            onPinClick={handlePinClick}
            userStreak={userStreak}
            onSettingsClick={() => setShowSettings(true)}
          />
        );
      case "friends":
        return (
          <FriendsView
            onAddFriend={handleAddFriend}
            onMessageFriend={handleMessageFriend}
          />
        );
      case "chat":
        return (
          <ChatView
            onBack={() => setCurrentTab("friends")}
            onOpenIndividualChat={handleMessageFriend}
          />
        );
      case "profile":
        return (
          <ProfileView
            stats={{
              totalPosts: pins.filter((p) => p.author === "you").length,
              totalLikes: pins
                .filter((p) => p.author === "you")
                .reduce((sum, p) => sum + p.likes, 0),
              totalComments: pins
                .filter((p) => p.author === "you")
                .reduce((sum, p) => sum + p.comments, 0),
              followers: 1247 + pins.filter((p) => p.author === "you").length * 10,
              following: 892,
            }}
            posts={pins.filter((p) => p.author === "you")}
            savedPosts={savedPosts}
            onCameraClick={() => setShowCamera(true)}
            onLogout={handleLogout}
            onProfilePicChange={handleProfilePicChange}
            onEditProfile={handleEditProfile}
            onShareProfile={handleShareProfileButton}
            onViewFollowers={handleViewFollowers}
            onViewFollowing={handleViewFollowing}
          />
        );
      default:
        return (
          <FeedView
            posts={feedPosts}
            onLike={handleLike}
            onComment={handleComment}
            onDuet={handleDuet}
            onFollow={handleFollow}
            onSavePost={handleSavePost}
            onSharePost={handleSharePost}
            onViewProfile={handleViewProfile}
            stories={stories}
            onStoryClick={() => setShowStories(true)}
          />
        );
    }
  };

  // Show authentication screen if user not logged in
  if (!user) {
    return <AuthView onAuthComplete={setUser} />;
  }

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Liquid Ether Background for current screen */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <LiquidEtherBackground
          variant={
            currentTab === "feed"
              ? "feed"
              : currentTab === "map"
              ? "map"
              : currentTab === "profile"
              ? "profile"
              : currentTab === "chat"
              ? "chat"
              : currentTab === "friends"
              ? "friends"
              : "feed"
          }
        />
      </div>

      {/* Professional App Header - Hidden on Map */}
      {currentTab !== "map" && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between py-4 px-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-white text-xl font-semibold">SnapCap</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentTab("chat")}
                className="text-white/70 hover:text-white transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`absolute left-0 right-0 bottom-16 ${
          currentTab === "map" ? "top-0" : "top-16"
        }`}
        style={{ 
          height: currentTab === "map" ? "calc(100vh - 64px)" : "calc(100vh - 128px)",
          width: '100%',
          position: 'absolute',
          zIndex: 10
        }}
      >
        {renderCurrentView()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Camera Overlay */}
      <AnimatePresence>
        {showCamera && (
          <CameraView
            onClose={() => setShowCamera(false)}
            onCapture={handleCameraCapture}
            onStoryUpload={handleCameraStoryUpload}
            userStreak={userStreak}
          />
        )}
      </AnimatePresence>

      {/* Duets Overlay */}
      <AnimatePresence>
        {showDuets && (
          <DuetView
            duets={sampleDuets}
            onClose={() => {
              setShowDuets(false);
              setSelectedPostForDuet(null);
            }}
            onCreateDuet={handleCreateDuet}
            selectedPostId={selectedPostForDuet}
          />
        )}
      </AnimatePresence>

      {/* Stories Overlay */}
      <AnimatePresence>
        {showStories && (
          <StoriesView
            stories={stories}
            onClose={() => setShowStories(false)}
            currentUser="you"
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsView
            onBack={() => setShowSettings(false)}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <EditProfileView
            onBack={() => setShowEditProfile(false)}
            onSave={handleSaveProfile}
            currentProfile={{
              username: userProfile.username,
              displayName: userProfile.displayName,
              bio: userProfile.bio || "",
              location: userProfile.location || "",
              website: userProfile.website || "",
              avatar: userProfile.avatar,
              email: userProfile.email || "",
              phone: userProfile.phone || "",
            }}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && shareContent && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            content={shareContent}
          />
        )}
      </AnimatePresence>

      {/* Story Upload Modal */}
      <AnimatePresence>
        {showStoryUpload && (
          <StoryUploadView
            isOpen={showStoryUpload}
            onClose={() => setShowStoryUpload(false)}
            onUpload={handleStoryUpload}
          />
        )}
      </AnimatePresence>

      {/* Followers Modal */}
      <AnimatePresence>
        {showFollowersModal && (
          <FollowersModal
            isOpen={showFollowersModal}
            onClose={() => setShowFollowersModal(false)}
            type={followersModalType}
            title={followersModalType === "followers" ? "Followers" : "Following"}
            followers={sampleFollowers}
            onFollowUser={handleFollowUser}
            onMessageUser={handleMessageFriend}
            onViewProfile={handleViewProfile}
          />
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {showCommentModal && selectedPostForComments && (
          <CommentModal
            isOpen={showCommentModal}
            onClose={() => {
              setShowCommentModal(false);
              setSelectedPostForComments(null);
            }}
            postAuthor={pins.find((pin) => pin.id === selectedPostForComments)?.author || ""}
            postImage={pins.find((pin) => pin.id === selectedPostForComments)?.image || ""}
            comments={generateCommentsForPost(selectedPostForComments)}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
            onReplyToComment={handleReplyToComment}
          />
        )}
      </AnimatePresence>

      {/* Individual Chat Modal */}
      <AnimatePresence>
        {showIndividualChat && selectedChatUser && (
          <motion.div
            className="absolute inset-0 z-[60]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 400,
            }}
          >
            <IndividualChatView
              user={selectedChatUser}
              onBack={() => {
                setShowIndividualChat(false);
                setSelectedChatUser(null);
                
                // Restore previous modal if it existed
                if (previousModal === 'followers') {
                  setTimeout(() => {
                    setShowFollowersModal(true);
                    setPreviousModal(null);
                  }, 150);
                } else if (previousModal === 'profile') {
                  setTimeout(() => {
                    setShowOtherProfile(true);
                    setPreviousModal(null);
                  }, 150);
                }
              }}
              onViewProfile={handleViewProfile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Other Profile Modal */}
      <AnimatePresence>
        {showOtherProfile && selectedProfileUser && (
          <motion.div
            className="absolute inset-0 z-50"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 400,
            }}
          >
            <OtherProfileView
              user={selectedProfileUser}
              stats={{
                posts: pins.filter((p) => p.author === selectedProfileUser.id).length,
                followers: Math.floor(Math.random() * 5000) + 1000,
                following: Math.floor(Math.random() * 1000) + 200,
                streakDays: Math.floor(Math.random() * 100) + 10,
                totalLikes: pins
                  .filter((p) => p.author === selectedProfileUser.id)
                  .reduce((sum, p) => sum + p.likes, 0),
              }}
              posts={pins.filter((p) => p.author === selectedProfileUser.id)}
              onBack={() => {
                setShowOtherProfile(false);
                setSelectedProfileUser(null);
              }}
              onMessage={handleMessageFriend}
              onFollow={handleFollowUser}
              onShare={handleShareProfile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
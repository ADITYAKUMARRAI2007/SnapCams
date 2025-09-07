import React from 'react';
import { Home, MapIcon, Camera, Users, User, Search, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userStreak?: number;
  userLevel?: number;
  userPoints?: number;
}

const tabs = [
  { id: 'feed', icon: Home, label: 'Home' },
  { id: 'friends', icon: Search, label: 'Search' },
  { id: 'camera', icon: Plus, label: 'Create' },
  { id: 'map', icon: MapIcon, label: 'Map' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNavigation({ currentTab, onTabChange, userStreak = 0, userLevel = 1, userPoints = 0 }: BottomNavigationProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around py-3 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isCamera = tab.id === 'camera';

          return (
            <button
              key={tab.id}
              className={`flex flex-col items-center p-2 transition-all duration-200 ${
                isCamera 
                  ? 'bg-white rounded-xl text-black'
                  : isActive 
                    ? 'text-white' 
                    : 'text-gray-500'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className={`w-6 h-6 ${isCamera ? 'text-black' : ''}`} />
              
              {!isCamera && (
                <span className="text-xs mt-1">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
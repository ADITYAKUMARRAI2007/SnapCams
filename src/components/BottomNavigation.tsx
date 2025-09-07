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
    <div 
      className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around py-2 px-2 sm:py-3 sm:px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isCamera = tab.id === 'camera';

          return (
            <button
              key={tab.id}
              className={`flex flex-col items-center transition-all duration-200 touch-manipulation ${
                isCamera 
                  ? 'bg-white rounded-xl text-black p-3'
                  : isActive 
                    ? 'text-white p-2' 
                    : 'text-gray-500 p-2'
              }`}
              onClick={() => onTabChange(tab.id)}
              style={{
                minWidth: isCamera ? '60px' : '44px',
                minHeight: isCamera ? '60px' : '44px'
              }}
            >
              <Icon className={`${isCamera ? 'w-7 h-7 text-black' : 'w-5 h-5 sm:w-6 sm:h-6'}`} />
              
              {!isCamera && (
                <span className="text-xs mt-1 hidden sm:block">
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
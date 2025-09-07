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
      className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around py-1 px-1 sm:py-2 sm:px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isCamera = tab.id === 'camera';

          return (
            <button
              key={tab.id}
              className={`flex flex-col items-center transition-all duration-200 touch-manipulation ${
                isCamera 
                  ? 'bg-white rounded-lg text-black p-2'
                  : isActive 
                    ? 'text-white p-1' 
                    : 'text-gray-500 p-1'
              }`}
              onClick={() => onTabChange(tab.id)}
              style={{
                minWidth: isCamera ? '50px' : '40px',
                minHeight: isCamera ? '50px' : '40px'
              }}
            >
              <Icon className={`${isCamera ? 'w-6 h-6 text-black' : 'w-4 h-4 sm:w-5 sm:h-5'}`} />
              
              {!isCamera && (
                <span className="text-xs mt-0.5 hidden sm:block">
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
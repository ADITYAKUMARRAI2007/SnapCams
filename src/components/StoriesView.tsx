import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share, Flame } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

interface StoriesViewProps {
  stories: Story[];
  onClose: () => void;
  currentUser: string;
}

export function StoriesView({ stories, onClose, currentUser }: StoriesViewProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentStoryIndex];
  const currentContent = currentStory?.content[currentContentIndex];

  // Reset progress when story/content changes
  useEffect(() => {
    setProgress(0);
  }, [currentStoryIndex, currentContentIndex]);

  // Auto progress timer
  useEffect(() => {
    if (!isPaused && currentContent) {
      const timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 2; // 5 seconds per story (100 / 50ms = 2000ms = 2s for testing, normally 5s)
          
          if (newProgress >= 100) {
            // Schedule state updates for next tick to avoid setState during render
            setTimeout(() => {
              if (currentContentIndex < currentStory.content.length - 1) {
                setCurrentContentIndex(prev => prev + 1);
                setProgress(0);
              } else if (currentStoryIndex < stories.length - 1) {
                setCurrentStoryIndex(prev => prev + 1);
                setCurrentContentIndex(0);
                setProgress(0);
              } else {
                onClose();
              }
            }, 0);
            return 100; // Keep at 100 until next tick
          }
          
          return newProgress;
        });
      }, 50);

      return () => clearInterval(timer);
    }
  }, [currentStoryIndex, currentContentIndex, isPaused, currentStory, stories.length, onClose]);

  const handlePrevious = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(prev => prev - 1);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentContentIndex(0);
    }
    // Progress will be reset by useEffect
  };

  const handleNext = () => {
    if (currentContentIndex < currentStory.content.length - 1) {
      setCurrentContentIndex(prev => prev + 1);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentContentIndex(0);
    } else {
      onClose();
    }
    // Progress will be reset by useEffect
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  };

  if (!currentStory || !currentContent) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={currentContent.image}
          alt={currentContent.caption}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50" />
      </div>

      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex space-x-1 mb-4">
          {currentStory.content.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{
                  width: index < currentContentIndex ? '100%' : 
                         index === currentContentIndex ? `${progress}%` : '0%'
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-0.5">
                <ImageWithFallback
                  src={currentStory.authorAvatar}
                  alt={currentStory.author}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {currentStory.streak > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full w-6 h-6 flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{currentStory.author}</h3>
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <span>{formatTimeAgo(currentStory.lastUpdated)}</span>
                {currentStory.streak > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-orange-400">🔥</span>
                      <span>{currentStory.streak} day streak</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Navigation Areas */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
        onClick={handlePrevious}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
        onClick={handleNext}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      />

      {/* Content Area */}
      <div
        className="absolute inset-0 flex items-center justify-center z-5"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Tap to pause indicator */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className="w-6 h-6 flex space-x-1">
                <div className="w-1 h-6 bg-white rounded-full"></div>
                <div className="w-1 h-6 bg-white rounded-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <motion.div
          key={`${currentStoryIndex}-${currentContentIndex}`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Caption */}
          <p className="text-white mb-4 text-lg leading-relaxed">
            {currentContent.caption}
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentContent.hashtags?.map((tag, index) => (
              <motion.span
                key={tag}
                className="text-purple-300 font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                #{tag}
              </motion.span>
            ))}
          </div>

          {/* Interaction Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>{currentContent.likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>{currentContent.comments}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Share className="w-5 h-5" />
                <span>Share</span>
              </div>
            </div>

            {/* Story Navigation */}
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <span>{currentStoryIndex + 1}</span>
              <span>/</span>
              <span>{stories.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Side Navigation Indicators */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
        <AnimatePresence>
          {currentStoryIndex > 0 && (
            <motion.button
              className="w-8 h-8 rounded-full glass-dark flex items-center justify-center text-white/60 hover:text-white transition-colors"
              onClick={handlePrevious}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
        <AnimatePresence>
          {currentStoryIndex < stories.length - 1 && (
            <motion.button
              className="w-8 h-8 rounded-full glass-dark flex items-center justify-center text-white/60 hover:text-white transition-colors"
              onClick={handleNext}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
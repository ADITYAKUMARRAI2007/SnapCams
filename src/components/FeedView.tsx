import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share, MoreVertical, MapPin, Bookmark, Send, UserPlus, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FeedPost {
  id: string;
  author: string;
  authorAvatar: string;
  image: string;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  streak: number;
  duets: number;
  location?: string;
  timeAgo: string;
}

interface Story {
  id: string;
  author: string;
  authorAvatar: string;
  content: any[];
  streak: number;
  lastUpdated: number;
  isViewed: boolean;
}

interface FeedViewProps {
  posts: FeedPost[];
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onDuet: (postId: string) => void;
  onFollow: (userId: string) => void;
  onSavePost: (postId: string) => void;
  onSharePost: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
  stories: Story[];
  onStoryClick: () => void;
}

interface ReelPostProps {
  post: FeedPost;
  isActive: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onDuet: (postId: string) => void;
  onFollow: (userId: string) => void;
  onSavePost: (postId: string) => void;
  onSharePost: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
}

function ReelPost({ post, isActive, onLike, onComment, onDuet, onFollow, onSavePost, onSharePost, onViewProfile }: ReelPostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [showHeart, setShowHeart] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    if (!isLiked) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    onLike(post.id);
  };

  const handleDoubleClick = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  return (
    <div className="w-full h-full relative snap-start snap-always">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      {/* Double tap heart animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Heart className="w-20 h-20 text-red-500 fill-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double tap area */}
      <div 
        className="absolute inset-0 z-10"
        onDoubleClick={handleDoubleClick}
      />

      {/* Top gradient for status bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-20" />

      {/* Author info */}
      <motion.div
        className="absolute top-16 left-3 right-3 sm:left-4 sm:right-4 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5">
              <ImageWithFallback
                src={post.authorAvatar}
                alt={post.author}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-white font-semibold">{post.author}</span>
                <button
                  onClick={() => {
                    setIsFollowing(!isFollowing);
                    onFollow(post.author);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    isFollowing
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isFollowing ? (
                    <><UserCheck className="w-3 h-3 inline mr-1" />Following</>
                  ) : (
                    <><UserPlus className="w-3 h-3 inline mr-1" />Follow</>
                  )}
                </button>
                <span className="text-white/60 text-sm">•</span>
                <span className="text-white/60 text-sm">{post.timeAgo}</span>
              </div>
              {post.location && (
                <div className="flex items-center space-x-1 text-white/70 text-sm mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{post.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {/* Three dots menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  className="absolute right-0 top-8 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 py-2 min-w-[140px] z-50"
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <button 
                    onClick={() => {
                      onSavePost(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Save post</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Report</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                    <span>🚫</span>
                    <span>Not interested</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Side Actions */}
      <motion.div
        className="absolute right-1 sm:right-2 bottom-24 sm:bottom-32 flex flex-col items-center space-y-2 sm:space-y-3 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Like */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className="p-1 sm:p-2 hover:scale-110 transition-transform touch-manipulation"
            style={{ minWidth: '36px', minHeight: '36px' }}
          >
            <Heart 
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isLiked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-white hover:text-red-400'
              } transition-colors`} 
            />
          </button>
          <span className="text-white text-xs mt-0.5">{likes.toLocaleString()}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onComment(post.id)}
            className="p-1 sm:p-2 hover:scale-110 transition-transform touch-manipulation"
            style={{ minWidth: '36px', minHeight: '36px' }}
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white hover:text-blue-400 transition-colors" />
          </button>
          <span className="text-white text-xs mt-0.5">{post.comments}</span>
        </div>

        {/* Send/Share */}
        <div className="flex flex-col items-center relative">
          <button 
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-1 sm:p-2 hover:scale-110 transition-transform touch-manipulation"
            style={{ minWidth: '36px', minHeight: '36px' }}
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white hover:text-blue-400 transition-colors" />
          </button>
          <span className="text-white text-xs mt-0.5">{post.shares}</span>
          
          {/* Share menu */}
          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                className="absolute right-16 top-0 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 py-2 min-w-[120px] z-50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <button 
                  onClick={() => {
                    onSharePost(post.id);
                    setShowShareMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors"
                >
                  Share to friends
                </button>
                <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors">
                  Copy link
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bookmark */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              onSavePost(post.id);
            }}
            className="p-1 sm:p-2 hover:scale-110 transition-transform touch-manipulation"
            style={{ minWidth: '36px', minHeight: '36px' }}
          >
            <Bookmark 
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isBookmarked 
                  ? 'fill-white text-white' 
                  : 'text-white hover:text-gray-300'
              } transition-colors`} 
            />
          </button>
        </div>
      </motion.div>

      {/* Bottom content */}
      <motion.div
        className="absolute bottom-4 sm:bottom-6 left-2 sm:left-3 right-12 sm:right-16 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Likes */}
        <div className="mb-2">
          <span className="text-white font-semibold">{likes.toLocaleString()} likes</span>
        </div>
        
        {/* Caption */}
        <div className="mb-3">
          <p className="text-white leading-relaxed">
            <span className="font-semibold">{post.author}</span>{' '}
            {post.caption}
          </p>
          
          {/* Hashtags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map((tag) => (
              <button
                key={tag}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comments link */}
        <button 
          onClick={() => onComment(post.id)}
          className="text-gray-400 text-sm hover:text-white transition-colors"
        >
          View all {post.comments} comments
        </button>
      </motion.div>
    </div>
  );
}

export function FeedView({ posts, onLike, onComment, onDuet, onFollow, onSavePost, onSharePost, onViewProfile, stories, onStoryClick }: FeedViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Handle scroll with snap behavior
  const handleScroll = () => {
    if (!containerRef.current || isScrolling.current) return;
    
    const container = containerRef.current;
    const scrollPosition = container.scrollTop;
    const viewportHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / viewportHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < posts.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Smooth scroll to specific post
  const scrollToPost = (index: number) => {
    if (!containerRef.current) return;
    
    isScrolling.current = true;
    const container = containerRef.current;
    const targetPosition = index * container.clientHeight;
    
    container.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      isScrolling.current = false;
    }, 500);
  };

  // Auto-advance functionality (optional - like TikTok)
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentIndex < posts.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        scrollToPost(nextIndex);
      }
    }, 10000); // 10 seconds per post

    return () => clearInterval(timer);
  }, [currentIndex, posts.length]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black" style={{
      height: '100%',
      minHeight: '100%',
      touchAction: 'pan-y pinch-zoom'
    }}>
      {/* Stories Header */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <div className="px-2 py-2 sm:px-3 sm:py-3">
          <div className="flex space-x-2 sm:space-x-3 overflow-x-auto scrollbar-hide">
            {/* Your Story */}
            <button
              className="flex-shrink-0 flex flex-col items-center space-y-1 touch-manipulation"
              onClick={onStoryClick}
              style={{ minWidth: '50px' }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl font-light">+</span>
                </div>
              </div>
              <span className="text-white text-xs">Your story</span>
            </button>

            {/* Friends' Stories */}
            {stories.map((story) => (
              <button
                key={story.id}
                className="flex-shrink-0 flex flex-col items-center space-y-1 touch-manipulation"
                onClick={onStoryClick}
                style={{ minWidth: '50px' }}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 ${
                  story.isViewed 
                    ? 'bg-gray-600' 
                    : 'bg-gradient-to-tr from-purple-500 to-pink-500'
                }`}>
                  <ImageWithFallback
                    src={story.authorAvatar}
                    alt={story.author}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="text-white text-xs truncate w-12 sm:w-14 text-center">
                  {story.author.split('_')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Feed - Scrollable Container */}
      <div 
        ref={containerRef}
        className="absolute top-16 sm:top-20 left-0 right-0 bottom-0 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ 
          scrollBehavior: 'smooth',
          touchAction: 'pan-y pinch-zoom',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {posts.map((post, index) => (
          <div key={post.id} className="w-full h-full">
            <ReelPost
              post={post}
              isActive={index === currentIndex}
              onLike={onLike}
              onComment={onComment}
              onDuet={onDuet}
              onFollow={onFollow}
              onSavePost={onSavePost}
              onSharePost={onSharePost}
              onViewProfile={onViewProfile}
            />
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30">
        <div className="flex flex-col space-y-1">
          {posts.map((_, index) => (
            <button
              key={index}
              className={`w-1 h-6 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/30'
              }`}
              onClick={() => {
                setCurrentIndex(index);
                scrollToPost(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
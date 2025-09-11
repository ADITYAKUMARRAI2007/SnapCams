import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share, MoreVertical, MapPin, Bookmark, Send, UserPlus, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { apiService, Post, Story as BackendStory } from '../services/api';

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
        className="absolute top-20 left-4 right-4 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-11 h-11 rounded-full border-2 border-white p-0.5">
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
        className="absolute right-4 bottom-40 flex flex-col items-center space-y-4 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Like */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className="p-3 hover:scale-110 transition-transform"
          >
            <Heart 
              className={`w-7 h-7 ${
                isLiked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-white hover:text-red-400'
              } transition-colors`} 
            />
          </button>
          <span className="text-white text-sm mt-1">{(likes ?? 0).toLocaleString()}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onComment(post.id)}
            className="p-3 hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-7 h-7 text-white hover:text-blue-400 transition-colors" />
          </button>
          <span className="text-white text-sm mt-1">{post.comments}</span>
        </div>

        {/* Send/Share */}
        <div className="flex flex-col items-center relative">
          <button 
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-3 hover:scale-110 transition-transform"
          >
            <Send className="w-7 h-7 text-white hover:text-blue-400 transition-colors" />
          </button>
          <span className="text-white text-sm mt-1">{post.shares}</span>
          
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
            className="p-3 hover:scale-110 transition-transform"
          >
            <Bookmark 
              className={`w-7 h-7 ${
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
        className="absolute bottom-8 left-4 right-20 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Likes */}
        <div className="mb-2">
          <span className="text-white font-semibold">{(likes ?? 0).toLocaleString()} likes</span>
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
  const [backendPosts, setBackendPosts] = useState([]);
  const [backendStories, setBackendStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load posts and stories in parallel
        const [postsResponse, storiesResponse] = await Promise.all([
          apiService.getFeed(),
          apiService.getStories()
        ]);

        if (postsResponse.success && postsResponse.data) {
          setBackendPosts(postsResponse.data.posts);
        }

        if (storiesResponse.success && storiesResponse.data) {
          setBackendStories(storiesResponse.data.stories);
        }
      } catch (error) {
        console.error('Error loading feed data:', error);
        setError('Failed to load feed data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      const totalPosts = backendPosts.length || posts.length;
      if (currentIndex < totalPosts - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        scrollToPost(nextIndex);
      }
    }, 10000); // 10 seconds per post

    return () => clearInterval(timer);
  }, [currentIndex, backendPosts.length, posts.length]);

  // Convert backend posts to frontend format
  const displayPosts = backendPosts.length > 0 ? backendPosts.map(post => ({
    id: post.id,
    author: post.author.displayName,
    authorAvatar: post.author.avatar,
    image: post.image,
    caption: post.caption,
    hashtags: post.hashtags,
    likes: post.likesCount,
    comments: post.commentsCount,
    shares: post.shares,
    isLiked: post.isLiked || false,
    streak: post.streak,
    duets: post.duetsCount,
    location: post.location?.name,
    timeAgo: new Date(post.createdAt).toLocaleDateString()
  })) : posts;

  // Convert backend stories to frontend format
  const displayStories = backendStories.length > 0 ? backendStories.map(story => ({
    id: story.id,
    author: story.author.displayName,
    authorAvatar: story.author.avatar,
    content: story.content,
    streak: story.contentCount,
    lastUpdated: new Date(story.updatedAt).getTime(),
    isViewed: story.isViewed || false
  })) : stories;

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      {/* Stories Header */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <div className="px-4 py-4">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {/* Your Story */}
            <button
              className="flex-shrink-0 flex flex-col items-center space-y-2"
              onClick={onStoryClick}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <span className="text-white text-2xl font-light">+</span>
                </div>
              </div>
              <span className="text-white text-xs">Your story</span>
            </button>

            {/* Friends' Stories */}
            {displayStories.map((story) => (
              <button
                key={story.id}
                className="flex-shrink-0 flex flex-col items-center space-y-2"
                onClick={onStoryClick}
              >
                <div className={`w-16 h-16 rounded-full p-0.5 ${
                  story.isViewed 
                    ? 'bg-gray-600' 
                    : 'bg-gradient-to-tr from-blue-500 to-cyan-500'
                }`}>
                  <ImageWithFallback
                    src={story.authorAvatar}
                    alt={story.author}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className="text-white text-xs truncate w-16 text-center">
                  {story.author.split('_')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute top-24 left-0 right-0 bottom-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading feed...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute top-24 left-0 right-0 bottom-0 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Feed - Scrollable Container */}
      {!isLoading && !error && (
        <div 
          ref={containerRef}
          className="absolute top-24 left-0 right-0 bottom-0 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth' }}
        >
          {displayPosts.map((post, index) => (
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
      )}

      {/* Progress Indicator */}
      {!isLoading && !error && displayPosts.length > 0 && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30">
          <div className="flex flex-col space-y-1">
            {displayPosts.map((_, index) => (
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
      )}
    </div>
  );
}
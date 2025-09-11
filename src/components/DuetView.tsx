import React, { useState } from 'react';
import { Send, Heart, Sparkles, X, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Duet {
  id: string;
  originalPost: {
    id: string;
    author: string;
    authorAvatar: string;
    image: string;
    caption: string;
    hashtags: string[];
  };
  response: string;
  author: string;
  authorAvatar: string;
  likes: number;
  isLiked: boolean;
  timeAgo: string;
}

interface DuetViewProps {
  duets: Duet[];
  onClose: () => void;
  onCreateDuet: (postId: string, response: string) => void;
  selectedPostId?: string;
}

const mockDuets: Duet[] = [
  {
    id: '1',
    originalPost: {
      id: '1',
      author: 'alexandra_wanderer',
      authorAvatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      image: 'https://images.unsplash.com/photo-1613228097818-386b8d5f2a08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwbW9tZW50fGVufDF8fHx8MTc1NjkwMTQ5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Morning rituals in the city that never sleeps ☕️',
      hashtags: ['morningvibes', 'coffee', 'citylife']
    },
    response: 'In porcelain cups, dreams unfold,\nSteam rises like stories untold,\nEach sip a verse,\nIn coffee\'s universe,\nWhere moments turn to liquid gold. ✨',
    author: 'poet_soul',
    authorAvatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    likes: 47,
    isLiked: true,
    timeAgo: '1h'
  }
];

export function DuetView({ duets = mockDuets, onClose, onCreateDuet, selectedPostId }: DuetViewProps) {
  const [isCreating, setIsCreating] = useState(!!selectedPostId);
  const [duetText, setDuetText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [likedDuets, setLikedDuets] = useState(new Set(['1']));

  const handleLike = (duetId: string) => {
    const newLikedDuets = new Set(likedDuets);
    if (newLikedDuets.has(duetId)) {
      newLikedDuets.delete(duetId);
    } else {
      newLikedDuets.add(duetId);
    }
    setLikedDuets(newLikedDuets);
  };

  const handlePostDuet = async () => {
    if (!duetText.trim() || !selectedPostId) return;
    
    setIsPosting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onCreateDuet(selectedPostId, duetText);
    setDuetText('');
    setIsCreating(false);
    setIsPosting(false);
  };

  const poeticSuggestions = [
    "In whispered moments, beauty speaks...",
    "Like melodies of light and shadow...", 
    "Where time stands still and hearts remember...",
    "A symphony of colors dancing..."
  ];

  const memeTemplates = [
    "When you see this post: 😍",
    "POV: You're living your best life 🔥",
    "This is giving main character energy ✨",
    "No thoughts, just vibes 💭",
    "The way this hits different 💯"
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={isCreating ? () => setIsCreating(false) : onClose}
          className="text-white hover:bg-gray-800"
        >
          {isCreating ? <ArrowLeft className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </Button>
        <h1 className="text-white font-medium">
          {isCreating ? 'Create Duet' : 'Caption Duets'}
        </h1>
        <div className="w-10" />
      </div>

      {isCreating ? (
        /* Create Duet View */
        <div className="flex-1 flex flex-col">
          {/* Original Post Preview */}
          {selectedPostId && (
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3 mb-3">
                <ImageWithFallback
                  src={duets[0].originalPost.authorAvatar}
                  alt={duets[0].originalPost.author}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white text-sm">{duets[0].originalPost.author}</span>
              </div>
              <div className="flex space-x-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={duets[0].originalPost.image}
                    alt="Original post"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{duets[0].originalPost.caption}</p>
                </div>
              </div>
            </div>
          )}

          {/* Duet Input */}
          <div className="flex-1 p-4">
            <div className="mb-4">
              {/* Creation Mode Tabs */}
              <div className="flex space-x-2 mb-4">
                <Button
                  variant={duetText.startsWith('🎭') ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDuetText('🎭 ')}
                >
                  🎭 Poetic
                </Button>
                <Button
                  variant={duetText.includes('😂') || duetText.includes('💯') ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDuetText('😂 ')}
                >
                  😂 Meme
                </Button>
                <Button
                  variant={duetText.includes('🔥') ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDuetText('🔥 ')}
                >
                  🔥 Hype
                </Button>
              </div>

              {/* Quick Emoji Bar */}
              <div className="flex space-x-2 mb-3 overflow-x-auto scrollbar-hide">
                {['😍', '🔥', '💯', '✨', '🤯', '💖', '😂', '🌟', '💫'].map((emoji) => (
                  <motion.button
                    key={emoji}
                    className="glass rounded-full w-10 h-10 flex items-center justify-center text-lg flex-shrink-0"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDuetText(prev => prev + emoji + ' ')}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>

              <h3 className="text-white font-medium mb-2">Your creative response:</h3>
              <Textarea
                value={duetText}
                onChange={(e) => setDuetText(e.target.value)}
                placeholder="Let your creativity flow... Write a poetic response, meme caption, or hype comment!"
                className="min-h-32 glass border-white/20 text-white placeholder-white/60 resize-none"
                maxLength={280}
              />
              
              {/* Quick Templates */}
              <div className="mt-3 space-y-2">
                <p className="text-white/60 text-sm">Quick templates:</p>
                <div className="flex flex-wrap gap-2">
                  {[...poeticSuggestions, ...memeTemplates].slice(0, 3).map((template, index) => (
                    <motion.button
                      key={index}
                      className="glass rounded-full px-3 py-1 text-xs text-white/80 hover:text-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDuetText(template)}
                    >
                      {template.slice(0, 20)}...
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <span className="text-white/60 text-sm">{duetText.length}/280</span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-400 hover:bg-purple-400/10"
                    onClick={() => {
                      const suggestion = poeticSuggestions[Math.floor(Math.random() * poeticSuggestions.length)];
                      setDuetText('🎭 ' + suggestion);
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Poetry
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-yellow-400 hover:bg-yellow-400/10"
                    onClick={() => {
                      const meme = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
                      setDuetText(meme);
                    }}
                  >
                    😂 Meme
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePostDuet}
              disabled={!duetText.trim() || isPosting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3"
            >
              {isPosting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post Duet
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Duets Feed */
        <div className="flex-1 overflow-y-auto">
          {duets.map((duet) => (
            <motion.div
              key={duet.id}
              className="border-b border-gray-800 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Original Post */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ImageWithFallback
                    src={duet.originalPost.authorAvatar}
                    alt={duet.originalPost.author}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-gray-400 text-sm">{duet.originalPost.author}</span>
                </div>
                <div className="flex space-x-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={duet.originalPost.image}
                      alt="Original post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{duet.originalPost.caption}</p>
                  </div>
                </div>
              </div>

              {/* Duet Response */}
              <div className="ml-4 border-l-2 border-purple-500 pl-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ImageWithFallback
                    src={duet.authorAvatar}
                    alt={duet.author}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white font-medium">{duet.author}</span>
                  <span className="text-gray-400 text-sm">• {duet.timeAgo}</span>
                </div>
                <p className="text-white mb-3 leading-relaxed whitespace-pre-line">{duet.response}</p>
                
                <div className="flex items-center space-x-4">
                  <motion.button
                    className="flex items-center space-x-1"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(duet.id)}
                  >
                    <Heart 
                      className={`w-5 h-5 ${likedDuets.has(duet.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                    />
                    <span className="text-gray-400 text-sm">
                      {duet.likes + (likedDuets.has(duet.id) && !duet.isLiked ? 1 : 
                        !likedDuets.has(duet.id) && duet.isLiked ? -1 : 0)}
                    </span>
                  </motion.button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-400 hover:bg-purple-400/10"
                    onClick={() => {
                      setIsCreating(true);
                      setDuetText(`@${duet.author} `);
                    }}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {duets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-white font-medium mb-2">No duets yet</h3>
              <p className="text-gray-400 px-8">
                Be the first to create a poetic response to someone's moment
              </p>
            </div>
          )}
        </div>
      )}

      {/* Floating Create Button */}
      {!isCreating && (
        <motion.div
          className="absolute bottom-6 right-6"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsCreating(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl"
            size="icon"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
import React, { useState, useRef } from 'react';
import { Camera, X, Sparkles, MapPin, Send, Zap, Music, Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CameraViewProps {
  onClose: () => void;
  onCapture: (photo: { image: string; caption: string; hashtags: string[] }) => void;
  onStoryUpload?: (story: { image: string; caption: string; hashtags: string[] }) => void;
  userStreak?: number;
}

export function CameraView({ onClose, onCapture, onStoryUpload, userStreak = 0 }: CameraViewProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock AI caption generation
  const generateCaption = async () => {
    setIsGeneratingCaption(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const captions = [
      "Lost in the beauty of everyday moments ✨",
      "Finding magic in the ordinary streets of life",
      "When the city speaks in colors and shadows",
      "Capturing memories one frame at a time",
      "Street poetry written in light and shadow"
    ];
    
    const hashtags = [
      ["streetphotography", "urban", "citylife", "moment"],
      ["inspiration", "beautiful", "everyday", "magic"],
      ["photography", "art", "creative", "vision"],
      ["memories", "capture", "life", "journey"],
      ["aesthetic", "mood", "vibes", "artistic"]
    ];
    
    const randomIndex = Math.floor(Math.random() * captions.length);
    setGeneratedCaption(captions[randomIndex]);
    setGeneratedHashtags(hashtags[randomIndex]);
    setIsGeneratingCaption(false);
  };

  const handleCapture = () => {
    // Mock camera capture - in real app would use camera API
    const mockImage = "https://images.unsplash.com/photo-1708352012139-cc209d6f479e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMHN0cmVldCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc1Njg5NzMzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    setCapturedImage(mockImage);
    generateCaption();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
      generateCaption();
    }
  };

  const handlePost = async () => {
    if (!capturedImage) return;
    
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onCapture({
      image: capturedImage,
      caption: generatedCaption,
      hashtags: generatedHashtags
    });
    
    setIsUploading(false);
  };

  const handleStoryPost = async () => {
    if (!capturedImage || !onStoryUpload) return;
    
    // Show music selector for stories
    setShowMusicSelector(true);
  };

  const handleStoryWithMusic = async () => {
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onStoryUpload({
      image: capturedImage,
      caption: generatedCaption,
      hashtags: generatedHashtags,
      music: selectedMusic
    });
    
    setIsUploading(false);
    setShowMusicSelector(false);
  };

  // Mock music tracks for AI-suggested music
  const suggestedMusic = [
    {
      id: '1',
      title: 'Dreamy Vibes',
      artist: 'Chill Studio',
      genre: 'Lo-Fi',
      mood: 'Relaxed',
      preview: '/audio/dreamy-vibes.mp3',
      duration: 30
    },
    {
      id: '2',
      title: 'City Lights',
      artist: 'Urban Beats',
      genre: 'Electronic',
      mood: 'Energetic',
      preview: '/audio/city-lights.mp3',
      duration: 30
    },
    {
      id: '3',
      title: 'Golden Hour',
      artist: 'Nature Sounds',
      genre: 'Ambient',
      mood: 'Peaceful',
      preview: '/audio/golden-hour.mp3',
      duration: 30
    },
    {
      id: '4',
      title: 'Adventure Awaits',
      artist: 'Epic Journeys',
      genre: 'Cinematic',
      mood: 'Inspiring',
      preview: '/audio/adventure-awaits.mp3',
      duration: 30
    }
  ];

  const toggleMusic = (track: any) => {
    if (selectedMusic?.id === track.id) {
      setSelectedMusic(null);
    } else {
      setSelectedMusic(track);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
        <h1 className="font-medium">Create Memory</h1>
        <div className="w-10" />
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        {capturedImage ? (
          <div className="w-full h-full relative">
            <ImageWithFallback
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
            
            {/* AI Caption Overlay */}
            <AnimatePresence>
              {isGeneratingCaption && (
                <motion.div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center text-white">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    </motion.div>
                    <p>AI generating your perfect caption...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Caption and Hashtags */}
            {generatedCaption && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <p className="mb-3">{generatedCaption}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {generatedHashtags.map((tag, index) => (
                    <motion.span
                      key={tag}
                      className="text-sm text-blue-300"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center mb-8">
              <Camera className="w-16 h-16 text-white/60" />
            </div>
            <h2 className="mb-2">Capture a Memory</h2>
            <p className="text-white/60 text-center px-8 mb-8">
              Let AI help you turn any moment into a captioned memory with perfect hashtags
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-6 bg-black">
        {!capturedImage ? (
          <div className="flex items-center justify-center space-x-8">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-white/30 text-white hover:bg-white/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-xs">📁</span>
            </Button>
            
            <motion.button
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-400 shadow-lg"
              whileTap={{ scale: 0.95 }}
              onClick={handleCapture}
            >
              <div className="w-full h-full rounded-full bg-white"></div>
            </motion.button>

            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-white/30 text-white hover:bg-white/10"
            >
              <Zap className="w-5 h-5" />
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setCapturedImage(null);
                  setGeneratedCaption('');
                  setGeneratedHashtags([]);
                  setShowShareOptions(false);
                }}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Retake
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="border-white/30 text-white hover:bg-white/10 px-8"
                disabled={isGeneratingCaption}
              >
                Next
              </Button>
            </div>

            {/* Post/Story Options */}
            <AnimatePresence>
              {showShareOptions && (
                <motion.div
                  className="flex space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={handlePost}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Post to Map
                      </>
                    )}
                  </Button>
                  
                  {onStoryUpload && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={handleStoryPost}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Add to Story
                        </>
                      )}
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Music Selector Modal for Stories */}
      <AnimatePresence>
        {showMusicSelector && (
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-md z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMusicSelector(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
                <h2 className="text-white font-semibold">Choose Music</h2>
                <Button
                  onClick={handleStoryWithMusic}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
                >
                  {isUploading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    'Share Story'
                  )}
                </Button>
              </div>

              {/* Music List */}
              <div className="flex-1 p-4 overflow-auto">
                <p className="text-white/60 text-sm mb-4">AI-suggested music based on your image</p>
                <div className="space-y-3">
                  {suggestedMusic.map((track) => (
                    <motion.div
                      key={track.id}
                      onClick={() => toggleMusic(track)}
                      className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all ${
                        selectedMusic?.id === track.id 
                          ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{track.title}</h3>
                        <p className="text-white/60 text-sm">{track.artist} • {track.genre}</p>
                        <p className="text-white/40 text-xs">{track.mood}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedMusic?.id === track.id ? (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-white/30 rounded-full" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Skip Option */}
                <motion.button
                  onClick={handleStoryWithMusic}
                  className="w-full mt-6 py-3 text-white/60 hover:text-white transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  Skip and continue without music
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
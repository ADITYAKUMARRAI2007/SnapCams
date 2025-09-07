import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Sparkles, MapPin, Send, Zap, Music, Play, Pause, RotateCcw } from 'lucide-react';
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraRequested, setCameraRequested] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(true);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [cameraMode, setCameraMode] = useState<'photo' | 'story'>('story');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [showEffects, setShowEffects] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detect available cameras
  const detectCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      console.log('Available cameras:', cameras.map(c => ({ label: c.label, deviceId: c.deviceId })));
    } catch (error) {
      console.error('Error detecting cameras:', error);
    }
  };

  // Auto-start camera when component mounts
  useEffect(() => {
    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(async () => {
      await detectCameras();
      startCamera();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [facingMode, capturedImage]);

  // Ensure video plays when stream changes
  useEffect(() => {
    if (stream && videoRef.current && isCameraActive) {
      console.log('Stream changed, ensuring video plays');
      videoRef.current.srcObject = stream;
      
      const playVideo = () => {
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            console.log('Video playing successfully');
          }).catch((error) => {
            console.error('Video play failed, retrying:', error);
            setTimeout(playVideo, 200);
          });
        }
      };
      
      playVideo();
    }
  }, [stream, isCameraActive]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraRequested(true);
      setIsStartingCamera(true);
      
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        setCameraError('Camera requires HTTPS. Please use file upload or access via HTTPS.');
        setIsCameraActive(false);
        setIsStartingCamera(false);
        return;
      }
      
      // Check if we're on Netlify and add specific handling
      const isNetlify = window.location.hostname.includes('netlify.app');
      if (isNetlify) {
        console.log('Running on Netlify - applying specific camera handling');
      }
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera not supported in this browser. Please use file upload instead.');
        setIsCameraActive(false);
        return;
      }
      
      // Try multiple camera constraint strategies
      let mediaStream;
      const constraints = [
        // Strategy 1: Exact facingMode with high quality
        {
          video: {
            facingMode: { exact: facingMode },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
            frameRate: { ideal: 30, min: 15 }
          },
          audio: false
        },
        // Strategy 2: Exact facingMode with medium quality
        {
          video: {
            facingMode: { exact: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        },
        // Strategy 3: Ideal facingMode (less strict)
        {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        },
        // Strategy 4: Basic facingMode
        {
          video: {
            facingMode: facingMode
          },
          audio: false
        },
        // Strategy 5: Any camera
        {
          video: true,
          audio: false
        }
      ];

      for (let i = 0; i < constraints.length; i++) {
        try {
          console.log(`Trying camera constraint strategy ${i + 1} for ${facingMode}:`, constraints[i]);
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints[i]);
          console.log(`✅ Successfully got camera with strategy ${i + 1} for ${facingMode}`);
          break;
        } catch (error) {
          console.log(`❌ Strategy ${i + 1} failed:`, error.name, error.message);
          if (i === constraints.length - 1) {
            throw error; // Re-throw the last error
          }
        }
      }
      
      setStream(mediaStream);
      setIsCameraActive(true);
      setIsStartingCamera(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Force video to play immediately
        videoRef.current.onloadedmetadata = () => {
          console.log('Camera stream loaded successfully');
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video is now playing');
            }).catch((error) => {
              console.error('Video play failed:', error);
              // Try to play again after a short delay
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(console.error);
                }
              }, 100);
            });
          }
        };
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play');
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        };
        
        videoRef.current.onerror = (error) => {
          console.error('Video element error:', error);
        };
        
        // Force play immediately
        setTimeout(() => {
          if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.play().catch(console.error);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. Please check permissions.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions in your browser settings and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera or use file upload.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported. Please use file upload instead.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is being used by another application. Please close other apps and try again.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints cannot be satisfied. Please try again or use file upload.';
        } else if (error.name === 'SecurityError') {
          errorMessage = 'Camera access blocked due to security restrictions. Please ensure you are using HTTPS.';
        }
      }
      
      setCameraError(errorMessage);
      setIsCameraActive(false);
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const switchCamera = async () => {
    if (isSwitchingCamera) return; // Prevent multiple simultaneous switches
    
    setIsSwitchingCamera(true);
    setIsCameraActive(false);
    setCameraError(null);
    
    try {
      // Stop current camera completely
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.label);
        });
        setStream(null);
      }
      
      // Wait for complete cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Switch facing mode
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      console.log(`Switching from ${facingMode} to ${newFacingMode}`);
      setFacingMode(newFacingMode);
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Start new camera with fresh state
      setIsStartingCamera(true);
      await startCamera();
      
    } catch (error) {
      console.error('Error switching camera:', error);
      setCameraError('Failed to switch camera. Please try again.');
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  // Handle camera mode changes
  const handleModeChange = (mode: 'photo' | 'story') => {
    setCameraMode(mode);
    console.log(`Switched to ${mode} mode`);
    
    // Reset story when switching modes
    if (mode === 'photo') {
      setStoryImages([]);
      setCurrentStoryIndex(0);
    }
  };

  // Handle flash mode toggle
  const toggleFlash = () => {
    const modes: ('off' | 'on' | 'auto')[] = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlashMode(modes[nextIndex]);
    console.log(`Flash mode: ${modes[nextIndex]}`);
  };

  // Handle effects toggle
  const toggleEffects = () => {
    setShowEffects(!showEffects);
    console.log(`Effects panel: ${!showEffects ? 'open' : 'closed'}`);
  };

  // Handle grid toggle
  const toggleGrid = () => {
    setShowGrid(!showGrid);
    console.log(`Grid: ${!showGrid ? 'on' : 'off'}`);
  };

  // Handle story capture
  const handleStoryCapture = () => {
    if (cameraMode === 'story') {
      console.log('Capturing story image...');
      // Capture image for story
      handleCapture();
    }
  };

  // Handle story actions
  const handleStorySave = () => {
    if (storyImages.length > 0) {
      console.log('Saving story...');
      alert(`Story saved with ${storyImages.length} images!`);
      setStoryImages([]);
      setCurrentStoryIndex(0);
    }
  };

  const handleStoryShare = () => {
    if (storyImages.length > 0) {
      console.log('Sharing story...');
      alert(`Story shared with ${storyImages.length} images!`);
    }
  };

  const handleStoryAddMore = () => {
    console.log('Adding more to story...');
    // Start camera again for more captures
    if (!isCameraActive) {
      startCamera();
    }
  };

  const handleStoryRemoveImage = (index: number) => {
    const newImages = storyImages.filter((_, i) => i !== index);
    setStoryImages(newImages);
    if (currentStoryIndex >= newImages.length) {
      setCurrentStoryIndex(Math.max(0, newImages.length - 1));
    }
  };

  // Audio recording functions
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        console.log('Audio recording stopped');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecordingAudio(true);
      console.log('Audio recording started');
    } catch (error) {
      console.error('Error starting audio recording:', error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecordingAudio(false);
      console.log('Audio recording stopped');
    }
  };

  const toggleAudioRecording = () => {
    if (isRecordingAudio) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

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
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Always add to story images (Instagram style)
    setStoryImages(prev => [...prev, imageDataUrl]);
    setCurrentStoryIndex(storyImages.length);
    console.log(`Added image to story. Total: ${storyImages.length + 1}`);
    
    // Don't stop camera for story mode - keep it running for multiple captures
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
      // Stop camera when using file upload
      stopCamera();
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
    if (!capturedImage) return;
    
    // Show music selector for stories
    setShowMusicSelector(true);
  };

  const handleStoryWithMusic = async () => {
    if (!capturedImage || !onStoryUpload) return;
    
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onStoryUpload({
      image: capturedImage,
      caption: generatedCaption,
      hashtags: generatedHashtags
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

  // Debug log
  console.log('CameraView render:', { 
    capturedImage: !!capturedImage, 
    isCameraActive, 
    cameraError, 
    cameraRequested,
    isStartingCamera,
    isSwitchingCamera,
    facingMode
  });

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header - Instagram/Snapchat Style */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 text-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center space-x-4">
          {/* Story Counter */}
          {storyImages.length > 0 && (
            <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">
                {storyImages.length} image{storyImages.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFlash}
          className={`w-10 h-10 rounded-full backdrop-blur-md hover:bg-black/50 transition-all duration-200 ${
            flashMode === 'off' ? 'bg-black/30' : 
            flashMode === 'on' ? 'bg-yellow-500/80' : 'bg-blue-500/80'
          }`}
          title={`Flash: ${flashMode.toUpperCase()}`}
        >
          <Zap className={`w-5 h-5 ${flashMode === 'off' ? 'text-white' : 'text-white'}`} />
        </Button>
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        {storyImages.length > 0 ? (
          <div className="w-full h-full relative">
            <ImageWithFallback
              src={storyImages[currentStoryIndex]}
              alt="Story"
              className="w-full h-full object-cover"
            />
            
            {/* Story Progress Bars - Instagram Style */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1">
              {storyImages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    index === currentStoryIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                  style={{ flex: 1 }}
                />
              ))}
            </div>
            
            {/* Story Navigation */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <Button
                onClick={() => handleStoryRemoveImage(currentStoryIndex)}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70"
              >
                <X className="w-4 h-4 text-white" />
              </Button>
            </div>
            
            {/* Audio Controls - Instagram Style */}
            <div className="absolute top-20 right-4 flex flex-col space-y-2">
              <Button
                onClick={toggleAudioRecording}
                className={`w-12 h-12 rounded-full backdrop-blur-md transition-all duration-200 ${
                  isRecordingAudio 
                    ? 'bg-red-500/80 hover:bg-red-600/80' 
                    : 'bg-black/50 hover:bg-black/70'
                }`}
              >
                {isRecordingAudio ? (
                  <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
                ) : (
                  <div className="w-6 h-6 bg-white rounded-full" />
                )}
              </Button>
              {audioUrl && (
                <audio
                  src={audioUrl}
                  controls
                  className="w-12 h-8 bg-black/50 backdrop-blur-md rounded"
                />
              )}
            </div>
            
            {/* Story Action Buttons - Instagram Style */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
              <Button
                onClick={handleStoryAddMore}
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-2 rounded-full border border-white/20"
              >
                <Camera className="w-4 h-4 mr-2" />
                Add More
              </Button>
              <Button
                onClick={handleStorySave}
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-2 rounded-full border border-white/20"
              >
                <Send className="w-4 h-4 mr-2" />
                Save Story
              </Button>
              <Button
                onClick={handleStoryShare}
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-2 rounded-full border border-white/20"
              >
                <Send className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        ) : capturedImage ? (
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
        ) : isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              controls={false}
              className="w-full h-full object-cover"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                backgroundColor: '#000'
              }}
            />
            {/* Camera Switch Button - Instagram/Snapchat Style */}
            <div className="absolute top-20 right-4 z-20">
              <Button
                variant="ghost"
                size="icon"
                onClick={switchCamera}
                disabled={isSwitchingCamera}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 disabled:opacity-50 transition-all duration-200"
                title={`Switch to ${facingMode === 'user' ? 'back' : 'front'} camera`}
              >
                {isSwitchingCamera ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RotateCcw className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <RotateCcw className="w-6 h-6 text-white" />
                )}
              </Button>
            </div>

            {/* Effects/Filters Button - Instagram Style */}
            <div className="absolute top-20 left-4 z-20">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleEffects}
                className={`w-12 h-12 rounded-full backdrop-blur-md hover:bg-black/60 transition-all duration-200 ${
                  showEffects ? 'bg-purple-500/80' : 'bg-black/40'
                }`}
                title="Effects & Filters"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </Button>
            </div>

            {/* Grid Lines - Instagram Style */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20"></div>
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20"></div>
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20"></div>
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20"></div>
              </div>
            )}

            {/* Grid Toggle Button */}
            <div className="absolute top-32 left-4 z-20">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleGrid}
                className={`w-10 h-10 rounded-full backdrop-blur-md hover:bg-black/60 transition-all duration-200 ${
                  showGrid ? 'bg-white/20' : 'bg-black/40'
                }`}
                title={`Grid: ${showGrid ? 'ON' : 'OFF'}`}
              >
                <div className="w-4 h-4 border border-white/60 rounded-sm">
                  <div className="w-full h-px bg-white/60 mt-1"></div>
                  <div className="w-full h-px bg-white/60 mt-1"></div>
                  <div className="w-px h-full bg-white/60 absolute left-1/2 top-0 transform -translate-x-1/2"></div>
                  <div className="w-px h-full bg-white/60 absolute right-1/3 top-0"></div>
                </div>
              </Button>
            </div>

            
            {/* Effects Panel */}
            {showEffects && (
              <div className="absolute bottom-20 left-4 right-4 z-30">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4">
                  <h3 className="text-white text-sm font-medium mb-3">Effects & Filters</h3>
                  <div className="flex space-x-3 overflow-x-auto">
                    <button className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </button>
                    <button className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white text-xs">Cool</span>
                    </button>
                    <button className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <span className="text-white text-xs">Warm</span>
                    </button>
                    <button className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-xs">Nature</span>
                    </button>
                    <button className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                      <span className="text-white text-xs">B&W</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : cameraError ? (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="w-32 h-32 rounded-full border-4 border-red-500/20 flex items-center justify-center mb-8">
              <Camera className="w-16 h-16 text-red-500/60" />
            </div>
            <h2 className="mb-2 text-red-400">Camera Error</h2>
            <p className="text-white/60 text-center px-8 mb-8">
              {cameraError}
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Upload Photo
              </Button>
            </div>
          </div>
        ) : isStartingCamera ? (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center mb-8 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Camera className="w-16 h-16 text-white/80" />
              </motion.div>
            </div>
            <h2 className="mb-2 text-xl font-semibold">🎥 Starting Camera...</h2>
            <p className="text-white/60 text-center px-8 mb-8">
              Please allow camera access to continue
            </p>
            <div className="mt-6">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 text-sm rounded-full shadow-lg transition-all duration-200"
              >
                📁 Upload Photo Instead
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center mb-8">
              <Camera className="w-16 h-16 text-white/60" />
            </div>
            <h2 className="mb-2">🎥 Camera Ready</h2>
            <p className="text-white/60 text-center px-8 mb-8">
              Camera is ready to use
            </p>
            <div className="mt-6">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm"
              >
                📁 Upload Photo Instead
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls - Instagram/Snapchat Style */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        {!capturedImage && storyImages.length === 0 ? (
          <div className="flex items-center justify-between">
            {/* Gallery Button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all duration-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-8 h-8 rounded border-2 border-white/60 flex items-center justify-center">
                <span className="text-xs text-white/60">📁</span>
              </div>
            </Button>

            {/* Main Capture Button - Instagram/Snapchat Style */}
            <div className="flex flex-col items-center">
              <motion.button
                className="w-20 h-20 rounded-full border-4 border-gray-300 shadow-2xl bg-white"
                whileTap={{ scale: 0.9 }}
                onClick={handleStoryCapture}
              >
                <div className="w-full h-full rounded-full bg-white"></div>
              </motion.button>
              <span className="text-xs text-white/80 mt-2 font-medium">
                STORY
              </span>
            </div>

            {/* Audio Recording Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudioRecording}
              className={`w-12 h-12 rounded-full backdrop-blur-md transition-all duration-200 ${
                isRecordingAudio 
                  ? 'bg-red-500/80 hover:bg-red-600/80' 
                  : 'bg-black/40 hover:bg-black/60'
              }`}
              title={isRecordingAudio ? 'Stop Recording' : 'Start Recording'}
            >
              {isRecordingAudio ? (
                <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
              ) : (
                <div className="w-6 h-6 bg-white rounded-full" />
              )}
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
                  setShowMusicSelector(false);
                  setSelectedMusic(null);
                  // Restart camera for retake
                  startCamera();
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
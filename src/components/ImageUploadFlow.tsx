import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Sparkles, MapPin, Send, Eye, RefreshCw, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiService } from '../services/api';

interface ImageUploadFlowProps {
  onClose: () => void;
  onPostCreated: (post: any) => void;
  onStoryCreated: (story: any) => void;
  userLocation?: { lat: number; lng: number; name: string };
  capturedPhoto?: {
    image: string;
    caption: string;
    hashtags: string[];
  } | null;
}

export function ImageUploadFlow({ onClose, onPostCreated, onStoryCreated, userLocation, capturedPhoto }: ImageUploadFlowProps) {
  const [step, setStep] = useState(capturedPhoto ? 2 : 1); // Start at step 2 if photo is provided
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(capturedPhoto?.image || null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState([]);
  const [customCaption, setCustomCaption] = useState('');
  const [customHashtags, setCustomHashtags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setStep(2);
    }
  };

  const generateCaption = async () => {
    if (!selectedFile && !capturedPhoto) return;

    setIsGeneratingCaption(true);
    try {
      let response;
      
      if (capturedPhoto) {
        // Handle blob URL or base64 data
        let imageData = capturedPhoto.image;
        
        try {
          let file;
          
          if (imageData.startsWith('blob:')) {
            // Handle blob URL - use canvas to convert to base64 first
            console.log('Converting blob URL to file via canvas...');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            if (!ctx) {
              throw new Error('Could not get canvas context');
            }
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                
                // Convert data URL to File
                const base64Data = dataURL.split(',')[1];
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });
                file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
                resolve(file);
              };
              img.onerror = reject;
              img.src = imageData;
            });
          } else if (imageData.startsWith('data:')) {
            // Handle data URL (base64)
            console.log('Converting data URL to file...');
            let base64Data = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            base64Data = base64Data.replace(/\s/g, ''); // Clean whitespace
            
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          } else {
            // Assume it's raw base64
            console.log('Converting raw base64 to file...');
            let base64Data = imageData.replace(/\s/g, '');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          }
          
          response = await apiService.generateCaption(file, {
            location: userLocation?.name,
            mood: 'happy',
            timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
          });
        } catch (conversionError) {
          console.error('Image conversion error:', conversionError);
          // Fallback to default caption if conversion fails
          const fallbackCaption = 'Amazing moment captured! ✨';
          const fallbackHashtags = ['moment', 'life', 'beautiful', 'vibes'];
          setGeneratedCaption(fallbackCaption);
          setGeneratedHashtags(fallbackHashtags);
          setCustomCaption(fallbackCaption);
          setCustomHashtags(fallbackHashtags.map(tag => `#${tag}`).join(' '));
          setStep(3);
          return;
        }
      } else {
        response = await apiService.generateCaption(selectedFile!, {
          location: userLocation?.name,
          mood: 'happy',
          timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
        });
      }

      if (response.success && response.data) {
        console.log('Generated caption:', response.data.caption);
        console.log('Generated hashtags:', response.data.hashtags);
        
        // Take only the first caption and limit hashtags to 4
        const caption = response.data.caption;
        const hashtags = (response.data.hashtags || []).slice(0, 4);
        
        setGeneratedCaption(caption);
        setGeneratedHashtags(hashtags);
        setCustomCaption(caption);
        setCustomHashtags(hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' '));
        setStep(3);
      } else {
        console.log('No response data or failed response:', response);
        // Fallback to default caption
        const fallbackCaption = 'Amazing moment captured! ✨';
        const fallbackHashtags = ['moment', 'life', 'beautiful', 'vibes'];
        setGeneratedCaption(fallbackCaption);
        setGeneratedHashtags(fallbackHashtags);
        setCustomCaption(fallbackCaption);
        setCustomHashtags(fallbackHashtags.map(tag => `#${tag}`).join(' '));
        setStep(3);
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      // Fallback to default caption
      const fallbackCaption = 'Amazing moment captured! ✨';
      const fallbackHashtags = ['moment', 'life', 'beautiful', 'vibes'];
      setGeneratedCaption(fallbackCaption);
      setGeneratedHashtags(fallbackHashtags);
      setCustomCaption(fallbackCaption);
      setCustomHashtags(fallbackHashtags.map(tag => `#${tag}`).join(' '));
      setStep(3);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handlePostToMap = async () => {
    if ((!selectedFile && !capturedPhoto) || !customCaption) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const postData = {
        caption: customCaption,
        hashtags: customHashtags.split(' ').filter(tag => tag.startsWith('#')),
        location: userLocation ? {
          name: userLocation.name,
          coordinates: { lat: userLocation.lat, lng: userLocation.lng }
        } : undefined
      };

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let fileToUpload = selectedFile;
      if (capturedPhoto && !selectedFile) {
        // Handle blob URL or base64 data
        let imageData = capturedPhoto.image;
        
        try {
          if (imageData.startsWith('blob:')) {
            // Handle blob URL - use canvas to convert to base64 first
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            if (!ctx) {
              throw new Error('Could not get canvas context');
            }
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                
                // Convert data URL to File
                const base64Data = dataURL.split(',')[1];
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });
                fileToUpload = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
                resolve(fileToUpload);
              };
              img.onerror = reject;
              img.src = imageData;
            });
          } else if (imageData.startsWith('data:')) {
            // Handle data URL (base64)
            let base64Data = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            base64Data = base64Data.replace(/\s/g, ''); // Clean whitespace
            
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            fileToUpload = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          } else {
            // Assume it's raw base64
            let base64Data = imageData.replace(/\s/g, '');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            fileToUpload = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          }
        } catch (conversionError) {
          console.error('Image conversion error in handlePostToMap:', conversionError);
          return;
        }
      }
      
      const response = await apiService.createPost(postData, fileToUpload!);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        onPostCreated(response.data.post);
        onClose();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateStory = async () => {
    if ((!selectedFile && !capturedPhoto) || !customCaption) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storyData = {
        caption: customCaption,
        location: userLocation ? {
          name: userLocation.name,
          coordinates: { lat: userLocation.lat, lng: userLocation.lng }
        } : undefined
      };

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let fileToUpload = selectedFile;
      if (capturedPhoto && !selectedFile) {
        // Handle blob URL or base64 data
        let imageData = capturedPhoto.image;
        
        try {
          if (imageData.startsWith('blob:')) {
            // Handle blob URL - use canvas to convert to base64 first
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            if (!ctx) {
              throw new Error('Could not get canvas context');
            }
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                
                // Convert data URL to File
                const base64Data = dataURL.split(',')[1];
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });
                fileToUpload = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
                resolve(fileToUpload);
              };
              img.onerror = reject;
              img.src = imageData;
            });
          } else if (imageData.startsWith('data:')) {
            // Handle data URL (base64)
            let base64Data = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            base64Data = base64Data.replace(/\s/g, ''); // Clean whitespace
            
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            fileToUpload = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          } else {
            // Assume it's raw base64
            let base64Data = imageData.replace(/\s/g, '');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            fileToUpload = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          }
        } catch (conversionError) {
          console.error('Image conversion error in handleCreateStory:', conversionError);
          return;
        }
      }
      
      const response = await apiService.createStory(storyData, fileToUpload!);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        onStoryCreated(response.data.story);
        onClose();
      }
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedFile(null);
    setImagePreview(null);
    setGeneratedCaption('');
    setGeneratedHashtags([]);
    setCustomCaption('');
    setCustomHashtags('');
    setIsUploading(false);
    setUploadProgress(0);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {step === 1 && 'Upload Image'}
              {step === 2 && 'Generate Caption'}
              {step === 3 && 'Preview'}
              {step === 4 && 'Choose Destination'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Upload Image */}
            {step === 1 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-4"
              >
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Image</h3>
                  <p className="text-gray-600 text-sm">Choose a photo to create a post or story</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Choose Image
                </Button>
              </motion.div>
            )}

            {/* Step 2: Generate Caption */}
            {step === 2 && (
              <motion.div
                key="caption"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {imagePreview && (
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate AI Caption</h3>
                  <p className="text-gray-600 text-sm">Let AI create a perfect caption with hashtags</p>
                </div>
                <Button
                  onClick={generateCaption}
                  disabled={isGeneratingCaption}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isGeneratingCaption ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Caption
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Your Post</h3>
                  <p className="text-gray-600 text-sm">
                    {customCaption ? "Review and edit your caption" : "Caption will appear here after generation"}
                  </p>
                </div>

                {/* Social Media Post Preview */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {imagePreview && (
                    <div className="w-full h-64 bg-gray-100">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    {/* Interaction Icons */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-6 h-6 text-red-500">❤️</div>
                        <div className="w-6 h-6 text-gray-600">💬</div>
                        <div className="w-6 h-6 text-gray-600">📤</div>
                      </div>
                      <div className="w-6 h-6 text-gray-600">🔖</div>
                    </div>
                    
                    {/* Likes Count */}
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      {Math.floor(Math.random() * 5000) + 1000} likes
                    </div>
                    
                    {/* Username and Caption */}
                    <div className="mb-2">
                      <span className="font-semibold text-gray-900">cosmic_wanderer</span>
                      <span className="ml-2 text-gray-700">
                        {customCaption || "Your caption will appear here..."}
                      </span>
                    </div>
                    
                    {/* Hashtags */}
                    {customHashtags && (
                      <div className="text-blue-600 text-sm">
                        {customHashtags.split(' ').map((tag, index) => (
                          <span key={index}>
                            {tag.startsWith('#') ? tag : `#${tag}`}
                            {index < customHashtags.split(' ').length - 1 && ' '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Section */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption
                    </label>
                    <textarea
                      value={customCaption}
                      onChange={(e) => setCustomCaption(e.target.value)}
                      placeholder={customCaption ? "Edit your caption..." : "Write your caption..."}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
                      rows={3}
                      style={{ minHeight: '80px', fontSize: '14px', lineHeight: '1.4' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hashtags
                    </label>
                    <Input
                      value={customHashtags}
                      onChange={(e) => setCustomHashtags(e.target.value)}
                      placeholder="#hashtag1 #hashtag2"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Choose Destination */}
            {step === 4 && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Destination</h3>
                  <p className="text-gray-600 text-sm">Where would you like to share this?</p>
                </div>

                {imagePreview && (
                  <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={handlePostToMap}
                    disabled={isUploading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12"
                  >
                    {isUploading && uploadProgress < 100 ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading to Map... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Post to Map
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleCreateStory}
                    disabled={isUploading}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white h-12"
                  >
                    {isUploading && uploadProgress < 100 ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Story... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Create Story
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  onClick={resetFlow}
                  variant="outline"
                  className="w-full"
                >
                  Start Over
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

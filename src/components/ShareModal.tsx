import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Instagram, 
  Twitter, 
  Facebook, 
  MessageSquare, 
  Mail, 
  Copy, 
  Link, 
  Download,
  Send,
  Users,
  QrCode
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LiquidEtherBackground } from './LiquidEtherBackground';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    type: 'post' | 'profile' | 'story';
    id: string;
    title: string;
    image?: string;
    author?: string;
    description?: string;
  };
}

interface ShareOption {
  id: string;
  name: string;
  icon: any;
  color: string;
  action: () => void;
}

export function ShareModal({ isOpen, onClose, content }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const shareUrl = `https://snapcap.app/${content.type}/${content.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-6 h-6" />,
      color: 'from-purple-600 to-pink-600',
      action: () => {
        // Open Instagram with share intent
        const text = `Check out this amazing ${content.type} on SnapCap! ${shareUrl}`;
        const instagramUrl = `https://www.instagram.com/`;
        window.open(instagramUrl, '_blank');
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      action: () => {
        const text = `${shareMessage || `Check out this ${content.type} on SnapCap!`} ${shareUrl}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6" />,
      color: 'from-blue-600 to-blue-700',
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank');
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      action: () => {
        const text = `${shareMessage || `Check out this ${content.type} on SnapCap!`} ${shareUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
      }
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-6 h-6" />,
      color: 'from-gray-500 to-gray-600',
      action: () => {
        const subject = `Check out this ${content.type} on SnapCap`;
        const body = `${shareMessage || `I thought you'd enjoy this ${content.type}!`}\n\n${shareUrl}`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = emailUrl;
      }
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: <Send className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-600',
      action: () => {
        const text = `${shareMessage || `Check out this ${content.type} on SnapCap!`} ${shareUrl}`;
        const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
        window.location.href = smsUrl;
      }
    }
  ];

  const quickActions = [
    {
      id: 'copy',
      name: 'Copy Link',
      icon: <Copy className="w-5 h-5" />,
      action: copyToClipboard
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: <QrCode className="w-5 h-5" />,
      action: () => {
        // Generate QR code for the share URL
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
        window.open(qrUrl, '_blank');
      }
    },
    {
      id: 'download',
      name: 'Download',
      icon: <Download className="w-5 h-5" />,
      action: () => {
        if (content.image) {
          const link = document.createElement('a');
          link.href = content.image;
          link.download = `snapcap-${content.type}-${content.id}.jpg`;
          link.click();
        }
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md mx-4 mb-4 bg-black/90 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Background Animation */}
          <div className="absolute inset-0 opacity-30">
            <LiquidEtherBackground variant="feed" />
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-white font-semibold">Share {content.type}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content Preview */}
          {content.image && (
            <div className="relative z-10 p-4">
              <div className="flex items-center space-x-3 bg-white/5 rounded-2xl p-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <ImageWithFallback
                    src={content.image}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{content.title}</p>
                  {content.author && (
                    <p className="text-white/60 text-sm">by {content.author}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Share Message */}
          <div className="relative z-10 px-4 pb-4">
            <Input
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              placeholder={`Add a message about this ${content.type}...`}
              className="bg-white/5 border-white/10 text-white placeholder-white/50"
            />
          </div>

          {/* Quick Actions */}
          <div className="relative z-10 px-4 pb-4">
            <div className="flex items-center justify-between">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  onClick={action.action}
                  className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    {action.icon}
                  </div>
                  <span className="text-white/80 text-xs font-medium">{action.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="relative z-10 px-4 pb-4">
            <div className="flex items-center space-x-2 bg-white/5 rounded-2xl p-3">
              <Link className="w-5 h-5 text-white/60" />
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent border-none text-white/80 text-sm p-0 focus:ring-0"
              />
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="sm"
                className={`text-white hover:bg-white/10 ${copied ? 'text-green-400' : ''}`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="relative z-10 px-4 pb-6">
            <h3 className="text-white/80 font-medium mb-3">Share to</h3>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={option.action}
                  className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-full flex items-center justify-center text-white`}>
                    {option.icon}
                  </div>
                  <span className="text-white/80 text-xs font-medium">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
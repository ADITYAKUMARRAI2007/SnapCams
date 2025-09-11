import React, { useState } from 'react';
import { X, Send, Heart, Reply, MoreVertical, Smile } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  timeAgo: string;
  replies?: Comment[];
  isPinned?: boolean;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postAuthor: string;
  postImage: string;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onLikeComment: (commentId: string) => void;
  onReplyToComment: (commentId: string, content: string) => void;
}

export function CommentModal({
  isOpen,
  onClose,
  postAuthor,
  postImage,
  comments,
  onAddComment,
  onLikeComment,
  onReplyToComment
}: CommentModalProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReplyToComment(commentId, replyContent.trim());
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleKeyPress = (e: any, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full bg-gray-900 rounded-t-3xl max-h-[80vh] flex flex-col"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <ImageWithFallback
                src={postImage}
                alt="Post"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-white font-semibold">Comments</h3>
                <p className="text-white/60 text-sm">{comments.length} comments</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2">
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  className={`relative ${comment.isPinned ? 'glass border border-purple-400/30 rounded-xl p-3' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {comment.isPinned && (
                    <div className="absolute -top-2 left-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      📌 Pinned
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <ImageWithFallback
                      src={comment.authorAvatar}
                      alt={comment.author}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium text-sm">{comment.author}</h4>
                        {comment.author === postAuthor && (
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                            OP
                          </span>
                        )}
                        <span className="text-white/40 text-xs">{comment.timeAgo}</span>
                      </div>
                      
                      <p className="text-white/80 text-sm leading-relaxed mb-2">
                        {comment.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-white/60">
                        <motion.button
                          className={`flex items-center space-x-1 text-xs hover:text-white ${
                            comment.isLiked ? 'text-red-400' : ''
                          }`}
                          onClick={() => onLikeComment(comment.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                          <span>{comment.likes}</span>
                        </motion.button>
                        
                        <motion.button
                          className="flex items-center space-x-1 text-xs hover:text-white"
                          onClick={() => setReplyingTo(comment.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Reply className="w-3 h-3" />
                          <span>Reply</span>
                        </motion.button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-white/40 hover:text-white"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <motion.div
                          className="mt-3 flex items-center space-x-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Input
                            placeholder={`Reply to ${comment.author}...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, () => handleSubmitReply(comment.id))}
                            className="flex-1 glass border-white/20 text-white placeholder-white/60 text-sm h-8"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim()}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-8 px-3"
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            className="text-white/60 hover:text-white h-8 px-2"
                          >
                            Cancel
                          </Button>
                        </motion.div>
                      )}
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 border-l-2 border-white/10 pl-4 space-y-3">
                          {comment.replies.map((reply, replyIndex) => (
                            <motion.div
                              key={reply.id}
                              className="flex items-start space-x-2"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (index * 0.1) + (replyIndex * 0.05) }}
                            >
                              <ImageWithFallback
                                src={reply.authorAvatar}
                                alt={reply.author}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="text-white font-medium text-xs">{reply.author}</h5>
                                  <span className="text-white/40 text-xs">{reply.timeAgo}</span>
                                </div>
                                <p className="text-white/70 text-xs leading-relaxed mb-1">
                                  {reply.content}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <button
                                    className={`flex items-center space-x-1 text-xs hover:text-white ${
                                      reply.isLiked ? 'text-red-400' : 'text-white/60'
                                    }`}
                                    onClick={() => onLikeComment(reply.id)}
                                  >
                                    <Heart className={`w-2 h-2 ${reply.isLiked ? 'fill-current' : ''}`} />
                                    <span>{reply.likes}</span>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {comments.length === 0 && (
                <motion.div
                  className="text-center py-12 text-white/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-4xl mb-4">💬</div>
                  <p>No comments yet</p>
                  <p className="text-sm mt-2">Be the first to share your thoughts!</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleSubmitComment)}
                  className="flex-1 glass border-white/20 text-white placeholder-white/60 rounded-full"
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:text-white"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50 rounded-full px-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
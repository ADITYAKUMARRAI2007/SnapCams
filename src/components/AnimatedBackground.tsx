import React from 'react';
import { motion } from 'motion/react';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'auth' | 'profile' | 'feed' | 'camera' | 'map' | 'chat' | 'settings' | 'friends' | 'stories';
}

export function AnimatedBackground({ variant = 'default' }: AnimatedBackgroundProps) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Main animated background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
          `
        }}
        animate={{
          background: [
            `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
            `,
            `
              radial-gradient(circle at 80% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 60% 60%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
            `,
            `
              radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 60% 60%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
            `,
            `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
            `
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Animated orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full opacity-20"
          style={{
            width: 200 + i * 100,
            height: 200 + i * 100,
            background: `radial-gradient(circle, rgba(${120 + i * 50}, ${119 + i * 30}, ${198 + i * 20}, 0.1) 0%, transparent 70%)`,
            left: `${20 + i * 30}%`,
            top: `${20 + i * 20}%`,
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2
          }}
        />
      ))}

      {/* Gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(45deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%),
            linear-gradient(-45deg, transparent 0%, rgba(0, 0, 0, 0.05) 50%, transparent 100%)
          `
        }}
      />

      {/* Subtle noise texture */}
      <motion.div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        animate={{
          opacity: [0.02, 0.05, 0.02],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}






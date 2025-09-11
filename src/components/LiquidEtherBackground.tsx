import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface LiquidEtherBackgroundProps {
  variant?: 'feed' | 'map' | 'profile' | 'chat' | 'camera' | 'settings' | 'friends' | 'stories' | 'auth';
  className?: string;
}

export function LiquidEtherBackground({ variant = 'feed', className = '' }: LiquidEtherBackgroundProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'feed':
        return {
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            radial-gradient(circle at 60% 80%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '400% 400%, 300% 300%, 500% 500%, 350% 350%, 100% 100%'
        };
      case 'map':
        return {
          background: `
            radial-gradient(circle at 25% 75%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '450% 450%, 350% 350%, 400% 400%, 300% 300%, 100% 100%'
        };
      case 'profile':
        return {
          background: `
            radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '380% 380%, 420% 420%, 350% 350%, 400% 400%, 100% 100%'
        };
      case 'chat':
        return {
          background: `
            radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 45% 55%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '420% 420%, 380% 380%, 450% 450%, 320% 320%, 100% 100%'
        };
      case 'camera':
        return {
          background: `
            radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '360% 360%, 400% 400%, 380% 380%, 340% 340%, 100% 100%'
        };
      case 'settings':
        return {
          background: `
            radial-gradient(circle at 35% 65%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 65% 35%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            radial-gradient(circle at 90% 90%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '390% 390%, 360% 360%, 410% 410%, 350% 350%, 100% 100%'
        };
      case 'friends':
        return {
          background: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            radial-gradient(circle at 10% 50%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '400% 400%, 370% 370%, 390% 390%, 360% 360%, 100% 100%'
        };
      case 'stories':
        return {
          background: `
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '350% 350%, 410% 410%, 380% 380%, 400% 400%, 100% 100%'
        };
      case 'auth':
        return {
          background: `
            radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '400% 400%, 350% 350%, 450% 450%, 300% 300%, 100% 100%'
        };
      default:
        return {
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.01) 0%, transparent 50%),
            linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #000000 100%)
          `,
          backgroundSize: '400% 400%, 300% 300%, 500% 500%, 100% 100%'
        };
    }
  };

  const styles = getVariantStyles();

  // Add CSS animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes liquidEther {
        0%, 100% {
          background-position: 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 0%;
          filter: brightness(1) contrast(1);
        }
        15% {
          background-position: 20% 80%, 30% 20%, 60% 40%, 90% 10%, 0% 0%;
          filter: brightness(1.1) contrast(1.1);
        }
        25% {
          background-position: 25% 75%, 50% 25%, 75% 50%, 100% 0%, 0% 0%;
          filter: brightness(1.2) contrast(1.2);
        }
        40% {
          background-position: 80% 20%, 70% 80%, 30% 70%, 10% 90%, 0% 0%;
          filter: brightness(1.1) contrast(1.1);
        }
        50% {
          background-position: 100% 100%, 100% 75%, 50% 100%, 0% 100%, 0% 0%;
          filter: brightness(1.3) contrast(1.3);
        }
        65% {
          background-position: 60% 40%, 40% 60%, 80% 30%, 20% 70%, 0% 0%;
          filter: brightness(1.1) contrast(1.1);
        }
        75% {
          background-position: 75% 25%, 50% 75%, 25% 50%, 50% 50%, 0% 0%;
          filter: brightness(1.2) contrast(1.2);
        }
        90% {
          background-position: 30% 70%, 70% 30%, 40% 80%, 80% 20%, 0% 0%;
          filter: brightness(1.05) contrast(1.05);
        }
      }
      
      @keyframes liquidEtherSlow {
        0%, 100% {
          background-position: 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 0%;
          opacity: 0.6;
        }
        20% {
          background-position: 20% 80%, 80% 20%, 40% 60%, 60% 40%, 0% 0%;
          opacity: 0.7;
        }
        33% {
          background-position: 30% 70%, 70% 30%, 50% 80%, 80% 20%, 0% 0%;
          opacity: 0.8;
        }
        50% {
          background-position: 60% 40%, 40% 60%, 70% 30%, 30% 70%, 0% 0%;
          opacity: 0.7;
        }
        66% {
          background-position: 70% 30%, 30% 70%, 80% 50%, 20% 80%, 0% 0%;
          opacity: 0.6;
        }
        80% {
          background-position: 40% 60%, 60% 40%, 20% 80%, 80% 20%, 0% 0%;
          opacity: 0.7;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Add electric pulse keyframes
  useEffect(() => {
    const electricStyle = document.createElement('style');
    electricStyle.textContent = `
      @keyframes electricPulse {
        0%, 100% {
          background-position: 0% 0%, 100% 100%;
          transform: scale(1);
          opacity: 0.3;
        }
        25% {
          background-position: 100% 0%, 0% 100%;
          transform: scale(1.02);
          opacity: 0.5;
        }
        50% {
          background-position: 100% 100%, 0% 0%;
          transform: scale(1.01);
          opacity: 0.4;
        }
        75% {
          background-position: 0% 100%, 100% 0%;
          transform: scale(1.03);
          opacity: 0.6;
        }
      }
    `;
    document.head.appendChild(electricStyle);
    return () => {
      if (document.head.contains(electricStyle)) {
        document.head.removeChild(electricStyle);
      }
    };
  }, []);

  return (
    <>
      {/* Main liquid ether background */}
      <motion.div
        className={`absolute inset-0 opacity-90 ${className}`}
        style={{
          ...styles,
          animation: 'liquidEther 25s ease-in-out infinite',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 2 }}
      />
      
      {/* Secondary slower moving layer for depth */}
      <motion.div
        className={`absolute inset-0 opacity-60 ${className}`}
        style={{
          background: `
            radial-gradient(circle at 60% 40%, rgba(139, 92, 246, 0.2) 0%, transparent 70%),
            radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)
          `,
          backgroundSize: '200% 200%, 150% 150%',
          animation: 'liquidEtherSlow 35s ease-in-out infinite reverse',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 3, delay: 0.5 }}
      />
      
      {/* Electric lightning layer for artistic vibe */}
      <motion.div
        className={`absolute inset-0 opacity-30 ${className}`}
        style={{
          background: `
            linear-gradient(45deg, transparent 48%, rgba(59, 130, 246, 0.1) 49%, rgba(59, 130, 246, 0.2) 50%, rgba(59, 130, 246, 0.1) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(139, 92, 246, 0.1) 49%, rgba(139, 92, 246, 0.2) 50%, rgba(139, 92, 246, 0.1) 51%, transparent 52%)
          `,
          backgroundSize: '100px 100px, 150px 150px',
          animation: 'electricPulse 8s ease-in-out infinite',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 4, delay: 1 }}
      />
      
      {/* Overlay for contrast */}
      <div className={`absolute inset-0 bg-black/20 ${className}`} />
    </>
  );
}
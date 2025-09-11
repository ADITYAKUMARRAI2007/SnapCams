import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import apiService from '../services/apiService';
import websocketService from '../services/websocketService';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking'); // 'connected', 'disconnected', 'checking', 'error'
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking');
        
        // Test API connection
        const apiResult = await apiService.testConnection();
        
        // Test WebSocket connection
        const wsStatus = websocketService.getStatus();
        
        if (apiResult.success && wsStatus === 'connected') {
          setStatus('connected');
          setLastUpdate(new Date());
        } else if (apiResult.success) {
          setStatus('partial'); // API works but WebSocket doesn't
          setLastUpdate(new Date());
        } else {
          setStatus('disconnected');
        }
      } catch (error) {
        console.error('Connection check failed:', error);
        setStatus('error');
      }
    };

    // Initial check
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Live';
      case 'partial':
        return 'Limited';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'partial':
        return 'text-yellow-400';
      case 'disconnected':
        return 'text-red-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-40 bg-black/50 backdrop-blur-md rounded-full px-3 py-2 flex items-center space-x-2">
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {lastUpdate && status === 'connected' && (
        <span className="text-xs text-white/60">
          {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;




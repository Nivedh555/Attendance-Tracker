import React, { useEffect, useState, useRef, useCallback } from 'react';
import './NotificationToast.css';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  icon?: string;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type,
  duration = 4000,
  onClose,
  icon
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    const exitTimer = setTimeout(() => {
      onClose();
    }, 300);
    timersRef.current.push(exitTimer);
  }, [onClose]);

  useEffect(() => {
    // Trigger entrance animation
    const entranceTimer = setTimeout(() => setIsVisible(true), 100);
    timersRef.current.push(entranceTimer);

    // Auto close after duration
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);
    timersRef.current.push(autoCloseTimer);

    return clearAllTimers;
  }, [duration, handleClose, clearAllTimers]);

  const getDefaultIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div className={`notification-toast toast-${type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}>
      <div className="toast-content">
        <span className="toast-icon">{icon || getDefaultIcon()}</span>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={handleClose}>
          ×
        </button>
      </div>
      <div className="toast-progress">
        <div className="progress-bar" style={{ animationDuration: `${duration}ms` }}></div>
      </div>
    </div>
  );
};

export default NotificationToast;

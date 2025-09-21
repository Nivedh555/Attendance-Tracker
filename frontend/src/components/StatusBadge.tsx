import React from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: 'check-in' | 'check-out' | 'present' | 'absent' | 'late';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  animated = false
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'check-in': return '🟢';
      case 'check-out': return '🔴';
      case 'present': return '✅';
      case 'absent': return '❌';
      case 'late': return '⚠️';
      default: return '⭕';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'check-in': return 'Checked In';
      case 'check-out': return 'Checked Out';
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      default: return 'Unknown';
    }
  };

  return (
    <span className={`status-badge status-${status} status-${size} ${animated ? 'animated' : ''}`}>
      <span className="status-icon">{getStatusIcon()}</span>
      <span className="status-text">{getStatusText()}</span>
    </span>
  );
};

export default StatusBadge;

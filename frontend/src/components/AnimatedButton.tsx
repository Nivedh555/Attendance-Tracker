import React from 'react';
import './AnimatedButton.css';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon
}) => {
  return (
    <button
      className={`animated-btn animated-btn-${variant} animated-btn-${size} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <span className="btn-content">
        {icon && <span className="btn-icon">{icon}</span>}
        <span className="btn-text">{children}</span>
      </span>
      {loading && <div className="btn-spinner"></div>}
      <div className="btn-ripple"></div>
    </button>
  );
};

export default AnimatedButton;

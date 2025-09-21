import React from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  userRole?: string;
  userName?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, userRole, userName }) => {
  return (
    <div className="hero-section">
      <div className="hero-background">
        <div className="hero-pattern"></div>
        <div className="hero-gradient"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            {title}
            <span className="hero-sparkle">✨</span>
          </h1>
          <p className="hero-subtitle">{subtitle}</p>
          {userName && (
            <div className="hero-welcome">
              Welcome back, <span className="hero-name">{userName}</span>
              {userRole && <span className="hero-role">({userRole})</span>}
            </div>
          )}
        </div>
        
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="stat-icon">🎯</div>
            <div className="stat-text">Smart Tracking</div>
          </div>
          <div className="hero-stat">
            <div className="stat-icon">📍</div>
            <div className="stat-text">Geofenced</div>
          </div>
          <div className="hero-stat">
            <div className="stat-icon">⚡</div>
            <div className="stat-text">Real-time</div>
          </div>
        </div>
      </div>
      
      <div className="hero-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default HeroSection;

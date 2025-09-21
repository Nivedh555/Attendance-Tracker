import React from 'react';
import './FloatingElements.css';

const FloatingElements: React.FC = () => {
  return (
    <div className="floating-elements">
      <div className="floating-shape shape-1">
        <div className="shape-inner">📍</div>
      </div>
      <div className="floating-shape shape-2">
        <div className="shape-inner">⏰</div>
      </div>
      <div className="floating-shape shape-3">
        <div className="shape-inner">👥</div>
      </div>
      <div className="floating-shape shape-4">
        <div className="shape-inner">📊</div>
      </div>
      <div className="floating-shape shape-5">
        <div className="shape-inner">🎯</div>
      </div>
      <div className="floating-shape shape-6">
        <div className="shape-inner">✅</div>
      </div>
    </div>
  );
};

export default FloatingElements;

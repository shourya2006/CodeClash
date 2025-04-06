import React, { useEffect } from 'react';
import '../css/Alert.css';

const Alert = ({ type, message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch(type) {
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'info':
        return <i className="fas fa-info-circle"></i>;
      case 'error':
      default:
        return <i className="fas fa-exclamation-circle"></i>;
    }
  };

  return (
    <div className={`alert-container ${type}`}>
      <div className="alert-content">
        <div className="alert-icon">
          {getIcon()}
        </div>
        <div className="alert-message">{message}</div>
        <button className="alert-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Alert; 
import React, { useState, useEffect } from 'react';

const ErrorAlert = ({ 
  message, 
  type = 'error', 
  duration = 5000, 
  onClose,
  showIcon = true,
  dismissible = true 
}) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration && duration > 0) {
      const interval = 100; // Update every 100ms
      const steps = duration / interval;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setProgress(100 - (currentStep / steps) * 100);

        if (currentStep >= steps) {
          handleClose();
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  // Alert type configurations
  const alertTypes = {
    error: {
      icon: '❌',
      bgColor: '#f8d7da',
      borderColor: '#f5c6cb',
      textColor: '#721c24',
      title: 'Error!'
    },
    success: {
      icon: '✅',
      bgColor: '#d4edda',
      borderColor: '#c3e6cb',
      textColor: '#155724',
      title: 'Success!'
    },
    warning: {
      icon: '⚠️',
      bgColor: '#fff3cd',
      borderColor: '#ffeeba',
      textColor: '#856404',
      title: 'Warning!'
    },
    info: {
      icon: 'ℹ️',
      bgColor: '#d1ecf1',
      borderColor: '#bee5eb',
      textColor: '#0c5460',
      title: 'Info!'
    }
  };

  const config = alertTypes[type] || alertTypes.error;

  return (
    <div
      className="alert-container"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '350px',
        maxWidth: '450px',
        animation: 'slideIn 0.3s ease'
      }}
    >
      <div
        className="alert"
        style={{
          backgroundColor: config.bgColor,
          borderLeft: `4px solid ${config.borderColor}`,
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Progress Bar */}
        {duration > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              width: `${progress}%`,
              backgroundColor: config.textColor,
              opacity: 0.3,
              transition: 'width 0.1s linear'
            }}
          />
        )}

        <div className="d-flex align-items-start">
          {/* Icon */}
          {showIcon && (
            <div
              style={{
                fontSize: '1.5rem',
                marginRight: '12px',
                lineHeight: 1
              }}
            >
              {config.icon}
            </div>
          )}

          {/* Content */}
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <h6
                style={{
                  color: config.textColor,
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }}
              >
                {config.title}
              </h6>

              {/* Close Button */}
              {dismissible && (
                <button
                  onClick={handleClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: config.textColor,
                    padding: '0 4px',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 1}
                  onMouseLeave={(e) => e.target.style.opacity = 0.7}
                >
                  ×
                </button>
              )}
            </div>

            {/* Message */}
            <p
              style={{
                color: config.textColor,
                marginBottom: 0,
                fontSize: '0.95rem',
                wordBreak: 'break-word'
              }}
            >
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Context for global error handling
export const ErrorContext = React.createContext();

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const showError = (message, type = 'error', duration = 5000) => {
    const id = Date.now();
    setErrors(prev => [...prev, { id, message, type, duration }]);
  };

  const removeError = (id) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {errors.map(error => (
        <ErrorAlert
          key={error.id}
          message={error.message}
          type={error.type}
          duration={error.duration}
          onClose={() => removeError(error.id)}
        />
      ))}
    </ErrorContext.Provider>
  );
};

// Custom hook for using errors
export const useError = () => {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};

// Inline Error component for forms
export const InlineError = ({ message, show = true }) => {
  if (!show || !message) return null;

  return (
    <div
      style={{
        color: '#dc3545',
        fontSize: '0.85rem',
        marginTop: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <span style={{ fontSize: '1rem' }}>⚠️</span>
      <span>{message}</span>
    </div>
  );
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export default ErrorAlert;
import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#66b032', 
  text = 'Loading...',
  fullScreen = false 
}) => {
  
  // Size configurations
  const sizes = {
    small: {
      spinner: '1.5rem',
      text: '0.875rem',
      border: '2px'
    },
    medium: {
      spinner: '3rem',
      text: '1rem',
      border: '3px'
    },
    large: {
      spinner: '5rem',
      text: '1.25rem',
      border: '4px'
    }
  };

  const selectedSize = sizes[size] || sizes.medium;

  const spinnerStyle = {
    width: selectedSize.spinner,
    height: selectedSize.spinner,
    border: `${selectedSize.border} solid rgba(102, 176, 50, 0.1)`,
    borderTop: `${selectedSize.border} solid ${color}`,
    borderRight: `${selectedSize.border} solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyle}>
        <div className="text-center">
          {/* Spinner */}
          <div style={spinnerStyle} className="mx-auto mb-3"></div>
          
          {/* Loading Text */}
          {text && (
            <p style={{ 
              color: '#6c757d', 
              fontSize: selectedSize.text,
              marginBottom: '0.5rem'
            }}>
              {text}
            </p>
          )}
          
          {/* Dots Animation */}
          <div className="d-flex justify-content-center gap-1">
            <div style={dotStyle(0.3)}></div>
            <div style={dotStyle(0.5)}></div>
            <div style={dotStyle(0.7)}></div>
          </div>
        </div>
      </div>
    </>
  );
};

// Dots animation style
const dotStyle = (delay) => ({
  width: '8px',
  height: '8px',
  backgroundColor: '#66b032',
  borderRadius: '50%',
  animation: `bounce 0.6s infinite ${delay}s`
});

// Variants with different designs
export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = [];

  for (let i = 0; i < count; i++) {
    if (type === 'card') {
      skeletons.push(
        <div key={i} className="card border-0 shadow-sm p-3 mb-3">
          <div className="d-flex">
            <div className="me-3">
              <div style={skeletonStyle(60, 60, 'circle')}></div>
            </div>
            <div className="flex-grow-1">
              <div style={skeletonStyle('100%', 20)} className="mb-2"></div>
              <div style={skeletonStyle('80%', 15)} className="mb-2"></div>
              <div style={skeletonStyle('60%', 15)}></div>
            </div>
          </div>
        </div>
      );
    } else if (type === 'table') {
      skeletons.push(
        <div key={i} className="mb-3">
          <div style={skeletonStyle('100%', 40)} className="mb-2"></div>
          <div style={skeletonStyle('100%', 30)} className="mb-2"></div>
          <div style={skeletonStyle('100%', 30)} className="mb-2"></div>
        </div>
      );
    } else if (type === 'profile') {
      skeletons.push(
        <div key={i} className="text-center">
          <div style={skeletonStyle(100, 100, 'circle')} className="mx-auto mb-3"></div>
          <div style={skeletonStyle(200, 20)} className="mx-auto mb-2"></div>
          <div style={skeletonStyle(150, 15)} className="mx-auto"></div>
        </div>
      );
    }
  }

  return <div>{skeletons}</div>;
};

// Skeleton style helper
const skeletonStyle = (width, height, shape = 'rectangle') => ({
  width: width,
  height: height,
  backgroundColor: '#e0e0e0',
  borderRadius: shape === 'circle' ? '50%' : '4px',
  animation: 'pulse 1.5s infinite',
  marginBottom: '0.5rem'
});

// Add pulse animation style
const pulseStyle = `
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

// Inject styles
const style = document.createElement('style');
style.textContent = pulseStyle;
document.head.appendChild(style);

export default LoadingSpinner;
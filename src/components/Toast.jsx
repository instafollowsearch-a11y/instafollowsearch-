import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: '#f0fdf4',
          borderColor: '#22c55e',
          textColor: '#166534',
          iconBg: '#dcfce7',
          iconColor: '#16a34a',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'error':
        return {
          bgColor: '#fef2f2',
          borderColor: '#ef4444',
          textColor: '#991b1b',
          iconBg: '#fecaca',
          iconColor: '#dc2626',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'warning':
        return {
          bgColor: '#fefce8',
          borderColor: '#eab308',
          textColor: '#92400e',
          iconBg: '#fef3c7',
          iconColor: '#d97706',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'info':
        return {
          bgColor: '#eff6ff',
          borderColor: '#3b82f6',
          textColor: '#1e40af',
          iconBg: '#dbeafe',
          iconColor: '#2563eb',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          bgColor: '#f9fafb',
          borderColor: '#6b7280',
          textColor: '#374151',
          iconBg: '#f3f4f6',
          iconColor: '#6b7280',
          icon: null
        };
    }
  };

  const config = getToastConfig();

  const toastStyle = {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100%)',
    zIndex: 9999,
    minWidth: '300px',
    maxWidth: '400px',
    width: 'auto',
    minHeight: '60px',
    backgroundColor: config.bgColor,
    border: `1px solid ${config.borderColor}`,
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    opacity: isVisible ? 1 : 0,
    transition: 'all 0.3s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxSizing: 'border-box',
  };

  const iconStyle = {
    flexShrink: 0,
    width: '32px',
    height: '32px',
    backgroundColor: config.iconBg,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: config.iconColor,
  };

  const textStyle = {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.4',
    color: config.textColor,
    margin: 0,
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    minWidth: 0,
  };

  const closeButtonStyle = {
    flexShrink: 0,
    width: '24px',
    height: '24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={toastStyle}>
      {config.icon && (
        <div style={iconStyle}>
          {config.icon}
        </div>
      )}
      <p style={textStyle}>
        {message}
      </p>
      <button
        onClick={handleClose}
        style={closeButtonStyle}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f3f4f6';
          e.target.style.color = '#6b7280';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#9ca3af';
        }}
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
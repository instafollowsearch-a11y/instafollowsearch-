import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration = 5000) => addToast(message, 'success', duration);
  const showError = (message, duration = 5000) => addToast(message, 'error', duration);
  const showWarning = (message, duration = 5000) => addToast(message, 'warning', duration);
  const showInfo = (message, duration = 5000) => addToast(message, 'info', duration);

  return (
    <ToastContext.Provider value={{
      addToast,
      removeToast,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      {/* Render toasts */}
      <div style={{ 
        position: 'fixed', 
        bottom: '24px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 9999, 
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        maxWidth: 'calc(100vw - 32px)',
        width: '100%',
      }}>
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            style={{ 
              pointerEvents: 'auto',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

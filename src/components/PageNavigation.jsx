import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PageNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();


  // Don't show navigation on homepage
  if (location.pathname === '/') {
    return null;
  }

  const handleGoBack = () => {
    console.log('Back button clicked');
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoHome = () => {
    console.log('Home button clicked');
    navigate('/');
  };

  // Check if page has navbar (SharedActivity has Header)
  const hasNavbar = location.pathname === '/sharedactivity';

  return (
    <div className={`fixed right-4 z-[60] ${hasNavbar ? 'top-20' : 'top-4'}`} data-component="PageNavigation">
      <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl p-3 shadow-lg relative">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleGoBack}
            className="flex items-center px-3 py-2 bg-white/10 text-white/80 text-sm font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            title="Go Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            title="Go Home"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNavigation;
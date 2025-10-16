import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const SubscriptionUpgradePrompt = ({ isOpen, feature, onClose, upgradeButtonText = "Upgrade Now", onUpgrade, included }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
      if (onClose) onClose();
    }
  };

  if (!isOpen) return null;

  const defaultIncluded = [
    'Recent followers',
    'Recent following',
    'Red flag detection',
    'Story Viewer',
    'Shared Activity',
    'Admirers',
    'View Instagram Profile',
    'Download posts'
  ];

  const overlay = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Premium Feature
          </h3>
          <p className="text-white/70 mb-6 leading-relaxed">
            {feature || 'This feature is available for premium subscribers only. Upgrade your plan to access this functionality.'}
          </p>

          {/* Key benefits */}
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center text-white/80">
              <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Unlimited searches</span>
            </div>
            <div className="flex items-center text-white/80">
              <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Advanced analytics</span>
            </div>
          </div>

          {/* Included in Premium */}
          <div className="mb-8">
            <div className="text-white/70 text-sm mb-2">Everything in Premium:</div>
            <div className="flex flex-wrap gap-2">
              {(included || defaultIncluded).map((item, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/15">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-200"
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              {upgradeButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render via portal to avoid ancestors with transforms affecting fixed positioning
  return createPortal(overlay, document.body);
};

export default SubscriptionUpgradePrompt;

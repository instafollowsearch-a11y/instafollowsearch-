import React, { useState } from 'react';
import apiService from '../services/api.js';
import { useToast } from '../contexts/ToastContext';

const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [redeemingDiscount, setRedeemingDiscount] = useState(false);
  const { showSuccess, showError } = useToast();

  // Debug logging
  console.log('CancelSubscriptionModal - isOpen:', isOpen);
  console.log('CancelSubscriptionModal - redeemingDiscount:', redeemingDiscount);

  if (!isOpen) return null;

  const handleRedeemDiscount = async () => {
    try {
      setRedeemingDiscount(true);
      
      const response = await apiService.applyDiscount();
      const data = response.data || response;
      
      if (data.success) {
        showSuccess('Discount coupon redeemed! You\'ll get 50% off your next payment cycle.');
        onClose();
      } else {
        showError(data.message || 'Failed to redeem discount. Please try again.');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      showError('Failed to redeem discount. Please try again.');
    } finally {
      setRedeemingDiscount(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full animate-fade-in">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Cancel Subscription?
          </h3>
          <p className="text-white/70 mb-6 leading-relaxed">
            Are you sure you want to cancel your subscription? You'll lose access to all premium features and will be moved to the free plan.
          </p>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className="text-red-400 font-semibold text-sm mb-1">Important:</p>
                <p className="text-red-300 text-sm">
                  This action cannot be undone. You'll need to subscribe again to regain access to premium features.
                </p>
              </div>
            </div>
          </div>

          {/* Discount Offer - Always Visible */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 mb-6" style={{ display: 'block' }}>
            {console.log('Rendering discount offer section')}
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.856.416L9.5 15.134l-2.611 1.538a1 1 0 01-1.856-.416L3.854 12.8 1.5 10.866a1 1 0 010-1.732L3.854 7.2l1.179-4.456A1 1 0 016.89 2.328L9.5 3.866 12.11 2.328A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-green-400 font-bold text-xl mb-2">🎉 Special Offer!</h4>
              <p className="text-green-300 text-sm mb-4">
                Before you go, we'd like to offer you a <span className="font-bold text-green-200">50% discount</span> on your next payment cycle to keep you with us!
              </p>
              <button
                onClick={handleRedeemDiscount}
                disabled={redeemingDiscount}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {redeemingDiscount ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Redeeming...
                  </div>
                ) : (
                  'Redeem Discount'
                )}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keep Subscription
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cancelling...
                </div>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionModal;

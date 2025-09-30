import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api.js';
import Header from '../components/Header';
import PageNavigation from '../components/PageNavigation';
import CancelSubscriptionModal from '../components/CancelSubscriptionModal';

const UserProfile = () => {
  const navigate = useNavigate();
  const { subscription, loading: subscriptionLoading, cancelSubscription, fetchSubscription, logout } = useSubscription();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Debug logging
  console.log('UserProfile - subscription:', subscription);
  console.log('UserProfile - subscriptionLoading:', subscriptionLoading);
  console.log('UserProfile - user:', user);


  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/');
      return;
    }
    fetchUserData();
  }, [navigate]);

  // Listen for auth state changes to refetch data when user logs back in
  useEffect(() => {
    const handleAuthStateChange = () => {
      if (apiService.isAuthenticated()) {
        fetchUserData();
        // Subscription will be refetched automatically by SubscriptionContext
      }
    };

    document.addEventListener('authStateChanged', handleAuthStateChange);
    
    return () => {
      document.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // First try to get user data from JWT token
      const token = localStorage.getItem('authToken');
      let userFromToken = null;
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userFromToken = {
            name: payload.name || payload.fullName || payload.firstName || payload.displayName || 'User',
            email: payload.email || 'user@example.com',
            createdAt: payload.createdAt || new Date().toISOString(),
            lastLoginAt: payload.lastLoginAt || new Date().toISOString()
          };
          console.log('User data from token:', userFromToken);
        } catch (tokenErr) {
          console.warn('Failed to decode token:', tokenErr);
        }
      }
      
      // Try to fetch user profile from API endpoint
      try {
        const userResponse = await apiService.getUserProfile();
        console.log('User profile API response:', userResponse);
        
        // Map the API response data correctly
        const userData = {
          name: userResponse.data?.username || userResponse.username || 'User',
          email: userResponse.data?.email || userResponse.email || 'user@example.com',
          createdAt: userResponse.data?.created_at || userResponse.created_at || new Date().toISOString(),
          lastLoginAt: userResponse.data?.lastLogin || userResponse.lastLogin || new Date().toISOString()
        };
        
        console.log('Mapped user data:', userData);
        setUser(userData);
      } catch (userErr) {
        console.warn('Failed to fetch user profile:', userErr);
        // Use token data if available, otherwise fallback
        setUser(userFromToken || {
          name: 'User',
          email: 'user@example.com',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      // Set fallback data even if everything fails
      setUser({
        name: 'User',
        email: 'user@example.com',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(true);
  };

  const confirmCancelSubscription = async () => {
    try {
      setCancelling(true);
      const success = await cancelSubscription();
      if (success) {
        setShowCancelModal(false);
        showSuccess('Subscription cancelled successfully');
      } else {
        showError('Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showError('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'inactive':
        return 'text-red-400 bg-red-400/20';
      case 'cancelled':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
        return 'from-purple-500 to-pink-500';
      case 'pro':
        return 'from-blue-500 to-cyan-500';
      case 'basic':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/80">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 max-w-md">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
                <p className="text-red-300">{error}</p>
                <button
                  onClick={fetchUserData}
                  className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-slate-900 ${getStatusColor(subscription?.active ? 'active' : 'inactive')} flex items-center justify-center`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.name || 'User'}
              </h1>
              <p className="text-white/70 text-lg mb-4">
                {user?.email || 'user@example.com'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription?.active ? 'active' : 'inactive')}`}>
                  {subscription?.active ? 'Active' : 'Inactive'}
                </span>
                {subscription?.name ? (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getPlanColor(subscription.name)} text-white`}>
                    {subscription.name.split(' ')[0]}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-300">
                    No Plan
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        {subscription && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Subscription Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Subscription Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Plan:</span>
                  {subscription?.name ? (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getPlanColor(subscription.name)} text-white`}>
                      {subscription.name.split(' ')[0]}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-500/20 text-gray-300">
                      No Plan
                    </span>
                  )}
                </div>
                {subscription?.name && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Product:</span>
                    <span className="text-white text-sm">{subscription.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription?.active ? 'active' : 'inactive')}`}>
                    {subscription?.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Start Date:</span>
                  <span className="text-white">{subscription?.start_date ? new Date(subscription.start_date * 1000).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Current Period End:</span>
                  <span className="text-white">{subscription?.items?.data?.[0]?.current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Billing Cycle:</span>
                  <span className="text-white">{subscription?.plan?.interval_count ? `${subscription.plan.interval_count} ${subscription.plan.interval}(s)` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Amount:</span>
                  <span className="text-white">${subscription?.plan?.amount ? (subscription.plan.amount / 100).toFixed(2) : 'N/A'} {subscription?.plan?.currency?.toUpperCase() || ''}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/70">Member Since:</span>
                    <span className="text-white">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/70">Searches:</span>
                    <span className="text-white font-semibold">Unlimited</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Last Activity:</span>
                    <span className="text-white">{new Date(user?.lastLoginAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Premium Features
              </h3>
              {subscription?.description ? (
                <div className="space-y-3">
                  {subscription.description.split(',').map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white/80">{feature.trim().replace(/'/g, '').replace(/:/g, '')}</span>
                    </div>
                  ))}
                </div>
              ) : subscription?.active ? (
                <div className="space-y-3">
                  {['Recent following', 'Recent followers', 'Red flag accounts', 'Story Viewer', 'Shared activity', 'Admirer feature: coming soon ✨'].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-white/40 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <p className="text-white/60">No features available</p>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Actions */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-xl font-semibold text-white mb-4">Account Actions</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {!subscription?.active && (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold"
              >
                Upgrade Plan
              </button>
            )}
            {subscription?.active && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 px-6 py-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
            <button
              onClick={() => {
                try {
                  // Remove auth token and clear subscription context
                  apiService.removeToken();
                  logout();
                  // Notify listeners and navigate home
                  document.dispatchEvent(new CustomEvent('authStateChanged'));
                  navigate('/');
                } finally {
                  // Ensure UI fully resets like header logout
                  setTimeout(() => window.location.reload(), 50);
                }
              }}
              className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelSubscription}
        loading={cancelling}
      />
    </div>
  );
};

export default UserProfile;

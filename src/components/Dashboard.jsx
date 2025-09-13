import React, { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api.js';
import Header from './Header';
import PageNavigation from './PageNavigation';
import SubscriptionUpgradePrompt from './SubscriptionUpgradePrompt';

const Dashboard = () => {
  console.log('Dashboard component rendered');
  const { subscription, isActive, loading: subscriptionLoading, getPlanName, getPlanTier, upgradeSubscription } = useSubscription();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // Debug logging
  console.log('Dashboard - subscription:', subscription);
  console.log('Dashboard - isActive():', isActive());
  console.log('Dashboard - subscriptionLoading:', subscriptionLoading);

  // Plans data (same as pricing page)
  const testPriceIds = {
    basic: 'price_1S5rhNAseffRTW6hXg7koHU2',
    premium: 'price_1S5rhwAseffRTW6hxOU8TEGD',
    pro: 'price_1S5rj7AseffRTW6hH285ofSW'
  }

  const livePriceIds = {
    basic: 'price_1S0PJVAseffRTW6hDZI18DZG',
    premium: 'price_1S0PKXAseffRTW6hy3qVkkgm',
    pro: 'price_1S5rY5AseffRTW6hc302fdww'
  }

  const plans = [
    {
      name: 'Basic',
      description: 'Essential features for personal use',
      priceId: livePriceIds.basic,
      price: {
        weekly: 5,
        monthly: 20
      },
      features: [
        'Recent following',
        'Recent followers',
        'Red flag accounts'
      ],
      popular: false,
      buttonText: 'Start Basic',
      buttonStyle: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
      stripeId: livePriceIds.basic
    },
    {
      name: 'Premium',
      description: 'Advanced features for power users',
      priceId: livePriceIds.premium,
      price: {
        weekly: 12,
        monthly: 48
      },
      features: [
        'Recent following',
        'Recent followers',
        'Red flag accounts',
        'Story Viewer',
        'Shared activity',
        'Admirer feature: coming soon💥'
      ],
      popular: true,
      buttonText: 'Start Premium',
      buttonStyle: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600',
      stripeId: livePriceIds.premium
    },
    {
      name: 'Pro',
      description: 'Professional features for businesses',
      priceId: livePriceIds.pro,
      price: {
        weekly: 50,
        monthly: 200
      },
      features: [
        'Everything in Premium',
        'Priority support',
        'Advanced analytics'
      ],
      popular: false,
      buttonText: 'Coming Soon',
      buttonStyle: 'bg-gray-500/20 text-gray-400 cursor-not-allowed',
      stripeId: livePriceIds.pro,
      disabled: true
    }
  ]

  const getButtonState = (plan) => {
    const currentPlan = getPlanName().toLowerCase();
    const currentTier = getPlanTier();
    const planTier = plan.name.toLowerCase() === 'basic' ? 1 : plan.name.toLowerCase() === 'premium' ? 2 : 3;
    
    // Check if plan is disabled
    if (plan.disabled) {
      return {
        text: plan.buttonText || 'Coming Soon',
        disabled: true,
        style: plan.buttonStyle || 'bg-gray-500/20 text-gray-400 cursor-not-allowed',
        action: null
      };
    }
    
    if (!isActive()) {
      return {
        text: `Start ${plan.name}`,
        disabled: false,
        style: plan.buttonStyle,
        action: () => handleUpgrade(plan.priceId)
      };
    }
    
    if (currentPlan === plan.name.toLowerCase()) {
      return {
        text: 'Current Plan',
        disabled: true,
        style: 'bg-gray-500/20 text-gray-400 cursor-not-allowed',
        action: null
      };
    }
    
    if (planTier > currentTier) {
      return {
        text: 'Upgrade',
        disabled: false,
        style: 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white',
        action: () => handleUpgrade(plan.priceId)
      };
    }
    
    if (planTier < currentTier) {
      return {
        text: 'Downgrade',
        disabled: false,
        style: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white',
        action: () => handleUpgrade(plan.priceId)
      };
    }
    
    return {
      text: `Start ${plan.name}`,
      disabled: false,
      style: plan.buttonStyle,
      action: () => handleUpgrade(plan.priceId)
    };
  };

  useEffect(() => {
    console.log('Dashboard component mounted');
    setLoading(false);
  }, []);

  const handleUpgrade = async (priceId) => {
    try {
      setUpgrading(true);
      
      if (isActive()) {
        // User has active subscription, use upgrade API
        await upgradeSubscription(priceId);
        showSuccess('Subscription updated successfully!');
      } else {
        // User doesn't have subscription, create new payment session
        const response = await apiService.createPaymentSession(priceId);
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Payment/Upgrade error:', error);
      showError('Failed to process request. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 max-w-md">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
            <p className="text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to Your
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-xl text-white/70">
            Manage your subscription and track your usage
          </p>
        </div>

        {/* Premium Features */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-white mb-6">Premium Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => (getPlanTier() >= 2) ? window.location.href = '/dashboard/search' : setShowUpgradePrompt(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 text-center"
            >
              <svg className="w-8 h-8 mb-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
              <p className="text-white/80 text-sm">
                {(getPlanTier() >= 2) ? 'Full search with comparison & analysis' : 'Premium feature - Upgrade to access'}
              </p>
              {(getPlanTier() < 2) && (
                <div className="mt-2 text-xs text-yellow-300 font-semibold">
                  🔒 Premium Feature
                </div>
              )}
            </button>
            
            <button
              onClick={() => (getPlanTier() >= 2) ? window.location.href = '/sharedactivity' : setShowUpgradePrompt(true)}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 text-center"
            >
              <svg className="w-8 h-8 mb-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Shared Activity</h3>
              <p className="text-white/80 text-sm">
                {(getPlanTier() >= 2) ? 'View shared activity between users' : 'Premium feature - Upgrade to access'}
              </p>
              {(getPlanTier() < 2) && (
                <div className="mt-2 text-xs text-yellow-300 font-semibold">
                  🔒 Premium Feature
                </div>
              )}
            </button>

            {/* Admirer Feature - Coming Soon */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-6 rounded-xl text-center opacity-75 cursor-not-allowed">
              <svg className="w-8 h-8 mb-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Admirer Feature</h3>
              <p className="text-white/80 text-sm mb-2">
                Find users who interact most with any profile
              </p>
              <div className="mt-2 text-xs text-yellow-300 font-semibold">
                ⏳ Coming Soon
              </div>
                  </div>
                  
            {/* View Instagram Profile - Coming Soon */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl text-center opacity-75 cursor-not-allowed">
              <svg className="w-8 h-8 mb-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">View Instagram Profile</h3>
              <p className="text-white/80 text-sm mb-2">
                View profiles even if you're blocked
              </p>
              <div className="mt-2 text-xs text-yellow-300 font-semibold">
                ⏳ Coming Soon
              </div>
            </div>
                  </div>
                  </div>
                  
        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => {
            const buttonState = getButtonState(plan);
            return (
              <div
                key={plan.name}
                className={`relative bg-white/5 backdrop-blur-md rounded-2xl border p-6 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.popular
                    ? 'border-purple-500/50 ring-2 ring-purple-500/20'
                    : 'border-white/10'
                } animate-slide-in-left`}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                      </span>
                    </div>
                  )}

                {/* Plan header */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/70 text-sm mb-3">{plan.description}</p>
                  <div className="text-3xl font-bold text-white mb-1">
                    ${plan.price.weekly}
                    <span className="text-sm text-white/60">/week</span>
                  </div>
                </div>
                
                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-white/80 text-sm">
                      <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                      {feature}
                  </li>
                  ))}
                </ul>
                
                {/* Button */}
                <button
                  onClick={buttonState.action}
                  disabled={buttonState.disabled || upgrading}
                  className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-200 text-center ${buttonState.style} ${
                    upgrading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {upgrading ? 'Processing...' : buttonState.text}
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* Upgrade Prompt Modal */}
      <SubscriptionUpgradePrompt
        isOpen={showUpgradePrompt}
        feature="Advanced search features are available for premium subscribers. Upgrade your plan to access full search capabilities with comparison and analysis tools."
        onClose={() => setShowUpgradePrompt(false)}
        upgradeButtonText="Upgrade from Plans"
        onUpgrade={() => setShowUpgradePrompt(false)}
      />
    </div>
  );
};

export default Dashboard; 
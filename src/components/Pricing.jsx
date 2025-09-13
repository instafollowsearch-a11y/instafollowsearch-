import React, { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api.js';
import { useScrollAnimation } from '../hooks/useScrollAnimation.js';

const Pricing = () => {
  const [billingCycle] = useState('weekly')
  const [headerRef, isHeaderVisible] = useScrollAnimation();
  const { subscription, isActive, getPlanName, getPlanTier, upgradeSubscription } = useSubscription();
  const { showSuccess, showError } = useToast();
  const [upgrading, setUpgrading] = useState(false);

  // Debug logging
  console.log('Pricing component - subscription:', subscription);
  console.log('Pricing component - isActive:', isActive());
  console.log('Pricing component - getPlanName:', getPlanName());
  console.log('Pricing component - getPlanTier:', getPlanTier());

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
        action: () => handleUpgrade(plan.stripeId)
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
        action: () => handleUpgrade(plan.stripeId)
      };
    }
    
    if (planTier < currentTier) {
      return {
        text: 'Downgrade',
        disabled: false,
        style: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white',
        action: () => handleUpgrade(plan.stripeId)
      };
    }
    
    return {
      text: `Start ${plan.name}`,
      disabled: false,
      style: plan.buttonStyle,
      action: () => handleUpgrade(plan.stripeId)
    };
  };

  const PricingCard = ({ plan, index }) => {
    const [cardRef, isCardVisible] = useScrollAnimation();
    const buttonState = getButtonState(plan);
    
    return (
      <div
        ref={cardRef}
        className={`relative bg-white/5 backdrop-blur-md rounded-2xl border p-8 hover:border-white/20 transition-all duration-700 hover:transform hover:scale-105 ${
          plan.popular
            ? 'border-purple-500/50 ring-2 ring-purple-500/20'
            : 'border-white/10'
        } ${isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        {/* Popular badge */}
        {plan.popular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>
        )}

        {/* Plan header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-white/70 mb-4">{plan.description}</p>
          <div className="text-4xl font-bold text-white mb-2">
            ${plan.price[billingCycle]}
            <span className="text-lg text-white/60">/{billingCycle === 'weekly' ? 'week' : 'month'}</span>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-center text-white/80">
              <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${buttonState.style} ${
            upgrading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {upgrading ? 'Processing...' : buttonState.text}
        </button>
      </div>
    );
  };

  const livePriceIds = {
    basic: 'price_1S0PJVAseffRTW6hDZI18DZG',
    premium: 'price_1S0PKXAseffRTW6hy3qVkkgm',
    pro: 'price_1S5rY5AseffRTW6hc302fdww'
  }

  const testPriceIds = {
    basic: 'price_1S5rhNAseffRTW6hXg7koHU2',
    premium: 'price_1S5rhwAseffRTW6hxOU8TEGD',
    pro: 'price_1S5rj7AseffRTW6hH285ofSW'
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

  const handleUpgrade = async (stripeId) => {
    try {
      setUpgrading(true);
      
      if (isActive()) {
        // User has active subscription, use upgrade API
        await upgradeSubscription(stripeId);
        showSuccess('Subscription updated successfully!');
      } else {
        // User doesn't have subscription, create new payment session
        const response = await apiService.createPaymentSession(stripeId);
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Payment/Upgrade error:', error);
      showError('Failed to process request. Please try again.');
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Pricing Plan
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            Start free or choose a plan that fits your needs. 
            Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {/* <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly Billing
            </button> */}
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                billingCycle === 'weekly' 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Weekly Billing
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
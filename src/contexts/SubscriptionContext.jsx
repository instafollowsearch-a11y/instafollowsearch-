import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api.js';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchSubscription = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      console.log('Subscription fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      if (!apiService.isAuthenticated()) {
        setSubscription(null);
        return;
      }

      const response = await apiService.getSubscription();
      console.log('Subscription API response:', response);
      
      // Handle the API response format
      if (response && response.subscription) {
        setSubscription(response.subscription);
      } else if (response && response.active !== undefined) {
        setSubscription(response);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError(err.message);
      setSubscription(null);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      await apiService.cancelSubscription();
      await fetchSubscription(); // Refresh subscription data
      return true;
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const upgradeSubscription = async (newPriceId) => {
    try {
      setLoading(true);
      const response = await apiService.upgradeSubscription(newPriceId);
      await fetchSubscription(); // Refresh subscription data
      return response;
    } catch (err) {
      console.error('Failed to upgrade subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isActive = () => {
    return subscription && subscription.active === true;
  };

  const getPlanName = () => {
    if (!subscription) return 'Free';
    // Extract plan name from the name field (e.g., "Premium Plan - 1 week" -> "Premium")
    if (subscription.name) {
      const planMatch = subscription.name.match(/^(\w+)\s+Plan/);
      return planMatch ? planMatch[1] : 'Free';
    }
    return subscription.plan || 'Free';
  };

  const getPlanTier = () => {
    if (!subscription) return 0;
    const planName = getPlanName().toLowerCase();
    if (planName === 'basic') return 1;
    if (planName === 'premium') return 2;
    if (planName === 'pro') return 3;
    return 0;
  };

  const logout = () => {
    setSubscription(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // Listen for auth state changes to refetch subscription
  useEffect(() => {
    const handleAuthStateChange = () => {
      console.log('Auth state changed event received, isAuthenticated:', apiService.isAuthenticated());
      if (apiService.isAuthenticated()) {
        // Small delay to ensure token is properly set
        setTimeout(() => {
          console.log('Refetching subscription after auth state change...');
          fetchSubscription();
        }, 100);
      } else {
        console.log('User logged out, clearing subscription data');
        logout();
      }
    };

    document.addEventListener('authStateChanged', handleAuthStateChange);
    
    return () => {
      document.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  const value = {
    subscription,
    loading,
    error,
    isActive,
    getPlanName,
    getPlanTier,
    fetchSubscription,
    cancelSubscription,
    upgradeSubscription,
    logout,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

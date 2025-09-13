import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageNavigation from '../components/PageNavigation';
import apiService from '../services/api.js';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      handlePaymentSuccess(sessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);
  
  const handlePaymentSuccess = async (sessionId) => {
    try {
      setLoading(true);
      const response = await apiService.verifyPayment(sessionId);
      
      if (response.success) {
        setSubscription(response.subscription);
      } else {
        setError(response.message || 'Payment verification failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while verifying payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <PageNavigation />
          <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/80">Processing your payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <PageNavigation />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <PageNavigation />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-8 max-w-md">
              <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-white/70 mb-6">
                Thank you for your payment. Your subscription has been activated.
              </p>
              
              {subscription && (
                <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-lg font-semibold text-white mb-3">Subscription Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="capitalize">{subscription.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Searches:</span>
                      <span>{subscription.searchesLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Link
                  to="/dashboard"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/"
                  className="block w-full px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  Start Searching
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
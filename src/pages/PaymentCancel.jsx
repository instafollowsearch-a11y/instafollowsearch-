import React from 'react';
import { Link } from 'react-router-dom';
import PageNavigation from '../components/PageNavigation';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <PageNavigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-8 max-w-md">
              <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h2>
              <p className="text-white/70 mb-6">
                Your payment was cancelled. No charges were made to your account.
              </p>
              
              <div className="space-y-3">
                <Link
                  to="/dashboard"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold"
                >
                  Try Again
                </Link>
                <Link
                  to="/"
                  className="block w-full px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
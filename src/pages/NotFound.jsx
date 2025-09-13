import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 max-w-md border border-white/10">
          <div className="text-6xl font-bold text-white mb-4">404</div>
          <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
          <p className="text-white/70 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold"
            >
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="block w-full px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 
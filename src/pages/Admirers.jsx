import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation.js';
import apiService, { API_BASE_URL } from '../services/api.js';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import PageNavigation from '../components/PageNavigation';
import AuthModal from '../components/AuthModal.jsx';
import SubscriptionUpgradePrompt from '../components/SubscriptionUpgradePrompt';
import SEO from '../components/SEO.jsx';

const Admirers = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [admirers, setAdmirers] = useState([]);
  const [error, setError] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const { getPlanTier } = useSubscription();
  const { showError } = useToast();
  const [headerRef, isHeaderVisible] = useScrollAnimation();

  // Backend proxy function (same as ViewProfile)
  const proxy = useCallback((url) => {
    if (!url) return '';
    return `${API_BASE_URL}/instagram/proxy-image?url=${encodeURIComponent(url)}`;
  }, []);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    const cleanUsername = username.trim().replace(/^@+/, '');
    setIsLoading(true);
    setError('');
    setAdmirers([]);

    try {
      const response = await apiService.getAdmirers(cleanUsername);
      console.log('API Response:', response); // Debug log
      
      // Use the API data directly - it already has the correct format
      if (response.data && response.data.admirers) {
        setAdmirers(response.data.admirers);
      } else {
        setAdmirers([]);
      }
      
      // const mockAdmirers = [
      //   {
      //     id: 1,
      //     username: 'saqlain.abid',
      //     profilePicture: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=SA',
      //     likePercentage: 92,
      //     rank: 1
      //   },
      //   {
      //     id: 2,
      //     username: 'eddiejutt1',
      //     profilePicture: 'https://via.placeholder.com/40x40/EC4899/FFFFFF?text=EJ',
      //     likePercentage: 83,
      //     rank: 2
      //   },
      //   {
      //     id: 3,
      //     username: 'jafrizahida',
      //     profilePicture: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=JZ',
      //     likePercentage: 83,
      //     rank: 3
      //   },
      //   {
      //     id: 4,
      //     username: '_beingzayn_',
      //     profilePicture: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=BZ',
      //     likePercentage: 58,
      //     rank: 4
      //   },
      //   {
      //     id: 5,
      //     username: 'umairbalouch555',
      //     profilePicture: 'https://via.placeholder.com/40x40/EF4444/FFFFFF?text=UB',
      //     likePercentage: 58,
      //     rank: 5
      //   },
      //   {
      //     id: 6,
      //     username: 'qasim_466',
      //     profilePicture: 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=Q4',
      //     likePercentage: 50,
      //     rank: 6
      //   },
      //   {
      //     id: 7,
      //     username: 'nainrajpooot',
      //     profilePicture: 'https://via.placeholder.com/40x40/06B6D4/FFFFFF?text=NR',
      //     likePercentage: 42,
      //     rank: 7
      //   }
      // ];
      
      // setAdmirers(mockAdmirers);
    } catch (err) {
      setError(err.message || 'Failed to fetch admirers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    document.dispatchEvent(new CustomEvent('authStateChanged'));
  };

  const handleViewProfile = (admirerUsername) => {
    // Open Instagram profile in new tab
    window.open(`https://instagram.com/${admirerUsername}`, '_blank');
  };

  // Virtual scrolling constants
  const ITEM_HEIGHT = 88; // Height of each admirer item in pixels
  const OVERSCAN = 5; // Number of items to render outside visible area

  // Calculate visible range for virtual scrolling
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      admirers.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, admirers.length]);

  // Get visible items for rendering
  const visibleAdmirers = useMemo(() => {
    return admirers.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [admirers, visibleRange]);

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Set container height on mount
  useEffect(() => {
    const updateHeight = () => {
      setContainerHeight(window.innerHeight - 400); // Adjust based on your layout
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <SEO 
        title="Instagram Admirers - Find Who Likes Your Posts Most | InstaFollowCheck"
        description="Discover your biggest Instagram admirers! Find out who likes your posts most often with our advanced analytics tool. Get detailed insights into your most engaged followers."
        keywords="instagram admirers, instagram likes, instagram analytics, social media insights, follower engagement, instagram tools"
        url="https://instafollowcheck.com/admirers"
      />
      <Header />
      <PageNavigation />
      
      <div className="container mx-auto px-4 py-8 mt-10">
        {/* Header Section */}
        <div ref={headerRef} className={`text-center mb-12 transition-all duration-700 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white mr-4">
              Account Admirers
            </h1>
            <span className="text-4xl">💕</span>
          </div>
          
          {/* Subscription prompt temporarily disabled for testing */}
          {/* {!isActive() && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-8 max-w-md mx-auto">
              <p className="text-yellow-300 font-semibold">
                Exclusive Access for Subscribers
              </p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="text-blue-400 underline hover:text-blue-300 mt-2"
              >
                Subscribe Now
              </button>
            </div>
          )} */}

          <div className="space-y-4 text-white/80 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">👀</span>
              <p className="text-lg">Do you have any admirers?</p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">💕</span>
              <p className="text-lg">Check who likes their posts most often</p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🕵️</span>
              <p className="text-lg">Reveal The Truth</p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">😲</span>
              <p className="text-lg">You may be shocked!</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Instagram username"
                className="flex-1 px-6 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Checking...
                  </div>
                ) : (
                  'Check →'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {admirers?.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              {username}'s Top 100 Admirers:
            </h2>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
              {/* Check if user has premium access */}
              {(() => {
                const isPremium = getPlanTier() >= 2;
                const displayCount = isPremium ? admirers.length : 2;
                const remainingCount = isPremium ? 0 : admirers.length - displayCount;
                
                return (
                  <>
                    {/* Premium users see all with virtual scrolling */}
                    {isPremium ? (
                      <div 
                        className="overflow-auto"
                        style={{ height: `${Math.min(containerHeight, admirers.length * ITEM_HEIGHT)}px` }}
                        onScroll={handleScroll}
                      >
                        {/* Total height spacer */}
                        <div style={{ height: `${admirers.length * ITEM_HEIGHT}px`, position: 'relative' }}>
                          {/* Visible items */}
                          <div 
                            style={{ 
                              position: 'absolute', 
                              top: `${visibleRange.startIndex * ITEM_HEIGHT}px`,
                              width: '100%'
                            }}
                          >
                            {visibleAdmirers.map((admirer, index) => {
                              const actualIndex = visibleRange.startIndex + index;
                              return (
                                <div 
                                  key={admirer.id || `${admirer.username}-${actualIndex}`}
                                  className={`flex items-center justify-between p-6 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors ${
                                    actualIndex % 2 === 0 ? 'bg-white/2' : 'bg-transparent'
                                  }`}
                                  style={{ height: `${ITEM_HEIGHT}px` }}
                                >
                                  <div className="flex items-center space-x-4">
                                    {/* Rank */}
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      {admirer.rank || actualIndex + 1}
                                    </div>
                                    
                                    {/* Profile Picture */}
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                                      <img 
                                        src={proxy(admirer.profilePicUrl)}
                                        alt={admirer.username}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                          // Fallback to placeholder if proxy fails
                                          e.target.src = `https://via.placeholder.com/48x48/4F46E5/FFFFFF?text=${admirer.username.charAt(0).toUpperCase()}`;
                                        }}
                                      />
                                    </div>
                                    
                                    {/* Username and Stats */}
                                    <div>
                                      <h3 className="text-white font-semibold text-lg">
                                        {admirer.username}
                                      </h3>
                                      <p className="text-white/70 text-sm">
                                        Liked {admirer.likePercentage}% of their posts.
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* View Button */}
                                  <button
                                    onClick={() => handleViewProfile(admirer.username)}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                                  >
                                    View →
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Free users see first 2 visible, third one blurred, rest hidden */
                      <div className="space-y-0">
                        {admirers.slice(0, 3).map((admirer, idx) => {
                          if (idx < 2) {
                            // First 2 admirers - visible
                            return (
                              <div 
                                key={admirer.id || `${admirer.username}-${idx}`}
                                className={`flex items-center justify-between p-6 border-b border-white/10 hover:bg-white/5 transition-colors ${
                                  idx % 2 === 0 ? 'bg-white/2' : 'bg-transparent'
                                }`}
                              >
                                <div className="flex items-center space-x-4">
                                  {/* Rank */}
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {admirer.rank || idx + 1}
                                  </div>
                                  
                                  {/* Profile Picture */}
                                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                                    <img 
                                      src={proxy(admirer.profilePicUrl)}
                                      alt={admirer.username}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.target.src = `https://via.placeholder.com/48x48/4F46E5/FFFFFF?text=${admirer.username.charAt(0).toUpperCase()}`;
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Username and Stats */}
                                  <div>
                                    <h3 className="text-white font-semibold text-lg">
                                      {admirer.username}
                                    </h3>
                                    <p className="text-white/70 text-sm">
                                      Liked {admirer.likePercentage}% of their posts.
                                    </p>
                                  </div>
                                </div>
                                
                                {/* View Button */}
                                <button
                                  onClick={() => handleViewProfile(admirer.username)}
                                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                                >
                                  View →
                                </button>
                              </div>
                            );
                          } else {
                            // Third admirer - blurred with locked icon
                            return (
                              <div 
                                key={admirer.id || `${admirer.username}-${idx}`}
                                onClick={() => setShowUpgradePrompt(true)}
                                className="flex items-center justify-between p-6 border-b border-purple-500/20 relative overflow-hidden bg-gradient-to-r from-purple-500/10 to-pink-500/10 cursor-pointer hover:opacity-90 transition-all"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-xl"></div>
                                <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-lg"></div>
                                <div className="absolute inset-0 flex items-center justify-center z-20 px-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <p className="text-white text-lg font-semibold">Premium Feature</p>
                                  </div>
                                </div>
                                <div className="relative z-10 opacity-60 flex items-center space-x-4 flex-1">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm blur-sm">
                                    {admirer.rank || idx + 1}
                                  </div>
                                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 blur-sm">
                                    <img 
                                      src={proxy(admirer.profilePicUrl)}
                                      alt={admirer.username}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = `https://via.placeholder.com/48x48/4F46E5/FFFFFF?text=${admirer.username.charAt(0).toUpperCase()}`;
                                      }}
                                    />
                                  </div>
                                  <div className="blur-sm">
                                    <h3 className="text-white font-semibold text-lg">
                                      {admirer.username}
                                    </h3>
                                    <p className="text-white/70 text-sm">
                                      Liked {admirer.likePercentage}% of their posts.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })}
                        
                        {/* Upgrade prompt for remaining admirers */}
                        {remainingCount > 0 && (
                          <button
                            onClick={() => setShowUpgradePrompt(true)}
                            className="w-full py-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-t border-purple-500/30 text-center hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200"
                          >
                            <div className="flex items-center justify-center gap-3">
                              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-purple-400 font-semibold text-lg">
                                +{remainingCount} more admirers available - Upgrade to Premium
                              </span>
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />

        {/* Subscription Upgrade Prompt */}
        <SubscriptionUpgradePrompt
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          feature="Admirer Feature"
          description="Access advanced Instagram admirers analytics to discover who interacts with any profile the most"
        />
      </div>
    </div>
  );
};

export default Admirers;

import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api.js';
import StoriesViewer from './StoriesViewer.jsx';
import { downloadStory, downloadAllStories } from '../utils/downloadUtils';

const DashboardSearch = () => {
  const { showSuccess, showError } = useToast();
  const [username, setUsername] = useState('');
  const [searchType, setSearchType] = useState('both');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [searchComparison, setSearchComparison] = useState(null);
  const [isFirstSearch, setIsFirstSearch] = useState(false);
  const [isStoriesViewerOpen, setIsStoriesViewerOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!apiService.isAuthenticated()) {
      setError('Please log in to access advanced search');
      return;
    }
    
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await apiService.getSubscription();
      setSubscription(data);
    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    // Check authentication
    if (!apiService.isAuthenticated()) {
      setError('Please log in to use advanced search');
      return;
    }

    // Check subscription
    if (!subscription || !subscription.hasSubscription) {
      setError('You need an active subscription to use advanced search. Please choose a plan first.');
      return;
    }

    // Убираем @ из начала username если он есть
    const cleanUsername = username.trim().replace(/^@+/, '');

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.advancedSearch(cleanUsername, searchType);
      const data = response.data || response;
      setResults(data);
      
      // Set comparison data from response
      setSearchComparison(data.comparison);
      setIsFirstSearch(data.isFirstSearch);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStory = async (story) => {
    try {
      setIsDownloading(true);
      await downloadStory(story, results.user.username);
    } catch (error) {
      console.error('Download failed:', error);
      showError('Failed to download story');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAllStories = async () => {
    try {
      setIsDownloading(true);
      const results = await downloadAllStories(results.stories, results.user.username);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        showSuccess(`Successfully downloaded ${successCount} out of ${results.stories.length} stories`);
      } else {
        showError('Failed to download any stories');
      }
    } catch (error) {
      console.error('Batch download failed:', error);
      showError('Failed to download stories');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderUserCard = (user, type = 'user') => {
    const getInitials = (name) => {
      return name ? name.charAt(0).toUpperCase() : '?';
    };

    const getRandomColor = (username) => {
      const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
      ];
      const index = username.length % colors.length;
      return colors[index];
    };

    const profilePicUrl = user.profilePicUrl || user.profile_pic_url;

    return (
      <div key={user.username} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200">
        <div className="flex items-center space-x-3">
          {profilePicUrl ? (
            <img
              src={`https://images.weserv.nl/?url=${encodeURIComponent(profilePicUrl)}`}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div className={`w-12 h-12 rounded-full ${getRandomColor(user.username)} flex items-center justify-center text-white font-bold text-lg ${profilePicUrl ? 'hidden' : ''}`}>
            {getInitials(user.full_name || user.fullName || user.username)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold truncate">@{user.username}</h4>
            {(user.full_name || user.fullName) && (
              <p className="text-white/60 text-sm truncate">{user.full_name || user.fullName}</p>
            )}
            <div className="flex items-center space-x-4 mt-1">
              {(user.is_private || user.isPrivate) && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                  Private
                </span>
              )}
              {(user.is_verified || user.isVerified) && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRedFlags = (userData) => {
    if (!userData.redFlags || userData.redFlags.length === 0) {
      return (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-400 font-semibold">No red flags detected</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <h4 className="text-red-400 font-semibold mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Red Flags Detected ({userData.redFlags.length})
        </h4>
        <div className="space-y-3">
          {userData.redFlags.map((flag, index) => {
            const getSeverityColor = (severity) => {
              switch (severity) {
                case 'high': return 'text-red-400';
                case 'medium': return 'text-orange-400';
                case 'low': return 'text-yellow-400';
                case 'positive': return 'text-green-400';
                default: return 'text-red-300';
              }
            };

            const getSeverityIcon = (severity) => {
              switch (severity) {
                case 'high': return (
                  <svg className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                );
                case 'medium': return (
                  <svg className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                );
                case 'low': return (
                  <svg className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                );
                case 'positive': return (
                  <svg className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                );
                default: return (
                  <svg className="w-4 h-4 text-red-300 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                );
              }
            };

            return (
              <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-start">
                  {getSeverityIcon(flag.severity)}
                  <div className="flex-1">
                    <div className={`font-medium ${getSeverityColor(flag.severity)}`}>
                      {flag.message}
                    </div>
                    {flag.details && (
                      <div className="text-white/60 text-sm mt-1">
                        {flag.details}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStories = (stories) => {
    if (!stories || stories.length === 0) {
      return (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-white/40 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-white/60">No stories available</p>
        </div>
      );
    }

    return (
      <div>
        {/* Download All Stories Button */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-white">Stories ({stories.length})</h4>
          <button
            onClick={handleDownloadAllStories}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span>Download All</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stories.map((story, index) => (
            <div 
              key={story.id || index} 
              className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              {story.mediaUrl ? (
                <div className="relative">
                  <img 
                    src={`https://images.weserv.nl/?url=${encodeURIComponent(story.mediaUrl)}`} 
                    alt={`Story ${index + 1}`}
                    className="w-full h-32 object-cover cursor-pointer"
                    onClick={() => setIsStoriesViewerOpen(true)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  {story.mediaType === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.447.894l2-2a1 1 0 000-1.788l-2-2z" />
                      </svg>
                    </div>
                  )}
                  {story.hasAudio && (
                    <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.794a1 1 0 011.383.87zM12.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center cursor-pointer" onClick={() => setIsStoriesViewerOpen(true)}>
                  <svg className="w-8 h-8 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-sm truncate">
                    Story {index + 1}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadStory(story);
                    }}
                    disabled={isDownloading}
                    className="p-1 bg-green-500/80 hover:bg-green-500 rounded text-white text-xs transition-colors disabled:opacity-50"
                    title="Download story"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-xs capitalize">
                    {story.mediaType || 'Unknown type'}
                  </p>
                  {story.duration && (
                    <p className="text-white/40 text-xs">
                      {story.duration.toFixed(1)}s
                    </p>
                  )}
                </div>
                {story.takenAt && (
                  <p className="text-white/40 text-xs mt-1">
                    {new Date(story.takenAt * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Advanced
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Instagram Search
            </span>
          </h1>
          <p className="text-xl text-white/70">
            Search, compare, and analyze Instagram activity with full features
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Instagram Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Instagram username"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Search Type
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="both">Followers & Following</option>
                <option value="followers">Followers Only</option>
                <option value="following">Following Only</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading || !username.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>

          {/* Search Info */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-white/80 text-sm">
                Advanced search automatically tracks changes between searches
              </p>
            </div>
            
            {subscription && (
              <div className="text-right">
                <p className="text-white/60 text-sm">
                  Searches remaining: {subscription.remainingSearches}
                </p>
                <p className="text-white/40 text-xs">
                  Plan: {subscription.plan}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* User Info */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://images.weserv.nl/?url=${encodeURIComponent(results.user.profilePicUrl || results.user.profile_pic_url)}`}
                    alt={results.user.username}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white font-bold text-xl hidden">
                    {(results.user.fullName || results.user.full_name || results.user.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">@{results.user.username}</h2>
                    <p className="text-white/60">
                      {results.user.followerCount || results.user.follower_count} followers • {results.user.followingCount || results.user.following_count} following
                    </p>
                    {(results.user.fullName || results.user.full_name) && (
                      <p className="text-white/80">{results.user.fullName || results.user.full_name}</p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{results.processingTime || 0}ms</div>
                  <div className="text-white/60 text-sm">Processing Time</div>
                </div>
              </div>

              {/* Red Flags - Premium Only */}
              {results.redFlags && (
                subscription?.plan === 'premium' ? (
                  renderRedFlags(results)
                ) : (
                  <div className="mt-6">
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Red Flag Analysis
                          </h4>
                          <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-medium">
                            Premium Feature
                          </span>
                        </div>
                        
                        <div className="bg-white/10 rounded-lg p-4 mb-4">
                          <p className="text-white/80 text-sm mb-3">
                            🔍 Advanced red flag detection is available with Premium subscription
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                            >
                              View Premium Plans
                            </button>
                            <button
                              onClick={() => window.location.href = '/dashboard'}
                              className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                            >
                              Upgrade Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Stories - Premium Only */}
            {results.stories && (
              subscription?.plan === 'premium' ? (
                renderStories(results.stories)
              ) : (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white flex items-center">
                        <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        Stories Viewer
                      </h4>
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-medium">
                        Premium Feature
                      </span>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-4 mb-4">
                      <p className="text-white/80 text-sm mb-3">
                        📸 View Instagram stories without being detected - Premium feature only
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                        >
                          View Premium Plans
                        </button>
                        <button
                          onClick={() => window.location.href = '/dashboard'}
                          className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                        >
                          Upgrade Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Comparison Results */}
            {searchComparison && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Changes Since Last Search
                  {isFirstSearch && (
                    <span className="text-blue-400 text-sm font-normal ml-2">
                      (First search - data will be recorded for future comparisons)
                    </span>
                  )}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {searchComparison.newFollowers && searchComparison.newFollowers.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <h4 className="text-green-400 font-semibold mb-2">
                        +{searchComparison.newFollowers.length} New Followers
                      </h4>
                      <div className="space-y-2">
                        {searchComparison.newFollowers.slice(0, 5).map(user => renderUserCard(user, 'follower'))}
                        {searchComparison.newFollowers.length > 5 && (
                          <p className="text-green-300 text-sm">
                            +{searchComparison.newFollowers.length - 5} more...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {searchComparison.removedFollowers && searchComparison.removedFollowers.length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                      <h4 className="text-orange-400 font-semibold mb-2">
                        -{searchComparison.removedFollowers.length} Unfollowed
                      </h4>
                      <div className="space-y-2">
                        {searchComparison.removedFollowers.slice(0, 5).map(user => renderUserCard(user, 'follower'))}
                        {searchComparison.removedFollowers.length > 5 && (
                          <p className="text-orange-300 text-sm">
                            +{searchComparison.removedFollowers.length - 5} more...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {searchComparison.newFollowing && searchComparison.newFollowing.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <h4 className="text-blue-400 font-semibold mb-2">
                        +{searchComparison.newFollowing.length} New Following
                      </h4>
                      <div className="space-y-2">
                        {searchComparison.newFollowing.slice(0, 5).map(user => renderUserCard(user, 'following'))}
                        {searchComparison.newFollowing.length > 5 && (
                          <p className="text-blue-300 text-sm">
                            +{searchComparison.newFollowing.length - 5} more...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {searchComparison.removedFollowing && searchComparison.removedFollowing.length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                      <h4 className="text-orange-400 font-semibold mb-2">
                        -{searchComparison.removedFollowing.length} Unfollowed
                      </h4>
                      <div className="space-y-2">
                        {searchComparison.removedFollowing.slice(0, 5).map(user => renderUserCard(user, 'following'))}
                        {searchComparison.removedFollowing.length > 5 && (
                          <p className="text-orange-300 text-sm">
                            +{searchComparison.removedFollowing.length - 5} more...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* New Followers */}
              {results.newFollowers && results.newFollowers.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    New Followers ({results.newFollowers.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {results.newFollowers.map(user => renderUserCard(user, 'follower'))}
                  </div>
                </div>
              )}

              {/* New Following */}
              {results.newFollowing && results.newFollowing.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    New Following ({results.newFollowing.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {results.newFollowing.map(user => renderUserCard(user, 'following'))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Info */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{results.processingTime || 0}ms</div>
                  <div className="text-white/60 text-sm">Processing Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {results.totalNewFollowers || 0}
                  </div>
                  <div className="text-white/60 text-sm">Total New Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {results.totalNewFollowing || 0}
                  </div>
                  <div className="text-white/60 text-sm">Total New Following</div>
                </div>
              </div>
              {results.lastUpdated && (
                <div className="text-center mt-4">
                  <p className="text-white/60 text-sm">
                    Last updated: {new Date(results.lastUpdated).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stories Viewer Modal */}
        <StoriesViewer
          stories={results?.stories}
          isOpen={isStoriesViewerOpen}
          onClose={() => setIsStoriesViewerOpen(false)}
          username={username}
        />
      </div>
    </div>
  );
};

export default DashboardSearch; 
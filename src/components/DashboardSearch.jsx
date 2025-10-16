import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api.js';
import StoriesViewer from './StoriesViewer.jsx';
import { downloadStory, downloadAllStories } from '../utils/downloadUtils';
import Header from './Header';
import PageNavigation from './PageNavigation';
import SubscriptionUpgradePrompt from './SubscriptionUpgradePrompt';

const DashboardSearch = () => {
  const navigate = useNavigate();
  const { isActive, getPlanTier, loading: subscriptionLoading } = useSubscription();
  const { showSuccess, showError, showInfo } = useToast();
  const [username, setUsername] = useState('');
  const [searchType, setSearchType] = useState('both');
  const [loading, setLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  // const [subscription, setSubscription] = useState(null);
  const [isStoriesViewerOpen, setIsStoriesViewerOpen] = useState(false);
  const [storiesStartIndex, setStoriesStartIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [isLoadingMoreFollowers, setIsLoadingMoreFollowers] = useState(false);
  const [isLoadingMoreFollowing, setIsLoadingMoreFollowing] = useState(false);
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [followersNextPageId, setFollowersNextPageId] = useState(null);
  const [followingNextPageId, setFollowingNextPageId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showAllRedFlags, setShowAllRedFlags] = useState(false);

  // Debug useEffect to monitor nextPageId changes
  useEffect(() => {
    console.log('followersNextPageId changed:', followersNextPageId);
  }, [followersNextPageId]);

  useEffect(() => {
    console.log('followingNextPageId changed:', followingNextPageId);
  }, [followingNextPageId]);

  const subscription = {
    hasSubscription: true,
    subscriptionType: 'pro',
    searchesUsed: 100,
    searchesLimit: 100,
    remainingSearches: 100,
    plan: 'premium',
  };

  useEffect(() => {
    // Allow page to load for all users; gating happens on actions
    setIsCheckingAuth(false);
  }, []);

  // Transform story data from API response to component format
  const transformStoryData = (stories) => {
    if (!stories || !Array.isArray(stories)) return [];
    
    return stories.map((story) => {
      const transformedStory = {
        id: story.pk || story.id,
        takenAt: story.taken_at,
        duration: story.video_duration,
        hasAudio: story.has_audio,
        mediaType: story.media_type === 1 ? 'image' : story.media_type === 2 ? 'video' : 'unknown',
        mediaUrl: null
      };

      // Extract media URL based on type
      if (story.media_type === 1) {
        // Image story - get from image_versions2.candidates
        if (story.image_versions2 && story.image_versions2.candidates && story.image_versions2.candidates.length > 0) {
          // Get the highest quality image (usually the first one)
          transformedStory.mediaUrl = story.image_versions2.candidates[0].url;
        }
      } else if (story.media_type === 2) {
        // Video story - get from video_versions
        if (story.video_versions && story.video_versions.length > 0) {
          // Get the highest quality video (usually the first one)
          transformedStory.mediaUrl = story.video_versions[0].url;
        }
      }

      return transformedStory;
    });
  };

  const handleReset = () => {
    setUsername('');
    setSearchType('both');
    setResults(null);
    setError(null);
    setFollowers([]);
    setFollowing([]);
    setShowAllRedFlags(false);
    setFollowersNextPageId(null);
    setFollowingNextPageId(null);
    setUserId(null);
    setFollowersPage(1);
    setFollowingPage(1);
  };

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    // Require Premium for using advanced search (logged in or not)
    if (getPlanTier() < 2) {
      setShowUpgradePrompt(true);
      return;
    }

    // Убираем @ из начала username если он есть
    const cleanUsername = username.trim().replace(/^@+/, '');

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.advancedSearch(cleanUsername, 'both');
      const data = response.data || response;
      
      // Transform stories data if it exists
      console.log('Full API response:', data);
      
      if (data?.stories && data?.stories?.reel && data?.stories?.reel?.items) {
        console.log('Raw stories data:', data?.stories?.reel?.items);
        data.stories = transformStoryData(data?.stories?.reel?.items);
        console.log('Transformed stories:', data?.stories);
      } else if (data?.reel && data?.reel?.items) {
        console.log('Stories found in data.reel.items:', data?.reel?.items);
        data.stories = transformStoryData(data?.reel?.items);
        console.log('Transformed stories:', data?.stories);
      } else {
        console.log('No stories data found in response. Available keys:', Object.keys(data));
      }
      
      setResults(data);
      
      
      // Extract and store userId for pagination
      if (data.user && data.user.id) {
        setUserId(data.user.id);
        console.log('Extracted userId for pagination:', data.user.id);
      }
      
      // Extract followers and following data from advanced search response
      if (getPlanTier() >= 2 && data) {
        // Extract followers data from the advanced search response
        const followersData = data.followers || data.newFollowers || data.followerList || [];
        setFollowers(Array.isArray(followersData) ? followersData : []);
        // Try multiple possible locations for nextPageId
        const followersNextId = data.followersNextPageId || data.nextFollowersPageId || data.followers?.nextPageId || null;
        setFollowersNextPageId(followersNextId);
        
        // Extract following data from the advanced search response
        const followingData = data.following || data.newFollowing || data.followingList || [];
        setFollowing(Array.isArray(followingData) ? followingData : []);
        const followingNextId = data.followingNextPageId || data.nextFollowingPageId || data.following?.nextPageId || null;
        setFollowingNextPageId(followingNextId);
        
        console.log('Extracted followers:', followersData.length, 'followersNextId:', followersNextId);
        console.log('Extracted following:', followingData.length, 'followingNextId:', followingNextId);
        console.log('Full API response data:', data);
        console.log('Available nextPageId fields:', {
          followersNextPageId: data.followersNextPageId,
          nextFollowersPageId: data.nextFollowersPageId,
          followersNextPageIdNested: data.followers?.nextPageId,
          followingNextPageId: data.followingNextPageId,
          nextFollowingPageId: data.nextFollowingPageId,
          followingNextPageIdNested: data.following?.nextPageId
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      
      // Обработка ошибки 429 (Rate Limit)
      if (err.message && err.message.includes('rate limit exceeded')) {
        setError('API rate limit exceeded. Please try again in a few minutes or upgrade your plan for higher limits.');
      }
      // Обработка ошибки 404 (User not found)
      else if (err.message && err.message.includes('User not found')) {
        setError('User not found. Please check the username and try again.');
      }
      // Обработка ошибок сервера
      else if (err.message && err.message.includes('temporarily unavailable')) {
        setError('Instagram API is temporarily unavailable. Please try again later.');
      }
      // Обработка ошибки 403 (Access denied)
      else if (err.message && err.message.includes('Access denied')) {
        setError('Access denied. The account might be private or restricted.');
      }
      // Общая ошибка
      else {
        setError(err.message || 'Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleLoadMoreFollowers = async () => {
    if (!userId || isLoadingMoreFollowers || !followersNextPageId) return;
    
    try {
      setIsLoadingMoreFollowers(true);
      
      // Call the dedicated next-followers endpoint with userId
      const response = await apiService.getNextFollowers(userId, followersNextPageId);
      const data = response.data || response;
      
      // Append new followers to existing list
      const newFollowers = data.followers || data.newFollowers || data.followerList || [];
      if (Array.isArray(newFollowers) && newFollowers.length > 0) {
        setFollowers(prev => [...prev, ...newFollowers]);
        setFollowersNextPageId(data.nextPageId || data.followersNextPageId || data.nextFollowersPageId || data.followers?.nextPageId || null);
        setFollowersPage(prev => prev + 1);
      }
      
      console.log(`Loaded more followers for userId ${userId}, new count: ${newFollowers.length}, nextPageId: ${data.nextPageId}`);
    } catch (err) {
      console.error('Error loading more followers:', err);
    } finally {
      setIsLoadingMoreFollowers(false);
    }
  };

  const handleLoadMoreFollowing = async () => {
    if (!userId || isLoadingMoreFollowing || !followingNextPageId) return;
    
    try {
      setIsLoadingMoreFollowing(true);
      
      // Call the dedicated next-following endpoint with userId
      const response = await apiService.getNextFollowing(userId, followingNextPageId);
      const data = response.data || response;
      
      // Append new following to existing list
      const newFollowing = data.following || data.newFollowing || data.followingList || [];
      if (Array.isArray(newFollowing) && newFollowing.length > 0) {
        setFollowing(prev => [...prev, ...newFollowing]);
        setFollowingNextPageId(data.nextPageId || data.followingNextPageId || data.nextFollowingPageId || data.following?.nextPageId || null);
        setFollowingPage(prev => prev + 1);
      }
      
      console.log(`Loaded more following for userId ${userId}, new count: ${newFollowing.length}, nextPageId: ${data.nextPageId}`);
    } catch (err) {
      console.error('Error loading more following:', err);
    } finally {
      setIsLoadingMoreFollowing(false);
    }
  };

  const handleDownloadStory = async (story) => {
    try {
      setIsDownloading(true);
      const result = await downloadStory(story, results.user.username);
      
      if (result.method === 'new_tab') {
        showInfo('Image opened in new tab (download not available)');
      } else {
        showSuccess(`Story downloaded successfully! (${result.size} bytes)`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      showError(`Failed to download story: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAllStories = async () => {
    try {
      setIsDownloading(true);
      const downloadResults = await downloadAllStories(results.stories, results.user.username);
      const successCount = downloadResults.filter(r => r.success).length;
      const newTabCount = downloadResults.filter(r => r.method === 'new_tab').length;
      
      if (successCount > 0) {
        let message = `Successfully processed ${successCount} out of ${results.stories.length} stories`;
        if (newTabCount > 0) {
          message += ` (${newTabCount} opened in new tab)`;
        }
        showSuccess(message);
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

  const renderRedFlags = (userData, showAll = false) => {
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

    const redFlags = userData.redFlags || [];
    const displayCount = showAll ? redFlags.length : Math.min(2, redFlags.length);
    const remainingCount = redFlags.length - displayCount;

    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="flex items-center text-red-400 font-semibold">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
            Red Flag Accounts ({redFlags.length})
        </h4>
          {!showAll && remainingCount > 0 && (
            <span className="text-red-300 text-sm">
              +{remainingCount} more
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          {redFlags.slice(0, displayCount).map((flag, index) => (
            <div key={flag.pk || flag.id || index} className="flex items-center gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
              <img
                src={flag.profile_pic_url ? `https://images.weserv.nl/?url=${encodeURIComponent(flag.profile_pic_url)}` : '/default-avatar.png'}
                alt={flag.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-red-500/20"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 items-center justify-center text-white font-bold text-sm hidden">
                {(flag.full_name || flag.username || '?').charAt(0).toUpperCase()}
                    </div>
              <div className="flex-1">
                <p className="font-medium text-white">@{flag.username}</p>
                <p className="text-sm text-white/60">{flag.full_name || 'No name'}</p>
                {flag.is_private && (
                  <span className="inline-block px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full mt-1">
                    Private Account
                  </span>
                    )}
                  </div>
              <div className="flex items-center text-red-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                </div>
              </div>
          ))}
        </div>

        {!showAll && remainingCount > 0 && (
          <button 
            onClick={() => setShowAllRedFlags(true)}
            className="w-full mt-4 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            View All {redFlags.length} Red Flag Accounts
          </button>
        )}
        
        {showAll && redFlags.length > 2 && (
          <button 
            onClick={() => setShowAllRedFlags(false)}
            className="w-full mt-4 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            Show Less
          </button>
        )}
      </div>
    );
  };

  const renderStories = (stories) => {
    console.log('renderStories called with:', stories);
    
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
                  {story.mediaType === 'video' ? (
                    <div className="relative">
                      <video 
                        src={story.mediaUrl}
                        className="w-full h-32 object-cover cursor-pointer"
                        muted
                        preload="metadata"
                        onClick={() => { setStoriesStartIndex(index); setIsStoriesViewerOpen(true); }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                      {/* Video play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer" onClick={() => { setStoriesStartIndex(index); setIsStoriesViewerOpen(true); }}>
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                          <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.447.894l2-2a1 1 0 000-1.788l-2-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div 
                        className="w-full h-32 cursor-pointer relative overflow-hidden"
                        onClick={() => { setStoriesStartIndex(index); setIsStoriesViewerOpen(true); }}
                      >
                        <img 
                          src={`https://images.weserv.nl/?url=${encodeURIComponent(story.mediaUrl)}`} 
                          alt={`Story ${index + 1}`}
                          className="w-full h-full object-cover"
                          onLoad={() => {
                            // Image loaded successfully
                          }}
                          onError={(e) => {
                            // Try direct URL as fallback
                            if (e.target.src.includes('weserv.nl')) {
                              e.target.src = story.mediaUrl;
                              return;
                            }
                            // Show fallback if both fail
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.image-fallback');
                            if (fallback) {
                              fallback.classList.remove('hidden');
                              fallback.classList.add('flex');
                            }
                          }}
                        />
                        {/* Fallback for failed image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 items-center justify-center hidden image-fallback">
                          <div className="text-center text-white/60">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <div className="text-xs">Image Story</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Media type indicators */}
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
                <div className="w-full h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center cursor-pointer" onClick={() => { setStoriesStartIndex(index); setIsStoriesViewerOpen(true); }}>
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


  const renderScrollableBox = (title, data, isLoading, icon, onLoadMore, isLoadingMore = false, hasNextPage = true) => (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-white/60 text-sm">{data.length} users</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
          <span className="text-white/80">Loading...</span>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {data.length > 0 ? (
            <>
              {data.map((user, index) => renderUserCard(user, 'user'))}
              
              {/* Load More Button */}
              {hasNextPage && (
                <div className="pt-4 pb-2">
                  <button
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-white/80 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Loading more...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Load More {title}
                    </div>
                  )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60">No {title.toLowerCase()} found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Show loading while checking authentication
  if (isCheckingAuth) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/80">Loading advanced search...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
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
                disabled={!!results}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Search Type
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                disabled={!!results}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">Fetch All</option>
                <option value="both">Followers & Following</option>
                <option value="followers">Followers Only</option>
                <option value="following">Following Only</option>
                <option value="stories">Stories Only</option>
                <option value="redFlags">Red Flags Only</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={results ? handleReset : handleSearch}
                disabled={loading || (!results && !username.trim())}
                className={`w-full px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  results 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Searching...
                  </div>
                ) : results ? (
                  'Reset'
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
                ⚠️ Account must be public to access and analyze content
              </p>
            </div>
            
            {subscription && subscription.hasSubscription ? (
              <div className="text-right">
                <p className="text-white/60 text-sm">
                  Searches remaining: {subscription.remainingSearches}
                </p>
                <p className="text-white/40 text-xs">
                  Plan: {subscription.plan}
                </p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-red-400 text-sm font-medium">
                  No active subscription
                </p>
                <p className="text-white/40 text-xs">
                  Choose a plan to start
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
              {/* Debug: subscription.plan = {subscription?.plan}, redFlags count = {results.redFlags?.length} */}
              {results.redFlags && (
                subscription?.plan === 'premium' ? (
                  renderRedFlags(results, showAllRedFlags)
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
                              onClick={() => navigate('/pricing')}
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

            {/* Stories - Premium Only - Show based on searchType */}
            {results.stories && (searchType === 'all' || searchType === 'stories') && (
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
                          onClick={() => navigate('/pricing')}
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


            {/* Scrollable Followers and Following Boxes - For Premium/Pro Users */}
            {getPlanTier() >= 2 && (followers.length > 0 || following.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Followers Box - Show based on searchType */}
                {(searchType === 'all' || searchType === 'both' || searchType === 'followers') && (
                  (() => {
                    console.log('Rendering Followers box - followersNextPageId:', followersNextPageId, 'hasNextPage:', !!followersNextPageId);
                    return renderScrollableBox(
                      'Recent Followers',
                      followers,
                      isLoadingFollowers,
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>,
                      handleLoadMoreFollowers,
                      isLoadingMoreFollowers,
                      !!followersNextPageId
                    );
                  })()
                )}
                
                {/* Following Box - Show based on searchType */}
                {(searchType === 'all' || searchType === 'both' || searchType === 'following') && (
                  (() => {
                    console.log('Rendering Following box - followingNextPageId:', followingNextPageId, 'hasNextPage:', !!followingNextPageId);
                    return renderScrollableBox(
                      'Recent Following',
                      following,
                      isLoadingFollowing,
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>,
                      handleLoadMoreFollowing,
                      isLoadingMoreFollowing,
                      !!followingNextPageId
                    );
                  })()
                )}
              </div>
            )}

            {/* Current Results */}
            <div className="space-y-6">
              {/* New Followers - Show based on searchType */}
              {results.newFollowers && results.newFollowers.length > 0 && (searchType === 'all' || searchType === 'both' || searchType === 'followers') && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    New Followers ({results.totalNewFollowers})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.newFollowers.slice(0, 2).map((follower) => (
                      <div key={follower.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://images.weserv.nl/?url=${encodeURIComponent(follower.profilePicUrl || follower.profile_pic_url)}`}
                            alt={follower.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white font-bold text-lg hidden">
                            {(follower.fullName || follower.full_name || follower.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">@{follower.username}</p>
                            <p className="text-sm text-white/60">{follower.fullName || follower.full_name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Following - Show based on searchType */}
              {results.newFollowing && results.newFollowing.length > 0 && (searchType === 'all' || searchType === 'both' || searchType === 'following') && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    New Following ({results.totalNewFollowing})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.newFollowing.slice(0, 2).map((following) => (
                      <div key={following.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://images.weserv.nl/?url=${encodeURIComponent(following.profilePicUrl || following.profile_pic_url)}`}
                            alt={following.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white font-bold text-lg hidden">
                            {(following.fullName || following.full_name || following.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">@{following.username}</p>
                            <p className="text-sm text-white/60">{following.fullName || following.full_name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags - Show based on searchType */}
              {results.redFlags && results.redFlags.length > 0 && (searchType === 'all' || searchType === 'redFlags') && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Red Flags ({results.redFlags.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.redFlags.slice(0, 6).map((flag, index) => (
                      <div key={index} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-white">@{flag.username || flag.user?.username || 'Unknown'}</p>
                            <p className="text-sm text-red-300">{flag.reason || flag.description || 'Suspicious activity detected'}</p>
                            {flag.confidence && (
                              <p className="text-xs text-red-400">Confidence: {flag.confidence}%</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
                {(searchType === 'all' || searchType === 'both' || searchType === 'followers') && (
                <div>
                  <div className="text-2xl font-bold text-white">
                    {results.totalNewFollowers || 0}
                  </div>
                  <div className="text-white/60 text-sm">Total New Followers</div>
                </div>
                )}
                {(searchType === 'all' || searchType === 'both' || searchType === 'following') && (
                <div>
                  <div className="text-2xl font-bold text-white">
                    {results.totalNewFollowing || 0}
                  </div>
                  <div className="text-white/60 text-sm">Total New Following</div>
                </div>
                )}
                {searchType === 'stories' && (
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {results.stories?.length || 0}
                    </div>
                    <div className="text-white/60 text-sm">Total Stories</div>
                  </div>
                )}
                {searchType === 'redFlags' && (
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {results.redFlags?.length || 0}
                    </div>
                    <div className="text-white/60 text-sm">Red Flags Detected</div>
                  </div>
                )}
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
          startIndex={storiesStartIndex}
        />

      {/* Upgrade Prompt Modal */}
      <SubscriptionUpgradePrompt
        isOpen={showUpgradePrompt}
        feature="Advanced search features are available for premium subscribers. Upgrade your plan to access full search capabilities with comparison and analysis tools."
        onClose={() => setShowUpgradePrompt(false)}
        />
      </div>
    </div>
  );
};

export default DashboardSearch; 
import { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import apiService from '../services/api.js';
import SearchResults from './SearchResults.jsx';

const SearchForm = () => {
  const { isActive, getPlanTier } = useSubscription();
  const [username, setUsername] = useState('');
  const [searchType, setSearchType] = useState('followers');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
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

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    // Убираем @ из начала username если он есть
    const cleanUsername = username.trim().replace(/^@+/, '');

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await apiService.searchInstagram(cleanUsername, searchType);
      const data = response.data;
      setResults(data);
      
      // If user is subscribed, extract followers and following data from the main response
      if (isActive() && data) {
        // Extract followers data
        const followersData = data.followers || data.newFollowers || [];
        setFollowers(followersData);
        setFollowersNextPageId(data.nextPageId || data.followersNextPageId || null);
        
        // Extract following data
        const followingData = data.following || data.newFollowing || [];
        setFollowing(followingData);
        setFollowingNextPageId(data.nextPageId || data.followingNextPageId || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleLoadMoreFollowers = async () => {
    if (!username.trim() || isLoadingMoreFollowers || !followersNextPageId) return;
    
    try {
      setIsLoadingMoreFollowers(true);
      const cleanUsername = username.trim().replace(/^@+/, '');
      
      // Call the dedicated next-followers endpoint
      const response = await apiService.getNextFollowers(cleanUsername, followersNextPageId);
      const data = response.data || response;
      
      // Append new followers to existing list
      const newFollowers = data.followers || data.newFollowers || data.followerList || [];
      if (Array.isArray(newFollowers) && newFollowers.length > 0) {
        setFollowers(prev => [...prev, ...newFollowers]);
        setFollowersNextPageId(data.nextPageId || data.followersNextPageId || null);
        setFollowersPage(prev => prev + 1);
      }
      
      console.log(`Loaded more followers for ${username}, new count: ${newFollowers.length}, nextPageId: ${data.nextPageId}`);
    } catch (err) {
      console.error('Error loading more followers:', err);
    } finally {
      setIsLoadingMoreFollowers(false);
    }
  };

  const handleLoadMoreFollowing = async () => {
    if (!username.trim() || isLoadingMoreFollowing || !followingNextPageId) return;
    
    try {
      setIsLoadingMoreFollowing(true);
      const cleanUsername = username.trim().replace(/^@+/, '');
      
      // Call the dedicated next-following endpoint
      const response = await apiService.getNextFollowing(cleanUsername, followingNextPageId);
      const data = response.data || response;
      
      // Append new following to existing list
      const newFollowing = data.following || data.newFollowing || data.followingList || [];
      if (Array.isArray(newFollowing) && newFollowing.length > 0) {
        setFollowing(prev => [...prev, ...newFollowing]);
        setFollowingNextPageId(data.nextPageId || data.followingNextPageId || null);
        setFollowingPage(prev => prev + 1);
      }
      
      console.log(`Loaded more following for ${username}, new count: ${newFollowing.length}, nextPageId: ${data.nextPageId}`);
    } catch (err) {
      console.error('Error loading more following:', err);
    } finally {
      setIsLoadingMoreFollowing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Instagram username"
              className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              disabled={isLoading}
            >
              <option value="followers">Followers</option>
              <option value="following">Following</option>
            </select>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      <SearchResults 
        results={results}
        isLoading={isLoading}
        error={error}
        isSubscribed={isActive()}
        followers={followers}
        following={following}
        isLoadingFollowers={isLoadingFollowers}
        isLoadingFollowing={isLoadingFollowing}
        onLoadMoreFollowers={handleLoadMoreFollowers}
        onLoadMoreFollowing={handleLoadMoreFollowing}
        isLoadingMoreFollowers={isLoadingMoreFollowers}
        isLoadingMoreFollowing={isLoadingMoreFollowing}
        followersNextPageId={followersNextPageId}
        followingNextPageId={followingNextPageId}
        showLoadMore={false}
        getPlanTier={getPlanTier}
      />
    </div>
  );
};

export default SearchForm; 
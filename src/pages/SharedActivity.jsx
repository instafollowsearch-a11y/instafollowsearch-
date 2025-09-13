import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageNavigation from '../components/PageNavigation';
import SubscriptionUpgradePrompt from '../components/SubscriptionUpgradePrompt';
import apiService from '../services/api.js';

const SharedActivity = () => {
  const navigate = useNavigate();
  const { isActive, getPlanTier } = useSubscription();
  const [formData, setFormData] = useState({
    username1: '',
    username2: ''
  });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  // Function to transform API data to UI format
  const transformApiData = (data, username1, username2) => {
    const firstUser = data.firstUser;
    const secondUser = data.secondUser;
    
    // Get actual counts from the API response
    const userALikesOnUserBPosts = data.secondUserPostsLikedByFirst?.length || 0;
    const userBLikesOnUserAPosts = data.firstUserPostsLikedBySecond?.length || 0;
    const userACommentsOnUserBPosts = data.secondUserPostsCommentedByFirst?.length || 0;
    const userBCommentsOnUserAPosts = data.firstUserPostsCommentedBySecond?.length || 0;
    
    const totalInteractions = userALikesOnUserBPosts + userBLikesOnUserAPosts + userACommentsOnUserBPosts + userBCommentsOnUserAPosts;
    const mutualLikes = userALikesOnUserBPosts + userBLikesOnUserAPosts;
    const mutualComments = userACommentsOnUserBPosts + userBCommentsOnUserAPosts;
    
    return {
      relationship: {
        type: data.isFirstFollowingSecond && data.isSecondFollowingFirst ? "mutual_following" : "one_way_following",
        sinceDate: data.sinceDate || "2024-01-15",
        status: data.isFirstFollowingSecond && data.isSecondFollowingFirst ? "Following each other" : "One-way following"
      },
      userA: {
        username: username1 || firstUser.username,
        fullName: firstUser.fullName || firstUser.full_name,
        profilePicUrl: `https://images.weserv.nl/?url=${encodeURIComponent(firstUser.profilePicUrl || firstUser.profile_pic_url)}`,
        postsLikedByUserB: userBLikesOnUserAPosts,
        commentsByUserB: userBCommentsOnUserAPosts,
        totalPosts: firstUser.mediaCount || firstUser.media_count
      },
      userB: {
        username: username2 || secondUser.username,
        fullName: secondUser.fullName || secondUser.full_name,
        profilePicUrl: `https://images.weserv.nl/?url=${encodeURIComponent(secondUser.profilePicUrl || secondUser.profile_pic_url)}`,
        postsLikedByUserA: userALikesOnUserBPosts,
        commentsByUserA: userACommentsOnUserBPosts,
        totalPosts: secondUser.mediaCount || secondUser.media_count
      },
      interactionStats: {
        totalInteractions,
        mutualLikes,
        mutualComments,
        lastInteraction: data.lastInteraction || new Date().toISOString()
      },
      // Store the actual post data for visualization
      likedPosts: {
        userALikedUserBPosts: data.secondUserPostsLikedByFirst || [],
        userBLikedUserAPosts: data.firstUserPostsLikedBySecond || []
      },
      commentedPosts: {
        userACommentedOnUserBPosts: data.secondUserPostsCommentedByFirst || [],
        userBCommentedOnUserAPosts: data.firstUserPostsCommentedBySecond || []
      },
      processingTime: data.processingTime || 0,
      lastUpdated: new Date().toISOString()
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username1.trim() || !formData.username2.trim()) {
      setError('Please enter both usernames');
      return;
    }

    // Check subscription - require Premium or Pro plan
    if (getPlanTier() < 2) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Clean usernames (remove @ if present)
      const cleanUsername1 = formData.username1.trim().replace(/^@+/, '');
      const cleanUsername2 = formData.username2.trim().replace(/^@+/, '');
      
      // Call the API endpoint
      const {data} = await apiService.getSharedActivity(cleanUsername1, cleanUsername2);
      
      // Transform the API response to UI format
      const transformedData = transformApiData(data, cleanUsername1, cleanUsername2);
      
      setResults(transformedData);

    } catch (err) {
        setError('Failed to compare accounts. Please try again.');
        console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          {/* Relationship Status Header */}
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-white text-sm font-medium mb-4">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {results.relationship.status}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                @{results.userA.username} and @{results.userB.username} are following each other
              </h3>
              {/* <p className="text-white/70">
                Since {new Date(results.relationship.sinceDate).toLocaleDateString()}
              </p> */}
            </div>
          </div>

          {/* User Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User A Card */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={results.userA.profilePicUrl}
                  alt={results.userA.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(results.userA.username)}&background=6366f1&color=ffffff&size=64`;
                  }}
                />
                <div>
                  <h4 className="text-xl font-semibold text-white">@{results.userA.username}</h4>
                  <p className="text-white/80">{results.userA.fullName}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Posts liked by @{results.userB.username}:</span>
                  <span className="text-white font-semibold">{results.userA.postsLikedByUserB}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Comments by @{results.userB.username}:</span>
                  <span className="text-white font-semibold">{results.userA.commentsByUserB}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Recent posts examined:</span>
                  <span className="text-white font-semibold">24</span>
                </div>
              </div>
            </div>

            {/* User B Card */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={results.userB.profilePicUrl}
                  alt={results.userB.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(results.userB.username)}&background=ec4899&color=ffffff&size=64`;
                  }}
                />
                <div>
                  <h4 className="text-xl font-semibold text-white">@{results.userB.username}</h4>
                  <p className="text-white/80">{results.userB.fullName}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Posts liked by @{results.userA.username}:</span>
                  <span className="text-white font-semibold">{results.userB.postsLikedByUserA}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Comments by @{results.userA.username}:</span>
                  <span className="text-white font-semibold">{results.userB.commentsByUserA}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Recent posts examined:</span>
                  <span className="text-white font-semibold">24</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interaction Summary */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Interaction Summary
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.interactionStats.totalInteractions}</div>
                <div className="text-white/70 text-sm">Total Interactions</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.interactionStats.mutualLikes}</div>
                <div className="text-white/70 text-sm">Mutual Likes</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.interactionStats.mutualComments}</div>
                <div className="text-white/70 text-sm">Mutual Comments</div>
              </div>
            </div>
          </div>

          {/* Processing Info */}
          <div className="text-sm text-white/60 border-t border-white/10 pt-4">
            <div className="flex justify-between items-center">
              <span>Processing time: {results.processingTime}ms</span>
              <span>Last updated: {new Date(results.lastUpdated).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Posts Visualization Sections */}
        <div className="mt-8 space-y-8">
          {/* Liked Posts Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h4 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Posts They Liked
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User A liked User B's posts */}
              <div className="lg:border-r lg:border-white/20 lg:pr-6">
                <h5 className="text-lg font-medium text-white mb-4">
                  @{results.userA.username} liked @{results.userB.username}'s posts ({results.likedPosts.userALikedUserBPosts.length})
                </h5>
                <div className="space-y-4">
                  {results.likedPosts.userALikedUserBPosts.map((post, index) => (
                    <div key={post.postId} className="bg-white/10 rounded-xl overflow-hidden border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-200 shadow-lg">
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={`https://images.weserv.nl/?url=${encodeURIComponent(post.imageUrl)}`}
                            alt={`Post ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=Post&background=6366f1&color=ffffff&size=128`;
                            }}
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <p className="text-white/80 text-sm mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {post.caption || 'No caption'}
                          </p>
                          <p className="text-white/60 text-xs">@{post.code}</p>
                        </div>
                      </div>
                      {index < results.likedPosts.userALikedUserBPosts.length - 1 && (
                        <div className="border-t border-white/10 mx-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* User B liked User A's posts */}
              <div className="lg:pl-3">
                <h5 className="text-lg font-medium text-white mb-4">
                  @{results.userB.username} liked @{results.userA.username}'s posts ({results.likedPosts.userBLikedUserAPosts.length})
                </h5>
                <div className="space-y-4">
                  {results.likedPosts.userBLikedUserAPosts.map((post, index) => (
                    <div key={post.postId} className="bg-white/10 rounded-xl overflow-hidden border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-200 shadow-lg">
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={`https://images.weserv.nl/?url=${encodeURIComponent(post.imageUrl)}`}
                            alt={`Post ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=Post&background=ec4899&color=ffffff&size=128`;
                            }}
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <p className="text-white/80 text-sm mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {post.caption || 'No caption'}
                          </p>
                          <p className="text-white/60 text-xs">@{post.code}</p>
                        </div>
                      </div>
                      {index < results.likedPosts.userBLikedUserAPosts.length - 1 && (
                        <div className="border-t border-white/10 mx-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Commented Posts Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h4 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Posts They Commented On
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User A commented on User B's posts */}
              <div className="lg:border-r lg:border-white/20 lg:pr-6">
                <h5 className="text-lg font-medium text-white mb-4">
                  @{results.userA.username} commented on @{results.userB.username}'s posts ({results.commentedPosts.userACommentedOnUserBPosts.length})
                </h5>
                <div className="space-y-4">
                  {results.commentedPosts.userACommentedOnUserBPosts.map((post, index) => (
                    <div key={post.postId} className="bg-white/10 rounded-xl overflow-hidden border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-200 shadow-lg">
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={`https://images.weserv.nl/?url=${encodeURIComponent(post.imageUrl)}`}
                            alt={`Post ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=Post&background=6366f1&color=ffffff&size=128`;
                            }}
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <p className="text-white/80 text-sm mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {post.caption || 'No caption'}
                          </p>
                          <p className="text-white/60 text-xs">@{post.code}</p>
                        </div>
                      </div>
                      {index < results.commentedPosts.userACommentedOnUserBPosts.length - 1 && (
                        <div className="border-t border-white/10 mx-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* User B commented on User A's posts */}
              <div className="lg:pl-3">
                <h5 className="text-lg font-medium text-white mb-4">
                  @{results.userB.username} commented on @{results.userA.username}'s posts ({results.commentedPosts.userBCommentedOnUserAPosts.length})
                </h5>
                <div className="space-y-4">
                  {results.commentedPosts.userBCommentedOnUserAPosts.map((post, index) => (
                    <div key={post.postId} className="bg-white/10 rounded-xl overflow-hidden border border-white/20 hover:border-white/30 hover:bg-white/15 transition-all duration-200 shadow-lg">
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={`https://images.weserv.nl/?url=${encodeURIComponent(post.imageUrl)}`}
                            alt={`Post ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=Post&background=ec4899&color=ffffff&size=128`;
                            }}
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <p className="text-white/80 text-sm mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {post.caption || 'No caption'}
                          </p>
                          <p className="text-white/60 text-xs">@{post.code}</p>
                        </div>
                      </div>
                      {index < results.commentedPosts.userBCommentedOnUserAPosts.length - 1 && (
                        <div className="border-t border-white/10 mx-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <PageNavigation />
      
      <main className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden animate-fade-in">
        {/* Background decorations */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto z-10">
          <div className="text-center mb-12">
            {/* Page title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="block">Compare Instagram</span>
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Shared Activity
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Discover shared followers, mutual connections, and overlapping activity between two Instagram accounts.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* First username input */}
              <div>
                <label htmlFor="username1" className="block text-white/90 text-lg font-medium mb-3 text-left">
                  First Instagram Account
                </label>
                <input
                  type="text"
                  id="username1"
                  name="username1"
                  value={formData.username1}
                  onChange={handleInputChange}
                  placeholder="Enter first Instagram username"
                  className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  disabled={isLoading}
                />
              </div>

              {/* Second username input */}
              <div>
                <label htmlFor="username2" className="block text-white/90 text-lg font-medium mb-3 text-left">
                  Second Instagram Account
                </label>
                <input
                  type="text"
                  id="username2"
                  name="username2"
                  value={formData.username2}
                  onChange={handleInputChange}
                  placeholder="Enter second Instagram username"
                  className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  disabled={isLoading}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-300 text-center">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Comparing Accounts...
                  </div>
                ) : (
                  'Compare Accounts'
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          {renderResults()}

          {/* Additional info */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-white/90 text-sm">100% Anonymous</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white/90 text-sm">Secure</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-white/90 text-sm">Instant Results</span>
              </div>
            </div>

            <p className="text-white/60 text-sm">
              Discover mutual connections and shared activity patterns between Instagram accounts
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Upgrade Prompt Modal */}
      <SubscriptionUpgradePrompt
        isOpen={showUpgradePrompt}
        feature="Shared activity analysis is available for premium subscribers. Upgrade your plan to access advanced comparison features and mutual connection insights."
        onClose={() => setShowUpgradePrompt(false)}
      />
    </div>
  );
};

export default SharedActivity;

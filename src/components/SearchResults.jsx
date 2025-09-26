import apiService from '../services/api.js';
import { useNavigate } from 'react-router-dom';

const SearchResults = ({ 
  results, 
  isLoading, 
  error, 
  isSubscribed, 
  followers, 
  following, 
  isLoadingFollowers, 
  isLoadingFollowing,
  onLoadMoreFollowers,
  onLoadMoreFollowing,
  isLoadingMoreFollowers,
  isLoadingMoreFollowing,
  followersNextPageId,
  followingNextPageId,
  showLoadMore = true,
  getPlanTier
}) => {
  const navigate = useNavigate();
  
  const renderUserCard = (user, index) => (
    <div key={user.id || index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
      <img
        src={`https://images.weserv.nl/?url=${encodeURIComponent(user.profilePicUrl || user.profile_pic_url)}`}
        alt={user.username}
        className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
        onError={(e) => {
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex';
          }
        }}
      />
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white font-bold text-sm hidden">
        {(user.fullName || user.full_name || user.username || '?').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="font-medium text-white">@{user.username}</p>
        <p className="text-sm text-white/60">{user.fullName || user.full_name || 'No name'}</p>
      </div>
    </div>
  );

  const renderScrollableBox = (title, data, isLoading, icon, onLoadMore, isLoadingMore = false, showLoadMore = true) => (
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
              {data.map((user, index) => renderUserCard(user, index))}
              
              {/* Load More Button */}
              {showLoadMore && (
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

  const renderRedFlags = (userData, isAdvancedSearch = false) => {
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
    const displayCount = isAdvancedSearch ? redFlags.length : Math.min(2, redFlags.length);
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
          {!isAdvancedSearch && remainingCount > 0 && (
            <div className="text-right">
              <span className="text-red-300 text-sm">
                +{remainingCount} more
              </span>
              <div className="text-xs text-red-400/70 mt-1">
                {getPlanTier && getPlanTier() >= 2 ? (
                  "See all in Advanced Search"
                ) : (
                  "Upgrade to Premium to see all"
                )}
              </div>
            </div>
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

        {isAdvancedSearch && remainingCount > 0 && (
          <button className="w-full mt-4 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200 text-sm font-medium">
            View All {redFlags.length} Red Flag Accounts
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
            <span className="text-white/80">Analyzing Instagram account...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        {/* User Info */}
        <div className="mb-8 p-6 bg-white/5 rounded-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={`https://images.weserv.nl/?url=${encodeURIComponent(results.user.profilePicUrl || results.user.profile_pic_url)}`}
                alt={results.user.username}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white font-bold text-2xl hidden">
                {(results.user.fullName || results.user.full_name || results.user.username || '?').charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">
                @{results.user.username}
              </h3>
              <div className="flex items-center justify-center space-x-8 mb-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {results.user.followerCount || results.user.follower_count}
                  </div>
                  <div className="text-sm text-white/60">followers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {results.user.followingCount || results.user.following_count}
                  </div>
                  <div className="text-sm text-white/60">following</div>
                </div>
              </div>
              {(results.user.fullName || results.user.full_name) && (
                <p className="text-white/80 text-lg">{results.user.fullName || results.user.full_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Red Flags */}
        {results.redFlags && (
          <div className="mb-6">
            {renderRedFlags(results, false)}
          </div>
        )}

        {/* Content based on subscription status */}
        {isSubscribed ? (
          // Subscribed users see scrollable followers and following
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Followers Box */}
            {renderScrollableBox(
              'Recent Followers',
              followers,
              isLoadingFollowers,
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>,
              onLoadMoreFollowers,
              isLoadingMoreFollowers,
              !!followersNextPageId,
              showLoadMore
            )}
            
            {/* Following Box */}
            {renderScrollableBox(
              'Recent Following',
              following,
              isLoadingFollowing,
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>,
              onLoadMoreFollowing,
              isLoadingMoreFollowing,
              !!followingNextPageId,
              showLoadMore
            )}
          </div>
        ) : (
          // Free users see locked content
          <>
            {/* New Followers - Locked */}
            {results.newFollowers && results.newFollowers.length > 0 && (
          <div className="mb-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      New Followers ({results.totalNewFollowers})
                    </h3>
                    <p className="text-white/60 text-sm">
                      @{results.newFollowers[0]?.username || 'user'} + {results.totalNewFollowers - 1} more
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-500/20 text-green-400 text-sm font-medium rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {results.newFollowers.slice(0, 3).map((follower) => (
                  <div key={follower.id} className="relative group">
                    {/* Blurred individual card with lock */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 relative overflow-hidden backdrop-blur-sm">
                      {/* Frosted glass effect with purple theme */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-xl"></div>
                      <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-lg"></div>
                      
                      {/* Lock icon */}
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-white text-sm font-medium">Premium</p>
                        </div>
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30">
                        <div className="bg-white/90 text-black px-3 py-1 rounded-lg text-xs font-medium">
                          Upgrade to Premium to unlock
                        </div>
                      </div>

                      {/* Heavily blurred content */}
                      <div className="relative z-10 opacity-60">
                        <img
                          src={`https://images.weserv.nl/?url=${encodeURIComponent(follower.profilePicUrl || follower.profile_pic_url)}`}
                          alt={follower.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/20 blur-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white font-bold text-sm hidden">
                          {(follower.fullName || follower.full_name || follower.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 blur-sm">
                          <p className="font-medium text-white">@{follower.username}</p>
                          <p className="text-sm text-white/60">{follower.fullName || follower.full_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* New Following */}
        {results.newFollowing && results.newFollowing.length > 0 && (
          <div className="mb-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      New Following ({results.totalNewFollowing})
                    </h3>
                    <p className="text-white/60 text-sm">
                      @{results.newFollowing[0]?.username || 'user'} + {results.totalNewFollowing - 1} more
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {results.newFollowing.slice(0, 3).map((following) => (
                  <div key={following.id} className="relative group">
                    {/* Blurred individual card with lock */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 relative overflow-hidden backdrop-blur-sm">
                      {/* Frosted glass effect with purple theme */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-xl"></div>
                      <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-lg"></div>
                      
                      {/* Lock icon */}
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-white text-sm font-medium">Premium</p>
                        </div>
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30">
                        <div className="bg-white/90 text-black px-3 py-1 rounded-lg text-xs font-medium">
                          Upgrade to Premium to unlock
                        </div>
                      </div>

                      {/* Heavily blurred content */}
                      <div className="relative z-10 opacity-60">
                        <img
                          src={`https://images.weserv.nl/?url=${encodeURIComponent(following.profilePicUrl || following.profile_pic_url)}`}
                          alt={following.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/20 blur-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white font-bold text-sm hidden">
                          {(following.fullName || following.full_name || following.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 blur-sm">
                          <p className="font-medium text-white">@{following.username}</p>
                          <p className="text-sm text-white/60">{following.fullName || following.full_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Upgrade CTA - Only show for Free and Basic users */}
        {results && getPlanTier && getPlanTier() < 2 && (
          <div className="mt-8 p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Premium Feature
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                🔥 Unlock Complete Instagram Analytics!
              </h3>
              
              <p className="text-white/80 mb-6 text-lg leading-relaxed">
                You're seeing just a preview! Upgrade to Premium and get unlimited access to all features:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center p-3 bg-white/10 rounded-lg">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/90 text-sm">All Results</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-white/10 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/90 text-sm">Track Changes</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-white/10 rounded-lg">
                  <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/90 text-sm">Stories Access</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🚀 View Pricing Plans
                </button>
                <button
                  onClick={() => {
                    if (apiService.isAuthenticated()) {
                      window.location.href = '/dashboard';
                    } else {
                      document.dispatchEvent(new CustomEvent('showAuthModal'));
                    }
                  }}
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  🔐 Sign Up Now
                </button>
              </div>
              
              <p className="text-white/60 text-sm mt-4">
                Join 8,000+ users who trust Followersearch for Instagram analytics
              </p>
            </div>
          </div>
        )}

        {/* Processing Info */}
        <div className="text-sm text-white/60 border-t border-white/10 pt-4 mt-6">
          <div className="flex justify-between items-center">
            <span>Processing time: {results.processingTime}ms</span>
            <span>Last updated: {new Date(results.lastUpdated).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import PageNavigation from '../components/PageNavigation';
import SEO from '../components/SEO.jsx';
import apiService, { API_BASE_URL } from '../services/api.js';
import StoriesViewer from '../components/StoriesViewer.jsx';
import MediaModal from '../components/MediaModal.jsx';
import SubscriptionUpgradePrompt from '../components/SubscriptionUpgradePrompt.jsx';
import { useSubscription } from '../contexts/SubscriptionContext';

const ViewProfile = () => {
  const { getPlanTier } = useSubscription();
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStories, setHasStories] = useState(false);
  const [stories, setStories] = useState([]);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  const [isRingAnimating, setIsRingAnimating] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  // Tab management
  const [activeTab, setActiveTab] = useState('posts');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersNextPageId, setFollowersNextPageId] = useState(null);
  const [followingNextPageId, setFollowingNextPageId] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Media pagination
  const [mediasNextPageId, setMediasNextPageId] = useState(null);
  const [isLoadingMoreMedias, setIsLoadingMoreMedias] = useState(false);

  const makeMockProfile = (handle) => {
    const seed = handle.length;
    const followers = 1200 + seed * 37;
    const following = 180 + seed * 5;
    const posts = 42 + (seed % 21);
    const colors = ['4F46E5','EC4899','10B981','F59E0B','8B5CF6','06B6D4'];
    const color = colors[seed % colors.length];
    const initials = handle.slice(0, 2).toUpperCase();

    const medias = Array.from({ length: 18 }).map((_, i) => ({
      id: `${handle}-${i}`,
      thumb: `https://picsum.photos/seed/${handle}-${i}/800/800`,
      likes: Math.floor(50 + Math.random() * 950),
      comments: Math.floor(Math.random() * 60)
    }));

    return {
      username: handle,
      fullName: handle.replace(/[_\.]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      profilePicUrl: `https://picsum.photos/seed/${handle}-avatar/200/200`,
      bio: `Hi, I'm ${handle}. Exploring InstaFollowCheck mock profile. #mock #demo`,
      counts: { posts, followers, following },
      verified: seed % 3 === 0,
      link: 'https://instafollowcheck.com',
      highlights: Array.from({ length: 8 }).map((_, i) => ({
        id: `hl-${i}`,
        label: i % 2 === 0 ? 'besties' : 'travel',
        cover: `https://picsum.photos/seed/${handle}-hl-${i}/120/120`
      })),
      medias
    };
  };

  const proxy = useCallback((url) => {
    if (!url) return '';
    return `${API_BASE_URL}/instagram/proxy-image?url=${encodeURIComponent(url)}`;
  }, []);


  // Helper function to map individual media items
  const mapMediaItem = (p, i, usernameApi) => {
    // Handle carousel posts (multiple images)
    if (p.carousel_media_count > 1 && p.carousel_media) {
      const carouselItems = p.carousel_media.map((item, itemIndex) => ({
        id: item.id || `${p.id}-${itemIndex}`,
        thumb: item.thumbnail_url || (item.image_versions2?.candidates?.[1]?.url) || (item.image_versions2?.candidates?.[0]?.url) || '',
        url: (item.image_versions2?.candidates?.[0]?.url) || '',
        image: (item.image_versions2?.candidates?.[0]?.url) || '',
        type: item.media_type === 2 ? 'video' : 'image',
        videoUrl: item.video_url || (item.video_versions?.[0]?.url) || ''
      }));
      
      return {
        id: p.id || `${usernameApi}-${i}`,
        thumb: p.thumbnail_url || (p.image_versions2?.candidates?.[1]?.url) || (p.image_versions2?.candidates?.[0]?.url) || '',
        url: (p.image_versions2?.candidates?.[0]?.url) || '',
        image: (p.image_versions2?.candidates?.[0]?.url) || '',
        likes: p.like_count ?? p.likeCount ?? 0,
        comments: p.comment_count ?? p.commentCount ?? 0,
        type: 'carousel',
        carouselItems: carouselItems,
        carouselCount: p.carousel_media_count || carouselItems.length
      };
    }
    
    // Handle single media posts
    const thumb = p.thumbnail_url || (p.image_versions2?.candidates?.[1]?.url) || (p.image_versions2?.candidates?.[0]?.url) || '';
    const isVideo = p.media_type === 2;
    
    return {
      id: p.id || `${usernameApi}-${i}`,
      thumb: thumb,
      url: p.video_url || (p.image_versions2?.candidates?.[0]?.url) || '',
      image: (p.image_versions2?.candidates?.[0]?.url) || '',
      likes: p.like_count ?? p.likeCount ?? 0,
      comments: p.comment_count ?? p.commentCount ?? 0,
      type: isVideo ? 'video' : 'image',
      videoUrl: isVideo ? (p.video_url || (p.video_versions?.[0]?.url) || '') : '',
      videoDuration: isVideo ? p.video_duration : null,
      hasAudio: isVideo ? p.has_audio : false
    };
  };

  const mapApiToProfile = (payload) => {
    const ui = payload?.userinfo || {};
    const posts = payload?.userPosts?.medias || payload?.userPosts || [];
    const apiStories = payload?.userStories || [];

    const usernameApi = ui.username || username.trim().replace(/^@+/, '');
    const fullNameApi = ui.full_name || ui.fullName || usernameApi;
    const followersApi = ui.follower_count ?? ui.followerCount ?? 0;
    const followingApi = ui.following_count ?? ui.followingCount ?? 0;
    const mediaApi = ui.media_count ?? ui.mediaCount ?? posts.length;
    const bioApi = ui.biography || '';
    const linkApi = ui.externalUrl || ui.external_url || '';
    const avatarApi = ui.profile_pic_url_hd || ui.profile_pic_url || ui.profilePicUrl || '';

    const medias = posts.map((p, i) => mapMediaItem(p, i, usernameApi));

    const mappedStories = apiStories.map((s) => ({
      mediaType: (s.mediaType || '').toLowerCase(),
      mediaUrl: s.mediaUrl || '', // Will be proxied by ReliableImage component
      duration: s.duration || null,
      takenAt: s.takenAt || null,
      hasAudio: s.hasAudio || false,
    }));

    return {
      username: usernameApi,
      fullName: fullNameApi,
      userId: ui.id || ui.pk || null, // Add userId for API calls
      profilePicUrl: avatarApi || `https://via.placeholder.com/200/1F2937/FFFFFF?text=${usernameApi.slice(0,2).toUpperCase()}`, // Fallback if no URL
      bio: bioApi,
      link: linkApi,
      verified: ui.is_verified || ui.isVerified || false,
      counts: { posts: mediaApi, followers: followersApi, following: followingApi },
      highlights: [],
      medias,
      stories: mappedStories,
      mediasNextPageId: payload?.userPosts?.nextPageId || null, // Add medias pagination
    };
  };

  // Memoize media grid to prevent re-renders
  const memoizedMediaGrid = useMemo(() => {
    if (!profile?.medias) return null;
    
    return profile.medias.map((m) => (
      <div
        key={m.id}
        className="relative group aspect-square overflow-hidden bg-black cursor-pointer"
        onClick={() => {
          setSelectedMedia(m);
          setIsMediaOpen(true);
        }}
      >
        <img
          src={proxy(m.thumb)}
          alt="media"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/800/111827/FFFFFF?text=Media`;
          }}
        />
        
        {/* Media Type Indicators */}
        {m.type === 'video' && (
          <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        )}
        
        {m.type === 'carousel' && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-semibold">
            {m.carouselCount}
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-semibold">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            {m.likes}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12l4-4h14a2 2 0 002-2V6a2 2 0 00-2-2z"/></svg>
            {m.comments}
          </div>
        </div>
      </div>
    ));
  }, [profile?.medias, proxy]);

  // Memoize followers list to prevent re-renders and ensure proxy works
  const memoizedFollowers = useMemo(() => {
    if (!followers || followers.length === 0) return null;
    
    return followers.map((follower, index) => (
      <div key={follower.id || index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
        <div className="relative w-12 h-12">
          <img
            src={proxy(follower.profilePicUrl)}
            alt={follower.username}
            className="w-full h-full rounded-full object-cover bg-slate-700"
            onError={(e) => {
              e.currentTarget.src = `https://via.placeholder.com/48/1F2937/FFFFFF?text=${follower.username?.slice(0,2).toUpperCase()}`;
            }}
          />
          {follower.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{follower.username}</h3>
            {follower.isPrivate && (
              <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            )}
          </div>
          <p className="text-sm text-white/70 truncate">{follower.fullName}</p>
        </div>
      </div>
    ));
  }, [followers, proxy]);

  // Memoize following list to prevent re-renders and ensure proxy works
  const memoizedFollowing = useMemo(() => {
    if (!following || following.length === 0) return null;
    
    return following.map((follow, index) => (
      <div key={follow.id || index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
        <div className="relative w-12 h-12">
          <img
            src={proxy(follow.profilePicUrl)}
            alt={follow.username}
            className="w-full h-full rounded-full object-cover bg-slate-700"
            onError={(e) => {
              e.currentTarget.src = `https://via.placeholder.com/48/1F2937/FFFFFF?text=${follow.username?.slice(0,2).toUpperCase()}`;
            }}
          />
          {follow.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{follow.username}</h3>
            {follow.isPrivate && (
              <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            )}
          </div>
          <p className="text-sm text-white/70 truncate">{follow.fullName}</p>
        </div>
      </div>
    ));
  }, [following, proxy]);

  // Load more followers
  const loadMoreFollowers = async () => {
    if (!followersNextPageId || isLoadingMore || !profile?.userId) return;
    
    try {
      setIsLoadingMore(true);
      const response = await apiService.getNextFollowers(Number(profile.userId), followersNextPageId);
      const newFollowers = response?.data?.followers || [];
      setFollowers(prev => [...prev, ...newFollowers]);
      setFollowersNextPageId(response?.data?.nextPageId || null);
    } catch (error) {
      console.error('Failed to load more followers:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load more following
  const loadMoreFollowing = async () => {
    if (!followingNextPageId || isLoadingMore || !profile?.userId) return;
    
    try {
      setIsLoadingMore(true);
      const response = await apiService.getNextFollowing(Number(profile.userId), followingNextPageId);
      const newFollowing = response?.data?.following || [];
      setFollowing(prev => [...prev, ...newFollowing]);
      setFollowingNextPageId(response?.data?.nextPageId || null);
    } catch (error) {
      console.error('Failed to load more following:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load more medias
  const loadMoreMedias = async () => {
    if (!mediasNextPageId || isLoadingMoreMedias || !profile?.userId) return;
    
    try {
      setIsLoadingMoreMedias(true);
      const response = await apiService.getNextMedias(Number(profile.userId), mediasNextPageId);
      const rawMedias = response?.data?.medias || [];
      
      // Map the new medias using the same logic as the original mapping
      const newMedias = rawMedias.map((p, i) => mapMediaItem(p, i, profile.username));
      
      // Update profile with new medias
      setProfile(prev => ({
        ...prev,
        medias: [...(prev.medias || []), ...newMedias]
      }));
      
      setMediasNextPageId(response?.data?.nextPageId || null);
    } catch (error) {
      console.error('Failed to load more medias:', error);
    } finally {
      setIsLoadingMoreMedias(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Check subscription for View Profile feature
    const planTier = getPlanTier();
    if (planTier < 2) {
      setShowUpgradePrompt(true);
      return;
    }
    
    const handle = username.trim().replace(/^@+/, '');
    
    // Log user info from backend (for now)
    try {
      setIsLoading(true);
      const userInfo = await apiService.getInstaProfile(handle);
      console.log('Fetched user info:', userInfo);
      const payload = userInfo?.data || userInfo;
      if (payload && (payload.userinfo || payload.userPosts)) {
        const mapped = mapApiToProfile(payload);
        setProfile(mapped);
        setStories(mapped.stories || []);
        setHasStories((mapped.stories || []).length > 0);
        
        // Set followers and following data
        if (payload.userFollowers) {
          setFollowers(payload.userFollowers.followers || []);
          setFollowersNextPageId(payload.userFollowers.nextPageId || null);
        }
        if (payload.userFollowing) {
          setFollowing(payload.userFollowing.following || []);
          setFollowingNextPageId(payload.userFollowing.nextPageId || null);
        }
        
        // Set medias pagination data
        if (payload.userPosts) {
          setMediasNextPageId(payload.userPosts.nextPageId || null);
        }
        
        setIsLoading(false);
        // trigger ring animation once stories detected
        if ((mapped.stories || []).length > 0) {
          setIsRingAnimating(true);
          setTimeout(() => setIsRingAnimating(false), 1200 * 2);
        }
        return;
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    } finally {
      setIsLoading(false);
    }

    // Keep mock profile rendering for UI preview
    // const mock = makeMockProfile(handle);
    // setProfile(mock);
    // setStories([]);
    // setHasStories(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <SEO 
        title="View Instagram Profile | InstaFollowCheck"
        description="Enter an Instagram username to view the public profile details."
        keywords="instagram profile viewer, view instagram profile, instagram tools"
        url="https://instafollowcheck.com/viewprofile"
      />
      <Header />
      <PageNavigation />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10 mt-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">View any Instagram page</h1>
          <h1 className="text-4xl md:text-5xl font-bold text-white">and story</h1>
          <h1 className="text-4xl md:text-5xl font-bold text-white">anonymously</h1>
          <p className="text-white/70 mt-3">Enter a public username to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Instagram username"
              className="flex-1 px-6 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={!username.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Loading…</span>
                </>
              ) : (
                'View →'
              )}
            </button>
          </div>
        </form>
        
        {profile && (
          <div className="max-w-5xl mx-auto mt-10 space-y-8 border border-white/15 rounded-3xl bg-white/5 backdrop-blur-md p-6 md:p-8 shadow-[inset_0_1px_20px_rgba(0,0,0,0.35)]">
            {/* Header */}
            <div className="bg-transparent">
              <div className="flex items-start gap-8 justify-center">
                <div className="relative inline-block w-32 h-32">
                  {/* Story ring - always visible when hasStories */}
                  {hasStories && (
                    <div
                      className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-tr from-red-500 via-pink-500 to-yellow-400"
                      style={isRingAnimating ? {
                        background: 'conic-gradient(from 0deg, #ef4444, #ec4899, #eab308, #ef4444)',
                        mask: 'repeating-conic-gradient(from 0deg, black 0deg 18deg, transparent 18deg 36deg)',
                        WebkitMask: 'repeating-conic-gradient(from 0deg, black 0deg 18deg, transparent 18deg 36deg)',
                        animation: 'spin 1.2s linear 2'
                      } : {}}
                    />
                  )}
                  {/* Profile picture (static) */}
                  <img
                    src={proxy(profile?.profilePicUrl)}
                    alt={profile?.username}
                    className={`absolute inset-[3px] rounded-full bg-slate-800 object-cover w-[calc(100%-6px)] h-[calc(100%-6px)] ${hasStories ? 'cursor-pointer' : ''}`}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/200/1F2937/FFFFFF?text=${profile?.username?.slice(0,2).toUpperCase()}`;
                    }}
                    onClick={() => {
                      if (hasStories) {
                        setIsRingAnimating(true);
                        setTimeout(() => {
                          setIsRingAnimating(false);
                          setIsStoriesOpen(true);
                        }, 1200 * 2);
                      }
                    }}
                  />
                </div>
                <div className="flex-1 min-w-[260px]">
                  <div className="flex items-center gap-2 text-white text-2xl font-semibold">
                    {profile.username}
                    {profile.verified && (
                      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.09 4.24L18.82 7l-3.09 3.01.73 4.49L12 12.9l-4.46 2.6.73-4.49L5.18 7l4.73-.76L12 2z"/></svg>
                    )}
                  </div>
                  <div className="flex items-center gap-8 text-white mt-4">
                    <div><span className="font-semibold">{profile.counts.posts}</span> posts</div>
                    <div><span className="font-semibold">{profile.counts.followers.toLocaleString()}</span> followers</div>
                    <div><span className="font-semibold">{profile.counts.following.toLocaleString()}</span> following</div>
                  </div>
                  <div className="mt-3 text-white">
                    <div className="font-semibold">{profile.fullName}</div>
                    <p className="text-white/80 whitespace-pre-line">{profile.bio}</p>
                    <a href={profile.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{profile.link}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="flex items-center gap-6 py-2 flex-wrap justify-center">
              {profile.highlights.map((h) => (
                <div key={h.id} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden mx-auto">
                    <img src={h.cover} alt={h.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-white/70 text-xs mt-2">{h.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-center gap-10 text-white/70 uppercase text-xs tracking-widest">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 transition-colors ${
                  activeTab === 'posts' ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/></svg>
                Posts
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex items-center gap-2 transition-colors ${
                  activeTab === 'followers' ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2h10a2 2 0 012 2v16l-7-3-7 3V4a2 2 0 012-2z"/></svg>
                Followers
                {followers.length > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {followers.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex items-center gap-2 transition-colors ${
                  activeTab === 'following' ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12l4-4h14a2 2 0 002-2V6a2 2 0 00-2-2z"/></svg>
                Following
                {following.length > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {following.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-1">
                  {memoizedMediaGrid}
                </div>
                
                {/* Load More Button for Posts */}
                {mediasNextPageId && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={loadMoreMedias}
                      disabled={isLoadingMoreMedias}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isLoadingMoreMedias ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        'Load More Posts'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'followers' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {memoizedFollowers}
                </div>
                
                {/* Load More Button for Followers */}
                {followersNextPageId && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={loadMoreFollowers}
                      disabled={isLoadingMore}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isLoadingMore ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        'Load More Followers'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'following' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {memoizedFollowing}
                </div>
                
                {/* Load More Button for Following */}
                {followingNextPageId && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={loadMoreFollowing}
                      disabled={isLoadingMore}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isLoadingMore ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        'Load More Following'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <StoriesViewer
        isOpen={isStoriesOpen}
        onClose={() => setIsStoriesOpen(false)}
        stories={stories}
        username={profile?.username}
      />
      <MediaModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        media={selectedMedia}
        profile={profile}
      />
      <SubscriptionUpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="View Instagram Profile"
        description="View detailed Instagram profiles with followers, following, and media analytics"
      />
    </div>
  );
};

export default ViewProfile;



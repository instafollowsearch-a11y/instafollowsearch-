import React, { useState, useRef, useEffect } from 'react';
import apiService from '../services/api';

const MediaModal = ({ isOpen, onClose, media, profile }) => {
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('media');
  const [likers, setLikers] = useState([]);
  const [comments, setComments] = useState([]);
  const [isFetchingLikers, setIsFetchingLikers] = useState(false);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentCarouselIndex(0);
      setIsVideoPlaying(false);
      setActiveTab('media');
      setLikers([]);
      setComments([]);
      setIsFetchingLikers(false);
      setIsFetchingComments(false);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && media.type === 'carousel') prevCarouselItem();
      if (e.key === 'ArrowRight' && media.type === 'carousel') nextCarouselItem();
      if (e.key === ' ' && media.type === 'video') {
        e.preventDefault();
        toggleVideoPlay();
      }
    };
    document.addEventListener('keydown', onKey);
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, media]);

  // Handle video play/pause
  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
  };

  // Handle video ended
  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
  };

  // Handle carousel navigation
  const nextCarouselItem = () => {
    if (media.type === 'carousel' && media.carouselItems) {
      setCurrentCarouselIndex((prev) => 
        prev < media.carouselItems.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevCarouselItem = () => {
    if (media.type === 'carousel' && media.carouselItems) {
      setCurrentCarouselIndex((prev) => 
        prev > 0 ? prev - 1 : media.carouselItems.length - 1
      );
    }
  };

  // Get current media item (for carousel or single media)
  const getCurrentMedia = () => {
    if (media.type === 'carousel' && media.carouselItems) {
      return media.carouselItems[currentCarouselIndex];
    }
    return media;
  };

  // On-demand fetchers for likers and comments
  const fetchLikers = async () => {
    if (isFetchingLikers || !media?.id) return;
    try {
      setIsFetchingLikers(true);
      const res = await apiService.getMediaLikers(media.id);
      const list = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.likers || res?.likers || []);
      const mapped = (list || []).map((liker) => ({
        id: liker.pk || liker.id,
        username: liker.username,
        fullName: liker.full_name || liker.fullName || '',
        profilePicUrl: liker.profile_pic_url || liker.profilePicUrl || '',
        isVerified: liker.is_verified || liker.isVerified || false,
        isPrivate: liker.is_private || liker.isPrivate || false,
      }));
      setLikers(mapped);
    } catch (e) {
      console.error('Failed to fetch media likers', e);
    } finally {
      setIsFetchingLikers(false);
    }
  };

  const fetchComments = async () => {
    if (isFetchingComments || !media?.id) return;
    try {
      setIsFetchingComments(true);
      const res = await apiService.getMediaComments(media.id);
      const list = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.comments || res?.comments || []);
      const mapped = (list || []).map((comment) => ({
        id: comment.pk || comment.id,
        text: comment.text || '',
        createdAt: comment.created_at ?? comment.created_at_utc ?? comment.createdAt ?? null,
        likeCount: comment.comment_like_count ?? comment.like_count ?? comment.likeCount ?? 0,
        hasLiked: comment.has_liked_comment ?? comment.has_liked ?? false,
        isLikedByMediaOwner: comment.is_liked_by_media_owner ?? false,
        user: {
          id: comment.user?.pk || comment.user?.id || comment.user_id || null,
          username: comment.user?.username || '',
          fullName: comment.user?.full_name || comment.user?.fullName || '',
          profilePicUrl: comment.user?.profile_pic_url || comment.user?.profilePicUrl || '',
          isVerified: comment.user?.is_verified || false,
          isPrivate: comment.user?.is_private || false,
        },
        previewChildComments: (comment.preview_child_comments || comment.previewChildComments || []).map((child) => ({
          id: child.pk || child.id,
          text: child.text || '',
          createdAt: child.created_at ?? child.created_at_utc ?? child.createdAt ?? null,
          likeCount: child.comment_like_count ?? child.like_count ?? child.likeCount ?? 0,
          hasLiked: child.has_liked_comment ?? child.has_liked ?? false,
          user: {
            id: child.user?.pk || child.user?.id || child.user_id || null,
            username: child.user?.username || '',
            fullName: child.user?.full_name || child.user?.fullName || '',
            profilePicUrl: child.user?.profile_pic_url || child.user?.profilePicUrl || '',
            isVerified: child.user?.is_verified || false,
            isPrivate: child.user?.is_private || false,
          },
        })),
      }));
      setComments(mapped);
    } catch (e) {
      console.error('Failed to fetch media comments', e);
    } finally {
      setIsFetchingComments(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  // Download function
  const handleDownload = async () => {
    try {
      const currentMedia = getCurrentMedia();
      const imageUrl = currentMedia.thumb || currentMedia.url || currentMedia.image || currentMedia.videoUrl;
      const proxiedUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instagram/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      
      const response = await fetch(proxiedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = currentMedia.type === 'video' ? 'mp4' : 'jpg';
      link.download = `instagram-media-${currentMedia.id || Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      const currentMedia = getCurrentMedia();
      window.open(currentMedia.thumb || currentMedia.url || currentMedia.image || currentMedia.videoUrl, '_blank');
    }
  };

  if (!isOpen || !media) return null;

  const currentMedia = getCurrentMedia();

  return (
    <div
      ref={overlayRef}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-[92vw] max-w-4xl max-h-[92vh] bg-slate-900 rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        {/* Header with avatar + username */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Collaboration display */}
            {media.isCollaboration ? (
              <div className="flex items-center gap-2">
                {/* Original poster */}
                <div className="relative w-9 h-9">
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instagram/proxy-image?url=${encodeURIComponent(media.originalUser?.profile_pic_url || '')}`}
                    alt={media.originalUser?.username}
                    className="absolute inset-0 w-full h-full rounded-full object-cover bg-slate-800"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/36/1F2937/FFFFFF?text=${media.originalUser?.username?.slice(0,2).toUpperCase()}`;
                    }}
                  />
                </div>
                <div className="text-white font-semibold">{media.originalUser?.username}</div>
                
                {/* Arrow */}
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>
                
                {/* Collaborator(s) */}
                <div className="flex items-center gap-1">
                  {media.collaborators?.slice(0, 2).map((collaborator, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="relative w-7 h-7">
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instagram/proxy-image?url=${encodeURIComponent(collaborator?.profile_pic_url || '')}`}
                          alt={collaborator?.username}
                          className="absolute inset-0 w-full h-full rounded-full object-cover bg-slate-800"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/28/1F2937/FFFFFF?text=${collaborator?.username?.slice(0,2).toUpperCase()}`;
                          }}
                        />
                      </div>
                      <div className="text-white font-semibold text-sm">{collaborator?.username}</div>
                      {index < media.collaborators.length - 1 && index < 1 && (
                        <span className="text-white/60">,</span>
                      )}
                    </div>
                  ))}
                  {media.collaborators?.length > 2 && (
                    <span className="text-white/60 text-sm">+{media.collaborators.length - 2}</span>
                  )}
                </div>
              </div>
            ) : (
              /* Regular post - show profile user */
              <>
                <div className="relative w-9 h-9">
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instagram/proxy-image?url=${encodeURIComponent(profile?.profilePicUrl || '')}`}
                    alt={profile?.username}
                    className="absolute inset-0 w-full h-full rounded-full object-cover bg-slate-800"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/36/1F2937/FFFFFF?text=${profile?.username?.slice(0,2).toUpperCase()}`;
                    }}
                  />
                </div>
                <div className="text-white font-semibold">{profile?.username}</div>
              </>
            )}
            
            {/* Carousel indicator */}
            {media.type === 'carousel' && (
              <div className="text-white/60 text-sm">
                {currentCarouselIndex + 1} of {media.carouselCount}
              </div>
            )}
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center border-b border-white/10">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'media' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTab('likers')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'likers' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Likers ({likers.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'comments' 
                  ? 'text-white border-b-2 border-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Comments ({comments.length || 0})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'media' && (
          <>
            {/* Media Container */}
        <div className="relative max-h-[70vh] overflow-auto bg-black">
          {/* Carousel Navigation Arrows */}
          {media.type === 'carousel' && media.carouselItems.length > 1 && (
            <>
              <button
                onClick={prevCarouselItem}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </button>
              <button
                onClick={nextCarouselItem}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                </svg>
              </button>
            </>
          )}

          {/* Media Content */}
          {currentMedia.type === 'video' ? (
            <div className="relative">
              <video
                ref={videoRef}
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instagram/proxy-image?url=${encodeURIComponent(currentMedia.videoUrl)}`}
                className="w-full h-auto max-h-[70vh] object-contain"
                controls={false}
                onEnded={handleVideoEnded}
                onError={(e) => {
                  console.error('Video failed to load:', e);
                }}
              />
              {/* Video Play/Pause Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={toggleVideoPlay}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                >
                  {isVideoPlaying ? (
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              {/* Video Duration */}
              {currentMedia.videoDuration && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {Math.floor(currentMedia.videoDuration)}s
                </div>
              )}
            </div>
          ) : (
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instagram/proxy-image?url=${encodeURIComponent(currentMedia.thumb || currentMedia.url || currentMedia.image)}`}
              alt="media"
              className="w-full h-auto max-h-[70vh] object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://via.placeholder.com/1200x800/111827/FFFFFF?text=Media`;
              }}
            />
          )}

          {/* Carousel Dots Indicator */}
          {media.type === 'carousel' && media.carouselItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {media.carouselItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCarouselIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentCarouselIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
          </>
        )}

        {/* Likers Tab */}
        {activeTab === 'likers' && (
          <div className="max-h-[70vh] overflow-auto bg-slate-800/50">
            <div className="p-4">
              <div className="space-y-3">
                {likers.length === 0 && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={fetchLikers}
                      disabled={isFetchingLikers}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isFetchingLikers ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Fetching Likers...
                        </>
                      ) : (
                        'Fetch Likers'
                      )}
                    </button>
                  </div>
                )}
                {(likers || []).map((liker, index) => (
                  <div key={liker.id || index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="relative w-10 h-10">
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instagram/proxy-image?url=${encodeURIComponent(liker.profilePicUrl || '')}`}
                        alt={liker.username}
                        className="w-full h-full rounded-full object-cover bg-slate-600"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/40/1F2937/FFFFFF?text=${liker.username?.slice(0,2).toUpperCase()}`;
                        }}
                      />
                      {liker.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">{liker.username}</h3>
                        {liker.isPrivate && (
                          <svg className="w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-white/70 truncate">{liker.fullName}</p>
                    </div>
                  </div>
                ))}
                
                {(likers || []).length === 0 && !isFetchingLikers && (
                  <div className="text-center py-8 text-white/60">
                    No likers found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="max-h-[70vh] overflow-auto bg-slate-800/50">
            <div className="p-4">
              <div className="space-y-4">
                {comments.length === 0 && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={fetchComments}
                      disabled={isFetchingComments}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isFetchingComments ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Fetching Comments...
                        </>
                      ) : (
                        'Fetch Comments'
                      )}
                    </button>
                  </div>
                )}
                {(comments || []).map((comment, index) => (
                  <div key={comment.id || index} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instagram/proxy-image?url=${encodeURIComponent(comment.user.profilePicUrl || '')}`}
                          alt={comment.user.username}
                          className="w-full h-full rounded-full object-cover bg-slate-600"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/32/1F2937/FFFFFF?text=${comment.user.username?.slice(0,2).toUpperCase()}`;
                          }}
                        />
                        {comment.user.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">{comment.user.username}</span>
                          {comment.user.isPrivate && (
                            <svg className="w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                            </svg>
                          )}
                          <span className="text-white/60 text-xs">{formatTimestamp(comment.createdAt)}</span>
                        </div>
                        <p className="text-white text-sm mb-2">{comment.text}</p>
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {comment.likeCount}
                          </div>
                          {comment.isLikedByMediaOwner && (
                            <span className="text-blue-400 text-xs">Liked by author</span>
                          )}
                        </div>
                        
                        {/* Child Comments */}
                        {comment.previewChildComments && comment.previewChildComments.length > 0 && (
                          <div className="mt-3 ml-4 space-y-2">
                            {comment.previewChildComments.map((child, childIndex) => (
                              <div key={child.id || childIndex} className="flex items-start gap-2">
                                <div className="relative w-6 h-6 flex-shrink-0">
                                  <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instagram/proxy-image?url=${encodeURIComponent(child.user.profilePicUrl || '')}`}
                                    alt={child.user.username}
                                    className="w-full h-full rounded-full object-cover bg-slate-600"
                                    onError={(e) => {
                                      e.currentTarget.src = `https://via.placeholder.com/24/1F2937/FFFFFF?text=${child.user.username?.slice(0,2).toUpperCase()}`;
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white text-xs">{child.user.username}</span>
                                    <span className="text-white/60 text-xs">{formatTimestamp(child.createdAt)}</span>
                                  </div>
                                  <p className="text-white text-xs">{child.text}</p>
                                  {child.likeCount > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <svg className="w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                      </svg>
                                      <span className="text-white/60 text-xs">{child.likeCount}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(comments || []).length === 0 && !isFetchingComments && (
                  <div className="text-center py-8 text-white/60">
                    No comments found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions - Only show for media tab */}
        {activeTab === 'media' && (
          <div className="p-4 flex items-center justify-between text-white/90 border-t border-white/10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="font-semibold">{media.likes || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4a2 2 0 00-2 2v12l4-4h14a2 2 0 002-2V6a2 2 0 00-2-2z"/>
                </svg>
                <span className="font-semibold">{media.comments || 0}</span>
              </div>
              {/* Media Type Indicator */}
              <div className="flex items-center gap-2 text-white/60 text-sm">
                {currentMedia.type === 'video' && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Video
                  </div>
                )}
                {media.type === 'carousel' && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                    </svg>
                    Carousel
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Download media"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaModal;
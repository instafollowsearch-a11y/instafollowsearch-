import React, { useState, useRef, useEffect } from 'react';

const MediaModal = ({ isOpen, onClose, media, profile }) => {
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentCarouselIndex(0);
      setIsVideoPlaying(false);
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

        {/* Actions */}
        <div className="p-4 flex items-center justify-between text-white/90 border-t border-white/10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="font-semibold">{media.likes}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4a2 2 0 00-2 2v12l4-4h14a2 2 0 002-2V6a2 2 0 00-2-2z"/>
              </svg>
              <span className="font-semibold">{media.comments}</span>
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
      </div>
    </div>
  );
};

export default MediaModal;
import React, { useState, useEffect, useRef } from 'react';
import { downloadStory, downloadAllStories } from '../utils/downloadUtils';
import { useToast } from '../contexts/ToastContext';

const StoriesViewer = ({ stories, isOpen, onClose, username, startIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const { showSuccess, showError } = useToast();

  // Reset index when stories change or modal opens
  useEffect(() => {
    if (isOpen) {
      const max = (stories?.length ?? 1) - 1;
      const safeIndex = Math.min(Math.max(startIndex, 0), Math.max(max, 0));
      setCurrentIndex(safeIndex);
      setIsVideoLoading(false);
      setIsPaused(false);
      setIsMuted(false); // Start with audio enabled
    }
  }, [isOpen, stories, startIndex]);

  // Sync video muted state when isMuted changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Auto-advance stories (only for images, videos handle their own timing)
  useEffect(() => {
    if (!isOpen || !stories || stories.length === 0 || isPaused) return;
    
    // Only auto-advance for images, videos handle their own timing via onEnded
    const currentStory = stories[currentIndex];
    if (currentStory.mediaType === 'video') return;

    const timer = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Close viewer when all stories are viewed
        setCurrentIndex(0);
        onClose();
      }
    }, 5000); // 5 seconds per story for images

    return () => clearTimeout(timer);
  }, [currentIndex, isOpen, stories, isPaused, onClose]);

  if (!isOpen || !stories || stories.length === 0) return null;

  const currentStory = stories[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === stories.length - 1;

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // If we're at the last story, go to the first one
      setCurrentIndex(0);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // If we're at the first story, go to the last one
      setCurrentIndex(stories.length - 1);
    }
  };

  const closeViewer = () => {
    setCurrentIndex(0);
    onClose();
  };

  const handleDownloadCurrent = async () => {
    try {
      setIsDownloading(true);
      await downloadStory(currentStory, username);
    } catch (error) {
      console.error('Download failed:', error);
      showError('Failed to download story');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      
      const results = await downloadAllStories(stories, username);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        showSuccess(`Successfully downloaded ${successCount} out of ${stories.length} stories`);
      } else {
        showError('Failed to download any stories');
      }
    } catch (error) {
      console.error('Batch download failed:', error);
      showError('Failed to download stories');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
      <div className="relative max-w-md w-full mx-4">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              {username ? username.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="text-white font-semibold">@{username}</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Download Current Story Button */}
            <button
              onClick={handleDownloadCurrent}
              disabled={isDownloading}
              className="px-3 py-1 bg-green-500/80 hover:bg-green-500 text-white text-xs font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              {isDownloading ? (
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              <span>Save</span>
            </button>
            
            {/* Download All Stories Button */}
            {stories.length > 1 && (
              <button
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="px-3 py-1 bg-blue-500/80 hover:bg-blue-500 text-white text-xs font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {isDownloading ? (
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                <span>All</span>
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={closeViewer}
              className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-16 left-4 right-4 z-10">
          <div className="flex space-x-1">
            {stories.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index <= currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
                style={{ width: `${100 / stories.length}%` }}
              />
            ))}
          </div>
        </div>

        {/* Story Content */}
        <div 
          className="relative bg-white rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
          onClick={nextStory}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {currentStory.mediaUrl ? (
            <div className="relative">
              {currentStory.mediaType === 'video' ? (
                <div className="relative">
                  {isVideoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    src={currentStory.mediaUrl}
                    className="w-full h-96 object-cover"
                    autoPlay
                    muted={isMuted}
                    playsInline
                    controls={false}
                    onLoadStart={() => setIsVideoLoading(true)}
                    onCanPlay={() => setIsVideoLoading(false)}
                    onError={(e) => {
                      console.error('Video error:', e);
                      setIsVideoLoading(false);
                    }}
                    onEnded={() => {
                      if (currentIndex < stories.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                      } else {
                        closeViewer();
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={`https://images.weserv.nl/?url=${encodeURIComponent(currentStory.mediaUrl)}`}
                    alt={`Story ${currentIndex + 1}`}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      // Try direct URL as fallback
                      if (e.target.src.includes('weserv.nl')) {
                        e.target.src = currentStory.mediaUrl;
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
                    onLoad={() => {
                      // Image loaded successfully
                    }}
                  />
                  {/* Fallback for failed image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 items-center justify-center hidden image-fallback">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-white/60 text-sm">Image failed to load</p>
                      <p className="text-white/40 text-xs mt-2">URL: {currentStory.mediaUrl}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Media Type Indicators - moved to bottom left to avoid overlap */}
              <div className="absolute bottom-4 left-4 flex space-x-2">
                {isPaused && (
                  <div className="bg-black/50 rounded-full p-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {currentStory.mediaType === 'video' && (
                  <div className="bg-black/50 rounded-full p-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.447.894l2-2a1 1 0 000-1.788l-2-2z" />
                    </svg>
                  </div>
                )}
                {currentStory.mediaType === 'video' && (
                  <button
                    onClick={() => {
                      const newMutedState = !isMuted;
                      setIsMuted(newMutedState);
                      if (videoRef.current) {
                        videoRef.current.muted = newMutedState;
                      }
                    }}
                    className="bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.794a1 1 0 011.383.87zM12.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4.617-3.794a1 1 0 011.383.87z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <svg className="w-16 h-16 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Story Info */}
          <div className="p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">
                Story {currentIndex + 1} of {stories.length}
              </span>
              <span className="text-gray-500 text-xs capitalize">
                {currentStory.mediaType || 'Unknown type'}
              </span>
            </div>
            
            {currentStory.duration && (
              <p className="text-gray-500 text-xs mb-2">
                Duration: {currentStory.duration.toFixed(1)}s
              </p>
            )}
            
            {currentStory.takenAt && (
              <p className="text-gray-500 text-xs">
                {new Date(currentStory.takenAt * 1000).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevStory();
            }}
            className="p-3 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80 transition-all duration-200 ml-4"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextStory();
            }}
            className="p-3 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80 transition-all duration-200 mr-4"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Keyboard Navigation */}
        <div className="absolute inset-0" tabIndex={0} onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') prevStory();
          if (e.key === 'ArrowRight') nextStory();
          if (e.key === 'Escape') closeViewer();
        }} />
      </div>
    </div>
  );
};

export default StoriesViewer; 
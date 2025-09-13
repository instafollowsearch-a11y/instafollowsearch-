import React, { useState, useEffect } from 'react';

// Utility function to proxy Instagram images through our backend
export const proxyImageUrl = (originalUrl) => {
  if (!originalUrl) return null;
  
  // If it's already a relative URL or our domain, return as is
  if (originalUrl.startsWith('/') || originalUrl.includes(window.location.hostname)) {
    return originalUrl;
  }
  
  // If it's an Instagram URL, proxy it
  if (originalUrl.includes('instagram.com') || originalUrl.includes('cdninstagram.com')) {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `/api/instagram/proxy-image?url=${encodedUrl}`;
  }
  
  // For other URLs, return as is
  return originalUrl;
};

// Hook for handling image errors with fallback
export const useImageWithFallback = (imageUrl, fallbackUrl = null) => {
  const [currentUrl, setCurrentUrl] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentUrl(imageUrl);
    setHasError(false);
  }, [imageUrl]);

  const handleError = () => {
    if (!hasError && fallbackUrl) {
      setCurrentUrl(fallbackUrl);
      setHasError(true);
    }
  };

  return {
    src: currentUrl,
    onError: handleError,
    hasError
  };
}; 
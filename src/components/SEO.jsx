import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SITE_CONFIG from '../config/site';

const SEO = ({ 
  title = "FollowerSearch - Instagram Followers Analytics & Search Tool",
  description = "Find and analyze Instagram followers with our powerful search tool. Get detailed analytics, follower insights, and growth strategies for your Instagram account.",
  keywords = "instagram followers, instagram analytics, instagram search, social media tools, instagram growth, follower analysis",
  image = "/og-image.png",
  url = null,
  canonicalUrl = null
}) => {
  // Use site config if URL not provided
  const baseUrl = url || SITE_CONFIG.getBaseUrl();
  const location = useLocation();

  useEffect(() => {
    // Determine the canonical URL - use provided canonicalUrl or construct from baseUrl + pathname
    const finalCanonicalUrl = canonicalUrl || (baseUrl + location.pathname);
    const finalOgUrl = baseUrl.includes(location.pathname) ? baseUrl : (baseUrl + location.pathname);
    
    // Update document title
    document.title = title;
    
    // Update meta description
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', finalOgUrl, 'property');
    
    // Update Twitter Card tags
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', image, 'name');
    
    // Update canonical URL
    updateCanonicalUrl(finalCanonicalUrl);
    
  }, [title, description, keywords, image, baseUrl, canonicalUrl, location.pathname]);

  const updateMetaTag = (name, content, attribute = 'name') => {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  const updateCanonicalUrl = (url) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  };

  return null;
};

export default SEO;

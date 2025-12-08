/**
 * Site Configuration
 * 
 * This file centralizes the base URL for the frontend application.
 * Change the BASE_URL value to switch between local development and production.
 * 
 * IMPORTANT: Before deploying to production, change BASE_URL to the production domain.
 * 
 * Usage:
 *   - Local development: 'http://localhost:3001'
 *   - Production: 'https://instafollowcheck.com'
 * 
 * This config is used for:
 *   - SEO canonical URLs
 *   - Open Graph URLs
 *   - Structured data URLs
 *   - Any absolute URL references
 */

const SITE_CONFIG = {
  // Base URL for the frontend site
  // ⚠️ PRODUCTION CONFIGURATION ⚠️
  BASE_URL: 'https://instafollowcheck.com', // Production URL
  
  // Helper function to get the base URL
  getBaseUrl: () => {
    return SITE_CONFIG.BASE_URL;
  },
  
  // Helper function to get full URL for a path
  getUrl: (path = '') => {
    const base = SITE_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }
};

export default SITE_CONFIG;


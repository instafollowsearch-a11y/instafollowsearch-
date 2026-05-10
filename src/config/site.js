/**
 * Site Configuration
 *
 * This file centralizes the base URL for the frontend application.
 */

const SITE_CONFIG = {
  BASE_URL: 'https://instafollowcheck.com',

  getBaseUrl: () => SITE_CONFIG.BASE_URL,

  getUrl: (path = '') => {
    const base = SITE_CONFIG.BASE_URL.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }
};

export default SITE_CONFIG;

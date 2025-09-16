import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  url, 
  ogImage, 
  type = 'website',
  structuredData 
}) => {
  const defaultTitle = "InstaFollowCheck - Instagram Followers Analytics & Search Tool";
  const defaultDescription = "Find and analyze Instagram followers with our powerful search tool. Get detailed analytics, follower insights, and growth strategies for your Instagram account.";
  const defaultKeywords = "instagram followers, instagram analytics, instagram search, social media tools, instagram growth, follower analysis";
  const defaultUrl = "https://instafollowcheck.com";
  const defaultOgImage = "https://instafollowcheck.com/og-image.png";

  const pageTitle = title ? `${title} | InstaFollowCheck` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageUrl = url || defaultUrl;
  const pageOgImage = ogImage || defaultOgImage;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={pageUrl} />
      
      {/* Enhanced Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={pageDescription} />
      <meta property="og:site_name" content="InstaFollowCheck" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageOgImage} />
      <meta name="twitter:image:alt" content={pageDescription} />
      <meta name="twitter:creator" content="@instafollowcheck" />
      <meta name="twitter:site" content="@instafollowcheck" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="application-name" content="InstaFollowCheck" />
      <meta name="apple-mobile-web-app-title" content="InstaFollowCheck" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

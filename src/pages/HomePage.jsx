import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import About from '../components/About';
import SEO from '../components/SEO';
import StructuredData from '../components/StructuredData';
import SITE_CONFIG from '../config/site';

const HomePage = () => {
  return (
    <>
      <SEO 
        title="Search Instagram Following & Blocked Pages | Admirer Tracker – InstaFollowCheck"
        description="Track Instagram followers, view blocked pages, and discover admirers easily with InstaFollowCheck. Analyze activity and monitor profiles efficiently."
        keywords="instagram followers, instagram analytics, instagram search, social media tools, instagram growth, follower analysis"
        canonicalUrl={SITE_CONFIG.getUrl('/')}
      />
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "InstaFollowCheck",
        "description": "Instagram followers analytics and search tool",
        "url": SITE_CONFIG.getBaseUrl(),
        "applicationCategory": "SocialMediaApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Instagram follower analytics",
          "Follower search and tracking",
          "Instagram growth insights",
          "Social media analytics"
        ]
      }} />
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <About />
      <Footer />
    </>
  );
};

export default HomePage;


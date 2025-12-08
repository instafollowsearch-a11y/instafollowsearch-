import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Features from '../components/Features';
import SEO from '../components/SEO';
import SITE_CONFIG from '../config/site';

const FeaturesPage = () => {
  return (
    <>
      <SEO 
        title="Features | Instagram Analytics Tools – InstaFollowCheck"
        description="Discover powerful Instagram analytics features including follower tracking, activity monitoring, and profile insights with InstaFollowCheck."
        keywords="instagram features, instagram analytics features, follower tracking, instagram tools"
        canonicalUrl={SITE_CONFIG.getUrl('/Features/')}
      />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Features />
      </div>
      <Footer />
    </>
  );
};

export default FeaturesPage;


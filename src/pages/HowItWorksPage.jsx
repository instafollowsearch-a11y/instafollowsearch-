import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HowItWorks from '../components/HowItWorks';
import SEO from '../components/SEO';
import SITE_CONFIG from '../config/site';

const HowItWorksPage = () => {
  return (
    <>
      <SEO 
        title="How It Works | Instagram Analytics Guide – InstaFollowCheck"
        description="Learn how to use InstaFollowCheck to track Instagram activity, analyze followers, and monitor profiles easily and anonymously."
        keywords="how instafollowcheck works, instagram analytics guide, follower tracking tutorial"
        canonicalUrl={SITE_CONFIG.getUrl('/How It Works/')}
      />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <HowItWorks />
      </div>
      <Footer />
    </>
  );
};

export default HowItWorksPage;


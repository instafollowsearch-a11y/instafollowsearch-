import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Pricing from '../components/Pricing';
import SEO from '../components/SEO';
import SITE_CONFIG from '../config/site';

const PricingPageSection = () => {
  return (
    <>
      <SEO 
        title="Pricing | Instagram Analytics Plans – InstaFollowCheck"
        description="Choose the perfect Instagram analytics plan for your needs. Compare pricing and features for Basic, Premium, and Pro plans."
        keywords="instagram pricing, instagram analytics pricing, follower tracking plans"
        canonicalUrl={SITE_CONFIG.getUrl('/Pricing/')}
      />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Pricing />
      </div>
      <Footer />
    </>
  );
};

export default PricingPageSection;


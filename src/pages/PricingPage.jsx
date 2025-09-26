import React from 'react';
import Pricing from '../components/Pricing';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const PricingPage = () => {
  return (
    <>
      <SEO 
        title="Pricing Plans - InstaFollowCheck"
        description="Choose the perfect plan for your Instagram analytics needs. Start free or upgrade to Premium for advanced features."
        keywords="instagram pricing, instagram analytics pricing, social media tools pricing, instagram followers pricing"
        url="https://instafollowcheck.com/pricing"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <main>
          <Pricing />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PricingPage;

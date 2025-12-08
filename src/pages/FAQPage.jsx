import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FAQ from '../components/FAQ';
import SEO from '../components/SEO';
import SITE_CONFIG from '../config/site';

const FAQPage = () => {
  return (
    <>
      <SEO 
        title="FAQ | Frequently Asked Questions – InstaFollowCheck"
        description="Find answers to frequently asked questions about InstaFollowCheck, Instagram analytics, follower tracking, and account monitoring."
        keywords="instafollowcheck faq, instagram analytics questions, follower tracking help"
        canonicalUrl={SITE_CONFIG.getUrl('/FAQ/')}
      />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <FAQ />
      </div>
      <Footer />
    </>
  );
};

export default FAQPage;


import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import About from '../components/About';
import SEO from '../components/SEO';
import SITE_CONFIG from '../config/site';

const AboutPage = () => {
  return (
    <>
      <SEO 
        title="About | InstaFollowCheck – Instagram Analytics Platform"
        description="Learn about InstaFollowCheck, our mission to provide transparent Instagram analytics and help users track follower activity anonymously."
        keywords="about instafollowcheck, instagram analytics platform, follower tracking company"
        canonicalUrl={SITE_CONFIG.getUrl('/About/')}
      />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <About />
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;


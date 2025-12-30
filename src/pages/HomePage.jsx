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
      {/* SEO Keyword Content Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              InstaFollowCheck is your comprehensive solution for <strong className="text-white">checking Instagram followers</strong>, <strong className="text-white">searching Instagram following</strong> lists, and using our powerful <strong className="text-white">follow checker for Instagram</strong>. Our advanced <strong className="text-white">Instagram follow checker</strong> helps you discover who's following whom, <strong className="text-white">search blocked page on Instagram</strong>, and identify connections. Whether you need an <strong className="text-white">app to check Instagram admirers</strong> or want to use our <strong className="text-white">Instagram admirer tracker</strong>, we provide all the tools you need to analyze Instagram relationships and activity efficiently and anonymously.
            </p>
          </div>
        </div>
      </section>
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


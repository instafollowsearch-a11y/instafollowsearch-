import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import About from './components/About';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import DashboardSearch from './components/DashboardSearch';
import SharedActivity from './pages/SharedActivity';
// import Admirers from './pages/Admirers';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';
import SEO from './components/SEO.jsx';
import StructuredData from './components/StructuredData.jsx';

function App() {
  useEffect(() => {
    // Handle global auth modal events
    const handleShowAuthModal = () => {
      // Dispatch event to Header component
      document.dispatchEvent(new CustomEvent('openAuthModal'));
    };

    document.addEventListener('showAuthModal', handleShowAuthModal);
    
    return () => {
      document.removeEventListener('showAuthModal', handleShowAuthModal);
    };
  }, []);
  return (
    <ToastProvider>
      <SubscriptionProvider>
        <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Routes>
          {/* Main landing page */}
          <Route path="/" element={
            <>
              <SEO 
                title="InstaFollowCheck - Instagram Followers Analytics & Search Tool"
                description="Find and analyze Instagram followers with our powerful search tool. Get detailed analytics, follower insights, and growth strategies for your Instagram account."
                keywords="instagram followers, instagram analytics, instagram search, social media tools, instagram growth, follower analysis"
                url="https://instafollowcheck.com"
              />
              <StructuredData data={{
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "InstaFollowCheck",
                "description": "Instagram followers analytics and search tool",
                "url": "https://instafollowcheck.com",
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
          } />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/search" element={<DashboardSearch />} />
          
          {/* Shared Activity */}
          <Route path="/sharedactivity" element={<SharedActivity />} />
          
          {/* Admirers */}
          {/* <Route path="/admirers" element={<Admirers />} /> */}
          
          {/* Payment pages */}
          <Route path="/successfulpayment" element={<PaymentSuccess />} />
          <Route path="/paymentfailed" element={<PaymentCancel />} />
          
          {/* User Profile */}
          <Route path="/profile" element={<UserProfile />} />
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        </Router>
      </SubscriptionProvider>
    </ToastProvider>
  );
}

export default App;
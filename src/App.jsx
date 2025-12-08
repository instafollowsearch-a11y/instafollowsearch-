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
import Admirers from './pages/Admirers';
import ViewProfile from './pages/ViewProfile';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import UserProfile from './pages/UserProfile';
import PricingPage from './pages/PricingPage';
import Blog from './pages/Blog';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPageSection from './pages/PricingPageSection';
import HowItWorksPage from './pages/HowItWorksPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
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

  // Handle hash navigation on page load
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && window.location.pathname === '/') {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Handle initial hash
    handleHashNavigation();

    // Handle hash changes
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);
  return (
    <ToastProvider>
      <SubscriptionProvider>
        <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Routes>
          {/* Main landing page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Separate section pages for SEO */}
          <Route path="/Home" element={<HomePage />} />
          <Route path="/Home/" element={<HomePage />} />
          <Route path="/Features" element={<FeaturesPage />} />
          <Route path="/Features/" element={<FeaturesPage />} />
          <Route path="/Pricing" element={<PricingPageSection />} />
          <Route path="/Pricing/" element={<PricingPageSection />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/how-it-works/" element={<HowItWorksPage />} />
          <Route path="/FAQ" element={<FAQPage />} />
          <Route path="/FAQ/" element={<FAQPage />} />
          <Route path="/About" element={<AboutPage />} />
          <Route path="/About/" element={<AboutPage />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/search" element={<DashboardSearch />} />
          
          {/* Shared Activity */}
          <Route path="/sharedactivity" element={<SharedActivity />} />
          
          {/* Admirers */}
          <Route path="/admirers" element={<Admirers />} />
          
          {/* View Instagram Profile */}
          <Route path="/viewprofile" element={<ViewProfile />} />
          
          {/* Payment pages */}
          <Route path="/successfulpayment" element={<PaymentSuccess />} />
          <Route path="/paymentfailed" element={<PaymentCancel />} />
          
          {/* User Profile */}
          <Route path="/profile" element={<UserProfile />} />
          
          {/* Pricing Page */}
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* Blog Page */}
          <Route path="/blog" element={<Blog />} />
          
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
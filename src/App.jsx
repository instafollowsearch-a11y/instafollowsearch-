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
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

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
          
          {/* Payment pages */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          
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
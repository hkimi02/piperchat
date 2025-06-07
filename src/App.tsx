import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestLayout from '@/layouts/GuestLayout';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import LandingPage from '@/pages/LandingPage';
import FeaturesPage from '@/pages/FeaturesPage';
import PricingPage from '@/pages/PricingPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import NotFoundPage from '@/pages/NotFoundPage';
// Import auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
// Import route components
import PublicRoute from '@/router/components/PublicRoute';
import ProtectedRoute from '@/router/components/ProtectedRoute';
// Future imports for other pages:
// import DashboardPage from '@/pages/dashboard/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing Pages */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Route>

        {/* Auth Pages - Only accessible when NOT authenticated */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes - Only accessible when authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<div>Authenticated Dashboard (Placeholder)</div>} />
            {/* Add other authenticated routes here */}
          </Route>
        </Route>

        {/* Catch-all 404 Not Found Page - Must be the last route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

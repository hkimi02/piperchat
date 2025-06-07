import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestLayout from '@/layouts/GuestLayout';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import LandingPage from '@/pages/LandingPage';
// Import new pages
import FeaturesPage from '@/pages/FeaturesPage';
import PricingPage from '@/pages/PricingPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
// Future imports for other pages:
// import LoginPage from '@/pages/auth/LoginPage';
// import RegisterPage from '@/pages/auth/RegisterPage';
// import DashboardPage from '@/pages/dashboard/DashboardPage';

function App() {
  // This is a placeholder. In a real app, this would come from an auth context or similar.
  const isAuthenticated = false;

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          // Authenticated Routes
          <Route element={<AuthenticatedLayout />}>
            {/* Example: <Route path="/dashboard" element={<DashboardPage />} /> */}
            {/* Add other authenticated routes here. For now, none are defined. */}
            {/* If no specific authenticated route matches, you might want a default one or a redirect. */}
            {/* As a fallback for now, if authenticated but no route matches inside, it might show a blank page or AuthenticatedLayout's base structure. */}
            {/* We can define a default authenticated route like an index for the AuthenticatedLayout later. */}
            <Route path="/" element={<div>Authenticated Home (Placeholder)</div>} /> {/* Placeholder for authenticated root */}
          </Route>
        ) : (
          // Guest Routes
          <Route element={<GuestLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            {/* Example: <Route path="/login" element={<LoginPage />} /> */}
            {/* Example: <Route path="/register" element={<RegisterPage />} /> */}
            {/* Add other guest routes here */}
          </Route>
        )}
        {/* You could add a catch-all 404 route here if needed */}
        {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
      </Routes>
    </Router>
  );
}

export default App;

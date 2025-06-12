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
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import DashboardPage from '@/pages/DashboardPage';

import PublicRoute from '@/router/components/PublicRoute';
import ProtectedRoute from '@/router/components/ProtectedRoute';
import { Provider } from 'react-redux';
import store from '@/store/store.ts';
import { Toaster } from 'react-hot-toast';
import KanbanPage from "@/pages/KanabanPage.tsx";

function App() {
  return (
      <Provider store={store}>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
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
              <Route path="/register" element={<RegisterPage />} />s
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>

            {/* Protected Routes - Only accessible when authenticated */}
            <Route element={<ProtectedRoute></ProtectedRoute>}>
              <Route element={<AuthenticatedLayout />}>

                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/kanban/:projectId" element={<KanbanPage />} />
              </Route>
            </Route>

            {/* Catch-all 404 Not Found Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </Provider>
  );
}

export default App;
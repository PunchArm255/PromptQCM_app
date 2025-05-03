import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { account } from './lib/appwrite';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Pages
import { Welcome } from './pages/welcome';
import { SignIn } from './pages/signin';
import { SignUp } from './pages/signup';
import { Home } from './pages/home';
import { Library } from './pages/library';
import { Modules } from './pages/modules';
import { Reports } from './pages/reports';
import { Settings } from './pages/settings';

// Layout component
import Layout from './components/Layout';

// Animation wrapper
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes with Layout */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/library" element={
          <ProtectedRoute>
            <Layout>
              <Library />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/modules" element={
          <ProtectedRoute>
            <Layout>
              <Modules />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = await account.get();
        setUser(user);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    checkUserStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#EAEFFB]">
        <div className="w-16 h-16 border-t-4 border-[#AF42F6] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/signin" replace />;
};
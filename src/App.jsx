import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { getCurrentUser } from './lib/appwrite';
import { useState, useEffect } from 'react';
import { DarkModeProvider, useDarkMode } from './lib/DarkModeContext';
import { LanguageProvider } from './lib/LanguageContext';

// Pages
import { Welcome } from './pages/welcome';
import { SignIn } from './pages/signin';
import { SignUp } from './pages/signup';
import { AuthCallback } from './pages/AuthCallback';
import { Home } from './pages/home';
import { Library } from './pages/library';
import { Modules } from './pages/modules';
import { Reports } from './pages/reports';
import { Settings } from './pages/settings';
import { Generate } from './pages/generate';
import { Upload } from './pages/upload';

// Layout component
import Layout from './components/Layout';

export default function App() {
  return (
    <LanguageProvider>
      <DarkModeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth-callback" element={<AuthCallback />} />

            {/* Protected routes with Layout - using a single Layout instance for all routes */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/home" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/upload" element={<Upload />} />
            </Route>

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </DarkModeProvider>
    </LanguageProvider>
  );
}

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
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
      <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'bg-[#181A20]' : 'bg-[#EAEFFB]'}`}>
        <div className="w-16 h-16 border-t-4 border-[#AF42F6] border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/signin" replace />;
};
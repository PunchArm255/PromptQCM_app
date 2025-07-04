import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, logoutUser } from '../lib/appwrite';
import { useDarkMode } from '../lib/DarkModeContext';
import { useLanguage } from '../lib/LanguageContext';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Logo from '../assets/icons/logo.svg';
import LogoDark from '../assets/icons/logoDark.svg';

const Layout = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [greeting, setGreeting] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isDarkMode, colors } = useDarkMode();
    const { translate } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const refreshUserData = useCallback(async () => {
        console.log("Refreshing user data...");
        try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                console.log("Refreshed user data:", currentUser);
                setUser(currentUser);
                return currentUser;
            } else {
                console.log("No user found during refresh");
                navigate('/signin');
                return null;
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
            return null;
        }
    }, [navigate]);

    useEffect(() => {
        const getUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    navigate('/signin');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                navigate('/signin');
            }
        };
        getUser();
    }, [navigate]);

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) return 'Good Morning';
            if (hour < 18) return 'Good Afternoon';
            return 'Good Evening';
        };
        setGreeting(getGreeting());
    }, []);

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            await logoutUser();
            navigate('/signin');
        } catch (error) {
            setError(error.message);
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Determine active nav item from location path
    const getActiveNavItem = () => {
        const path = location.pathname;
        if (path === '/home') return 'Dashboard';
        if (path === '/library') return 'Library';
        if (path === '/modules') return 'Modules';
        if (path === '/reports') return 'Reports';
        if (path === '/settings') return 'Settings';
        return 'Dashboard';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ backgroundColor: colors.bgElevated }}
            className="flex h-screen overflow-hidden font-gotham"
        >
            {/* Desktop Sidebar */}
            <Sidebar
                user={user}
                activeNavItem={getActiveNavItem()}
                handleLogout={handleLogout}
                isLoading={isLoading}
            />

            {/* Mobile Sidebar - positioned to cover the header */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <MobileSidebar
                        user={user}
                        activeNavItem={getActiveNavItem()}
                        toggleMobileMenu={toggleMobileMenu}
                        handleLogout={handleLogout}
                        isLoading={isLoading}
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 overflow-y-auto relative"
            >
                {/* Mobile Header with centered logo */}
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
                    className="lg:hidden fixed top-6 left-0 right-0 z-20 mx-4 flex items-center justify-between rounded-xl shadow-md px-4 py-3"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleMobileMenu}
                        style={{ backgroundColor: colors.bgSecondary, color: colors.textPrimary }}
                        className="p-2 rounded-full hover:bg-opacity-80 transition-colors z-30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </motion.button>

                    {/* Centered Logo */}
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                        <img src={isDarkMode ? LogoDark : Logo} alt="PromptQCM" className="h-8 w-auto" />
                    </div>

                    {/* Invisible element to balance the header */}
                    <div className="w-10 h-10 opacity-0"></div>
                </motion.div>

                {/* Add padding at the top on mobile to account for the floating header */}
                <div className="lg:pt-0 pt-20">
                    {/* Dynamic content with Outlet */}
                    <Outlet context={{ user, greeting, refreshUserData }} />
                </div>
            </motion.div>

            {/* Custom styles */}
            <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* For the progress bars and chart animations */
        @keyframes gradient-pulse {
          0% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
          100% {
            filter: brightness(1);
          }
        }
        
        .gradient-border {
          background-image: linear-gradient(#F6F8FC, #F6F8FC), linear-gradient(to right, #00CAC3, #AF42F6);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          border: 2px solid transparent;
        }
      `}</style>
        </motion.div>
    );
};

export default Layout; 
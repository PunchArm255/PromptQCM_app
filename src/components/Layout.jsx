import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '../lib/appwrite';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import React from 'react';

const Layout = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [greeting, setGreeting] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const getUser = async () => {
            try {
                const currentUser = await account.get();
                setUser(currentUser);
            } catch (error) {
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
            await account.deleteSession('current');
            navigate('/');
        } catch (error) {
            setError(error.message);
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

    // Clone the child element and pass additional props
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                layoutUser: user,
                layoutGreeting: greeting
            });
        }
        return child;
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex h-screen bg-[#EAEFFB] overflow-hidden font-gotham"
        >
            {/* Mobile Menu Toggle */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:hidden fixed top-4 left-4 z-30"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-full bg-[#F5F6FF] shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </motion.button>
            </motion.div>

            {/* Desktop Sidebar */}
            <Sidebar
                user={user}
                activeNavItem={getActiveNavItem()}
                handleLogout={handleLogout}
            />

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <MobileSidebar
                        user={user}
                        activeNavItem={getActiveNavItem()}
                        toggleMobileMenu={toggleMobileMenu}
                        handleLogout={handleLogout}
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 overflow-y-auto"
            >
                {childrenWithProps}
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
      `}</style>
        </motion.div>
    );
};

export default Layout; 
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useDarkMode } from '../lib/DarkModeContext';
import { useLanguage } from '../lib/LanguageContext';
import { getProfileImageUrl } from '../lib/appwrite';
import { useState, useEffect } from 'react';
import Logo from '../assets/icons/logo.svg';
import LogoDark from '../assets/icons/logoDark.svg';
import DashboardIcon from '../assets/icons/dashboard.svg';
import DashboardIconDark from '../assets/icons/dashboardDark.svg';
import LibraryIcon from '../assets/icons/library.svg';
import LibraryIconDark from '../assets/icons/libraryDark.svg';
import ModulesIcon from '../assets/icons/modules.svg';
import ModulesIconDark from '../assets/icons/modulesDark.svg';
import ReportsIcon from '../assets/icons/reports.svg';
import ReportsIconDark from '../assets/icons/reportsDark.svg';
import SettingsIcon from '../assets/icons/settings.svg';
import SettingsIconDark from '../assets/icons/settingsDark.svg';
import ProfilePlaceholder from '../assets/icons/profile.svg';
import ProfilePlaceholderDark from '../assets/icons/profileDark.svg';

const Sidebar = ({ user, activeNavItem, handleLogout, isLoading }) => {
    const { isDarkMode, colors } = useDarkMode();
    const { translate } = useLanguage();
    const [profileImageUrl, setProfileImageUrl] = useState(null);

    useEffect(() => {
        // Get the profile image URL if the user has one
        const fetchProfileImage = async () => {
            try {
                console.log("Fetching profile image. User:", user);
                console.log("Profile image ID:", user?.profile?.profileImageId);

                if (user?.profile?.profileImageId) {
                    const imageUrl = getProfileImageUrl(user.profile.profileImageId);
                    console.log("Profile image URL:", imageUrl);
                    setProfileImageUrl(imageUrl);
                }
            } catch (error) {
                console.error('Error fetching profile image:', error);
            }
        };

        if (user) {
            fetchProfileImage();
        }
    }, [user]);

    // Force re-render when activeNavItem changes (like when visiting Settings)
    useEffect(() => {
        if (activeNavItem === 'Settings' && user?.profile?.profileImageId) {
            const imageUrl = getProfileImageUrl(user.profile.profileImageId);
            setProfileImageUrl(imageUrl);
        }
    }, [activeNavItem, user]);

    // Animation configs
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    // Navigation items
    const navItems = [
        { name: 'Dashboard', icon: isDarkMode ? DashboardIconDark : DashboardIcon, path: '/home' },
        { name: 'Library', icon: isDarkMode ? LibraryIconDark : LibraryIcon, path: '/library' },
        { name: 'Modules', icon: isDarkMode ? ModulesIconDark : ModulesIcon, path: '/modules' },
        { name: 'Reports', icon: isDarkMode ? ReportsIconDark : ReportsIcon, path: '/reports' },
        { name: 'Settings', icon: isDarkMode ? SettingsIconDark : SettingsIcon, path: '/settings' },
    ];

    return (
        <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ backgroundColor: colors.bgPrimary }}
            className="hidden lg:flex w-64 rounded-r-4xl shadow-lg flex-col items-center py-10 px-4 z-20"
        >
            {/* Logo */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-12 flex items-center gap-2"
            >
                <img src={isDarkMode ? LogoDark : Logo} alt="PromptQCM" className="h-12" />
            </motion.div>

            {/* Navigation */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col w-full space-y-2 mb-auto"
            >
                {navItems.map((item, index) => (
                    <motion.div
                        key={item.name}
                        variants={itemVariants}
                        custom={index}
                        whileHover={{ x: 5 }}
                    >
                        <Link
                            to={item.path}
                            style={{
                                backgroundColor: activeNavItem === item.name
                                    ? colors.bgAccent
                                    : 'transparent',
                                color: colors.textPrimary
                            }}
                            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 hover:bg-opacity-80 ${activeNavItem === item.name ? 'shadow' : ''}`}
                        >
                            <img src={item.icon} alt={item.name} className="w-5 h-5 mr-3" />
                            <span className="font-medium text-base">{translate(item.name)}</span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* User Profile */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{ backgroundColor: colors.bgAccent }}
                className="mt-8 rounded-lg p-3 w-full flex items-center"
            >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200">
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt={user?.name || 'User'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                console.error('Error loading profile image, falling back to placeholder');
                                e.target.onerror = null;
                                e.target.src = isDarkMode ? ProfilePlaceholderDark : ProfilePlaceholder;
                            }}
                        />
                    ) : (
                        <img
                            src={isDarkMode ? ProfilePlaceholderDark : ProfilePlaceholder}
                            alt={user?.name || 'User'}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                <div className="ml-3">
                    <p style={{ color: colors.textPrimary }} className="font-semibold text-s">{user?.name || 'User'}</p>
                    <p style={{ color: colors.textSecondary }} className="text-xs">Student</p>
                </div>
            </motion.div>

            {/* Logout button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ backgroundColor: colors.errorBg }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                disabled={isLoading}
                style={{
                    backgroundColor: colors.errorBg,
                    color: colors.error
                }}
                className="mt-4 flex items-center justify-center gap-2 text-sm p-3 w-full rounded-lg disabled:opacity-50"
            >
                <FiLogOut size={16} />
                <span>{isLoading ? translate('Logging out...') : translate('Logout')}</span>
            </motion.button>
        </motion.div>
    );
};

export default Sidebar; 
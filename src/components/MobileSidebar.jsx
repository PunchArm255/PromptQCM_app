import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useDarkMode } from '../lib/DarkModeContext';
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

const MobileSidebar = ({ user, activeNavItem, toggleMobileMenu, handleLogout }) => {
    const { isDarkMode, colors } = useDarkMode();

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={toggleMobileMenu}
        >
            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ backgroundColor: colors.bgPrimary }}
                className="w-64 h-full shadow-lg flex flex-col items-center py-8 px-4 absolute top-0 left-0 rounded-tr-xl rounded-br-xl"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8"
                >
                    <img src={isDarkMode ? LogoDark : Logo} alt="PromptQCM" className="h-12" />
                </motion.div>

                {/* Navigation */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col w-full space-y-3 mb-auto"
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
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 hover:bg-opacity-80 ${activeNavItem === item.name ? 'shadow-md' : ''}`}
                                onClick={() => {
                                    toggleMobileMenu();
                                }}
                            >
                                <img src={item.icon} alt={item.name} className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* User Profile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    style={{ backgroundColor: colors.bgAccent }}
                    className="mt-8 rounded-lg p-3 w-full flex items-center"
                >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt={user?.name || 'User'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={isDarkMode ? ProfilePlaceholderDark : ProfilePlaceholder}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="ml-3">
                        <p style={{ color: colors.textPrimary }} className="font-semibold text-base">{user?.name || 'User'}</p>
                        <p style={{ color: colors.textSecondary }} className="text-xs">Student</p>
                    </div>
                </motion.div>

                {/* Logout button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ backgroundColor: colors.errorBg }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    style={{
                        backgroundColor: colors.errorBg,
                        color: colors.error
                    }}
                    className="mt-4 flex items-center justify-center gap-2 text-sm p-3 w-full rounded-lg"
                >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default MobileSidebar; 
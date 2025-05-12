import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import Logo from '../assets/icons/logo.svg';
import DashboardIcon from '../assets/icons/dashboard.svg';
import LibraryIcon from '../assets/icons/library.svg';
import ModulesIcon from '../assets/icons/modules.svg';
import ReportsIcon from '../assets/icons/reports.svg';
import SettingsIcon from '../assets/icons/settings.svg';
import ProfilePlaceholder from '../assets/icons/profile.svg';

const MobileSidebar = ({ user, activeNavItem, toggleMobileMenu, handleLogout, isDarkMode = false }) => {
    // Background colors based on dark mode
    const bgPrimary = isDarkMode ? "#1E1E1E" : "#F5F6FF";
    const bgSecondary = isDarkMode ? "#2D2D2D" : "#FFFFFF";
    const bgAccent = isDarkMode ? "#3D3D3D" : "#F6F8FC";
    const textPrimary = isDarkMode ? "#FFFFFF" : "#252525";
    const textSecondary = isDarkMode ? "#E0E0E0" : "#6B7280";
    const borderColor = isDarkMode ? "#3D3D3D" : "#E0E7EF";

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
        { name: 'Dashboard', icon: DashboardIcon, path: '/home' },
        { name: 'Library', icon: LibraryIcon, path: '/library' },
        { name: 'Modules', icon: ModulesIcon, path: '/modules' },
        { name: 'Reports', icon: ReportsIcon, path: '/reports' },
        { name: 'Settings', icon: SettingsIcon, path: '/settings' },
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
                style={{ backgroundColor: bgPrimary }}
                className="w-64 h-full shadow-lg flex flex-col items-center py-8 px-4 absolute top-0 left-0 rounded-tr-xl rounded-br-xl"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8"
                >
                    <img src={Logo} alt="PromptQCM" className="h-12" />
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
                                        ? bgAccent
                                        : 'transparent',
                                    color: textPrimary
                                }}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white hover:shadow-md ${activeNavItem === item.name ? 'shadow-md' : ''}`}
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
                    style={{ backgroundColor: bgAccent }}
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
                                src={ProfilePlaceholder}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="ml-3">
                        <p style={{ color: textPrimary }} className="font-semibold text-base">{user?.name || 'User'}</p>
                        <p style={{ color: textSecondary }} className="text-xs">Student</p>
                    </div>
                </motion.div>

                {/* Logout button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ backgroundColor: bgAccent }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    style={{
                        backgroundColor: isDarkMode ? "rgba(220, 38, 38, 0.1)" : "rgba(254, 226, 226, 0.8)",
                        color: isDarkMode ? "#F87171" : "#DC2626"
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
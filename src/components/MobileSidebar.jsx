import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../assets/icons/logo.svg';
import DashboardIcon from '../assets/icons/dashboard.svg';
import LibraryIcon from '../assets/icons/library.svg';
import ModulesIcon from '../assets/icons/modules.svg';
import ReportsIcon from '../assets/icons/reports.svg';
import SettingsIcon from '../assets/icons/settings.svg';
import ProfilePlaceholder from '../assets/icons/profile.svg';

const MobileSidebar = ({ user, activeNavItem, toggleMobileMenu, handleLogout }) => {
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
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
            onClick={toggleMobileMenu}
        >
            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-64 h-full bg-[#F5F6FF] rounded-r-3xl shadow-lg flex flex-col items-center py-8 px-4"
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
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white hover:shadow-md ${activeNavItem === item.name ? 'bg-white shadow-md' : ''
                                    }`}
                                onClick={() => {
                                    toggleMobileMenu();
                                }}
                            >
                                <img src={item.icon} alt={item.name} className="w-5 h-5 mr-3" />
                                <span className="text-[#252525] font-medium">{item.name}</span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* User Profile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-8 bg-[#F6F8FC] rounded-lg p-3 w-full flex items-center"
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
                        <p className="font-semibold text-[#252525] text-base">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400">Etudiante</p>
                    </div>
                </motion.div>

                {/* Logout button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ backgroundColor: "#F6F8FC" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="mt-4 text-sm text-red-500 hover:underline p-2 w-full text-center rounded-lg"
                >
                    Logout
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default MobileSidebar; 
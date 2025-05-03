import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { account } from '../lib/appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/global.css';

// Import SVG icons (assuming they're in an assets/icons folder)
import Logo from '../assets/icons/logo.svg';
import SearchIcon from '../assets/icons/search.svg';
import DashboardIcon from '../assets/icons/dashboard.svg';
import LibraryIcon from '../assets/icons/library.svg';
import ModulesIcon from '../assets/icons/modules.svg';
import ReportsIcon from '../assets/icons/reports.svg';
import SettingsIcon from '../assets/icons/settings.svg';
import ProfilePlaceholder from '../assets/icons/profile.svg';
import DocIcon from '../assets/icons/doc.svg';

export const Home = () => {
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

    const cardVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 20 }
        },
        hover: {
            scale: 1.03,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
            transition: { type: "spring", stiffness: 400, damping: 10 }
        }
    };

    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [greeting, setGreeting] = useState('');
    const [activeNavItem, setActiveNavItem] = useState('Dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('May 2025');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const monthPickerRef = useRef(null);
    const scrollRef = useRef(null);

    const navigate = useNavigate();

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

    useEffect(() => {
        // Close month picker when clicking outside
        const handleClickOutside = (event) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
                setShowMonthPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Implement search functionality
        console.log('Searching for:', searchQuery);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Function to scroll horizontally when arrows are clicked
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Mock data for the progress modules
    const progressModules = [
        {
            id: 1,
            title: 'Technologie du Web',
            description: 'hadi modil kan9raw fiha html w kda',
            progress: 5,
            total: 10,
        },
        {
            id: 2,
            title: 'C++',
            description: 'ci pliss pliss will ba',
            progress: 2,
            total: 10,
        },
        {
            id: 3,
            title: 'Java',
            description: 'bochra ya bochra ale',
            progress: 2,
            total: 10,
        },
        {
            id: 4,
            title: 'System',
            description: 'abu chaker',
            progress: 3,
            total: 10,
        },
    ];

    // Mock data for report section
    const reportData = [
        { title: 'Technologie du Web', hours: 18 },
        { title: 'C++', hours: 10 },
        { title: 'Java', hours: 2 },
    ];

    // Mock data for recent documents
    const recentDocuments = [
        { id: 1, name: 'document1.pdf', date: '10/12/2023' },
        { id: 2, name: 'document2.pdf', date: '10/12/2023' },
        { id: 3, name: 'document3.pdf', date: '12/12/2023' },
    ];

    // Available months for the picker
    const months = [
        'January 2025', 'February 2025', 'March 2025',
        'April 2025', 'May 2025', 'June 2025',
        'July 2025', 'August 2025', 'September 2025',
        'October 2025', 'November 2025', 'December 2025',
        'All Time'
    ];

    // Navigation items
    const navItems = [
        { name: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
        { name: 'Library', icon: LibraryIcon, path: '/library' },
        { name: 'Modules', icon: ModulesIcon, path: '/modules' },
        { name: 'Reports', icon: ReportsIcon, path: '/reports' },
        { name: 'Settings', icon: SettingsIcon, path: '/settings' },
    ];

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

            {/* Sidebar - Desktop */}
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="hidden lg:flex w-64 bg-[#F5F6FF] rounded-r-3xl shadow-lg flex-col items-center py-10 px-4 z-20"
            >
                {/* Logo */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-12 flex items-center gap-2"
                >
                    <img src={Logo} alt="PromptQCM" className="h-12" />
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
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 hover:bg-[#F6F8FC] hover:shadow ${activeNavItem === item.name ? 'bg-[#F6F8FC] shadow' : ''}`}
                                onClick={() => setActiveNavItem(item.name)}
                            >
                                <img src={item.icon} alt={item.name} className="w-5 h-5 mr-3" />
                                <span className="text-[#252525] font-medium text-base">{item.name}</span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
                {/* User Profile */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-8 flex flex-col items-center"
                >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mb-2">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <img src={ProfilePlaceholder} alt="Profile" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <p className="font-semibold text-[#252525] text-base">{user?.name || 'Majda'}</p>
                    <p className="text-xs text-gray-400">Etudiante</p>
                </motion.div>
            </motion.div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-20 bg-black bg-opacity-50 backdrop-blur-sm"
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
                                                setActiveNavItem(item.name);
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
                                className="mt-8 flex flex-col items-center"
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mb-2">
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
                                <p className="font-medium text-[#252525]">{user?.name || 'User'}</p>
                                <p className="text-sm text-gray-500">Student</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="mt-3 text-xs text-red-500 hover:underline"
                                >
                                    Logout
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto px-8 py-8"
            >
                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
                >
                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl font-medium text-[#252525] mb-4 md:mb-0"
                    >
                        {greeting || 'Good Morning'}, {user?.name?.split(' ')[0] || 'Majda'}!
                    </motion.h1>
                    <motion.form
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        onSubmit={handleSearch}
                        className="flex w-full md:w-auto"
                    >
                        <div className="relative flex-1 md:flex-none md:w-80">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for chi haja..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#E0E7EF] bg-[#F5F6FF] focus:outline-none focus:ring-2 focus:ring-[#AF42F6] shadow-sm text-base"
                            />
                            <img src={SearchIcon} alt="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            className="ml-2 px-5 py-2 rounded-lg border border-[#AF42F6] bg-[#F5F6FF] text-[#AF42F6] font-semibold shadow-sm hover:bg-[#F6F8FC] transition-colors duration-300"
                        >
                            Search
                        </motion.button>
                    </motion.form>
                </motion.div>

                {/* Quick Action Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex gap-6 mb-8"
                >
                    <Link to="/generate-qcm" className="flex-1">
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(175, 66, 246, 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-3 px-0 py-6 bg-[#F5F6FF] border border-[#AF42F6] rounded-xl shadow hover:shadow-lg transition-all duration-300 text-2xl font-bold text-[#252525]"
                        >
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F6F8FC] border border-[#AF42F6] mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#AF42F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </span>
                            Generate QCM
                        </motion.button>
                    </Link>
                    <Link to="/upload-qcm" className="flex-1">
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 202, 195, 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-3 px-0 py-6 bg-[#F5F6FF] border border-[#00CAC3] rounded-xl shadow hover:shadow-lg transition-all duration-300 text-2xl font-bold text-[#252525]"
                        >
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F6F8FC] border border-[#00CAC3] mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00CAC3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </span>
                            Upload QCM
                        </motion.button>
                    </Link>
                </motion.div>
                {/* Progress Section */}
                <motion.div
                    variants={itemVariants}
                    className="mb-8"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-[#252525]">Progress</h2>
                        <Link to="/modules" className="text-[#AF42F6] font-semibold hover:underline">View All</Link>
                    </div>
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 py-2"
                    >
                        {progressModules.map((module, index) => (
                            <motion.div
                                key={module.id}
                                variants={cardVariants}
                                whileHover="hover"
                                className={`bg-[#F5F6FF] rounded-2xl shadow p-6 flex flex-col min-w-[260px] max-w-[320px] ${index === 0 ? 'w-80' : 'w-64'}`}
                            >
                                <h3 className="font-bold text-lg mb-1">{module.title}</h3>
                                <p className="text-gray-500 text-sm mb-4">{module.description}</p>
                                <div className="mt-auto">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold text-[#AF42F6]">{module.progress}/{module.total}</span>
                                    </div>
                                    <motion.div
                                        className="h-2 w-full bg-[#EAEFFB] rounded-full overflow-hidden"
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(module.progress / module.total) * 100}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.5 + (index * 0.2) }}
                                            className="h-full rounded-full bg-gradient-to-r from-[#00CAC3] to-[#AF42F6]"
                                        />
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
                {/* Report and Recents Sections */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* Report Section */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        className="bg-[#F5F6FF] rounded-2xl p-8 shadow flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-[#252525]">Total hours spended</h2>
                            <div className="relative" ref={monthPickerRef}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowMonthPicker(!showMonthPicker)}
                                    className="bg-[#F6F8FC] rounded-lg px-4 py-2 flex items-center border border-[#E0E7EF]"
                                >
                                    <span className="text-base mr-2 font-medium">{selectedMonth}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </motion.button>
                                <AnimatePresence>
                                    {showMonthPicker && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg z-10 py-1 border border-gray-100"
                                        >
                                            {months.map((month) => (
                                                <motion.button
                                                    key={month}
                                                    whileHover={{ backgroundColor: "#F6F8FC" }}
                                                    className={`w-full text-left px-4 py-2 text-base transition-colors ${selectedMonth === month ? 'font-bold text-[#AF42F6]' : ''}`}
                                                    onClick={() => { setSelectedMonth(month); setShowMonthPicker(false); }}
                                                >
                                                    {month}
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div className="flex justify-around">
                            {reportData.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 + (index * 0.2), type: "spring", stiffness: 300, damping: 25 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative w-16 h-16 mb-2">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#E6E6E6" strokeWidth="10" />
                                            <motion.circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke={index === 0 ? 'url(#gradient1)' : index === 1 ? 'url(#gradient2)' : '#9CA3AF'}
                                                strokeWidth="10"
                                                strokeDasharray="251.2"
                                                initial={{ strokeDashoffset: 251.2 }}
                                                animate={{ strokeDashoffset: (100 - (item.hours / reportData[0].hours * 100)) * 2.512 }}
                                                transition={{ duration: 1.5, delay: 0.5 + (index * 0.2), ease: "easeOut" }}
                                                transform="rotate(-90 50 50)"
                                            />
                                            <defs>
                                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00CAC3" /><stop offset="100%" stopColor="#AF42F6" /></linearGradient>
                                                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#8B5CF6" /></linearGradient>
                                            </defs>
                                        </svg>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.2 + (index * 0.2) }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <span className="text-xl font-bold">{item.hours}h</span>
                                        </motion.div>
                                    </div>
                                    <p className="text-center text-sm font-medium text-[#252525]">{item.title}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recents Section */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        className="bg-[#F5F6FF] rounded-2xl p-8 shadow flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-[#252525]">Recents</h2>
                            <Link to="/library" className="text-[#AF42F6] font-semibold hover:underline">View All</Link>
                        </div>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {recentDocuments.map((doc, index) => (
                                <motion.div
                                    key={doc.id}
                                    variants={itemVariants}
                                    custom={index}
                                    whileHover={{ scale: 1.02, backgroundColor: "#F6F8FC" }}
                                    className="flex items-center p-3 rounded-lg cursor-pointer transition-all"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[#E8EDFE] flex items-center justify-center mr-3">
                                        <img src={DocIcon} alt="Document" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#252525]">{doc.name}</p>
                                        <p className="text-xs text-gray-400">{doc.date}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </motion.div>
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

export default Home;
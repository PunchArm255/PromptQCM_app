import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiMoon, FiSun, FiGlobe, FiUser, FiMail, FiLock, FiLogOut, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { useDarkMode } from '../lib/DarkModeContext';

export const Settings = () => {
    const { user } = useOutletContext();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [language, setLanguage] = useState('English');
    const [accountSettings, setAccountSettings] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: '********'
    });
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        app: true
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Load settings from localStorage
        const storedLanguage = localStorage.getItem('qcm_language');
        const storedNotifications = localStorage.getItem('qcm_notifications');

        if (storedLanguage) {
            setLanguage(storedLanguage);
        }

        if (storedNotifications) {
            setNotifications(JSON.parse(storedNotifications));
        }
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        console.log('Searching for:', query);
    };

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        localStorage.setItem('qcm_language', newLanguage);
    };

    const handleNotificationChange = (type) => {
        const updatedNotifications = {
            ...notifications,
            [type]: !notifications[type]
        };
        setNotifications(updatedNotifications);
        localStorage.setItem('qcm_notifications', JSON.stringify(updatedNotifications));
    };

    const saveAccountSetting = (field, value) => {
        setAccountSettings({
            ...accountSettings,
            [field]: value
        });

        // Show success message
        setSuccessMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);

        // Reset edit state
        if (field === 'name') setIsEditingName(false);
        if (field === 'email') setIsEditingEmail(false);
        if (field === 'password') setIsEditingPassword(false);
    };

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

    // Background colors based on dark mode
    const bgPrimary = isDarkMode ? "#1E1E1E" : "#F5F6FF";
    const bgSecondary = isDarkMode ? "#2D2D2D" : "#FFFFFF";
    const bgAccent = isDarkMode ? "#3D3D3D" : "#F6F8FC";
    const textPrimary = isDarkMode ? "#FFFFFF" : "#252525";
    const textSecondary = isDarkMode ? "#E0E0E0" : "#6B7280";
    const borderColor = isDarkMode ? "#3D3D3D" : "#E0E7EF";

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 sm:px-6 md:px-8 py-6 md:py-8"
        >
            {/* Header */}
            <PageHeader
                greeting="Settings"
                showExclamation={false}
                onSearch={handleSearch}
                showSearchBar={false}
            />

            {/* Settings Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Sidebar - Settings Categories */}
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-1"
                >
                    <div style={{ backgroundColor: bgPrimary }} className="rounded-2xl p-4 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                        <h2 style={{ color: textPrimary }} className="text-lg font-bold mb-4">Settings</h2>
                        <div className="space-y-2">
                            <button style={{ backgroundColor: bgAccent, color: "#AF42F6" }} className="w-full text-left py-2 px-3 rounded-lg font-medium">
                                Account Settings
                            </button>
                            <button style={{ color: textSecondary }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#F6F8FC] transition-colors">
                                Notifications
                            </button>
                            <button style={{ color: textSecondary }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#F6F8FC] transition-colors">
                                Privacy & Security
                            </button>
                            <button style={{ color: textSecondary }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#F6F8FC] transition-colors">
                                Help & Support
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Content Area */}
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-2"
                >
                    <div style={{ backgroundColor: bgPrimary }} className="rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center" style={{
                                backgroundColor: isDarkMode ? "rgba(6, 78, 59, 0.5)" : "rgba(209, 250, 229, 0.8)",
                                color: isDarkMode ? "#34D399" : "#047857"
                            }}>
                                <FiCheckCircle className="mr-2" />
                                {successMessage}
                            </div>
                        )}

                        {/* Account Settings Section */}
                        <div className="mb-8">
                            <h2 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Account Settings</h2>
                            <div className="space-y-4">
                                {/* Name Setting */}
                                <div style={{ backgroundColor: bgSecondary }} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl">
                                    <div className="flex items-center mb-3 sm:mb-0">
                                        <div style={{ backgroundColor: bgAccent }} className="p-2 rounded-lg mr-3">
                                            <FiUser className="text-[#AF42F6]" />
                                        </div>
                                        <div>
                                            <p style={{ color: textSecondary }} className="text-sm">Full Name</p>
                                            {isEditingName ? (
                                                <input
                                                    type="text"
                                                    style={{
                                                        color: textPrimary,
                                                        backgroundColor: "transparent",
                                                        borderBottom: "1px solid #AF42F6"
                                                    }}
                                                    className="font-medium focus:outline-none"
                                                    defaultValue={accountSettings.name}
                                                    autoFocus
                                                    onBlur={(e) => saveAccountSetting('name', e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            saveAccountSetting('name', e.target.value);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <p style={{ color: textPrimary }} className="font-medium">{accountSettings.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        style={{ backgroundColor: bgAccent, color: "#AF42F6" }}
                                        className="px-3 py-1.5 text-sm rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Email Setting */}
                                <div style={{ backgroundColor: bgSecondary }} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl">
                                    <div className="flex items-center mb-3 sm:mb-0">
                                        <div style={{ backgroundColor: bgAccent }} className="p-2 rounded-lg mr-3">
                                            <FiMail className="text-[#AF42F6]" />
                                        </div>
                                        <div>
                                            <p style={{ color: textSecondary }} className="text-sm">Email Address</p>
                                            {isEditingEmail ? (
                                                <input
                                                    type="email"
                                                    style={{
                                                        color: textPrimary,
                                                        backgroundColor: "transparent",
                                                        borderBottom: "1px solid #AF42F6"
                                                    }}
                                                    className="font-medium focus:outline-none"
                                                    defaultValue={accountSettings.email}
                                                    autoFocus
                                                    onBlur={(e) => saveAccountSetting('email', e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            saveAccountSetting('email', e.target.value);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <p style={{ color: textPrimary }} className="font-medium">{accountSettings.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditingEmail(true)}
                                        style={{ backgroundColor: bgAccent, color: "#AF42F6" }}
                                        className="px-3 py-1.5 text-sm rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Password Setting */}
                                <div style={{ backgroundColor: bgSecondary }} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl">
                                    <div className="flex items-center mb-3 sm:mb-0">
                                        <div style={{ backgroundColor: bgAccent }} className="p-2 rounded-lg mr-3">
                                            <FiLock className="text-[#AF42F6]" />
                                        </div>
                                        <div>
                                            <p style={{ color: textSecondary }} className="text-sm">Password</p>
                                            {isEditingPassword ? (
                                                <input
                                                    type="password"
                                                    style={{
                                                        color: textPrimary,
                                                        backgroundColor: "transparent",
                                                        borderBottom: "1px solid #AF42F6"
                                                    }}
                                                    className="font-medium focus:outline-none"
                                                    defaultValue={accountSettings.password}
                                                    autoFocus
                                                    onBlur={(e) => saveAccountSetting('password', e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            saveAccountSetting('password', e.target.value);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <p style={{ color: textPrimary }} className="font-medium">{accountSettings.password}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditingPassword(true)}
                                        style={{ backgroundColor: bgAccent, color: "#AF42F6" }}
                                        className="px-3 py-1.5 text-sm rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        Change
                                    </button>
                                </div>

                                {/* Logout Button */}
                                <button style={{
                                    backgroundColor: isDarkMode ? "rgba(220, 38, 38, 0.1)" : "rgba(254, 226, 226, 0.8)",
                                    color: isDarkMode ? "#F87171" : "#DC2626"
                                }} className="w-full mt-4 p-3 flex items-center justify-center gap-2 rounded-xl hover:opacity-90 transition-colors">
                                    <FiLogOut />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>

                        {/* App Settings Section */}
                        <div>
                            <h2 style={{ color: textPrimary }} className="text-xl font-bold mb-4">App Settings</h2>
                            <div className="space-y-4">
                                {/* Dark Mode Toggle */}
                                <div style={{ backgroundColor: bgSecondary }} className="flex items-center justify-between p-4 rounded-xl">
                                    <div className="flex items-center">
                                        <div style={{ backgroundColor: bgAccent }} className="p-2 rounded-lg mr-3">
                                            {isDarkMode ? (
                                                <FiMoon className="text-[#AF42F6]" />
                                            ) : (
                                                <FiSun className="text-[#AF42F6]" />
                                            )}
                                        </div>
                                        <div>
                                            <p style={{ color: textPrimary }} className="font-medium">Dark Mode</p>
                                            <p style={{ color: textSecondary }} className="text-sm">
                                                {isDarkMode ? 'Currently enabled' : 'Currently disabled'}
                                            </p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isDarkMode}
                                            onChange={toggleDarkMode}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#AF42F6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AF42F6]"></div>
                                    </label>
                                </div>

                                {/* Language Setting */}
                                <div style={{ backgroundColor: bgSecondary }} className="flex items-center justify-between p-4 rounded-xl">
                                    <div className="flex items-center">
                                        <div style={{ backgroundColor: bgAccent }} className="p-2 rounded-lg mr-3">
                                            <FiGlobe className="text-[#AF42F6]" />
                                        </div>
                                        <p style={{ color: textPrimary }} className="font-medium">Language</p>
                                    </div>
                                    <select
                                        value={language}
                                        onChange={handleLanguageChange}
                                        style={{ backgroundColor: bgAccent, color: textPrimary }}
                                        className="px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                    >
                                        <option value="English">English</option>
                                        <option value="French">French</option>
                                    </select>
                                </div>

                                {/* Notification Settings */}
                                <div style={{ backgroundColor: bgSecondary }} className="p-4 rounded-xl">
                                    <h3 style={{ color: textPrimary }} className="font-medium mb-3">Notifications</h3>

                                    <div className="flex items-center justify-between mb-2">
                                        <p style={{ color: textSecondary }} className="text-sm">Email Notifications</p>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={notifications.email}
                                                onChange={() => handleNotificationChange('email')}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#AF42F6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#AF42F6]"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p style={{ color: textSecondary }} className="text-sm">App Notifications</p>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={notifications.app}
                                                onChange={() => handleNotificationChange('app')}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#AF42F6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#AF42F6]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Settings;
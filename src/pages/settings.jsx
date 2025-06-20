import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FiMoon, FiSun, FiGlobe, FiUser, FiMail, FiLock, FiLogOut, FiCheckCircle, FiBell, FiUpload } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { useDarkMode } from '../lib/DarkModeContext';
import { account, updateUserProfile, uploadProfileImage, getProfileImageUrl, logoutUser } from '../lib/appwrite';
import LogoDark from '../assets/icons/logoDark.svg';
import Logo from '../assets/icons/logo.svg';
import Mohammed from '../assets/icons/Mohammed.png';
import Asmae from '../assets/icons/Asmae.png';

export const Settings = () => {
    const { user } = useOutletContext();
    const { isDarkMode, toggleDarkMode, colors } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [language, setLanguage] = useState('English');
    const [accountSettings, setAccountSettings] = useState({
        name: user?.name || 'User',
        email: user?.email || '',
        password: '********'
    });
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('account');
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { refreshUserData } = useOutletContext();

    useEffect(() => {
        // Load settings from localStorage
        const storedLanguage = localStorage.getItem('qcm_language');
        const storedNotifications = localStorage.getItem('qcm_notifications');

        if (storedLanguage) {
            setLanguage(storedLanguage);
        }

        if (storedNotifications) {
            setNotifications(JSON.parse(storedNotifications) === true);
        }

        // Load user profile image if available
        const loadProfileImage = async () => {
            try {
                if (user?.profile?.profileImageId) {
                    const imageUrl = getProfileImageUrl(user.profile.profileImageId);
                    setProfileImagePreview(imageUrl);
                }
            } catch (error) {
                console.error('Error loading profile image:', error);
            }
        };

        if (user) {
            setAccountSettings({
                name: user.name || 'User',
                email: user.email || '',
                password: '********'
            });
            loadProfileImage();
        }
    }, [user]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        localStorage.setItem('qcm_language', newLanguage);
    };

    const handleNotificationChange = () => {
        const updatedNotifications = !notifications;
        setNotifications(updatedNotifications);
        localStorage.setItem('qcm_notifications', JSON.stringify(updatedNotifications));
    };

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await logoutUser();
            navigate('/signin');
        } catch (error) {
            setError('Failed to logout. Please try again.');
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveAccountSetting = async (field, value) => {
        setIsLoading(true);
        setError('');

        try {
            // Update account settings based on the field
            if (field === 'name') {
                await account.updateName(value);
            } else if (field === 'email') {
                await account.updateEmail(value);
            } else if (field === 'password') {
                // For password, we'd typically need the current password as well
                // This is a simplified version
                await account.updatePassword(value);
            }

            // Update local state
            setAccountSettings({
                ...accountSettings,
                [field]: field === 'password' ? '********' : value
            });

            // Update user profile if needed
            if (field === 'name' && user?.$id) {
                await updateUserProfile(user.$id, { name: value });

                // Refresh user data to update the sidebar with the new name
                if (refreshUserData) {
                    console.log("Refreshing user data after name update");
                    await refreshUserData();
                }
            }

            // Show success message
            setSuccessMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setError(`Failed to update ${field}: ${error.message}`);
            console.error(`Error updating ${field}:`, error);
        } finally {
            setIsLoading(false);

            // Reset edit state
            if (field === 'name') setIsEditingName(false);
            if (field === 'email') setIsEditingEmail(false);
            if (field === 'password') setIsEditingPassword(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        setError('');

        try {
            // Create a preview
            const reader = new FileReader();
            reader.onload = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload the file
            setProfileImage(file);
            const uploadedFile = await uploadProfileImage(file);

            // Update user profile
            if (user?.$id) {
                await updateUserProfile(user.$id, {
                    profileImageId: uploadedFile.$id
                });

                // Refresh user data to update the sidebar
                if (refreshUserData) {
                    console.log("Refreshing user data after profile image update");
                    await refreshUserData();
                    setSuccessMessage('Profile picture updated successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    // Fallback to page reload if refreshUserData is not available
                    window.location.reload();
                }
            }
        } catch (error) {
            setError(`Failed to update profile picture: ${error.message}`);
            console.error('Error updating profile picture:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
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
                    <div style={{ backgroundColor: colors.bgPrimary }} className="rounded-2xl p-4 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                        <h2 style={{ color: colors.textPrimary }} className="text-lg font-bold mb-4">Settings</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('account')}
                                style={{
                                    backgroundColor: activeTab === 'account' ? colors.bgAccent : 'transparent',
                                    color: activeTab === 'account' ? colors.purple : colors.textSecondary
                                }}
                                className="w-full text-left py-2 px-3 rounded-lg font-medium"
                            >
                                Account Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('about')}
                                style={{
                                    backgroundColor: activeTab === 'about' ? colors.bgAccent : 'transparent',
                                    color: activeTab === 'about' ? colors.purple : colors.textSecondary
                                }}
                                className="w-full text-left py-2 px-3 rounded-lg hover:bg-opacity-80 transition-colors"
                            >
                                About
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right Content Area */}
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-2"
                >
                    <div style={{ backgroundColor: colors.bgPrimary }} className="rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 rounded-lg flex items-center" style={{
                                backgroundColor: colors.errorBg,
                                color: colors.error
                            }}>
                                <FiCheckCircle className="mr-2" />
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-4 p-3 rounded-lg flex items-center" style={{
                                backgroundColor: colors.successBg,
                                color: colors.success
                            }}>
                                <FiCheckCircle className="mr-2" />
                                {successMessage}
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <>
                                {/* Account Settings Section */}
                                <div className="mb-8">
                                    <h2 style={{ color: colors.textPrimary }} className="text-xl font-bold mb-6">Account Settings</h2>

                                    {/* Profile Picture */}
                                    <div className="flex flex-col items-center mb-8">
                                        <div
                                            onClick={triggerFileInput}
                                            className="w-24 h-24 rounded-full overflow-hidden mb-3 cursor-pointer relative"
                                        >
                                            {profileImagePreview ? (
                                                <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div
                                                    style={{ backgroundColor: colors.bgAccent }}
                                                    className="w-full h-full flex items-center justify-center"
                                                >
                                                    <FiUser size={40} className="text-[#AF42F6]" />
                                                </div>
                                            )}
                                            <div
                                                style={{ backgroundColor: colors.bgAccent }}
                                                className="absolute bottom-0 right-0 p-1.5 rounded-full"
                                            >
                                                <FiUpload size={14} className="text-[#AF42F6]" />
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <p style={{ color: colors.textSecondary }} className="text-sm">
                                            Click to change profile picture
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Name Setting */}
                                        <div style={{ backgroundColor: colors.bgSecondary }} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl">
                                            <div className="flex items-center mb-3 sm:mb-0">
                                                <div style={{ backgroundColor: colors.bgAccent }} className="p-2 rounded-lg mr-3">
                                                    <FiUser className="text-[#AF42F6]" />
                                                </div>
                                                <div>
                                                    <p style={{ color: colors.textSecondary }} className="text-sm">Full Name</p>
                                                    {isEditingName ? (
                                                        <input
                                                            type="text"
                                                            style={{
                                                                color: colors.textPrimary,
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
                                                        <p style={{ color: colors.textPrimary }} className="font-medium">{accountSettings.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsEditingName(true)}
                                                disabled={isLoading}
                                                style={{ backgroundColor: colors.bgAccent, color: colors.purple }}
                                                className="px-3 py-1.5 text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {isLoading && isEditingName ? 'Saving...' : 'Edit'}
                                            </button>
                                        </div>

                                        {/* Email Setting */}
                                        <div style={{ backgroundColor: colors.bgSecondary }} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl">
                                            <div className="flex items-center mb-3 sm:mb-0">
                                                <div style={{ backgroundColor: colors.bgAccent }} className="p-2 rounded-lg mr-3">
                                                    <FiMail className="text-[#AF42F6]" />
                                                </div>
                                                <div>
                                                    <p style={{ color: colors.textSecondary }} className="text-sm">Email Address</p>
                                                    {isEditingEmail ? (
                                                        <input
                                                            type="email"
                                                            style={{
                                                                color: colors.textPrimary,
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
                                                        <p style={{ color: colors.textPrimary }} className="font-medium">{accountSettings.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsEditingEmail(true)}
                                                disabled={isLoading}
                                                style={{ backgroundColor: colors.bgAccent, color: colors.purple }}
                                                className="px-3 py-1.5 text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {isLoading && isEditingEmail ? 'Saving...' : 'Edit'}
                                            </button>
                                        </div>

                                        {/* Password Setting */}
                                        <div style={{ backgroundColor: colors.bgSecondary }} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl">
                                            <div className="flex items-center mb-3 sm:mb-0">
                                                <div style={{ backgroundColor: colors.bgAccent }} className="p-2 rounded-lg mr-3">
                                                    <FiLock className="text-[#AF42F6]" />
                                                </div>
                                                <div>
                                                    <p style={{ color: colors.textSecondary }} className="text-sm">Password</p>
                                                    {isEditingPassword ? (
                                                        <input
                                                            type="password"
                                                            style={{
                                                                color: colors.textPrimary,
                                                                backgroundColor: "transparent",
                                                                borderBottom: "1px solid #AF42F6"
                                                            }}
                                                            className="font-medium focus:outline-none"
                                                            defaultValue=""
                                                            placeholder="Enter new password"
                                                            autoFocus
                                                            onBlur={(e) => saveAccountSetting('password', e.target.value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    saveAccountSetting('password', e.target.value);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <p style={{ color: colors.textPrimary }} className="font-medium">{accountSettings.password}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsEditingPassword(true)}
                                                disabled={isLoading}
                                                style={{ backgroundColor: colors.bgAccent, color: colors.purple }}
                                                className="px-3 py-1.5 text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {isLoading && isEditingPassword ? 'Saving...' : 'Change'}
                                            </button>
                                        </div>

                                        {/* Logout Button */}
                                        <button
                                            onClick={handleLogout}
                                            disabled={isLoading}
                                            style={{
                                                backgroundColor: colors.errorBg,
                                                color: colors.error
                                            }}
                                            className="w-full mt-4 p-3 flex items-center justify-center gap-2 rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
                                        >
                                            <FiLogOut />
                                            <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* App Settings Section */}
                                <div>
                                    <h2 style={{ color: colors.textPrimary }} className="text-xl font-bold mb-4">App Settings</h2>
                                    <div className="space-y-4">
                                        {/* Dark Mode Toggle */}
                                        <div style={{ backgroundColor: colors.bgSecondary }} className="flex items-center justify-between p-4 rounded-xl">
                                            <div className="flex items-center">
                                                <div style={{ backgroundColor: colors.bgAccent }} className="p-2 rounded-lg mr-3">
                                                    {isDarkMode ? (
                                                        <FiMoon className="text-[#AF42F6]" />
                                                    ) : (
                                                        <FiSun className="text-[#AF42F6]" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p style={{ color: colors.textPrimary }} className="font-medium">Dark Mode</p>
                                                    <p style={{ color: colors.textSecondary }} className="text-sm">
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
                                        <div style={{ backgroundColor: colors.bgSecondary }} className="flex items-center justify-between p-4 rounded-xl">
                                            <div className="flex items-center">
                                                <div style={{ backgroundColor: colors.bgAccent }} className="p-2 rounded-lg mr-3">
                                                    <FiGlobe className="text-[#AF42F6]" />
                                                </div>
                                                <div>
                                                    <p style={{ color: colors.textPrimary }} className="font-medium">Language</p>
                                                    <p style={{ color: colors.textSecondary }} className="text-sm">
                                                        Choose your preferred language
                                                    </p>
                                                </div>
                                            </div>
                                            <select
                                                value={language}
                                                onChange={handleLanguageChange}
                                                style={{ backgroundColor: colors.bgAccent, color: colors.textPrimary }}
                                                className="px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                            >
                                                <option value="English">English</option>
                                                <option value="French">French</option>
                                            </select>
                                        </div>

                                        {/* Notification Settings - Combined */}
                                        <div style={{ backgroundColor: colors.bgSecondary }} className="flex items-center justify-between p-4 rounded-xl">
                                            <div className="flex items-center">
                                                <div style={{ backgroundColor: colors.bgAccent }} className="p-2 rounded-lg mr-3">
                                                    <FiBell className="text-[#AF42F6]" />
                                                </div>
                                                <div>
                                                    <p style={{ color: colors.textPrimary }} className="font-medium">Notifications</p>
                                                    <p style={{ color: colors.textSecondary }} className="text-sm">
                                                        {notifications ? 'Currently enabled' : 'Currently disabled'}
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notifications}
                                                    onChange={handleNotificationChange}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#AF42F6] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AF42F6]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'about' && (
                            <div className="flex flex-col items-center text-center">
                                <img
                                    src={isDarkMode ? LogoDark : Logo}
                                    alt="PromptQCM"
                                    className="h-24 mb-4"
                                />
                                <h2
                                    style={{ color: colors.textPrimary }}
                                    className="text-2xl font-bold mb-2"
                                >
                                    PromptQCM
                                </h2>
                                <p
                                    style={{ color: colors.textSecondary }}
                                    className="text-sm mb-8"
                                >
                                    Prototype v0.1
                                </p>

                                <h3
                                    style={{ color: colors.textPrimary }}
                                    className="text-xl font-semibold mb-6"
                                >
                                    Meet the Team
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                                    {/* Mohammed Card */}
                                    <div
                                        style={{ backgroundColor: colors.bgSecondary }}
                                        className="p-6 rounded-xl flex flex-col items-center"
                                    >
                                        <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                                            <img
                                                src={Mohammed}
                                                alt="Mohammed Nassri"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h4
                                            style={{ color: colors.textPrimary }}
                                            className="text-lg font-semibold mb-1"
                                        >
                                            Mohammed Nassri
                                        </h4>
                                        <p
                                            style={{ color: colors.textSecondary }}
                                            className="text-sm mb-3"
                                        >
                                            Lead Developer & Designer
                                        </p>
                                        <p
                                            style={{ color: colors.textSecondary }}
                                            className="text-sm text-center"
                                        >
                                            Responsible for the full development process and UI/UX design of the application.
                                        </p>
                                    </div>

                                    {/* Asmae Card */}
                                    <div
                                        style={{ backgroundColor: colors.bgSecondary }}
                                        className="p-6 rounded-xl flex flex-col items-center"
                                    >
                                        <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                                            <img
                                                src={Asmae}
                                                alt="Asmae Majdi"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h4
                                            style={{ color: colors.textPrimary }}
                                            className="text-lg font-semibold mb-1"
                                        >
                                            Asmae Majdi
                                        </h4>
                                        <p
                                            style={{ color: colors.textSecondary }}
                                            className="text-sm mb-3"
                                        >
                                            Design Assistant & QA Lead
                                        </p>
                                        <p
                                            style={{ color: colors.textSecondary }}
                                            className="text-sm text-center"
                                        >
                                            Assisted with frontend design and led the organization and testing efforts.
                                        </p>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background: "linear-gradient(to right, rgba(0, 202, 195, 0.1), rgba(175, 66, 246, 0.1))",
                                        borderLeft: "3px solid #AF42F6"
                                    }}
                                    className="mt-8 p-4 rounded-lg max-w-2xl text-left"
                                >
                                    <p style={{ color: colors.textSecondary }} className="text-sm">
                                        PromptQCM is an innovative application designed to help students prepare for their exams through interactive multiple-choice questions. Our mission is to make studying more efficient and engaging through modern technology.
                                    </p>
                                </div>

                                <p
                                    style={{ color: colors.textSecondary }}
                                    className="text-sm mt-8"
                                >
                                    © 2023 PromptQCM. All rights reserved.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Settings;
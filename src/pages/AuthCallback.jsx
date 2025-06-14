import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { account, createUserProfile } from '../lib/appwrite';
import Logo from '../assets/icons/logo.svg';
import LogoDark from '../assets/icons/logoDark.svg';
import { useDarkMode } from '../lib/DarkModeContext';

export const AuthCallback = () => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Get current user after OAuth redirect
                const user = await account.get();

                // Check if this is a new user (needs profile creation)
                // We could check if user profile exists in our database
                try {
                    // Create a user profile if it doesn't exist
                    await createUserProfile(user.$id, {
                        name: user.name,
                        email: user.email,
                        // If OAuth provider gives us a profile picture, we could store it here
                        profileImageId: null
                    });
                } catch (profileError) {
                    // Profile might already exist, that's fine
                    console.log('Profile might already exist:', profileError);
                }

                // Redirect to home page
                navigate('/home');
            } catch (error) {
                console.error('OAuth callback error:', error);
                setError('Authentication failed. Please try again.');
                // Redirect to sign in page after a delay
                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            } finally {
                setIsLoading(false);
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen flex flex-col items-center justify-center px-4 font-gotham ${isDarkMode ? 'bg-[#181A20]' : 'bg-[#EAEFFB]'}`}
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
            >
                <img src={isDarkMode ? LogoDark : Logo} alt="PromptQCM" className="h-16 w-auto" />
            </motion.div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`w-full max-w-md rounded-2xl p-8 sm:p-10 shadow-[0_10px_50px_rgba(0,0,0,0.1)] relative overflow-hidden ${isDarkMode ? 'bg-[#23272F]' : 'bg-[#F5F6FF]'}`}
            >
                {/* Gradient Glow Background */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00CAC3] rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#AF42F6] rounded-full opacity-10 blur-3xl"></div>

                <div className="flex flex-col items-center justify-center text-center">
                    {isLoading ? (
                        <>
                            <div className="w-12 h-12 border-4 border-t-transparent border-[#AF42F6] rounded-full animate-spin mb-4"></div>
                            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#252525]'}`}>
                                Completing Authentication
                            </h2>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Please wait while we process your login...
                            </p>
                        </>
                    ) : error ? (
                        <>
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#252525]'}`}>
                                Authentication Failed
                            </h2>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {error}
                            </p>
                            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Redirecting you to sign in page...
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#252525]'}`}>
                                Authentication Successful
                            </h2>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Redirecting you to dashboard...
                            </p>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AuthCallback; 
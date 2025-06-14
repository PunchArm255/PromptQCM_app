import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { account, oAuthProviders } from '../lib/appwrite';
import Logo from '../assets/icons/logo.svg';
import LogoDark from '../assets/icons/logoDark.svg';
import { useDarkMode } from '../lib/DarkModeContext';
import { FcGoogle } from 'react-icons/fc';
import { AiFillApple } from 'react-icons/ai';

export const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState('');
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();

    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                await account.get();
                // If successful, user is logged in, redirect to home
                navigate('/home');
            } catch (error) {
                // User is not logged in, stay on signin page
                console.log('User not logged in');
            }
        };

        checkUser();
    }, [navigate]);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await account.createEmailPasswordSession(email, password);
            navigate('/home');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider) => {
        try {
            setOauthLoading(provider);

            // Create OAuth session and redirect to provider's login page
            const redirectUrl = window.location.origin + '/auth-callback';
            await account.createOAuth2Session(provider, redirectUrl, redirectUrl);

        } catch (error) {
            setError(`Failed to sign in with ${provider}: ${error.message}`);
            setOauthLoading('');
        }
    };

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
                <Link to="/">
                    <img src={isDarkMode ? LogoDark : Logo} alt="PromptQCM" className="h-16 w-auto" />
                </Link>
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

                <h1 className={`text-3xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-[#252525]'}`}>Welcome Back!</h1>
                <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to your account</p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSignIn} className="space-y-5">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`w-full py-3 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#AF42F6] focus:border-transparent transition-all ${isDarkMode ? 'bg-[#23272F] border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-200'}`}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ml-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={`w-full py-3 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#AF42F6] focus:border-transparent transition-all ${isDarkMode ? 'bg-[#23272F] border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-200'}`}
                            placeholder="Enter your password"
                        />
                    </div>
                    <div className="pt-2">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-xl text-base font-semibold text-white transition-all disabled:opacity-70"
                            style={{
                                background: "linear-gradient(to right, #00CAC3, #AF42F6)"
                            }}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </motion.button>
                    </div>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className={`flex-grow h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <span className={`px-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>or continue with</span>
                    <div className={`flex-grow h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleOAuthSignIn(oAuthProviders.google)}
                        disabled={oauthLoading === oAuthProviders.google}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${isDarkMode ? 'bg-[#23272F] border-gray-700 text-white hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                        <FcGoogle size={20} />
                        <span>Google</span>
                        {oauthLoading === oAuthProviders.google && (
                            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin ml-2"></div>
                        )}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleOAuthSignIn(oAuthProviders.apple)}
                        disabled={oauthLoading === oAuthProviders.apple}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${isDarkMode ? 'bg-[#23272F] border-gray-700 text-white hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                        <AiFillApple size={22} className={isDarkMode ? 'text-white' : 'text-black'} />
                        <span>Apple</span>
                        {oauthLoading === oAuthProviders.apple && (
                            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin ml-2"></div>
                        )}
                    </motion.button>
                </div>

                <div className="text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            className="font-semibold"
                            style={{
                                background: "linear-gradient(to right, #00CAC3, #AF42F6)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SignIn;
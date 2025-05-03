import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { account } from '../lib/appwrite';
import Logo from '../assets/icons/logo.svg';

export const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center bg-[#EAEFFB] px-4 font-gotham"
        >
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
            >
                <Link to="/">
                    <img src={Logo} alt="PromptQCM" className="h-16 w-auto" />
                </Link>
            </motion.div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full max-w-md bg-[#F5F6FF] rounded-2xl p-8 sm:p-10 shadow-[0_10px_50px_rgba(0,0,0,0.1)] relative overflow-hidden"
            >
                {/* Gradient Glow Background */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00CAC3] rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#AF42F6] rounded-full opacity-10 blur-3xl"></div>

                <h1 className="text-3xl font-bold text-center mb-2 text-[#252525]">Welcome Back!</h1>
                <p className="text-gray-500 text-center mb-8">Sign in to your account</p>

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
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full py-3 px-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#AF42F6] focus:border-transparent transition-all"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full py-3 px-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#AF42F6] focus:border-transparent transition-all"
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

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
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
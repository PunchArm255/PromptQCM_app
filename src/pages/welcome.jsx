import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { account } from '../lib/appwrite';
import Logo from '../assets/icons/logo.svg';

export const Welcome = () => {
    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                await account.get();
                // If successful, user is logged in, redirect to home
                navigate('/home');
            } catch (error) {
                // User is not logged in, stay on welcome page
                console.log('User not logged in');
            }
        };

        checkUser();
    }, [navigate]);

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
                <img src={Logo} alt="PromptQCM" className="h-24 w-auto" />
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

                <h1 className="text-3xl font-bold text-center mb-6 text-[#252525]">Welcome to PromptQCM</h1>


                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Link to="/signin" className="block w-full">
                        <button
                            className="w-full py-3 px-4 rounded-xl text-base font-semibold text-white transition-all"
                            style={{
                                background: "linear-gradient(to right, #00CAC3, #AF42F6)"
                            }}
                        >
                            Continue with Email
                        </button>
                    </Link>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Welcome;
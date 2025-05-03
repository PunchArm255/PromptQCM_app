import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const PageHeader = ({ greeting, userName, onSearch, showExclamation = true }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8"
        >
            <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-3xl font-medium text-[#252525] mb-4 md:mb-0 hidden md:block"
            >
                {userName && showExclamation ?
                    `${greeting}, ${userName}!` :
                    greeting
                }
            </motion.h1>

            {/* For mobile only - show just the greeting text */}
            <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-xl font-medium text-[#252525] mb-4 block md:hidden"
            >
                Welcome to your dashboard
            </motion.h2>

            <SearchBar onSearch={onSearch} />
        </motion.div>
    );
};

export default PageHeader; 
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const PageHeader = ({ greeting, userName, onSearch, showExclamation = true }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
            <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-medium text-[#252525] mb-4 md:mb-0"
            >
                {userName && showExclamation ?
                    `${greeting}, ${userName}!` :
                    greeting
                }
            </motion.h1>

            <SearchBar onSearch={onSearch} />
        </motion.div>
    );
};

export default PageHeader; 
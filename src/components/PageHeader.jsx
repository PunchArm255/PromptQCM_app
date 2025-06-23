import { motion } from 'framer-motion';
import { useDarkMode } from '../lib/DarkModeContext';
import { useLanguage } from '../lib/LanguageContext';
import SearchBar from './SearchBar';

const PageHeader = ({ greeting, userName, onSearch, showExclamation = true, showSearchBar = false, searchProps = {} }) => {
    const { colors } = useDarkMode();
    const { translate } = useLanguage();

    // Determine the text to show based on props
    const headerText = userName && showExclamation
        ? `${translate(greeting)}, ${userName}!`
        : translate(greeting);

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
                className="text-2xl md:text-3xl font-medium mb-4 md:mb-0 hidden md:block"
                style={{ color: colors.textPrimary }}
            >
                {headerText}
            </motion.h1>

            {/* For mobile only - show the same greeting as desktop */}
            <motion.h2
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-xl font-medium mb-4 block md:hidden"
                style={{ color: colors.textPrimary }}
            >
                {headerText}
            </motion.h2>

            {showSearchBar && <SearchBar onSearch={onSearch} value={searchProps.value} onClear={searchProps.onClear} />}
        </motion.div>
    );
};

export default PageHeader; 
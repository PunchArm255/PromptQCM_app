import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../lib/DarkModeContext';
import SearchIcon from '../assets/icons/search.svg';
import SearchIconDark from '../assets/icons/searchDark.svg';

const SearchBar = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { isDarkMode, colors } = useDarkMode();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    return (
        <motion.form
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="flex w-full md:w-auto"
        >
            <div className="relative flex-1 md:flex-none md:w-80">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a file..."
                    className="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent focus:shadow-md peer text-sm md:text-base"
                    style={{
                        backgroundColor: isDarkMode ? colors.bgAccent : colors.bgPrimary,
                        color: colors.textPrimary,
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: 'transparent',
                        backgroundImage: `linear-gradient(${isDarkMode ? colors.bgAccent : 'white'}, ${isDarkMode ? colors.bgAccent : 'white'}), linear-gradient(to right, ${colors.teal}, ${colors.purple})`,
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box',
                        backgroundSize: '100% 100%, 100% 100%',
                    }}
                />
                <img
                    src={isDarkMode ? SearchIconDark : SearchIcon}
                    alt="Search"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
                />
            </div>
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="hidden md:block ml-2 px-5 py-2 rounded-full shadow-sm font-semibold transition-colors duration-300 relative"
                style={{
                    backgroundColor: isDarkMode ? colors.bgAccent : colors.bgPrimary,
                    color: colors.textPrimary,
                    backgroundImage: `linear-gradient(${isDarkMode ? colors.bgAccent : colors.bgPrimary}, ${isDarkMode ? colors.bgAccent : colors.bgPrimary}), linear-gradient(to right, ${colors.teal}, ${colors.purple})`,
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: 'transparent'
                }}
            >
                Search
            </motion.button>
        </motion.form>
    );
};

export default SearchBar; 
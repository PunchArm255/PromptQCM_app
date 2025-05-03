import { useState } from 'react';
import { motion } from 'framer-motion';
import SearchIcon from '../assets/icons/search.svg';

const SearchBar = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');

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
                    placeholder="Search for chi haja..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-[#E0E7EF] bg-[#F5F6FF] focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent focus:bg-white focus:shadow-md peer text-sm md:text-base"
                    style={{
                        backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #00CAC3, #AF42F6)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box',
                        backgroundSize: '100% 100%, 100% 100%',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: 'transparent'
                    }}
                />
                <img src={SearchIcon} alt="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" />
            </div>
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="hidden md:block ml-2 px-5 py-2 rounded-full shadow-sm text-[#252525] font-semibold hover:bg-[#F6F8FC] transition-colors duration-300 relative"
                style={{
                    backgroundImage: 'linear-gradient(#F5F6FF, #F5F6FF), linear-gradient(to right, #00CAC3, #AF42F6)',
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
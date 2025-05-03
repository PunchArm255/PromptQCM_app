import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export const Modules = () => {
    const { user } = useOutletContext();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query) => {
        setSearchQuery(query);
        console.log('Searching for:', query);
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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 sm:px-6 md:px-8 py-6 md:py-8"
        >
            {/* Header */}
            <PageHeader
                greeting="Modules"
                showExclamation={false}
                onSearch={handleSearch}
            />

            {/* Modules Content */}
            <div className="bg-[#F5F6FF] rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <h2 className="text-xl font-bold text-[#252525] mb-4">All Modules</h2>
                <p className="text-gray-500">This is the Modules page. You can add module-specific content here.</p>
            </div>
        </motion.div>
    );
};

export default Modules;
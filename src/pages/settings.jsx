import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';

export const Settings = () => {
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
            className="px-8 py-8"
        >
            {/* Header */}
            <PageHeader
                greeting="Settings"
                showExclamation={false}
                onSearch={handleSearch}
            />

            {/* Settings Content */}
            <div className="bg-[#F5F6FF] rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <h2 className="text-xl font-bold text-[#252525] mb-4">Account Settings</h2>
                <p className="text-gray-500">This is the Settings page. You can add settings-specific content here.</p>
            </div>
        </motion.div>
    );
};

export default Settings;
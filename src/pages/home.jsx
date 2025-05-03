import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import '../styles/global.css';

// Components
import PageHeader from '../components/PageHeader';
import QuickActions from '../components/QuickActions';
import ProgressSection from '../components/ProgressSection';
import ReportCard from '../components/ReportCard';
import RecentsCard from '../components/RecentsCard';

export const Home = () => {
    const { user, greeting } = useOutletContext();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Implement search functionality
        console.log('Searching for:', query);
    };

    // Mock data for the progress modules
    const progressModules = [
        {
            id: 1,
            title: 'Technologie du Web',
            description: 'This module contains stuff about HTML/CSS.',
            progress: 5,
            total: 10,
        },
        {
            id: 2,
            title: 'C++',
            description: 'This module contains stuff about C++.',
            progress: 2,
            total: 10,
        },
        {
            id: 3,
            title: 'Java',
            description: 'This module contains stuff about Java.',
            progress: 2,
            total: 10,
        },
        {
            id: 4,
            title: 'System',
            description: 'This module contains stuff about system.',
            progress: 3,
            total: 10,
        },
    ];

    // Mock data for report section
    const reportData = [
        { title: 'Technologie du Web', hours: 18 },
        { title: 'C++', hours: 10 },
        { title: 'Java', hours: 12 },
    ];

    // Mock data for recent documents
    const recentDocuments = [
        { id: 1, name: 'document1.pdf', date: '10/12/2023' },
        { id: 2, name: 'document2.pdf', date: '10/12/2023' },
        { id: 3, name: 'document3.pdf', date: '12/12/2023' },
    ];

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
                greeting={greeting || 'Welcome'}
                userName={user?.name?.split(' ')[0] || 'User'}
                onSearch={handleSearch}
            />

            {/* Quick Action Buttons */}
            <QuickActions />

            {/* Progress Section */}
            <ProgressSection modules={progressModules} />

            {/* Report and Recents Sections */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
            >
                {/* Report Section */}
                <ReportCard reportData={reportData} />

                {/* Recents Section */}
                <RecentsCard documents={recentDocuments} />
            </motion.div>
        </motion.div>
    );
};

export default Home;
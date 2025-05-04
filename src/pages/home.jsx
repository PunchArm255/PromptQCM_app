import { useState, useEffect } from 'react';
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
    const [recentDocuments, setRecentDocuments] = useState([]);
    const [progressModules, setProgressModules] = useState([]);
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        // Load documents from localStorage
        const storedDocs = localStorage.getItem('qcm_documents');
        if (storedDocs) {
            const docs = JSON.parse(storedDocs);
            // Sort by last accessed and get the most recent 3
            const sortedDocs = [...docs].sort((a, b) => b.lastAccessed - a.lastAccessed).slice(0, 3);
            setRecentDocuments(sortedDocs);
        }

        // Load modules from localStorage
        const storedModules = localStorage.getItem('qcm_modules');
        if (storedModules) {
            const modules = JSON.parse(storedModules);
            // Sort by progress percentage (descending)
            const sortedModules = [...modules].sort((a, b) => {
                const progressA = a.completedDocs / (a.totalDocs || 1);
                const progressB = b.completedDocs / (b.totalDocs || 1);
                return progressB - progressA;
            }).slice(0, 4); // Limit to 4 modules
            setProgressModules(sortedModules);

            // Update report data based on module data
            const reportModules = sortedModules.slice(0, 3).map(module => ({
                title: module.name,
                hours: Math.round(module.completedDocs * 2) // Assuming 2 hours per completed doc
            }));
            setReportData(reportModules);
        } else {
            // Set default modules if none exist
            const defaultModules = [
                {
                    id: 1,
                    name: 'Technologie du Web',
                    description: 'This module contains stuff about HTML/CSS.',
                    completedDocs: 5,
                    totalDocs: 10,
                },
                {
                    id: 2,
                    name: 'C++',
                    description: 'This module contains stuff about C++.',
                    completedDocs: 2,
                    totalDocs: 10,
                },
                {
                    id: 3,
                    name: 'Java',
                    description: 'This module contains stuff about Java.',
                    completedDocs: 2,
                    totalDocs: 10,
                },
                {
                    id: 4,
                    name: 'System',
                    description: 'This module contains stuff about system.',
                    completedDocs: 3,
                    totalDocs: 10,
                },
            ];
            setProgressModules(defaultModules);

            // Default report data
            const defaultReportData = [
                { title: 'Technologie du Web', hours: 18 },
                { title: 'C++', hours: 10 },
                { title: 'Java', hours: 12 },
            ];
            setReportData(defaultReportData);
        }
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Implement search functionality
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
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext, useNavigate } from 'react-router-dom';
import '../styles/global.css';
import { useDarkMode } from '../lib/DarkModeContext';

// Components
import PageHeader from '../components/PageHeader';
import QuickActions from '../components/QuickActions';
import ProgressSection from '../components/ProgressSection';
import ReportCard from '../components/ReportCard';
import RecentsCard from '../components/RecentsCard';
import { getUserModules, getUserPDFs, getTotalTimeSpent, getModuleTimeTracking, getModuleQCMs } from '../lib/appwriteService';

export const Home = () => {
    const { user, greeting } = useOutletContext();
    const { isDarkMode, colors } = useDarkMode();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [recentDocuments, setRecentDocuments] = useState([]);
    const [progressModules, setProgressModules] = useState([]);
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        // Fetch modules and recent documents from Appwrite
        const fetchData = async () => {
            try {
                // Fetch modules
                const modules = await getUserModules();

                // Process modules to get QCM counts
                const processedModules = await Promise.all(modules.map(async module => {
                    // Fetch QCMs for this module
                    const qcms = await getModuleQCMs(module.$id);

                    return {
                        ...module,
                        completedQcms: module.completedQcms || 0,
                        totalDocs: module.qcmCount || 0,
                        savedQCMsCount: qcms.length // Track the actual number of saved QCMs
                    };
                }));

                // Sort by progress percentage (descending)
                const sortedModules = [...processedModules].sort((a, b) => {
                    const progressA = (a.savedQCMsCount || 0) / 10;
                    const progressB = (b.savedQCMsCount || 0) / 10;
                    return progressB - progressA;
                }).slice(0, 4); // Limit to 4 modules

                setProgressModules(sortedModules);

                // Get total time spent
                const totalMinutes = await getTotalTimeSpent();

                // Format time display (minutes until 59, then hours)
                let timeDisplay;
                if (totalMinutes < 60) {
                    timeDisplay = `${totalMinutes}m`;
                } else {
                    const hours = Math.floor(totalMinutes / 60);
                    timeDisplay = `${hours}h`;
                }

                // Get module time tracking data for top modules
                const moduleTimePromises = sortedModules.slice(0, 3).map(async (module) => {
                    const timeData = await getModuleTimeTracking(module.$id);
                    const totalModuleMinutes = timeData.reduce((sum, record) => sum + record.minutes, 0);

                    // Format time display
                    let moduleTimeDisplay;
                    if (totalModuleMinutes < 60) {
                        moduleTimeDisplay = `${totalModuleMinutes}m`;
                    } else {
                        const hours = Math.floor(totalModuleMinutes / 60);
                        moduleTimeDisplay = `${hours}h`;
                    }

                    return {
                        title: module.name,
                        hours: Math.floor(totalModuleMinutes / 60),
                        minutes: totalModuleMinutes % 60,
                        timeDisplay: moduleTimeDisplay
                    };
                });

                const moduleTimeData = await Promise.all(moduleTimePromises);

                // Sort by time spent
                const sortedModuleStats = moduleTimeData.sort((a, b) =>
                    (b.hours * 60 + b.minutes) - (a.hours * 60 + a.minutes)
                );

                // Update report data with actual time tracking data
                setReportData(sortedModuleStats);

                // Fetch recent documents (PDFs)
                const pdfs = await getUserPDFs();

                // Sort by creation date (newest first)
                const sortedPDFs = [...pdfs].sort((a, b) =>
                    new Date(b.$createdAt || 0) - new Date(a.$createdAt || 0)
                ).slice(0, 3); // Limit to 3 recent documents

                setRecentDocuments(sortedPDFs);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Implement search functionality
        console.log('Searching for:', query);
    };

    const handlePractice = (module) => {
        // Navigate to modules page with the selected module ID
        navigate('/modules', { state: { selectedModuleId: module.$id } });
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
            style={{ backgroundColor: 'transparent' }}
        >
            {/* Header */}
            <PageHeader
                greeting={greeting || 'Welcome'}
                userName={user?.name?.split(' ')[0] || 'User'}
                onSearch={handleSearch}
                showSearchBar={true}
            />

            {/* Quick Action Buttons */}
            <QuickActions />

            {/* Progress Section */}
            <ProgressSection
                modules={progressModules}
                onPractice={handlePractice}
            />

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
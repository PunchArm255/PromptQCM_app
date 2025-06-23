import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext, useNavigate } from 'react-router-dom';
import '../styles/global.css';
import { useDarkMode } from '../lib/DarkModeContext';
import { useLanguage } from '../lib/LanguageContext';

// Components
import PageHeader from '../components/PageHeader';
import QuickActions from '../components/QuickActions';
import ProgressSection from '../components/ProgressSection';
import ReportCard from '../components/ReportCard';
import RecentsCard from '../components/RecentsCard';
import DocumentCard from '../components/DocumentCard';
import { getUserModules, getUserPDFs, getTotalTimeSpent, getModuleTimeTracking, getModuleQCMs } from '../lib/appwriteService';

export const Home = () => {
    const { user, greeting } = useOutletContext();
    const { isDarkMode, colors } = useDarkMode();
    const { translate } = useLanguage();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [recentDocuments, setRecentDocuments] = useState([]);
    const [progressModules, setProgressModules] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [allModules, setAllModules] = useState([]);
    const [allDocuments, setAllDocuments] = useState([]);
    const [allQCMs, setAllQCMs] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        // Fetch modules and recent documents from Appwrite
        const fetchData = async () => {
            try {
                // Fetch modules
                const modules = await getUserModules();
                setAllModules(modules);

                // Process modules to get QCM counts
                const processedModules = await Promise.all(modules.map(async module => {
                    // Fetch QCMs for this module
                    const qcms = await getModuleQCMs(module.$id);

                    // Store QCMs for searching
                    if (qcms.length > 0) {
                        setAllQCMs(prevQCMs => [...prevQCMs, ...qcms]);
                    }

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
                setAllDocuments(pdfs);

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

        if (!query.trim()) {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const lowerCaseQuery = query.toLowerCase();

        // Search in modules
        const foundModules = allModules.filter(module =>
            module.name.toLowerCase().includes(lowerCaseQuery) ||
            (module.description && module.description.toLowerCase().includes(lowerCaseQuery))
        ).map(module => ({
            ...module,
            type: 'module',
            title: module.name,
            icon: 'module'
        }));

        // Search in documents
        const foundDocuments = allDocuments.filter(doc =>
            (doc.fileName && doc.fileName.toLowerCase().includes(lowerCaseQuery))
        ).map(doc => ({
            ...doc,
            type: 'document',
            title: doc.fileName || translate("Untitled PDF"),
            icon: 'document'
        }));

        // Search in QCMs
        const foundQCMs = allQCMs.filter(qcm =>
            qcm.name.toLowerCase().includes(lowerCaseQuery) ||
            qcm.questions.some(q =>
                q.question.toLowerCase().includes(lowerCaseQuery) ||
                q.options.some(opt => opt.toLowerCase().includes(lowerCaseQuery))
            )
        ).map(qcm => ({
            ...qcm,
            type: 'qcm',
            title: qcm.name,
            icon: 'qcm'
        }));

        // Combine and limit results
        const combinedResults = [...foundModules, ...foundDocuments, ...foundQCMs].slice(0, 10);
        setSearchResults(combinedResults);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
    };

    const handleResultClick = (result) => {
        setIsSearching(false);
        setSearchResults([]);
        setSearchQuery('');

        if (result.type === 'module') {
            navigate('/modules', { state: { selectedModuleId: result.$id } });
        } else if (result.type === 'document') {
            // Handle document click - could open a preview or navigate to library
            navigate('/library', { state: { selectedDocumentId: result.$id } });
        } else if (result.type === 'qcm') {
            // Navigate to the module containing this QCM
            navigate('/modules', { state: { selectedModuleId: result.moduleId, selectedQCMId: result.$id } });
        }
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

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 sm:px-6 md:px-8 py-6 md:py-8 relative"
            style={{ backgroundColor: 'transparent' }}
        >
            {/* Header */}
            <PageHeader
                greeting={translate(greeting || 'Welcome')}
                userName={user?.name?.split(' ')[0] || 'User'}
                onSearch={handleSearch}
                showSearchBar={true}
                searchProps={{
                    value: searchQuery,
                    onClear: handleClearSearch
                }}
            />

            {/* Search Results Overlay */}
            {isSearching && searchResults.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 mt-2 w-full max-w-xl left-1/2 transform -translate-x-1/2 shadow-lg rounded-lg overflow-hidden"
                    style={{
                        backgroundColor: isDarkMode ? colors.bgSecondary : colors.bgPrimary,
                        border: `1px solid ${isDarkMode ? colors.borderDark : colors.borderLight}`,
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }}
                >
                    <div className="p-3 font-semibold border-b" style={{ borderColor: isDarkMode ? colors.borderDark : colors.borderLight }}>
                        {translate("Search Results")} ({searchResults.length})
                    </div>
                    <div>
                        {searchResults.map((result, index) => (
                            <motion.div
                                key={`${result.type}-${result.$id}`}
                                variants={itemVariants}
                                onClick={() => handleResultClick(result)}
                                className="cursor-pointer"
                            >
                                {result.type === 'document' ? (
                                    <DocumentCard document={result} index={index} />
                                ) : (
                                    <div
                                        className="flex items-center p-3 hover:bg-opacity-10 transition-colors"
                                        style={{
                                            borderBottom: index < searchResults.length - 1 ? `1px solid ${isDarkMode ? colors.borderDark : colors.borderLight}` : 'none'
                                        }}
                                    >
                                        <div
                                            style={{ backgroundColor: isDarkMode ? "#4B5563" : "#EDF2F7" }}
                                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                                        >
                                            <span className="text-sm font-bold">
                                                {result.type === 'module' ? 'M' : 'Q'}
                                            </span>
                                        </div>
                                        <div>
                                            <p style={{ color: colors.textPrimary }} className="font-medium">{result.title}</p>
                                            <p style={{ color: colors.textSecondary }} className="text-xs">
                                                {result.type === 'module'
                                                    ? translate("Module")
                                                    : result.type === 'qcm'
                                                        ? translate("QCM")
                                                        : translate("Document")
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* No Results Message - Only shown when actively searching */}
            {isSearching && searchQuery && searchResults.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 mt-2 w-full max-w-xl left-1/2 transform -translate-x-1/2 shadow-lg rounded-lg overflow-hidden p-6 text-center"
                    style={{
                        backgroundColor: isDarkMode ? colors.bgSecondary : colors.bgPrimary,
                        border: `1px solid ${isDarkMode ? colors.borderDark : colors.borderLight}`
                    }}
                >
                    <p style={{ color: colors.textSecondary }}>{translate("No results found for")} "{searchQuery}"</p>
                </motion.div>
            )}

            {/* Main Content - Only show when not searching or no results */}
            <div className={isSearching && searchResults.length > 0 ? 'opacity-50 pointer-events-none' : ''}>
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
            </div>
        </motion.div>
    );
};

export default Home;
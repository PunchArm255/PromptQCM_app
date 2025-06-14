import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiCalendar, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useDarkMode } from '../lib/DarkModeContext';
import { getUserModules, getModuleTimeTracking, getTotalTimeSpent } from '../lib/appwriteService';

export const Reports = () => {
    const { user } = useOutletContext();
    const { isDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
    const [totalStats, setTotalStats] = useState({
        hoursSpent: 0,
        modulesProgress: 0,
        docsCompleted: 0
    });
    const [moduleStats, setModuleStats] = useState([]);

    // Background colors based on dark mode
    const bgPrimary = isDarkMode ? "#1E1E1E" : "#F5F6FF";
    const bgSecondary = isDarkMode ? "#2D2D2D" : "#FFFFFF";
    const bgAccent = isDarkMode ? "#3D3D3D" : "#F6F8FC";
    const textPrimary = isDarkMode ? "#FFFFFF" : "#252525";
    const textSecondary = isDarkMode ? "#E0E0E0" : "#6B7280";
    const borderColor = isDarkMode ? "#3D3D3D" : "#E0E7EF";

    useEffect(() => {
        // Load data from Appwrite
        const loadStats = async () => {
            try {
                // Get all modules
                const modules = await getUserModules();

                // Get total time spent
                const totalMinutes = await getTotalTimeSpent();

                // Format time display (minutes until 59, then hours)
                let timeDisplay;
                if (totalMinutes < 60) {
                    timeDisplay = `${totalMinutes}m`;
                } else {
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    timeDisplay = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
                }

                // Calculate total completed QCMs
                const totalDocs = modules.reduce((total, module) => total + (module.completedQcms || 0), 0);

                // Calculate average progress percentage across all modules
                const totalModulesProgress = modules.length > 0
                    ? modules.reduce((sum, module) => {
                        const totalQcms = module.qcmCount || 1;
                        const completedQcms = module.completedQcms || 0;
                        return sum + (completedQcms / totalQcms);
                    }, 0) / modules.length
                    : 0;

                setTotalStats({
                    hoursSpent: timeDisplay,
                    modulesProgress: Math.round(totalModulesProgress * 100), // Convert to percentage
                    docsCompleted: totalDocs
                });

                // Get module time tracking data for all modules
                const moduleTimePromises = modules.map(async (module) => {
                    const timeData = await getModuleTimeTracking(module.$id);
                    const totalModuleMinutes = timeData.reduce((sum, record) => sum + record.minutes, 0);

                    // Format time display (minutes until 59, then hours)
                    let timeDisplay;
                    if (totalModuleMinutes < 60) {
                        timeDisplay = `${totalModuleMinutes}m`;
                    } else {
                        const hours = Math.floor(totalModuleMinutes / 60);
                        const minutes = totalModuleMinutes % 60;
                        timeDisplay = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
                    }

                    return {
                        title: module.name,
                        hours: Math.floor(totalModuleMinutes / 60),
                        minutes: totalModuleMinutes % 60,
                        timeDisplay: timeDisplay,
                        totalMinutes: totalModuleMinutes
                    };
                });

                const moduleTimeData = await Promise.all(moduleTimePromises);

                // Sort by time spent
                const sortedModuleStats = moduleTimeData
                    .sort((a, b) => b.totalMinutes - a.totalMinutes)
                    .slice(0, 3); // Take top 3 modules

                setModuleStats(sortedModuleStats);
            } catch (error) {
                console.error("Error loading stats:", error);
            }
        };

        loadStats();
    }, [selectedPeriod]); // Recalculate when period changes

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

    const statCardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
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
                greeting="Reports"
                showExclamation={false}
                onSearch={handleSearch}
                showSearchBar={false}
            />

            {/* Reports Content */}
            <div style={{ backgroundColor: bgPrimary }} className="rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                    <h2 style={{ color: textPrimary }} className="text-xl font-bold mb-3 md:mb-0">Activity Overview</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Last 7 days', 'Last 30 days', 'All time'].map((period) => (
                            <motion.button
                                key={period}
                                whileHover={{ backgroundColor: selectedPeriod === period ? "#F6F8FC" : "#EAEFFB" }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedPeriod(period)}
                                style={{
                                    backgroundColor: selectedPeriod === period
                                        ? (isDarkMode ? "#3D3D3D" : "#F6F8FC")
                                        : (isDarkMode ? "#2D2D2D" : "#EAEFFB"),
                                    color: selectedPeriod === period
                                        ? "#AF42F6"
                                        : (isDarkMode ? "#E0E0E0" : "#6B7280"),
                                    borderColor: selectedPeriod === period ? borderColor : "transparent",
                                    borderWidth: selectedPeriod === period ? "1px" : "0"
                                }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === period ? "border" : ""}`}
                            >
                                {period}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Key Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        variants={statCardVariants}
                        style={{ backgroundColor: bgSecondary }}
                        className="rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center mb-3">
                            <div className="p-2 rounded-lg bg-[#FFF3E8] mr-3">
                                <FiClock className="text-[#FFA048]" size={20} />
                            </div>
                            <span style={{ color: textSecondary }} className="font-medium">Hours Spent</span>
                        </div>
                        <p style={{ color: textPrimary }} className="text-3xl font-bold">{totalStats.hoursSpent}</p>
                        <p style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-400" }} className="text-sm mt-1">
                            <FiCalendar className="inline mr-1" size={14} />
                            {selectedPeriod}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={statCardVariants}
                        style={{ backgroundColor: bgSecondary }}
                        className="rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center mb-3">
                            <div className="p-2 rounded-lg bg-[#E8F5FF] mr-3">
                                <FiTrendingUp className="text-[#00A2FF]" size={20} />
                            </div>
                            <span style={{ color: textSecondary }} className="font-medium">Progress Average</span>
                        </div>
                        <p style={{ color: textPrimary }} className="text-3xl font-bold">{totalStats.modulesProgress}%</p>
                        <p style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-400" }} className="text-sm mt-1">
                            <FiCalendar className="inline mr-1" size={14} />
                            {selectedPeriod}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={statCardVariants}
                        style={{ backgroundColor: bgSecondary }}
                        className="rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center mb-3">
                            <div className="p-2 rounded-lg bg-[#E8FFEF] mr-3">
                                <FiCheckCircle className="text-[#2AD350]" size={20} />
                            </div>
                            <span style={{ color: textSecondary }} className="font-medium">QCMs Completed</span>
                        </div>
                        <p style={{ color: textPrimary }} className="text-3xl font-bold">{totalStats.docsCompleted}</p>
                        <p style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-400" }} className="text-sm mt-1">
                            <FiCalendar className="inline mr-1" size={14} />
                            {selectedPeriod}
                        </p>
                    </motion.div>
                </div>

                {/* Module Stats Section */}
                <div>
                    <h2 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Module Hours</h2>
                    <div className="flex flex-wrap justify-around gap-8">
                        {moduleStats.length > 0 ? (
                            moduleStats.map((item, index) => (
                                <StatCard
                                    key={index}
                                    item={item}
                                    index={index}
                                    isDarkMode={isDarkMode}
                                    bgColor={bgSecondary}
                                    textColor={textPrimary}
                                    textSecondary={textSecondary}
                                />
                            ))
                        ) : (
                            <div style={{ color: textSecondary }} className="text-center py-8 w-full">
                                <p>No module data available yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="mt-8">
                    <h2 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Activity Timeline</h2>
                    <div style={{ backgroundColor: bgSecondary }} className="rounded-xl p-5 shadow-sm">
                        <div className="flex justify-center items-center h-40">
                            <p style={{ color: textSecondary }}>Timeline visualization will be available soon.</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Reports;
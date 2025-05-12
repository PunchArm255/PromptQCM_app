import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiCalendar, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useDarkMode } from '../lib/DarkModeContext';

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
        // Load data from localStorage
        const loadStats = () => {
            const modules = JSON.parse(localStorage.getItem('qcm_modules') || '[]');
            const documents = JSON.parse(localStorage.getItem('qcm_documents') || '[]');

            // Calculate total hours based on completed docs (assuming 2 hours per doc)
            const totalDocs = modules.reduce((total, module) => total + module.completedDocs, 0);
            const totalHours = totalDocs * 2; // 2 hours per completed doc

            // Calculate average progress percentage across all modules
            const totalModulesProgress = modules.length > 0
                ? modules.reduce((sum, module) => {
                    return sum + (module.completedDocs / (module.totalDocs || 1));
                }, 0) / modules.length
                : 0;

            setTotalStats({
                hoursSpent: totalHours,
                modulesProgress: Math.round(totalModulesProgress * 100), // Convert to percentage
                docsCompleted: totalDocs
            });

            // Get top 3 modules by hours spent for the stats cards
            const topModules = [...modules]
                .sort((a, b) => b.completedDocs - a.completedDocs)
                .slice(0, 3)
                .map(module => ({
                    title: module.name,
                    hours: module.completedDocs * 2 // 2 hours per doc
                }));

            setModuleStats(topModules);
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
                        <p style={{ color: textPrimary }} className="text-3xl font-bold">{totalStats.hoursSpent}h</p>
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
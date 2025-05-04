import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiCalendar, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

export const Reports = () => {
    const { user } = useOutletContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
    const [totalStats, setTotalStats] = useState({
        hoursSpent: 0,
        modulesProgress: 0,
        docsCompleted: 0
    });
    const [moduleStats, setModuleStats] = useState([]);

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
            />

            {/* Reports Content */}
            <div className="bg-[#F5F6FF] rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                    <h2 className="text-xl font-bold text-[#252525] mb-3 md:mb-0">Activity Overview</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Last 7 days', 'Last 30 days', 'All time'].map((period) => (
                            <motion.button
                                key={period}
                                whileHover={{ backgroundColor: selectedPeriod === period ? "#F6F8FC" : "#EAEFFB" }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === period
                                    ? "bg-[#F6F8FC] text-[#AF42F6] border border-[#E0E7EF]"
                                    : "bg-[#EAEFFB] text-[#6B7280]"
                                    }`}
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
                        className="bg-white rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center mb-3">
                            <div className="p-2 rounded-lg bg-[#FFF3E8] mr-3">
                                <FiClock className="text-[#FFA048]" size={20} />
                            </div>
                            <span className="text-[#6B7280] font-medium">Hours Spent</span>
                        </div>
                        <p className="text-3xl font-bold text-[#252525]">{totalStats.hoursSpent}h</p>
                        <p className="text-sm text-gray-400 mt-1">
                            <FiCalendar className="inline mr-1" size={14} />
                            {selectedPeriod}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={statCardVariants}
                        className="bg-white rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center mb-3">
                            <div className="p-2 rounded-lg bg-[#E8F5FF] mr-3">
                                <FiTrendingUp className="text-[#00A2FF]" size={20} />
                            </div>
                            <span className="text-[#6B7280] font-medium">Progress Average</span>
                        </div>
                        <p className="text-3xl font-bold text-[#252525]">{totalStats.modulesProgress}%</p>
                        <p className="text-sm text-gray-400 mt-1">
                            <FiCalendar className="inline mr-1" size={14} />
                            {selectedPeriod}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={statCardVariants}
                        className="bg-white rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center mb-3">
                            <div className="p-2 rounded-lg bg-[#E8FFEF] mr-3">
                                <FiCheckCircle className="text-[#2AD350]" size={20} />
                            </div>
                            <span className="text-[#6B7280] font-medium">QCMs Completed</span>
                        </div>
                        <p className="text-3xl font-bold text-[#252525]">{totalStats.docsCompleted}</p>
                        <p className="text-sm text-gray-400 mt-1">
                            <FiCalendar className="inline mr-1" size={14} />
                            {selectedPeriod}
                        </p>
                    </motion.div>
                </div>

                {/* Module Stats Section */}
                <div>
                    <h2 className="text-xl font-bold text-[#252525] mb-4">Module Hours</h2>
                    <div className="flex flex-wrap justify-around gap-8">
                        {moduleStats.length > 0 ? (
                            moduleStats.map((item, index) => (
                                <StatCard key={index} item={item} index={index} />
                            ))
                        ) : (
                            <div className="text-center py-8 w-full">
                                <p className="text-gray-500">No module data available yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-[#252525] mb-4">Activity Timeline</h2>
                    <div className="bg-white rounded-xl p-5 shadow-sm">
                        <div className="flex justify-center items-center h-40">
                            <p className="text-gray-500">Timeline visualization will be available soon.</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Reports;
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import '../styles/global.css';
import { useDarkMode } from '../lib/DarkModeContext';
import { AnimatePresence } from 'framer-motion';

// Components
import PageHeader from '../components/PageHeader';
import QuickActions from '../components/QuickActions';
import ProgressSection from '../components/ProgressSection';
import ReportCard from '../components/ReportCard';
import RecentsCard from '../components/RecentsCard';
import { getModules } from '../appwrite/api';

export const Home = () => {
    const { user, greeting } = useOutletContext();
    const { isDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [recentDocuments, setRecentDocuments] = useState([]);
    const [progressModules, setProgressModules] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [activeModule, setActiveModule] = useState(null);
    const [showQcmModal, setShowQcmModal] = useState(false);
    const [activeQcm, setActiveQcm] = useState(null);
    const [userAnswers, setUserAnswers] = useState([]);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef(null);

    // Background colors based on dark mode
    const bgPrimary = isDarkMode ? "#1E1E1E" : "#F5F6FF";
    const bgSecondary = isDarkMode ? "#2D2D2D" : "#FFFFFF";
    const bgAccent = isDarkMode ? "#3D3D3D" : "#F6F8FC";
    const textPrimary = isDarkMode ? "#FFFFFF" : "#252525";
    const textSecondary = isDarkMode ? "#E0E0E0" : "#6B7280";
    const borderColor = isDarkMode ? "#3D3D3D" : "#E0E7EF";

    useEffect(() => {
        // Fetch modules from Appwrite
        const fetchModules = async () => {
            const modRes = await getModules();
            const modules = modRes.documents || [];
            // Sort by progress percentage (descending)
            const sortedModules = [...modules].sort((a, b) => {
                const progressA = (a.completedDocs || 0) / ((a.totalDocs || 1));
                const progressB = (b.completedDocs || 0) / ((b.totalDocs || 1));
                return progressB - progressA;
            }).slice(0, 4); // Limit to 4 modules
            setProgressModules(sortedModules);

            // Update report data based on module data
            const reportModules = sortedModules.slice(0, 3).map(module => ({
                title: module.name,
                hours: Math.round((module.completedDocs || 0) * 2) // Assuming 2 hours per completed doc
            }));
            setReportData(reportModules);
        };
        fetchModules();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Implement search functionality
        console.log('Searching for:', query);
    };

    const handlePractice = (module) => {
        setActiveModule(module);
        setShowQcmModal(true);
        setActiveQcm(null);
        setUserAnswers([]);
        setShowScore(false);
        setScore(0);
        setShowConfetti(false);
    };

    const handleCloseQcmModal = () => {
        setShowQcmModal(false);
        setActiveModule(null);
        setActiveQcm(null);
        setUserAnswers([]);
        setShowScore(false);
        setScore(0);
        setShowConfetti(false);
    };

    const handleOpenQcm = (qcm) => {
        setActiveQcm(qcm);
        setUserAnswers(Array(qcm.questions.length).fill(''));
        setShowScore(false);
        setScore(0);
        setShowConfetti(false);
    };

    const handleAnswerChange = (idx, val) => {
        setUserAnswers(ans => {
            const copy = [...ans];
            copy[idx] = val;
            return copy;
        });
    };

    const handleSubmitQcm = () => {
        if (!activeQcm) return;
        let correct = 0;
        activeQcm.questions.forEach((q, i) => {
            if (userAnswers[i] && q.answer && userAnswers[i].toUpperCase() === q.answer.toUpperCase()) correct++;
        });
        setScore(correct);
        setShowScore(true);
        if (correct === activeQcm.questions.length) {
            setShowConfetti(true);
            if (confettiRef.current) {
                import('canvas-confetti').then(confetti => {
                    confetti.default({
                        particleCount: 120,
                        spread: 90,
                        origin: { y: 0.6 }
                    });
                });
            }
            setTimeout(() => setShowConfetti(false), 2000);
        }
        // Mark as completed in localStorage
        const storedModules = localStorage.getItem('qcm_modules');
        if (storedModules) {
            const modulesArr = JSON.parse(storedModules);
            const idx = modulesArr.findIndex(m => m.id === activeModule.id);
            if (idx !== -1) {
                if (!modulesArr[idx].completedQCMs) modulesArr[idx].completedQCMs = [];
                if (!modulesArr[idx].completedQCMs.includes(activeQcm.id)) {
                    modulesArr[idx].completedQCMs.push(activeQcm.id);
                    // Update completedDocs, max 10
                    modulesArr[idx].completedDocs = Math.min((modulesArr[idx].completedQCMs?.length || 0), 10);
                    localStorage.setItem('qcm_modules', JSON.stringify(modulesArr));
                }
            }
        }
    };

    const handleRetry = () => {
        setUserAnswers(Array(activeQcm.questions.length).fill(''));
        setShowScore(false);
        setScore(0);
        setShowConfetti(false);
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
            style={{ backgroundColor: isDarkMode ? "#121212" : "transparent" }}
        >
            {/* Header */}
            <PageHeader
                greeting={greeting || 'Welcome'}
                userName={user?.name?.split(' ')[0] || 'User'}
                onSearch={handleSearch}
                showSearchBar={true}
            />

            {/* Quick Action Buttons */}
            <QuickActions
                isDarkMode={isDarkMode}
                bgColor={bgSecondary}
                textColor={textPrimary}
                textSecondary={textSecondary}
            />

            {/* Progress Section */}
            <ProgressSection
                modules={progressModules}
                isDarkMode={isDarkMode}
                bgColor={bgSecondary}
                textColor={textPrimary}
                textSecondary={textSecondary}
                bgPrimary={bgPrimary}
                onPractice={handlePractice}
            />

            {/* Report and Recents Sections */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
            >
                {/* Report Section */}
                <ReportCard
                    reportData={reportData}
                    isDarkMode={isDarkMode}
                    bgColor={bgSecondary}
                    textColor={textPrimary}
                    textSecondary={textSecondary}
                />

                {/* Recents Section */}
                <RecentsCard
                    documents={recentDocuments}
                    isDarkMode={isDarkMode}
                    bgColor={bgSecondary}
                    textColor={textPrimary}
                    textSecondary={textSecondary}
                />
            </motion.div>

            {/* QCM Modal (copied/adapted from modules.jsx) */}
            <AnimatePresence>
                {showQcmModal && activeModule && (
                    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 bg-black bg-opacity-30">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                            style={{ backgroundColor: bgSecondary }}
                            className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EAEFFB]"
                            ref={confettiRef}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 style={{ color: textPrimary }} className="text-xl font-bold">{activeModule.name} - Practice QCMs</h3>
                                <button onClick={handleCloseQcmModal} className="text-[#AF42F6] font-bold text-lg">&times;</button>
                            </div>
                            {!activeQcm ? (
                                <div>
                                    {activeModule.savedQCMs && activeModule.savedQCMs.length > 0 ? (
                                        <ul className="divide-y divide-[#EAEFFB]">
                                            {activeModule.savedQCMs.map(qcm => (
                                                <li key={qcm.id} className="py-3 flex justify-between items-center">
                                                    <span className="font-semibold text-[#252525]">{qcm.name}</span>
                                                    <button
                                                        className="py-1 px-3 rounded-lg text-sm font-semibold text-white ml-2 shadow"
                                                        style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                                                        onClick={() => handleOpenQcm(qcm)}
                                                    >
                                                        Practice
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-gray-500 text-center py-8">No saved QCMs for this module.</div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-[#F5F6FF] rounded-xl p-6 border border-[#EAEFFB] shadow mb-4">
                                    <h4 className="text-lg font-bold mb-4 text-[#252525]">{activeQcm.name}</h4>
                                    <form onSubmit={e => { e.preventDefault(); handleSubmitQcm(); }}>
                                        {activeQcm.questions.map((q, i) => (
                                            <div key={i} className="mb-6">
                                                <div className="font-semibold mb-2">{i + 1}. {q.question}</div>
                                                <ul className="mb-2">
                                                    {q.options.map((opt, j) => {
                                                        const letter = String.fromCharCode(65 + j);
                                                        let highlight = '';
                                                        if (showScore && userAnswers[i] === letter && letter === q.answer) {
                                                            highlight = 'bg-green-100 border-green-500 text-green-700';
                                                        }
                                                        return (
                                                            <li key={j} className={`pl-2 py-1 flex items-center ${highlight} border rounded-lg mb-1 transition-all duration-200`}>
                                                                <label className="inline-flex items-center cursor-pointer w-full">
                                                                    <input
                                                                        type="radio"
                                                                        name={`qcm-q${i}`}
                                                                        value={letter}
                                                                        checked={userAnswers[i] === letter}
                                                                        onChange={() => handleAnswerChange(i, letter)}
                                                                        className="form-radio text-[#AF42F6] mr-2"
                                                                        disabled={showScore}
                                                                    />
                                                                    <span className="ml-1">{letter}) {opt}</span>
                                                                </label>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                        {!showScore && (
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                type="submit"
                                                className="py-2 px-5 rounded-lg text-sm font-semibold text-white font-gotham shadow"
                                                style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                                            >
                                                Submit Answers
                                            </motion.button>
                                        )}
                                        {showScore && (
                                            <div className="mt-4 text-center">
                                                <div className="text-xl font-bold text-[#00CAC3] mb-2">Score: {score} / {activeQcm.questions.length}</div>
                                                <button
                                                    className="mt-2 py-1 px-4 rounded-lg text-sm font-semibold text-white mr-2 shadow"
                                                    style={{ background: 'linear-gradient(to right, #AF42F6, #00CAC3)' }}
                                                    onClick={handleRetry}
                                                    type="button"
                                                >
                                                    Retry
                                                </button>
                                                <button
                                                    className="mt-2 py-1 px-4 rounded-lg text-sm font-semibold text-white shadow"
                                                    style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                                                    onClick={() => { setActiveQcm(null); setShowScore(false); }}
                                                    type="button"
                                                >
                                                    Back to QCMs
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Home;
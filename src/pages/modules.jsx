import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext, useLocation } from 'react-router-dom';
import { FiSettings, FiPlus, FiTrash2, FiX, FiEdit, FiFilter, FiGrid, FiClock, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { useDarkMode } from '../lib/DarkModeContext';
import {
    createEstablishment,
    getUserEstablishments,
    createModule,
    getUserModules,
    updateModule,
    deleteModule,
    deleteEstablishment,
    getModuleQCMs,
    updateEstablishment,
    updateQCM,
    deleteQCM,
    trackModuleTime,
    updateQCMScore,
    getModuleTimeTracking
} from '../lib/appwriteService';

export const Modules = () => {
    const { user } = useOutletContext();
    const { isDarkMode, colors } = useDarkMode();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [establishments, setEstablishments] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedEstablishment, setSelectedEstablishment] = useState('all');

    const [isAddingEstablishment, setIsAddingEstablishment] = useState(false);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [isEditingEstablishment, setIsEditingEstablishment] = useState(false);
    const [isEditingModule, setIsEditingModule] = useState(false);
    const [editingEstablishment, setEditingEstablishment] = useState(null);
    const [editingModule, setEditingModule] = useState(null);
    const [newEstablishment, setNewEstablishment] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    // Background colors based on dark mode
    const bgPrimary = isDarkMode ? "#1E1E1E" : "#F5F6FF";
    const bgSecondary = isDarkMode ? "#2D2D2D" : "#FFFFFF";
    const bgAccent = isDarkMode ? "#3D3D3D" : "#F6F8FC";
    const textPrimary = isDarkMode ? "#FFFFFF" : "#252525";
    const textSecondary = isDarkMode ? "#E0E0E0" : "#6B7280";
    const borderColor = isDarkMode ? "#3D3D3D" : "#E0E7EF";

    // New module state
    const [newModule, setNewModule] = useState({
        name: '',
        description: '',
        type: '',
        establishmentId: null
    });

    const [activeModule, setActiveModule] = useState(null);
    const [showQcmModal, setShowQcmModal] = useState(false);
    const [activeQcm, setActiveQcm] = useState(null);
    const [isEditingQcm, setIsEditingQcm] = useState(false);
    const [editingQcm, setEditingQcm] = useState(null);
    const [newQcmName, setNewQcmName] = useState('');
    const [userAnswers, setUserAnswers] = useState([]);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isTracking, setIsTracking] = useState(false);
    const timeIntervalRef = useRef(null);
    const confettiRef = useRef(null);

    // Fetch modules and establishments from Appwrite
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch establishments from Appwrite
                const establishments = await getUserEstablishments();
                setEstablishments(establishments || []);

                // Fetch modules from Appwrite
                const modules = await getUserModules();

                // Process modules to get QCM counts
                const processedModules = await Promise.all(modules.map(async module => {
                    // Fetch QCMs for this module
                    const qcms = await getModuleQCMs(module.$id);

                    return {
                        ...module,
                        completedDocs: module.completedQcms || 0,
                        totalDocs: module.qcmCount || 0,
                        savedQCMsCount: qcms.length // Track the actual number of saved QCMs
                    };
                }));

                setModules(processedModules || []);

                // Check if we have a selected module ID from navigation state
                if (location.state?.selectedModuleId) {
                    const selectedModule = processedModules.find(
                        module => module.$id === location.state.selectedModuleId
                    );

                    if (selectedModule) {
                        // Open the module modal
                        handleOpenModule(selectedModule);

                        // Clear the location state to avoid reopening on refresh
                        window.history.replaceState({}, document.title);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [location]);

    // Clean up timer when component unmounts
    useEffect(() => {
        return () => {
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }
        };
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        console.log('Searching for:', query);
    };

    const addEstablishment = async () => {
        if (!newEstablishment.trim()) return;

        try {
            // Create establishment in Appwrite
            const createdEstablishment = await createEstablishment(newEstablishment);

            // Add to local state
            setEstablishments([...establishments, createdEstablishment]);
            setNewEstablishment('');
            setIsAddingEstablishment(false);
        } catch (error) {
            console.error("Error creating establishment:", error);
        }
    };

    const addModule = async () => {
        if (
            !newModule.name.trim() ||
            !newModule.description.trim() ||
            !newModule.type.trim() ||
            !newModule.establishmentId
        ) {
            return;
        }

        try {
            // Create module in Appwrite
            const createdModule = await createModule(
                newModule.name,
                newModule.type,
                newModule.description,
                newModule.establishmentId
            );

            // Add to local state
            setModules([...modules, createdModule]);

            // Reset form
            setNewModule({
                name: '',
                description: '',
                type: '',
                establishmentId: null
            });
            setIsAddingModule(false);
        } catch (error) {
            console.error("Error creating module:", error);
        }
    };

    const openAddModuleModal = () => {
        if (establishments.length === 0) {
            setIsAddingEstablishment(true);
        } else {
            setNewModule((prev) => ({
                ...prev,
                establishmentId:
                    selectedEstablishment === 'all'
                        ? establishments[0].$id
                        : selectedEstablishment,
            }));
            setIsAddingModule(true);
        }
    };

    const toggleItemSelection = (type, id) => {
        const itemKey = `${type}-${id}`;
        if (selectedItems.includes(itemKey)) {
            setSelectedItems(selectedItems.filter((item) => item !== itemKey));
        } else {
            setSelectedItems([...selectedItems, itemKey]);
        }
    };

    const deleteSelectedItems = async () => {
        try {
            for (const item of selectedItems) {
                const [type, id] = item.split('-');

                if (type === 'establishment') {
                    // Delete establishment in Appwrite
                    await deleteEstablishment(id);

                    // Also delete all modules from this establishment
                    const modulesToDelete = modules.filter(mod => mod.establishmentId === id);
                    for (const mod of modulesToDelete) {
                        await deleteModule(mod.$id);
                    }
                } else if (type === 'module') {
                    // Delete module in Appwrite
                    await deleteModule(id);
                }
            }

            // Refresh data from Appwrite
            const fetchedEstablishments = await getUserEstablishments();
            setEstablishments(fetchedEstablishments || []);

            const fetchedModules = await getUserModules();
            setModules(fetchedModules || []);

            setSelectedItems([]);
            setShowSettings(false);
        } catch (error) {
            console.error("Error deleting items:", error);
        }
    };

    // Filter modules based on selected establishment
    const filteredModules =
        selectedEstablishment === 'all'
            ? modules
            : modules.filter((module) => module.establishmentId === selectedEstablishment);

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

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", damping: 20 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const handleOpenModule = async (module) => {
        try {
            // Set initial state
            setActiveModule({ ...module });
            setShowQcmModal(true);
            setActiveQcm(null);
            setUserAnswers([]);
            setShowScore(false);
            setScore(0);

            // Get existing time tracking data for this module
            try {
                const timeTrackingData = await getModuleTimeTracking(module.$id);
                const totalMinutes = timeTrackingData.reduce((sum, record) => sum + record.minutes, 0);

                // Store the total time in a separate variable but don't show it in the UI timer
                // This is the total time from the database
                module.totalTimeSpent = totalMinutes;

                // Set the timer display to 0 for the new session
                setTimeSpent(0);
                console.log(`Module has ${totalMinutes} minutes of existing time in database`);
            } catch (error) {
                console.error("Error loading time tracking data:", error);
                setTimeSpent(0);
                module.totalTimeSpent = 0;
            }

            // Start time tracking
            setIsTracking(true);

            // Set up interval to track time (increment every minute)
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }

            // Use a more precise tracking approach
            const startTime = Date.now();
            let lastMinuteTracked = 0;

            timeIntervalRef.current = setInterval(() => {
                // Calculate elapsed minutes since the timer started
                const elapsedMs = Date.now() - startTime;
                const elapsedMinutes = Math.floor(elapsedMs / 60000);

                // Only increment if a full minute has passed since last update
                if (elapsedMinutes > lastMinuteTracked) {
                    setTimeSpent(prev => prev + 1);
                    lastMinuteTracked = elapsedMinutes;
                }
            }, 10000); // Check every 10 seconds

            // Fetch QCMs for this module
            const qcms = await getModuleQCMs(module.$id);

            // Map QCMs to a format the UI expects
            const formattedQcms = qcms.map(qcm => ({
                id: qcm.$id,
                name: qcm.name || "Untitled QCM",
                questions: Array.isArray(qcm.questions) ? qcm.questions : [],
                moduleId: qcm.moduleId,
                score: qcm.score // Include score if available
            }));

            // Update the active module with the fetched QCMs
            setActiveModule(prev => ({
                ...prev,
                savedQCMs: formattedQcms,
                totalTimeSpent: module.totalTimeSpent
            }));
        } catch (error) {
            console.error("Error loading QCMs for module:", error);
        }
    };

    const handleCloseQcmModal = async () => {
        // Stop time tracking
        if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current);
            timeIntervalRef.current = null;
        }

        // Save time spent if we were tracking and have an active module
        if (isTracking && activeModule && activeModule.$id && timeSpent > 0) {
            try {
                // Only track the time spent in this session
                await trackModuleTime(activeModule.$id, timeSpent);
                console.log(`Tracked ${timeSpent} minutes for module ${activeModule.$id}`);
            } catch (error) {
                console.error("Error tracking time:", error);
            }
        }

        // Reset states
        setIsTracking(false);
        setTimeSpent(0);
        setShowQcmModal(false);
        setActiveModule(null);
        setActiveQcm(null);
        setUserAnswers([]);
        setShowScore(false);
        setScore(0);
    };

    const handleOpenQcm = (qcm) => {
        // Validate that we have a valid QCM with questions
        if (!qcm || !qcm.questions) {
            console.error("Invalid QCM or missing questions:", qcm);
            return;
        }

        // Ensure questions is an array
        const questions = Array.isArray(qcm.questions) ? qcm.questions : [];

        // Create a safe QCM object
        const safeQcm = {
            ...qcm,
            questions: questions
        };

        // Set state for the QCM practice
        setActiveQcm(safeQcm);
        setUserAnswers(Array(questions.length).fill(''));
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

    const handleSubmitQcm = async () => {
        if (!activeQcm) return;
        let correct = 0;
        activeQcm.questions.forEach((q, i) => {
            if (userAnswers[i] && q.answer && userAnswers[i].toUpperCase() === q.answer.toUpperCase()) correct++;
        });
        setScore(correct);
        setShowScore(true);

        // Calculate score percentage
        const scorePercentage = Math.round((correct / activeQcm.questions.length) * 100);

        // Save score to Appwrite
        try {
            await updateQCMScore(activeQcm.id, scorePercentage);
            console.log(`Saved score ${scorePercentage}% for QCM ${activeQcm.id}`);

            // Update local state to show the score
            if (activeModule && activeModule.savedQCMs) {
                const updatedQcms = activeModule.savedQCMs.map(qcm =>
                    qcm.id === activeQcm.id ? { ...qcm, score: scorePercentage } : qcm
                );

                setActiveModule(prev => ({
                    ...prev,
                    savedQCMs: updatedQcms
                }));

                // Update the activeQcm with the score
                setActiveQcm(prev => ({
                    ...prev,
                    score: scorePercentage
                }));
            }
        } catch (error) {
            console.error("Error saving QCM score:", error);
        }

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

    const handleEditEstablishment = (establishment) => {
        setEditingEstablishment(establishment);
        setNewEstablishment(establishment.name);
        setIsEditingEstablishment(true);
    };

    const updateEstablishmentData = async () => {
        if (!newEstablishment.trim() || !editingEstablishment) return;

        try {
            // Update establishment in Appwrite
            const updatedEstablishment = await updateEstablishment(editingEstablishment.$id, { name: newEstablishment.trim() });

            // Update local state
            setEstablishments(establishments.map(est =>
                est.$id === editingEstablishment.$id ? updatedEstablishment : est
            ));

            setNewEstablishment('');
            setEditingEstablishment(null);
            setIsEditingEstablishment(false);
        } catch (error) {
            console.error("Error updating establishment:", error);
        }
    };

    const handleEditModule = (module) => {
        setEditingModule(module);
        setNewModule({
            name: module.name,
            description: module.description,
            type: module.type,
            establishmentId: module.establishmentId
        });
        setIsEditingModule(true);
    };

    const updateModuleData = async () => {
        if (
            !newModule.name.trim() ||
            !newModule.description.trim() ||
            !newModule.type.trim() ||
            !newModule.establishmentId ||
            !editingModule
        ) {
            return;
        }

        try {
            // Update module in Appwrite
            const updatedModule = await updateModule(
                editingModule.$id,
                {
                    name: newModule.name.trim(),
                    description: newModule.description.trim(),
                    type: newModule.type.trim(),
                    establishmentId: newModule.establishmentId
                }
            );

            // Update local state
            setModules(modules.map(mod =>
                mod.$id === editingModule.$id ? {
                    ...mod,
                    name: newModule.name.trim(),
                    description: newModule.description.trim(),
                    type: newModule.type.trim(),
                    establishmentId: newModule.establishmentId
                } : mod
            ));

            // Reset form
            setNewModule({
                name: '',
                description: '',
                type: '',
                establishmentId: null
            });
            setEditingModule(null);
            setIsEditingModule(false);
        } catch (error) {
            console.error("Error updating module:", error);
        }
    };

    const handleEditQcm = (qcm) => {
        setEditingQcm(qcm);
        setNewQcmName(qcm.name || "Untitled QCM");
        setIsEditingQcm(true);
    };

    const updateQcmData = async () => {
        if (!newQcmName.trim() || !editingQcm) return;

        try {
            // Update QCM in Appwrite
            const updatedQcm = await updateQCM(
                editingQcm.id,
                { name: newQcmName.trim() }
            );

            // Update local state
            if (activeModule && activeModule.savedQCMs) {
                const updatedQcms = activeModule.savedQCMs.map(qcm =>
                    qcm.id === editingQcm.id ? { ...qcm, name: newQcmName.trim() } : qcm
                );

                setActiveModule(prev => ({
                    ...prev,
                    savedQCMs: updatedQcms
                }));
            }

            setNewQcmName('');
            setEditingQcm(null);
            setIsEditingQcm(false);
        } catch (error) {
            console.error("Error updating QCM:", error);
        }
    };

    const handleDeleteQcm = async (qcm) => {
        if (!qcm || !qcm.id) return;

        try {
            // Delete QCM from Appwrite
            await deleteQCM(qcm.id);

            // Update local state
            if (activeModule && activeModule.savedQCMs) {
                const updatedQcms = activeModule.savedQCMs.filter(q => q.id !== qcm.id);

                setActiveModule(prev => ({
                    ...prev,
                    savedQCMs: updatedQcms
                }));
            }
        } catch (error) {
            console.error("Error deleting QCM:", error);
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
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    greeting="Modules"
                    showExclamation={false}
                    onSearch={handleSearch}
                    showSearchBar={false}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    style={{
                        backgroundColor: showSettings ? "#AF42F6" : bgAccent,
                        color: showSettings ? "#FFFFFF" : textPrimary
                    }}
                    className="p-2.5 rounded-full"
                >
                    <FiSettings size={20} />
                </motion.button>
            </div>

            {/* Modules Content */}
            <div style={{ backgroundColor: bgPrimary }} className="rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                {/* Settings Mode */}
                {showSettings && (
                    <div
                        style={{ backgroundColor: bgAccent }}
                        className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl"
                    >
                        <div>
                            <h3 style={{ color: textPrimary }} className="font-semibold mb-1">Module Settings</h3>
                            <p style={{ color: textSecondary }} className="text-sm">{selectedItems.length} items selected</p>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={deleteSelectedItems}
                                disabled={selectedItems.length === 0}
                                style={{
                                    backgroundColor: selectedItems.length === 0
                                        ? (isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.8)')
                                        : (isDarkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(254, 226, 226, 0.8)'),
                                    color: selectedItems.length === 0
                                        ? (isDarkMode ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.8)')
                                        : (isDarkMode ? '#F87171' : 'rgba(220, 38, 38, 0.8)')
                                }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg ${selectedItems.length === 0 ? 'cursor-not-allowed' : ''}`}
                            >
                                <FiTrash2 size={16} />
                                <span>Delete</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowSettings(false)}
                                style={{ backgroundColor: isDarkMode ? "#2D2D2D" : "#EAEFFB", color: textPrimary }}
                                className="px-4 py-2 rounded-lg flex items-center gap-1.5"
                            >
                                <FiX size={16} />
                                <span>Close</span>
                            </motion.button>
                        </div>
                    </div>
                )}

                {/* Establishments Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                        <div className="flex items-center">
                            <h2 style={{ color: textPrimary }} className="text-xl font-bold mr-2">Establishments</h2>
                            <FiFilter style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-400" }} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsAddingEstablishment(true)}
                                style={{ backgroundColor: bgAccent, color: "#AF42F6" }}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                            >
                                <FiPlus size={16} />
                                <span>Add Establishment</span>
                            </motion.button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <motion.button
                            whileHover={{ backgroundColor: selectedEstablishment === 'all' ? "#F6F8FC" : "#EAEFFB" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedEstablishment('all')}
                            style={{
                                backgroundColor: selectedEstablishment === 'all'
                                    ? (isDarkMode ? "#3D3D3D" : "#F6F8FC")
                                    : (isDarkMode ? "#2D2D2D" : "#EAEFFB"),
                                color: selectedEstablishment === 'all'
                                    ? "#AF42F6"
                                    : (isDarkMode ? "#E0E0E0" : "#6B7280"),
                                borderColor: selectedEstablishment === 'all' ? borderColor : "transparent",
                                borderWidth: selectedEstablishment === 'all' ? "1px" : "0"
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedEstablishment === 'all' ? "border" : ""}`}
                        >
                            All Establishments
                        </motion.button>

                        {establishments.map((establishment) => (
                            <motion.div
                                key={establishment.$id}
                                className="relative"
                                onClick={() => showSettings
                                    ? toggleItemSelection('establishment', establishment.$id)
                                    : setSelectedEstablishment(establishment.$id)
                                }
                            >
                                <motion.button
                                    whileHover={{ backgroundColor: selectedEstablishment === establishment.$id ? "#F6F8FC" : "#EAEFFB" }}
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        backgroundColor: selectedEstablishment === establishment.$id
                                            ? (isDarkMode ? "#3D3D3D" : "#F6F8FC")
                                            : (isDarkMode ? "#2D2D2D" : "#EAEFFB"),
                                        color: selectedEstablishment === establishment.$id
                                            ? "#AF42F6"
                                            : (isDarkMode ? "#E0E0E0" : "#6B7280"),
                                        borderWidth: "1px",
                                        borderStyle: showSettings && selectedItems.includes(`establishment-${establishment.$id}`)
                                            ? 'solid'
                                            : (selectedEstablishment === establishment.$id ? 'solid' : 'none'),
                                        borderColor: showSettings && selectedItems.includes(`establishment-${establishment.$id}`)
                                            ? '#AF42F6'
                                            : borderColor
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                                >
                                    {establishment.name}
                                    {!showSettings && (
                                        <FiEdit
                                            size={14}
                                            className="ml-1 cursor-pointer text-gray-400 hover:text-[#AF42F6]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditEstablishment(establishment);
                                            }}
                                        />
                                    )}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Modules Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 style={{ color: textPrimary }} className="text-xl font-bold">Modules</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openAddModuleModal}
                            style={{ backgroundColor: bgAccent, color: "#AF42F6" }}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                            <FiPlus size={16} />
                            <span>Add Module</span>
                        </motion.button>
                    </div>

                    {filteredModules.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredModules.map((module) => (
                                <motion.div
                                    key={module.$id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    style={{
                                        backgroundColor: bgSecondary,
                                        borderColor: showSettings && selectedItems.includes(`module-${module.$id}`)
                                            ? '#AF42F6'
                                            : 'transparent',
                                        borderWidth: showSettings && selectedItems.includes(`module-${module.$id}`) ? '2px' : '0'
                                    }}
                                    className="rounded-xl p-5 shadow-sm cursor-pointer"
                                    onClick={() => showSettings
                                        ? toggleItemSelection('module', module.$id)
                                        : handleOpenModule(module)
                                    }
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 style={{ color: textPrimary }} className="font-bold text-lg">{module.name}</h3>
                                        <div className="flex items-center">
                                            {!showSettings && (
                                                <FiEdit
                                                    size={16}
                                                    className="mr-2 cursor-pointer text-gray-400 hover:text-[#AF42F6]"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditModule(module);
                                                    }}
                                                />
                                            )}
                                            <span style={{
                                                backgroundColor: isDarkMode ? "#3D3D3D" : "#EAEFFB",
                                                color: isDarkMode ? "#E0E0E0" : "#6B7280"
                                            }} className="px-2 py-1 text-xs rounded-lg">
                                                {module.type}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-500" }} className="text-sm mb-4 line-clamp-2">{module.description}</p>

                                    <div className="flex items-center mt-3">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${Math.min((module.savedQCMsCount || 0) / 10 * 100, 100)}%`,
                                                    background: 'linear-gradient(to right, #00CAC3, #AF42F6)'
                                                }}
                                            ></div>
                                        </div>
                                        <span style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-500" }} className="ml-2 text-xs">
                                            {module.savedQCMsCount || 0}/10
                                        </span>
                                    </div>

                                    {/* Establishment tag */}
                                    <div className="mt-4 flex items-center">
                                        <FiGrid size={14} style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-400" }} className="mr-1.5" />
                                        <span style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-500" }} className="text-xs">
                                            {establishments.find(e => e.$id === module.establishmentId)?.name || 'Unknown'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ backgroundColor: bgSecondary }} className="rounded-xl p-8 text-center">
                            <div style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-400" }} className="mb-2">
                                <FiGrid size={40} className="mx-auto" />
                            </div>
                            <h3 style={{ color: textPrimary }} className="text-lg font-semibold mb-1">No modules found</h3>
                            <p style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-500" }} className="text-sm mb-4">
                                {selectedEstablishment === 'all'
                                    ? 'You haven\'t created any modules yet.'
                                    : 'No modules in this establishment.'}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={openAddModuleModal}
                                style={{ backgroundColor: bgAccent, color: "#AF42F6" }}
                                className="px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
                            >
                                <FiPlus size={16} />
                                <span>Add Module</span>
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Establishment Modal */}
            <AnimatePresence>
                {isAddingEstablishment && (
                    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ backgroundColor: bgSecondary }}
                            className="rounded-2xl p-6 w-full max-w-md"
                        >
                            <h3 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Add Establishment</h3>
                            <div className="mb-4">
                                <label style={{ color: textSecondary }} htmlFor="establishmentName" className="block text-sm font-medium mb-1">Establishment Name</label>
                                <input
                                    type="text"
                                    id="establishmentName"
                                    value={newEstablishment}
                                    onChange={(e) => setNewEstablishment(e.target.value)}
                                    placeholder="Enter establishment name"
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsAddingEstablishment(false)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addEstablishment}
                                    disabled={!newEstablishment.trim()}
                                    style={{
                                        backgroundColor: !newEstablishment.trim() ? "#9CA3AF" : "#AF42F6",
                                        color: "#FFFFFF"
                                    }}
                                    className={`px-4 py-2 rounded-lg ${!newEstablishment.trim() ? 'cursor-not-allowed' : ''}`}
                                >
                                    Add Establishment
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Module Modal */}
            <AnimatePresence>
                {isAddingModule && (
                    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ backgroundColor: bgSecondary }}
                            className="rounded-2xl p-6 w-full max-w-md"
                        >
                            <h3 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Add Module</h3>

                            <div className="mb-4">
                                <label style={{ color: textSecondary }} htmlFor="moduleName" className="block text-sm font-medium mb-1">Module Name</label>
                                <input
                                    type="text"
                                    id="moduleName"
                                    value={newModule.name}
                                    onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                                    placeholder="Enter module name"
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>

                            <div className="mb-4">
                                <label style={{ color: textSecondary }} htmlFor="moduleDescription" className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    id="moduleDescription"
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                    placeholder="Enter module description"
                                    rows={3}
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>

                            <div className="mb-4">
                                <label style={{ color: textSecondary }} htmlFor="moduleType" className="block text-sm font-medium mb-1">Module Type</label>
                                <input
                                    type="text"
                                    id="moduleType"
                                    value={newModule.type}
                                    onChange={(e) => setNewModule({ ...newModule, type: e.target.value })}
                                    placeholder="e.g. Mathematics, Physics, Computer Science"
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>

                            <div className="mb-6">
                                <label style={{ color: textSecondary }} htmlFor="establishmentSelect" className="block text-sm font-medium mb-1">Establishment</label>
                                <select
                                    id="establishmentSelect"
                                    value={newModule.establishmentId || ''}
                                    onChange={(e) => setNewModule({ ...newModule, establishmentId: e.target.value })}
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                >
                                    <option value="">Select an establishment</option>
                                    {establishments.map(establishment => (
                                        <option key={establishment.$id} value={establishment.$id}>
                                            {establishment.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsAddingModule(false)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={addModule}
                                    disabled={!newModule.name.trim() || !newModule.description.trim() || !newModule.type.trim() || !newModule.establishmentId}
                                    style={{
                                        backgroundColor: !newModule.name.trim() || !newModule.description.trim() || !newModule.type.trim() || !newModule.establishmentId
                                            ? "#9CA3AF"
                                            : "#AF42F6",
                                        color: "#FFFFFF"
                                    }}
                                    className={`px-4 py-2 rounded-lg ${!newModule.name.trim() || !newModule.description.trim() || !newModule.type.trim() || !newModule.establishmentId
                                        ? 'cursor-not-allowed'
                                        : ''
                                        }`}
                                >
                                    Add Module
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QCM Modal */}
            <AnimatePresence>
                {showQcmModal && activeModule && (
                    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 bg-black bg-opacity-30">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border"
                            style={{
                                backgroundColor: colors.bgPrimary,
                                borderColor: colors.borderColor
                            }}
                            ref={confettiRef}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 style={{ color: colors.textPrimary }} className="text-xl font-bold">{activeModule.name} - Practice QCMs</h3>
                                <div className="flex items-center">
                                    <div className="flex items-center mr-4 text-sm" style={{ color: colors.textPrimary }}>
                                        <FiClock className="mr-1" />
                                        <span>Session: {timeSpent} min</span>
                                        {activeModule.totalTimeSpent > 0 && (
                                            <span className="ml-2" style={{ color: colors.textSecondary }}>Total: {activeModule.totalTimeSpent + timeSpent} min</span>
                                        )}
                                    </div>
                                    <button onClick={handleCloseQcmModal} className="text-[#AF42F6] font-bold text-lg">&times;</button>
                                </div>
                            </div>
                            {!activeQcm ? (
                                <div>
                                    {activeModule.savedQCMs && activeModule.savedQCMs.length > 0 ? (
                                        <ul className="divide-y" style={{ borderColor: colors.borderColor }}>
                                            {activeModule.savedQCMs.map(qcm => (
                                                <li key={qcm.id} className="py-3 flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <span className="font-semibold" style={{ color: colors.textPrimary }}>{qcm.name}</span>
                                                        {qcm.score !== undefined && (
                                                            <span
                                                                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${isDarkMode
                                                                    ? (qcm.score >= 80
                                                                        ? 'bg-green-900 text-green-100'
                                                                        : qcm.score >= 60
                                                                            ? 'bg-yellow-900 text-yellow-100'
                                                                            : 'bg-red-900 text-red-100')
                                                                    : (qcm.score >= 80
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : qcm.score >= 60
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : 'bg-red-100 text-red-800')
                                                                    }`}
                                                            >
                                                                {qcm.score}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <button
                                                            className="p-1 rounded-lg hover:text-[#AF42F6]"
                                                            style={{ color: colors.textSecondary }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditQcm(qcm);
                                                            }}
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button
                                                            className="p-1 rounded-lg hover:text-red-500 mx-1"
                                                            style={{ color: colors.textSecondary }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteQcm(qcm);
                                                            }}
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                        <button
                                                            className="py-1 px-3 rounded-lg text-sm font-semibold text-white shadow"
                                                            style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                                                            onClick={() => handleOpenQcm(qcm)}
                                                        >
                                                            Practice
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8" style={{ color: colors.textSecondary }}>No saved QCMs for this module.</div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-xl p-6 border shadow mb-4" style={{
                                    backgroundColor: colors.bgAccent,
                                    borderColor: colors.borderColor
                                }}>
                                    <h4 className="text-lg font-bold mb-6 text-center" style={{ color: colors.textPrimary }}>{activeQcm.name}</h4>
                                    <form onSubmit={e => { e.preventDefault(); handleSubmitQcm(); }}>
                                        {activeQcm.questions.map((q, i) => (
                                            <div key={i} className="mb-8 p-6 rounded-xl shadow-sm" style={{ backgroundColor: colors.bgPrimary }}>
                                                <div className="font-semibold mb-4 text-lg" style={{ color: colors.textPrimary }}>{i + 1}. {q.question}</div>

                                                {q.code && (
                                                    <div className="mb-4 rounded-lg p-4 overflow-x-auto" style={{ backgroundColor: colors.bgSecondary }}>
                                                        <pre className="text-sm font-mono whitespace-pre-wrap" style={{ color: colors.textPrimary }}>{q.code}</pre>
                                                    </div>
                                                )}

                                                <div className="space-y-3 mt-4">
                                                    {q.options.map((opt, j) => {
                                                        const letter = String.fromCharCode(65 + j);
                                                        let highlight = '';
                                                        let textColor = '';
                                                        let borderColor = '';

                                                        if (showScore) {
                                                            if (letter === q.answer) {
                                                                // Correct answer
                                                                highlight = isDarkMode ? 'bg-green-900' : 'bg-green-100';
                                                                borderColor = isDarkMode ? 'border-green-700' : 'border-green-500';
                                                                textColor = isDarkMode ? 'text-green-100' : 'text-green-700';
                                                            } else if (userAnswers[i] === letter) {
                                                                // User's incorrect answer
                                                                highlight = isDarkMode ? 'bg-red-900' : 'bg-red-100';
                                                                borderColor = isDarkMode ? 'border-red-700' : 'border-red-500';
                                                                textColor = isDarkMode ? 'text-red-100' : 'text-red-700';
                                                            }
                                                        }

                                                        return (
                                                            <div
                                                                key={j}
                                                                className={`${highlight} border rounded-lg transition-all duration-200 hover:shadow-md ${!showScore ? 'hover:border-[#AF42F6]' : borderColor}`}
                                                                style={{
                                                                    borderColor: showScore ? '' : colors.borderColor,
                                                                    backgroundColor: !highlight ? colors.bgSecondary : ''
                                                                }}
                                                            >
                                                                <label className="flex items-center cursor-pointer w-full p-3">
                                                                    <input
                                                                        type="radio"
                                                                        name={`qcm-q${i}`}
                                                                        value={letter}
                                                                        checked={userAnswers[i] === letter}
                                                                        onChange={() => handleAnswerChange(i, letter)}
                                                                        className="form-radio text-[#AF42F6] mr-3 h-4 w-4"
                                                                        disabled={showScore}
                                                                    />
                                                                    <div className={`${textColor}`} style={{ color: !textColor ? colors.textPrimary : '' }}>
                                                                        <span className="font-medium mr-2">{letter})</span>
                                                                        {opt}
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="mt-6 flex justify-center">
                                            {!showScore ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    type="submit"
                                                    className="py-3 px-8 rounded-lg text-base font-semibold text-white shadow-md"
                                                    style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                                                >
                                                    Submit Answers
                                                </motion.button>
                                            ) : (
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold mb-4" style={{ color: '#00CAC3' }}>Score: {score} / {activeQcm.questions.length}</div>
                                                    <div className="flex justify-center gap-4">
                                                        <motion.button
                                                            whileHover={{ scale: 1.03 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            onClick={handleRetry}
                                                            type="button"
                                                            className="py-2 px-6 rounded-lg text-sm font-semibold text-white shadow"
                                                            style={{ background: 'linear-gradient(to right, #AF42F6, #00CAC3)' }}
                                                        >
                                                            Retry
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.03 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            onClick={() => { setActiveQcm(null); setShowScore(false); }}
                                                            type="button"
                                                            className="py-2 px-6 rounded-lg text-sm font-semibold text-white shadow"
                                                            style={{ background: 'linear-gradient(to right, #00CAC3, #AF42F6)' }}
                                                        >
                                                            Back to QCMs
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Establishment Modal */}
            <AnimatePresence>
                {isEditingEstablishment && (
                    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ backgroundColor: bgSecondary }}
                            className="rounded-2xl p-6 w-full max-w-md"
                        >
                            <h3 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Edit Establishment</h3>
                            <div className="mb-4">
                                <label style={{ color: textSecondary }} htmlFor="establishmentName" className="block text-sm font-medium mb-1">Establishment Name</label>
                                <input
                                    type="text"
                                    id="establishmentName"
                                    value={newEstablishment}
                                    onChange={(e) => setNewEstablishment(e.target.value)}
                                    placeholder="Enter establishment name"
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setIsEditingEstablishment(false);
                                        setEditingEstablishment(null);
                                        setNewEstablishment('');
                                    }}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={updateEstablishmentData}
                                    disabled={!newEstablishment.trim()}
                                    style={{
                                        backgroundColor: !newEstablishment.trim() ? "#9CA3AF" : "#AF42F6",
                                        color: "#FFFFFF"
                                    }}
                                    className={`px-4 py-2 rounded-lg ${!newEstablishment.trim() ? 'cursor-not-allowed' : ''}`}
                                >
                                    Update Establishment
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Module Modal */}
            <AnimatePresence>
                {isEditingModule && (
                    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ backgroundColor: bgSecondary }}
                            className="rounded-2xl p-6 w-full max-w-md"
                        >
                            <h3 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Edit Module</h3>

                            <div className="mb-4">
                                <label style={{ color: textSecondary }} htmlFor="moduleName" className="block text-sm font-medium mb-1">Module Name</label>
                                <input
                                    type="text"
                                    id="moduleName"
                                    value={newModule.name}
                                    onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                                    placeholder="Enter module name"
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>

                            <div className="mb-4">
                                <label style={{ color: textSecondary }} htmlFor="moduleDescription" className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    id="moduleDescription"
                                    value={newModule.description}
                                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                    placeholder="Enter module description"
                                    rows={3}
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>

                            <div className="mb-4">
                                <label style={{ color: textSecondary }} htmlFor="moduleType" className="block text-sm font-medium mb-1">Module Type</label>
                                <input
                                    type="text"
                                    id="moduleType"
                                    value={newModule.type}
                                    onChange={(e) => setNewModule({ ...newModule, type: e.target.value })}
                                    placeholder="e.g. Mathematics, Physics, Computer Science"
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>

                            <div className="mb-6">
                                <label style={{ color: textSecondary }} htmlFor="establishmentSelect" className="block text-sm font-medium mb-1">Establishment</label>
                                <select
                                    id="establishmentSelect"
                                    value={newModule.establishmentId || ''}
                                    onChange={(e) => setNewModule({ ...newModule, establishmentId: e.target.value })}
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                >
                                    <option value="">Select an establishment</option>
                                    {establishments.map(establishment => (
                                        <option key={establishment.$id} value={establishment.$id}>
                                            {establishment.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setIsEditingModule(false);
                                        setEditingModule(null);
                                        setNewModule({
                                            name: '',
                                            description: '',
                                            type: '',
                                            establishmentId: null
                                        });
                                    }}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={updateModuleData}
                                    disabled={!newModule.name.trim() || !newModule.description.trim() || !newModule.type.trim() || !newModule.establishmentId}
                                    style={{
                                        backgroundColor: !newModule.name.trim() || !newModule.description.trim() || !newModule.type.trim() || !newModule.establishmentId
                                            ? "#9CA3AF"
                                            : "#AF42F6",
                                        color: "#FFFFFF"
                                    }}
                                    className={`px-4 py-2 rounded-lg ${!newModule.name.trim() || !newModule.description.trim() || !newModule.type.trim() || !newModule.establishmentId
                                        ? 'cursor-not-allowed'
                                        : ''
                                        }`}
                                >
                                    Update Module
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit QCM Modal */}
            <AnimatePresence>
                {isEditingQcm && (
                    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ backgroundColor: bgSecondary }}
                            className="rounded-2xl p-6 w-full max-w-md"
                        >
                            <h3 style={{ color: textPrimary }} className="text-xl font-bold mb-4">Edit QCM</h3>
                            <div className="mb-4">
                                <label style={{ color: textSecondary }} htmlFor="qcmName" className="block text-sm font-medium mb-1">QCM Name</label>
                                <input
                                    type="text"
                                    id="qcmName"
                                    value={newQcmName}
                                    onChange={(e) => setNewQcmName(e.target.value)}
                                    placeholder="Enter QCM name"
                                    style={{
                                        backgroundColor: bgAccent,
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AF42F6]"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setIsEditingQcm(false);
                                        setEditingQcm(null);
                                        setNewQcmName('');
                                    }}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: textPrimary,
                                        borderColor: borderColor
                                    }}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={updateQcmData}
                                    disabled={!newQcmName.trim()}
                                    style={{
                                        backgroundColor: !newQcmName.trim() ? "#9CA3AF" : "#AF42F6",
                                        color: "#FFFFFF"
                                    }}
                                    className={`px-4 py-2 rounded-lg ${!newQcmName.trim() ? 'cursor-not-allowed' : ''}`}
                                >
                                    Update QCM
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Modules;
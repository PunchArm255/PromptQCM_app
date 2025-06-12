import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { FiSettings, FiPlus, FiTrash2, FiX, FiEdit, FiFilter, FiGrid } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { useDarkMode } from '../lib/DarkModeContext';
import {
    getModules,
    createModule,
    updateModule,
    deleteModule,
    getEstablishments,
    createEstablishment,
} from '../appwrite/api';

export const Modules = () => {
    const { user } = useOutletContext();
    const { isDarkMode } = useDarkMode();
    const [searchQuery, setSearchQuery] = useState('');
    const [establishments, setEstablishments] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedEstablishment, setSelectedEstablishment] = useState('all');

    const [isAddingEstablishment, setIsAddingEstablishment] = useState(false);
    const [isAddingModule, setIsAddingModule] = useState(false);
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
    const [userAnswers, setUserAnswers] = useState([]);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef(null);

    // Fetch modules and establishments from Appwrite
    useEffect(() => {
        const fetchData = async () => {
            const estRes = await getEstablishments();
            setEstablishments(estRes.documents || []);
            const modRes = await getModules();
            setModules(modRes.documents || []);
        };
        fetchData();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        console.log('Searching for:', query);
    };

    const addEstablishment = async () => {
        if (newEstablishment.trim()) {
            const newEst = await createEstablishment({
                name: newEstablishment
            });
            setEstablishments((prev) => [...prev, newEst]);
            setNewEstablishment('');
            setIsAddingEstablishment(false);
        }
    };

    const addModule = async () => {
        if (
            newModule.name.trim() &&
            newModule.description.trim() &&
            newModule.type.trim() &&
            newModule.establishmentId
        ) {
            await createModule({
                name: newModule.name,
                description: newModule.description,
                type: newModule.type,
                establishmentId: newModule.establishmentId
            });
            // Fetch latest modules from Appwrite
            const modRes = await getModules();
            setModules(modRes.documents || []);
            setNewModule({
                name: '',
                description: '',
                type: '',
                establishmentId: null,
            });
            setIsAddingModule(false);
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
        let updatedEstablishments = [...establishments];
        let updatedModules = [...modules];
        for (const item of selectedItems) {
            const [type, id] = item.split('-');
            if (type === 'establishment') {
                await Promise.all([
                    // Delete establishment
                    getEstablishments().then((res) =>
                        res.documents
                            .filter((est) => est.$id === id)
                            .forEach((est) =>
                                updatedEstablishments.splice(
                                    updatedEstablishments.findIndex((e) => e.$id === est.$id),
                                    1
                                )
                            )
                    ),
                    // Delete all modules from this establishment
                    getModules().then((res) =>
                        res.documents
                            .filter((mod) => mod.establishmentId === id)
                            .forEach(async (mod) => {
                                await deleteModule(mod.$id);
                                updatedModules.splice(
                                    updatedModules.findIndex((m) => m.$id === mod.$id),
                                    1
                                );
                            })
                    ),
                ]);
            } else if (type === 'module') {
                await deleteModule(id);
                updatedModules.splice(
                    updatedModules.findIndex((m) => m.$id === id),
                    1
                );
            }
        }
        setEstablishments(updatedEstablishments);
        setModules(updatedModules);
        setSelectedItems([]);
        setShowSettings(false);
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
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 500
            }
        },
        exit: {
            y: 20,
            opacity: 0,
            transition: {
                duration: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const handleOpenModule = (module) => {
        setActiveModule(module);
        setShowQcmModal(true);
        setActiveQcm(null);
        setUserAnswers([]);
        setShowScore(false);
        setScore(0);
    };

    const handleCloseQcmModal = () => {
        setShowQcmModal(false);
        setActiveModule(null);
        setActiveQcm(null);
        setUserAnswers([]);
        setShowScore(false);
        setScore(0);
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
                                        borderColor: selectedEstablishment === establishment.$id ? borderColor : "transparent",
                                        borderWidth: "1px",
                                        borderStyle: showSettings && selectedItems.includes(`establishment-${establishment.$id}`)
                                            ? 'solid'
                                            : (selectedEstablishment === establishment.$id ? 'solid' : 'none'),
                                        borderColor: showSettings && selectedItems.includes(`establishment-${establishment.$id}`)
                                            ? '#AF42F6'
                                            : borderColor
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {establishment.name}
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
                                        <span style={{
                                            backgroundColor: isDarkMode ? "#3D3D3D" : "#EAEFFB",
                                            color: isDarkMode ? "#E0E0E0" : "#6B7280"
                                        }} className="px-2 py-1 text-xs rounded-lg">
                                            {module.type}
                                        </span>
                                    </div>
                                    <p style={{ color: isDarkMode ? "#9CA3AF" : "text-gray-500" }} className="text-sm mb-4 line-clamp-2">{module.description}</p>

                                    <div className="flex justify-between text-xs mb-2">
                                        <span style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}>Progress</span>
                                        <span style={{ color: "#AF42F6" }} className="font-semibold">
                                            {module.completedDocs}/{module.totalDocs} QCMs
                                        </span>
                                    </div>
                                    <div style={{ backgroundColor: isDarkMode ? "#3D3D3D" : "#EAEFFB" }} className="h-2 w-full rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(module.completedDocs / (module.totalDocs || 1)) * 100}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full rounded-full bg-gradient-to-r from-[#00CAC3] to-[#AF42F6]"
                                        />
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

export default Modules;